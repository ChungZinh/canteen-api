const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../helpers/asyncHandler");
const {
  UnauthorizedResponse,
  NotFoundResponse,
} = require("../core/error.response");
const KeyTokenService = require("../services/keyToken.service");
const Role = require("../models/role.model");
const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
  CLIENT_ID: "x-client-id",
  REFRESH_TOKEN: "refresh-token",
};

const generateTokens = (payload, privateKey) => {
  const accessToken = jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "7d",
  });
  const refreshToken = jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

const authentification = asyncHandler(async (req, res, next) => {
  // 1 -  check userId missing
  // 2 - get accessToken from header
  // 3 - verify accessToken
  // 4 - check user in database
  // 5 - check keyStore with userId

  const userId = req.headers[HEADER.CLIENT_ID]?.toString();
  if (!userId) throw new UnauthorizedResponse("User id is required");

  const keyStore = await KeyTokenService.findByUserId(userId);
  if (!keyStore) throw new NotFoundResponse("User not found");

  // check premission

  const refreshToken = req.headers[HEADER.REFRESH_TOKEN]?.toString();
  if (refreshToken) {
    try {
      const decodedUser = jwt.verify(refreshToken, keyStore.privateKey);
      if (userId !== decodedUser.userId)
        throw new UnauthorizedResponse("Invalid user id");

      if (decodedUser.role !== "admin")
        throw new UnauthorizedResponse("User is not admin");

      req.keyStore = keyStore;
      req.user = decodedUser;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      throw new UnauthorizedResponse("Invalid refresh token");
    }
  }

  // const accessToken = req.headers[HEADER.AUTHORIZATION]?.toString();
  const authorizationHeader = req.headers[HEADER.AUTHORIZATION];

  const accessToken = authorizationHeader
    ? authorizationHeader.toString().split(" ")[1]
    : null;


  if (accessToken) {
    try {
      const decodedUser = jwt.verify(accessToken, keyStore.publicKey);
      if (userId !== decodedUser.userId)
        throw new UnauthorizedResponse("Invalid user id");
      req.keyStore = keyStore;
      req.user = decodedUser;
      return next();
    } catch (error) {
      throw new UnauthorizedResponse("Invalid access token");
    }
  } else {
    throw new UnauthorizedResponse("Access token is required");
  }
});

const verifyRefreshToken = async (refreshToken, privateKey) => {
  return jwt.verify(refreshToken, privateKey);
};

module.exports = {
  generateTokens,
  authentification,
  verifyRefreshToken,
};
