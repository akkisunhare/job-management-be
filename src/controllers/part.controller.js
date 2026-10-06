const partService = require('../services/part.service');
const { sendSuccess } = require('../utils/response');

class PartController {
  async addPart(req, res, next) {
    try {
      const part = await partService.addPart(req.params.jobId, req.body, req.user);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Part added successfully to job',
        data: part,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getParts(req, res, next) {
    try {
      const parts = await partService.getPartsByJobId(req.params.jobId, req.user);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Parts retrieved successfully',
        data: parts,
      });
    } catch (error) {
      return next(error);
    }
  }

  async updatePart(req, res, next) {
    try {
      const updatedPart = await partService.updatePart(
        req.params.jobId,
        req.params.partId,
        req.body,
        req.user
      );
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Part updated successfully',
        data: updatedPart,
      });
    } catch (error) {
      return next(error);
    }
  }

  async deletePart(req, res, next) {
    try {
      await partService.deletePart(req.params.jobId, req.params.partId, req.user);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Part deleted successfully',
        data: null,
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new PartController();
