function setupAssociations({ User, Job, JobPart, JobImage, Invoice }) {
  User.hasMany(Job, {
    foreignKey: 'assigned_worker_id',
    as: 'assignedJobs',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  Job.belongsTo(User, {
    foreignKey: 'assigned_worker_id',
    as: 'worker',
  });

  User.hasMany(Job, {
    foreignKey: 'created_by',
    as: 'createdJobs',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
  Job.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator',
  });

  Job.hasMany(JobPart, {
    foreignKey: 'job_id',
    as: 'parts',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  JobPart.belongsTo(Job, {
    foreignKey: 'job_id',
    as: 'job',
  });

  Job.hasMany(JobImage, {
    foreignKey: 'job_id',
    as: 'images',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  JobImage.belongsTo(Job, {
    foreignKey: 'job_id',
    as: 'job',
  });

  Job.hasOne(Invoice, {
    foreignKey: 'job_id',
    as: 'invoice',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
  Invoice.belongsTo(Job, {
    foreignKey: 'job_id',
    as: 'job',
  });

  User.hasMany(Invoice, {
    foreignKey: 'created_by',
    as: 'createdInvoices',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
  Invoice.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator',
  });
}

module.exports = setupAssociations;
