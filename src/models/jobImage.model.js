const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const JobImage = sequelize.define(
  'JobImage',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    job_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    mime_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    file_size: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: 'job_images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

module.exports = JobImage;
