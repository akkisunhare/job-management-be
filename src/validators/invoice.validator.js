const Joi = require('joi');

const createInvoiceSchema = Joi.object({
  jobId: Joi.number().integer().positive().required(),
  serviceCost: Joi.number().min(0).precision(2).required(),
  cleaningCost: Joi.number().min(0).precision(2).required(),
});

module.exports = {
  createInvoiceSchema,
};
