const { NotFoundResponse } = require("../core/error.response");
const User = require("../models/user.model");
const Role = require("../models/role.model");
const Wallet = require("../models/wallet.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { generateTokens, verifyRefreshToken } = require("../auth/authUtils");
const KeyTokenService = require("../services/keyToken.service");
const {
  findUserByStudentId,
} = require("../models/repositories/user.repository");

class AuthService {
  static async loginAdmin({ email, password }) {
    // check if user exists
    const user = await User.findOne({ email }).lean();
    if (!user) {
      throw new NotFoundResponse("User not found");
    }

    // get role of user
    const role = await Role.findById(user.role);
    if (!role) {
      throw new NotFoundResponse("Role not found");
    }

    // check if user is admin
    if (role.name !== "admin") {
      throw new NotFoundResponse("User is not admin");
    }

    // check if password is correct
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new NotFoundResponse("Invalid password");
    }

    // create token
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
    });

    const token = await generateTokens({ userId: user._id, email }, privateKey);

    await KeyTokenService.generateKeyToken({
      userId: user._id,
      publicKey,
      privateKey,
      refreshToken: token.refreshToken,
    });

    return {
      user,
      token: token.accessToken,
    };
  }

  static async registerAdmin(req) {
    const { email, password, fullName } = req.body;

    // check if user already exists
    const user = await User.findOne({ email });

    if (user) {
      throw new NotFoundResponse("User already exists");
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // add role to user
    const role = await Role.findOne({ name: "admin" });

    if (!role) {
      throw new NotFoundResponse("Role not found");
    }

    // create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      fullName,
      role: role._id,
    });

    await newUser.save();

    return newUser;
  }

  static async loginUser({ email, password }) {
    // check if user exists
    const user = await User.findOne({ email }).lean();

    if (!user) {
      throw new NotFoundResponse("User not found");
    }

    // get role of user
    const role = await Role.findById(user.role);
    if (!role) {
      throw new NotFoundResponse("Role not found");
    }

    // // check if user is user
    // if (role.name !== "user") {
    //   throw new NotFoundResponse("User is not user");
    // }

    // check if password is correct
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new NotFoundResponse("Invalid password");
    }

    // create token
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
    });

    const token = await generateTokens(
      { userId: user._id, studentId: user.studentId, email: user.email },
      privateKey
    );

    await KeyTokenService.generateKeyToken({
      userId: user._id,
      publicKey,
      privateKey,
      refreshToken: token.refreshToken,
    });

    // Create a simplified role object
    user.role = {
      name: role.name, // Add only the name
      description: role.description, // Add the description
    };

    return {
      user,
      token: {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      },
    };
  }



  static async registerUser(req) {
    const { studentId, password, fullName, email, phone, rePassword } =
      req.body;

    if (studentId) {
      const user = await User.findOne({ studentId });
      if (user) {
        throw new NotFoundResponse("User already exists");
      }
    }

    // check if password and rePassword match
    if (password !== rePassword) {
      throw new NotFoundResponse("Password and rePassword do not match");
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // add role to user
    const role = await Role.findOne({ name: "user" });

    if (!role) {
      throw new NotFoundResponse("Role not found");
    }

    // create new user
    const newUser = new User({
      studentId,
      password: hashedPassword,
      fullName,
      email,
      phone,
      role: role._id,
    });

    // create wallet
    const wallet = new Wallet({
      user: newUser._id,
    });

    await wallet.save();

    newUser.wallet = wallet._id;

    await newUser.save();

    return newUser;
  }

  static async changePassword(req, res) {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;
  
    try {
      // Kiểm tra ID người dùng hợp lệ
      // if (!mongoose.Types.ObjectId.isValid(userId)) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "ID người dùng không hợp lệ",
      //   });
      // }
  
      // Tìm người dùng theo ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }
  
      // Kiểm tra mật khẩu cũ có khớp không
      const isOldPasswordMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordMatch) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu cũ không chính xác",
        });
      }
  
      // Kiểm tra mật khẩu mới có giống mật khẩu cũ không
      if (oldPassword === newPassword) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu mới không được giống mật khẩu cũ",
        });
      }
  
      // Mã hóa mật khẩu mới
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
      // Cập nhật mật khẩu mới vào cơ sở dữ liệu
      user.password = hashedNewPassword;
      await user.save();
  
      return res.status(200).json({
        success: true,
        message: "Mật khẩu đã được cập nhật thành công",
      });
    } catch (error) {
      console.error("Error in changePassword:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi thay đổi mật khẩu",
      });
    }
  }
  

  static async logout(req) {
    const { refreshToken } = req.body;

    //get private key
    const keyToken = await KeyTokenService.findByRefreshToken(refreshToken);

    if (!keyToken) {
      throw new NotFoundResponse("Invalid token");
    }

    const { userId } = await verifyRefreshToken(
      refreshToken,
      keyToken.privateKey
    );

    if (!userId) {
      throw new NotFoundResponse("Invalid token");
    }

    await KeyTokenService.deleteKeyById(userId);

    return "Logged out";
  }
}

module.exports = AuthService;
