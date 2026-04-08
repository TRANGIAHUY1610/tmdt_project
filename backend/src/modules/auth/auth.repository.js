const User = require("../../../models/User");
const Admin = require("../../../models/Admin");

class AuthRepository {
  async findAdminByEmail(email) {
    return Admin.findByEmail(email);
  }

  async findAdminById(id) {
    return Admin.findById(id);
  }

  async findByEmail(email) {
    return User.findByEmail(email);
  }

  async findById(id) {
    return User.findById(id);
  }

  async createUser(payload) {
    return User.create(payload);
  }
}

module.exports = new AuthRepository();
