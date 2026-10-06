const { Op } = require('sequelize');
const { Job, User, JobPart, JobImage, Invoice } = require('../models');
const {
  ROLES,
  JOB_STATUS,
  ALLOWED_STATUS_TRANSITIONS,
  WORKER_ALLOWED_TRANSITIONS,
  ALLOWED_JOB_SORT_FIELDS,
  ALLOWED_SORT_ORDERS,
} = require('../utils/constants');
const {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} = require('../utils/errors');
const { getPaginationParams, buildPaginationMetadata } = require('../utils/pagination');
const BigNumber = require('bignumber.js');

class JobService {
  async createJob(jobData, adminUser) {
    let initialStatus = JOB_STATUS.PENDING;

    if (jobData.assigned_worker_id) {
      const worker = await User.findOne({
        where: { id: jobData.assigned_worker_id, role: ROLES.WORKER },
      });
      if (!worker) {
        throw new BadRequestError('Assigned worker not found or invalid role');
      }
      initialStatus = JOB_STATUS.ASSIGNED;
    }

    const createdJob = await Job.create({
      ...jobData,
      status: initialStatus,
      created_by: adminUser.id,
    });

    return Job.findByPk(createdJob.id, {
      include: [
        { model: User, as: 'worker', attributes: ['name', 'email'] },
        { model: User, as: 'creator', attributes: ['name', 'email'] },
      ],
    });
  }

  async getJobs(query, user) {
    const { page, limit, offset } = getPaginationParams(query);
    const { search, status, priority, sortBy, sortOrder } = query;

    const where = {};

    if (user.role === ROLES.WORKER) {
      where.assigned_worker_id = user.id;
    } else if (query.workerId) {
      where.assigned_worker_id = query.workerId;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { customer_name: { [Op.like]: `%${search}%` } },
      ];
    }

    const safeSortBy = ALLOWED_JOB_SORT_FIELDS.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = (sortOrder && ALLOWED_SORT_ORDERS.includes(sortOrder.toUpperCase()))
      ? sortOrder.toUpperCase()
      : 'DESC';

    const { count: total, rows: jobs } = await Job.findAndCountAll({
      where,
      include: [
        { model: User, as: 'worker', attributes: ['name', 'email'] },
        { model: User, as: 'creator', attributes: ['name', 'email'] },
      ],
      order: [[safeSortBy, safeSortOrder]],
      limit,
      offset,
    });

    const pagination = buildPaginationMetadata(page, limit, total);
    return { jobs, pagination };
  }

  async getJobById(jobId, user) {
    const job = await Job.findByPk(jobId, {
      include: [
        { model: User, as: 'worker', attributes: ['name', 'email'] },
        { model: User, as: 'creator', attributes: ['name', 'email'] },
        { model: JobPart, as: 'parts' },
        { model: JobImage, as: 'images' },
        { model: Invoice, as: 'invoice' },
      ],
    });

    if (!job) {
      throw new NotFoundError(`Job with ID ${jobId} not found`);
    }

    if (user.role === ROLES.WORKER && job.assigned_worker_id !== user.id) {
      throw new ForbiddenError('You are not authorized to view this job');
    }

    return job;
  }

  async updateJob(jobId, updateData, user) {
    const job = await Job.findByPk(jobId);
    if (!job) {
      throw new NotFoundError(`Job with ID ${jobId} not found`);
    }

    if (user.role === ROLES.WORKER) {
      if (job.assigned_worker_id !== user.id) {
        throw new ForbiddenError('You are not authorized to update this job');
      }

      const forbiddenKeys = Object.keys(updateData).filter((k) => k !== 'status');
      if (forbiddenKeys.length > 0) {
        throw new ForbiddenError('Workers can only update job status');
      }

      if (!updateData.status) {
        throw new BadRequestError('Status is required');
      }

      this._validateWorkerStatusTransition(job.status, updateData.status);

      const updatePayload = { status: updateData.status };
      if (updateData.status === JOB_STATUS.COMPLETED) {
        updatePayload.completed_at = new Date();
      }

      await job.update(updatePayload);
      return job;
    }

    if (updateData.status && updateData.status !== job.status) {
      this._validateAdminStatusTransition(job.status, updateData.status);
      if (updateData.status === JOB_STATUS.COMPLETED) {
        updateData.completed_at = new Date();
      }
    }

    await job.update(updateData);
    return job;
  }

  async deleteJob(jobId) {
    const job = await Job.findByPk(jobId);
    if (!job) {
      throw new NotFoundError(`Job with ID ${jobId} not found`);
    }

    const existingInvoice = await Invoice.findOne({ where: { job_id: jobId } });
    if (existingInvoice) {
      throw new ConflictError('Cannot delete job because an invoice has already been generated');
    }

    await job.destroy();
    return true;
  }

  async assignWorker(jobId, workerId) {
    const job = await Job.findByPk(jobId);
    if (!job) {
      throw new NotFoundError(`Job with ID ${jobId} not found`);
    }

    if (job.status === JOB_STATUS.CANCELLED) {
      throw new BadRequestError('Cannot assign a cancelled job');
    }

    if (job.status === JOB_STATUS.COMPLETED) {
      throw new BadRequestError('Cannot reassign an already completed job');
    }

    const worker = await User.findOne({
      where: { id: workerId, role: ROLES.WORKER },
    });
    if (!worker) {
      throw new BadRequestError('Worker not found or invalid role');
    }

    await job.update({
      assigned_worker_id: workerId,
      status: JOB_STATUS.ASSIGNED,
    });

    return Job.findByPk(jobId, {
      include: [{ model: User, as: 'worker', attributes: ['name', 'email'] }],
    });
  }

  async getCompletedJobs() {
    const jobs = await Job.findAll({
      where: { status: JOB_STATUS.COMPLETED },
      include: [
        { model: User, as: 'worker', attributes: ['id', 'name', 'email'] },
        { model: JobPart, as: 'parts' },
        { model: Invoice, as: 'invoice' },
      ],
      order: [
        ['completed_at', 'DESC'],
        ['id', 'DESC'],
      ],
    });

    return jobs.map((j) => {
      const partsTotal = j.parts
        ? j.parts.reduce((sum, p) => sum.plus(new BigNumber(p.total_price || 0)), new BigNumber(0)).toFixed(2)
        : '0.00';

      return {
        id: j.id,
        title: j.title,
        description: j.description,
        customer_name: j.customer_name,
        customer_contact: j.customer_contact,
        address: j.address,
        priority: j.priority,
        status: j.status,
        completed_at: j.completed_at,
        created_at: j.created_at,
        worker_id: j.worker ? j.worker.id : null,
        worker_name: j.worker ? j.worker.name : null,
        worker_email: j.worker ? j.worker.email : null,
        parts_total: partsTotal,
        has_invoice: j.invoice ? 1 : 0,
        invoice_id: j.invoice ? j.invoice.id : null,
        invoice_total: j.invoice ? j.invoice.final_total : null,
      };
    });
  }

  _validateAdminStatusTransition(currentStatus, targetStatus) {
    const allowedTargets = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedTargets.includes(targetStatus)) {
      throw new BadRequestError(`Cannot change job status from ${currentStatus} to ${targetStatus}`);
    }
  }

  _validateWorkerStatusTransition(currentStatus, targetStatus) {
    const allowedTargets = WORKER_ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowedTargets.includes(targetStatus)) {
      throw new BadRequestError(`Workers cannot transition job from ${currentStatus} to ${targetStatus}`);
    }
  }
}

module.exports = new JobService();
