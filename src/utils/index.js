const { Types } = require("mongoose");

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((item) => [item, 1]));
};

const unGetSelectData = (select = []) => {
  return Object.fromEntries(select.map((item) => [item, 0]));
};

const removeNull = (obj) => {
  Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
  return obj;
};

const updateNestedObject = (obj) => {
  const final = {};
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      const response = updateNestedObject(obj[key]);
      Object.keys(response).forEach((nestedKey) => {
        final[`${key}.${nestedKey}`] = response[nestedKey];
      });
    } else {
      final[key] = obj[key];
    }
  });
  return final;
};

const convertToObjectId = (id) => {
  new Types.ObjectId(id);
};

module.exports = {
  getSelectData,
  unGetSelectData,
  removeNull,
  updateNestedObject,
  convertToObjectId,
};
