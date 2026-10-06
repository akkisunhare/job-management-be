const imageService = require('../services/image.service');
const { sendSuccess } = require('../utils/response');

class ImageController {
  async uploadImages(req, res, next) {
    try {
      const images = await imageService.uploadImages(req.params.jobId, req.files, req.user);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Images uploaded successfully',
        data: images,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getImages(req, res, next) {
    try {
      const images = await imageService.getImagesByJobId(req.params.jobId, req.user);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Images retrieved successfully',
        data: images,
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteImage(req, res, next) {
    try {
      await imageService.deleteImage(req.params.jobId, req.params.imageId, req.user);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Image deleted successfully',
        data: null,
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new ImageController();
