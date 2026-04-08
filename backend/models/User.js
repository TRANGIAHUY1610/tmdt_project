const { dbHelpers } = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
  constructor(data) {
    Object.assign(this, data);
    this.accountType = "user";
  }

  // Gắn method check password
  async checkPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  // Trả về JSON không lộ password
  toJSON() {
    const user = { ...this };
    delete user.password;
    user.accountType = "user";
    return user;
  }

  // Update user
  async update(updateData) {
    await dbHelpers.execute(
      `
      UPDATE users
      SET
        name = @name,
        address = @address,
        phone = @phone,
        avatar_url = @avatar_url
      WHERE id = @id
    `,
      {
        id: this.id,
        name: updateData.name ?? this.name,
        address: updateData.address ?? this.address,
        phone: updateData.phone ?? this.phone,
        avatar_url: updateData.avatar_url ?? this.avatar_url,
      }
    );

    Object.assign(this, updateData);
  }

  // Đổi mật khẩu
  async changePassword(newHashedPassword) {
    await dbHelpers.execute(
      `
      UPDATE users
      SET password = @password
      WHERE id = @id
    `,
      { id: this.id, password: newHashedPassword }
    );

    this.password = newHashedPassword;
  }

  // ===========================
  // STATIC METHODS
  // ===========================
  static baseUserProjection() {
    return `
      SELECT
        u.*,
        CASE WHEN a.id IS NULL THEN 'customer' ELSE 'admin' END AS role,
        CASE WHEN a.id IS NULL THEN 0 ELSE 1 END AS is_admin
      FROM users u
      LEFT JOIN admins a ON a.user_id = u.id AND a.status = 'active'
    `;
  }

  static async findByEmail(email) {
    const result = await dbHelpers.query(
      `${User.baseUserProjection()} WHERE u.email = @email LIMIT 1`,
      { email }
    );

    if (result[0]) {
      return new User(result[0]);
    }

    return null;
  }

  static async findById(id) {
    const result = await dbHelpers.query(
      `${User.baseUserProjection()} WHERE u.id = @id LIMIT 1`,
      { id }
    );

    if (result[0]) {
      return new User(result[0]);
    }

    return null;
  }

  static async create(data) {
    const insertResult = await dbHelpers.execute(
      `
      INSERT INTO users (name, email, password, address, phone)
      VALUES (@name, @email, @password, @address, @phone)
    `,
      {
        name: data.name,
        email: data.email,
        password: data.password,
        address: data.address,
        phone: data.phone,
      }
    );

    const created = await dbHelpers.getOne(
      `${User.baseUserProjection()} WHERE u.id = @id LIMIT 1`,
      { id: insertResult.insertId }
    );

    return new User(created);
  }
}

module.exports = User;
