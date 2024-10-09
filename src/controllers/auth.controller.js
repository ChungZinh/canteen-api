const {
  CreatedResponse,
  SuccessResponse,
} = require("../core/success.response");
const AuthService = require("../services/auth.service");
class AuthController {
  static async register(req, res, next) {
    new CreatedResponse({
      message: "User registered successfully",
      data: await AuthService.registerAdmin(req),
    }).send(res);
  }

  static async login(req, res, next) {
    new SuccessResponse({
      message: "User logged in successfully",
      data: await AuthService.loginAdmin({
        email: req.body.email,
        password: req.body.password,
      }),
    }).send(res);
  }

  static async signup(req, res, next) {
    new CreatedResponse({
      message: "User signed up successfully",
      data: await AuthService.registerUser(req),
    }).send(res);
  }

  static async signin(req, res, next) {
    new SuccessResponse({
      message: "User signed in successfully",
      data: await AuthService.loginUser({
        studentId: req.body.studentId,
        password: req.body.password,
      }),
    }).send(res);
  }

  static async logout(req, res, next) {
    new SuccessResponse({
      message: "User logged out successfully",
      data: await AuthService.logout(req),
    }).send(res);
  }
}

module.exports = AuthController;
