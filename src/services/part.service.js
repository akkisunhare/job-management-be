const { Job, JobPart, Invoice } = require('../models');
const { calculatePartTotal } = require('../utils/math');
const { ROLES, JOB_STATUS } = require('../utils/constants');
const {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} = require('../utils/errors');

class PartService {
  async addPart(jobId, partData, user) {
    const job = await this._verifyJobAccess(jobId, user);

    if (job.status === JOB_STATUS.COMPLETED || job.status === JOB_STATUS.CANCELLED) {
      throw new BadRequestError(`Cannot add parts to a job with status '${job.status}'`);
    }

    const unitPrice = parseFloat(partData.unit_price).toFixed(2);
    const quantity = parseInt(partData.quantity, 10);
    const totalPrice = calculatePartTotal(unitPrice, quantity);

    const createdPart = await JobPart.create({
      job_id: jobId,
      part_name: partData.part_name.trim(),
      unit_price: unitPrice,
      quantity,
      total_price: totalPrice,
    });

    return createdPart;
  }

  async getPartsByJobId(jobId, user) {
    await this._verifyJobAccess(jobId, user);
    return JobPart.findAll({
      where: { job_id: jobId },
      order: [['id', 'ASC']],
    });
  }

  async updatePart(jobId, partId, updateData, user) {
    const job = await this._verifyJobAccess(jobId, user);

    if (job.status === JOB_STATUS.COMPLETED || job.status === JOB_STATUS.CANCELLED) {
      throw new BadRequestError(`Cannot modify parts on a job with status '${job.status}'`);
    }

    const invoice = await Invoice.findOne({ where: { job_id: jobId } });
    if (invoice) {
      throw new ConflictError('Parts cannot be modified after invoice is generated');
    }

    const existingPart = await JobPart.findOne({
      where: { id: partId, job_id: jobId },
    });
    if (!existingPart) {
      throw new NotFoundError(`Part with ID ${partId} not found on job ${jobId}`);
    }

    const unitPrice = updateData.unit_price !== undefined
      ? parseFloat(updateData.unit_price).toFixed(2)
      : existingPart.unit_price;

    const quantity = updateData.quantity !== undefined
      ? parseInt(updateData.quantity, 10)
      : existingPart.quantity;

    const totalPrice = calculatePartTotal(unitPrice, quantity);

    const payload = {
      total_price: totalPrice,
      unit_price: unitPrice,
      quantity,
    };

    if (updateData.part_name) {
      payload.part_name = updateData.part_name.trim();
    }

    await existingPart.update(payload);
    return existingPart;
  }

  async deletePart(jobId, partId, user) {
    const job = await this._verifyJobAccess(jobId, user);

    if (job.status === JOB_STATUS.COMPLETED || job.status === JOB_STATUS.CANCELLED) {
      throw new BadRequestError(`Cannot delete parts from a job with status '${job.status}'`);
    }

    const invoice = await Invoice.findOne({ where: { job_id: jobId } });
    if (invoice) {
      throw new ConflictError('Parts cannot be deleted after invoice is generated');
    }

    const existingPart = await JobPart.findOne({
      where: { id: partId, job_id: jobId },
    });
    if (!existingPart) {
      throw new NotFoundError(`Part with ID ${partId} not found on job ${jobId}`);
    }

    await existingPart.destroy();
    return true;
  }

  async _verifyJobAccess(jobId, user) {
    const job = await Job.findByPk(jobId);
    if (!job) {
      throw new NotFoundError(`Job with ID ${jobId} not found`);
    }

    if (user.role === ROLES.WORKER && job.assigned_worker_id !== user.id) {
      throw new ForbiddenError('You are not authorized to access parts for this job');
    }

    return job;
  }
}

module.exports = new PartService();
