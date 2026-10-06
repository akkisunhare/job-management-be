const fs = require('fs');
const path = require('path');
const { Job, JobImage } = require('../models');
const { ROLES, JOB_STATUS, MAX_JOB_IMAGES } = require('../utils/constants');
const {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} = require('../utils/errors');

class ImageService {
  async uploadImages(jobId, files, user) {
    if (!files || files.length === 0) {
      throw new BadRequestError('At least one image file is required');
    }

    const job = await Job.findByPk(jobId);
    if (!job) {
      this._cleanupFiles(files);
      throw new NotFoundError(`Job with ID ${jobId} not found`);
    }

    if (user.role === ROLES.WORKER && job.assigned_worker_id !== user.id) {
      this._cleanupFiles(files);
      throw new ForbiddenError('You are not authorized to upload images for this job');
    }

    if (job.status === JOB_STATUS.CANCELLED) {
      this._cleanupFiles(files);
      throw new BadRequestError('Cannot upload images to a cancelled job');
    }

    const currentCount = await JobImage.count({ where: { job_id: jobId } });
    if (currentCount + files.length > MAX_JOB_IMAGES) {
      this._cleanupFiles(files);
      throw new BadRequestError(
        `Upload limit exceeded. Maximum ${MAX_JOB_IMAGES} images allowed per job.`
      );
    }

    const imagesToInsert = files.map((file) => ({
      job_id: jobId,
      file_name: file.filename,
      file_url: `/uploads/${file.filename}`,
      mime_type: file.mimetype,
      file_size: file.size,
    }));

    try {
      await JobImage.bulkCreate(imagesToInsert);
      return JobImage.findAll({
        where: { job_id: jobId },
        order: [['id', 'ASC']],
      });
    } catch (error) {
      this._cleanupFiles(files);
      throw error;
    }
  }

  async getImagesByJobId(jobId, user) {
    const job = await Job.findByPk(jobId);
    if (!job) {
      throw new NotFoundError(`Job with ID ${jobId} not found`);
    }

    if (user.role === ROLES.WORKER && job.assigned_worker_id !== user.id) {
      throw new ForbiddenError('You are not authorized to view images for this job');
    }

    return JobImage.findAll({
      where: { job_id: jobId },
      order: [['id', 'ASC']],
    });
  }

  async deleteImage(jobId, imageId, user) {
    const job = await Job.findByPk(jobId);
    if (!job) {
      throw new NotFoundError(`Job with ID ${jobId} not found`);
    }

    if (user.role === ROLES.WORKER && job.assigned_worker_id !== user.id) {
      throw new ForbiddenError('You are not authorized to delete images from this job');
    }

    const image = await JobImage.findOne({
      where: { id: imageId, job_id: jobId },
    });
    if (!image) {
      throw new NotFoundError(`Image with ID ${imageId} not found on job ${jobId}`);
    }

    await image.destroy();

    const diskPath = path.resolve(process.cwd(), 'uploads', image.file_name);
    if (fs.existsSync(diskPath)) {
      try {
        fs.unlinkSync(diskPath);
      } catch (err) {}
    }

    return true;
  }

  _cleanupFiles(files) {
    if (!files || !Array.isArray(files)) return;
    for (const file of files) {
      if (file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {}
      }
    }
  }
}

module.exports = new ImageService();
