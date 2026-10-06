const { User } = require('../models');
const { ROLES } = require('../utils/constants');
const { NotFoundError } = require('../utils/errors');

class UserService {
  async getWorkers() {
    return User.findAll({
      where: { role: ROLES.WORKER },
      attributes: { exclude: ['password_hash'] },
      order: [['name', 'ASC']],
    });
  }

  async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
    return user;
  }
}

module.exports = new UserService();
