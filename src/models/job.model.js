const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { JOB_STATUS, JOB_PRIORITY } = require('../utils/constants');

const Job = sequelize.define(
  'Job',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    customer_contact: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    assigned_worker_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM(...Object.values(JOB_PRIORITY)),
      allowNull: false,
      defaultValue: JOB_PRIORITY.MEDIUM,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(JOB_STATUS)),
      allowNull: false,
      defaultValue: JOB_STATUS.PENDING,
    },
    created_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'jobs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Job;
