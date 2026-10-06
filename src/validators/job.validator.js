const Joi = require('joi');
const {
  JOB_STATUS,
  JOB_PRIORITY,
  ALLOWED_JOB_SORT_FIELDS,
  ALLOWED_SORT_ORDERS,
} = require('../utils/constants');

const createJobSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().max(2000).allow('', null).optional(),
  customer_name: Joi.string().trim().min(2).max(100).required(),
  customer_contact: Joi.string().trim().min(5).max(30).required(),
  address: Joi.string().trim().min(5).max(500).required(),
  priority: Joi.string().valid(...Object.values(JOB_PRIORITY)).default(JOB_PRIORITY.MEDIUM),
  assigned_worker_id: Joi.number().integer().positive().allow(null).optional(),
});

const updateJobSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),
  description: Joi.string().trim().max(2000).allow('', null).optional(),
  customer_name: Joi.string().trim().min(2).max(100).optional(),
  customer_contact: Joi.string().trim().min(5).max(30).optional(),
  address: Joi.string().trim().min(5).max(500).optional(),
  priority: Joi.string().valid(...Object.values(JOB_PRIORITY)).optional(),
  status: Joi.string().valid(...Object.values(JOB_STATUS)).optional(),
}).min(1);

const assignWorkerSchema = Joi.object({
  workerId: Joi.number().integer().positive().required(),
});

const listJobsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(100).allow('', null).optional(),
  status: Joi.string().valid(...Object.values(JOB_STATUS)).optional(),
  priority: Joi.string().valid(...Object.values(JOB_PRIORITY)).optional(),
  sortBy: Joi.string().valid(...ALLOWED_JOB_SORT_FIELDS).default('created_at'),
  sortOrder: Joi.string().valid(...ALLOWED_SORT_ORDERS).default('DESC'),
  workerId: Joi.number().integer().positive().optional(),
});

const jobIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const jobParamIdSchema = Joi.object({
  jobId: Joi.number().integer().positive().required(),
});

module.exports = {
  createJobSchema,
  updateJobSchema,
  assignWorkerSchema,
  listJobsQuerySchema,
  jobIdParamSchema,
  jobParamIdSchema,
};
