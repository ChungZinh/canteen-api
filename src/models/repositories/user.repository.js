const User = require("../../models/user.model");
const findUserById = async (id) => {
  return await User.findById(id);
};

const findUserByEmail = async (email) => {
  return await User.findOne({ email }).lean();
};

const findUserByStudentId = async (studentId) => {
  return await User.findOne({ studentId }).lean();
};

module.exports = {
  findUserById,
  findUserByEmail,
  findUserByStudentId,
};
