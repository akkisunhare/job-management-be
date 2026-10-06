const { sequelize } = require('../config/database');
const User = require('./user.model');
const Job = require('./job.model');
const JobPart = require('./jobPart.model');
const JobImage = require('./jobImage.model');
const Invoice = require('./invoice.model');
const setupAssociations = require('./association');

setupAssociations({ User, Job, JobPart, JobImage, Invoice });

module.exports = {
  sequelize,
  User,
  Job,
  JobPart,
  JobImage,
  Invoice,
};
