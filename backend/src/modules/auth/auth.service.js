const bcrypt = require("bcryptjs");
const authRepository = require("./auth.repository");
const { generateToken } = require("../../../middleware/auth");

class AuthService {
  async register(payload) {
    const { name, email, password, address, phone } = payload;

    if (!name || !email || !password) {
      return { error: { statusCode: 400, message: "Ten, email va mat khau la bat buoc" } };
    }

    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) {
      return { error: { statusCode: 400, message: "Email da duoc su dung" } };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await authRepository.createUser({
      name,
      email,
      password: hashedPassword,
      address: address || null,
      phone: phone || null,
    });

    const token = generateToken(user);

    return {
      data: {
        user: user.toJSON(),
        token,
      },
      message: "Dang ky thanh cong",
      statusCode: 201,
    };
  }

  async login(payload) {
    const { email, password } = payload;

    if (!email || !password) {
      return { error: { statusCode: 400, message: "Email va mat khau la bat buoc" } };
    }

    const admin = await authRepository.findAdminByEmail(email);
    if (admin) {
      const isAdminPasswordValid = await admin.checkPassword(password);
      if (!isAdminPasswordValid) {
        return { error: { statusCode: 401, message: "Email hoac mat khau khong dung" } };
      }

      const token = generateToken(admin);

      return {
        data: {
          user: admin.toJSON(),
          token,
          redirectTo: "/admin.html",
        },
        message: "Dang nhap thanh cong",
      };
    }

    const user = await authRepository.findByEmail(email);
    if (!user) {
      return { error: { statusCode: 401, message: "Email hoac mat khau khong dung" } };
    }

    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return { error: { statusCode: 401, message: "Email hoac mat khau khong dung" } };
    }

    if (user.is_active === false) {
      return { error: { statusCode: 401, message: "Tai khoan da bi khoa" } };
    }

    const token = generateToken(user);

    return {
      data: {
        user: user.toJSON(),
        token,
        redirectTo: user.role === "admin" ? "/admin.html" : "/index.html",
      },
      message: "Dang nhap thanh cong",
    };
  }

  async getProfile(userId) {
    const accountType = userId?.accountType || "user";

    if (accountType === "admin") {
      const admin = await authRepository.findAdminById(userId.id);
      if (!admin) {
        return { error: { statusCode: 404, message: "Khong tim thay admin" } };
      }
      return { data: admin.toJSON() };
    }

    const user = await authRepository.findById(userId.id || userId);
    if (!user) {
      return { error: { statusCode: 404, message: "Khong tim thay user" } };
    }

    return { data: user.toJSON() };
  }

  async updateProfile(authUser, payload) {
    if (authUser.accountType === "admin") {
      const admin = await authRepository.findAdminById(authUser.id);
      if (!admin) {
        return { error: { statusCode: 404, message: "Khong tim thay admin" } };
      }

      const { name, phone } = payload;
      const updateData = {};
      if (name) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;

      if (!Object.keys(updateData).length) {
        return { error: { statusCode: 400, message: "Khong co du lieu hop le de cap nhat" } };
      }

      await admin.update(updateData);
      return { data: admin.toJSON(), message: "Cap nhat thanh cong" };
    }

    const user = await authRepository.findById(authUser.id);
    if (!user) {
      return { error: { statusCode: 404, message: "Khong tim thay user" } };
    }

    const { name, address, phone, avatar_url } = payload;
    const updateData = {};
    if (name) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    await user.update(updateData);
    return { data: user.toJSON(), message: "Cap nhat thanh cong" };
  }

  async changePassword(authUser, payload) {
    const { currentPassword, newPassword } = payload;

    if (authUser.accountType === "admin") {
      const admin = await authRepository.findAdminById(authUser.id);
      if (!admin) {
        return { error: { statusCode: 404, message: "Admin not found" } };
      }

      const isAdminMatch = await admin.checkPassword(currentPassword);
      if (!isAdminMatch) {
        return { error: { statusCode: 400, message: "Mat khau hien tai khong dung" } };
      }

      const hashedNewAdminPassword = await bcrypt.hash(newPassword, 10);
      await admin.changePassword(hashedNewAdminPassword);
      return { data: null, message: "Doi mat khau thanh cong" };
    }

    const user = await authRepository.findById(authUser.id);

    if (!user) {
      return { error: { statusCode: 404, message: "User not found" } };
    }

    const isMatch = await user.checkPassword(currentPassword);
    if (!isMatch) {
      return { error: { statusCode: 400, message: "Mat khau hien tai khong dung" } };
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await user.changePassword(hashedNewPassword);

    return { data: null, message: "Doi mat khau thanh cong" };
  }
}

module.exports = new AuthService();
