const { dbHelpers } = require("../config/database");
const bcrypt = require("bcryptjs");

class Admin {
  constructor(data) {
    Object.assign(this, data);
    this.role = "admin";
    this.accountType = "admin";
  }

  async checkPassword(enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
  }

  toJSON() {
    const admin = { ...this };
    delete admin.password;
    admin.role = "admin";
    admin.accountType = "admin";
    return admin;
  }

  async update(updateData) {
    await dbHelpers.execute(
      `
      UPDATE admins
      SET
        name = @name,
        phone = @phone,
        updated_at = NOW()
      WHERE id = @id
    `,
      {
        id: this.id,
        name: updateData.name ?? this.name,
        phone: updateData.phone ?? this.phone,
      }
    );

    Object.assign(this, updateData);
  }

  async changePassword(newHashedPassword) {
    await dbHelpers.execute(
      `
      UPDATE admins
      SET password = @password, updated_at = NOW()
      WHERE id = @id
    `,
      { id: this.id, password: newHashedPassword }
    );

    this.password = newHashedPassword;
  }

  static baseAdminProjection() {
    return `
      SELECT
        a.*,
        'admin' AS role,
        'admin' AS accountType
      FROM admins a
      WHERE a.status = 'active' AND a.is_active = 1
    `;
  }

  static async findByEmail(email) {
    const rows = await dbHelpers.query(
      `${Admin.baseAdminProjection()} AND a.email = @email LIMIT 1`,
      { email }
    );

    return rows[0] ? new Admin(rows[0]) : null;
  }

  static async findById(id) {
    const rows = await dbHelpers.query(
      `${Admin.baseAdminProjection()} AND a.id = @id LIMIT 1`,
      { id }
    );

    return rows[0] ? new Admin(rows[0]) : null;
  }
}

module.exports = Admin;
