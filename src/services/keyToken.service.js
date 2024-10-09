const Key = require("../models/key.model");
const { Types } = require("mongoose");
class KeyTokenService {
  generateKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      const filter = { user: userId };
      const update = {
        publicKey,
        privateKey,
        refreshToken,
        refreshTokenUsed: [],
      };
      const options = { new: true, upsert: true };

      const tokens = await Key.findOneAndUpdate(filter, update, options).lean();

      return tokens;
    } catch (error) {
      return {
        error: true,
        message: error.message,
      };
    }
  };

  findByUserId = async (userId) => {
    return Key.findOne({ user: userId });
  };

  removeKeyById = async (id) => {
    return Key.findByIdAndDelete(id);
  };

  findByRefreshTokenUsed = async (refreshToken) => {
    return Key.findOne({ refreshTokenUsed: refreshToken }).lean();
  };

  findByRefreshToken = async (refreshToken) => {
    return Key.findOne({ refreshToken });
  };

  deleteKeyById = async (userId) => {
    return Key.deleteOne({ user: new Types.ObjectId(userId) });
  };
}

module.exports = new KeyTokenService();
