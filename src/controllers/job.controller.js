const jobService = require('../services/job.service');
const { sendSuccess } = require('../utils/response');

class JobController {
  async createJob(req, res, next) {
    try {
      const job = await jobService.createJob(req.body, req.user);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Job created successfully',
        data: job,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getJobs(req, res, next) {
    try {
      const { jobs, pagination } = await jobService.getJobs(req.query, req.user);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Jobs retrieved successfully',
        data: jobs,
        pagination,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getJobById(req, res, next) {
    try {
      const job = await jobService.getJobById(req.params.id, req.user);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Job details retrieved successfully',
        data: job,
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateJob(req, res, next) {
    try {
      const updatedJob = await jobService.updateJob(req.params.id, req.body, req.user);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Job updated successfully',
        data: updatedJob,
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteJob(req, res, next) {
    try {
      await jobService.deleteJob(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Job deleted successfully',
        data: null,
      });
    } catch (error) {
      return next(error);
    }
  }

  async assignWorker(req, res, next) {
    try {
      const updatedJob = await jobService.assignWorker(req.params.jobId, req.body.workerId);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Worker assigned successfully',
        data: updatedJob,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getCompletedJobs(req, res, next) {
    try {
      const jobs = await jobService.getCompletedJobs();
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Completed jobs retrieved successfully',
        data: jobs,
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new JobController();
