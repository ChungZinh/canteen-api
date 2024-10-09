const {
  StatusCodes: STATUS_CODE,
  ReasonPhrases: REASON_PHRASES,
} = require("../utils/httpStatusCode");

class SuccessResponse {
  constructor({
    message,
    statusCode = STATUS_CODE.OK,
    reasonPhrases = REASON_PHRASES.OK,
    data = {},
  }) {
    this.message = !message ? REASON_PHRASES.OK : message;
    this.statusCode = statusCode;
    this.data = data;
  }

  send(res, headers = {}) {
    res.status(this.statusCode).json(this);
  }
}

class CreatedResponse extends SuccessResponse {
  constructor(message, data = null) {
    super(message, STATUS_CODE.CREATED, data);
  }

  send(res, headers = {}) {
    super.send(res, headers);
  }
}

module.exports = {
  SuccessResponse,
  CreatedResponse,
};
