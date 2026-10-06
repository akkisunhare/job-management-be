const Joi = require('joi');

const addPartSchema = Joi.object({
  part_name: Joi.string().trim().min(2).max(150).required(),
  unit_price: Joi.number().positive().precision(2).required(),
  quantity: Joi.number().integer().positive().min(1).required(),
});

const updatePartSchema = Joi.object({
  part_name: Joi.string().trim().min(2).max(150).optional(),
  unit_price: Joi.number().positive().precision(2).optional(),
  quantity: Joi.number().integer().positive().min(1).optional(),
}).min(1);

const partIdParamSchema = Joi.object({
  jobId: Joi.number().integer().positive().required(),
  partId: Joi.number().integer().positive().required(),
});

module.exports = {
  addPartSchema,
  updatePartSchema,
  partIdParamSchema,
};
