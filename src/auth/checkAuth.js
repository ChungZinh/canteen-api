const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
  CLIENT_ID: "x-client-id",
};

const checkAuth = async (req, res, next) => {
  const key = req.headers[HEADER.API_KEY]?.toString();
  if (!key) {
    return res.status(401).json({
      error: true,
      message: "Api key is required",
    });
  }

  // check if key is valid
  const objKey = await findById(key);
  if (!objKey) {
    return res.status(401).json({
      error: true,
      message: "Invalid api key",
    });
  }

  req.objKey = objKey;
  return next();
};


const checkPermissions = (permission) => {
    return async (req, res, next) => {
      try {
        // check if user has permission
        if (!req.objKey.permissions.includes(permission)) {
          return res.status(403).json({
            error: true,
            message: "Permission denied",
          });
        }
        return next();
      } catch (error) {}
    };
  };


module.exports = {
  checkAuth,
  checkPermissions,
};