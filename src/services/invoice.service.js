const { sequelize, Job, JobPart, Invoice } = require('../models');
const { calculateInvoiceTotals } = require('../utils/math');
const { JOB_STATUS } = require('../utils/constants');
const {
  NotFoundError,
  BadRequestError,
  ConflictError,
} = require('../utils/errors');

class InvoiceService {
  async generateInvoice({ jobId, serviceCost, cleaningCost }, adminUser) {
    return sequelize.transaction(async (t) => {
      const job = await Job.findByPk(jobId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!job) {
        throw new NotFoundError(`Job with ID ${jobId} not found`);
      }

      if (job.status !== JOB_STATUS.COMPLETED) {
        throw new BadRequestError('Invoice can only be generated for completed jobs');
      }

      const existingInvoice = await Invoice.findOne({
        where: { job_id: jobId },
        transaction: t,
      });

      if (existingInvoice) {
        throw new ConflictError('Invoice already exists for this job');
      }

      const partsSum = await JobPart.sum('total_price', {
        where: { job_id: jobId },
        transaction: t,
      });
      const partsTotalStr = partsSum ? String(partsSum) : '0.00';

      const totals = calculateInvoiceTotals({
        partsTotal: partsTotalStr,
        serviceCost,
        cleaningCost,
        gstRate: 10.0,
      });

      const createdInvoice = await Invoice.create(
        {
          job_id: jobId,
          parts_total: totals.partsTotal,
          service_cost: totals.serviceCost,
          cleaning_cost: totals.cleaningCost,
          subtotal: totals.subtotal,
          gst_rate: totals.gstRate,
          gst_amount: totals.gstAmount,
          final_total: totals.finalTotal,
          created_by: adminUser.id,
        },
        { transaction: t }
      );

      return {
        invoiceId: createdInvoice.id,
        jobId: createdInvoice.job_id,
        partsTotal: parseFloat(createdInvoice.parts_total),
        serviceCost: parseFloat(createdInvoice.service_cost),
        cleaningCost: parseFloat(createdInvoice.cleaning_cost),
        subtotal: parseFloat(createdInvoice.subtotal),
        gstRate: parseFloat(createdInvoice.gst_rate),
        gstAmount: parseFloat(createdInvoice.gst_amount),
        finalTotal: parseFloat(createdInvoice.final_total),
        createdAt: createdInvoice.created_at,
      };
    });
  }
}

module.exports = new InvoiceService();
