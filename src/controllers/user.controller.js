const userService = require('../services/user.service');
const { sendSuccess } = require('../utils/response');

class UserController {
  async getWorkers(req, res, next) {
    try {
      const workers = await userService.getWorkers();
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Workers retrieved successfully',
        data: workers,
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new UserController();
