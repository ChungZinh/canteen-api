const {
  StatusCodes: STATUS_CODE,
  ReasonPhrases: REASON_PHRASES,
} = require("../utils/httpStatusCode");

class ErrorResponse extends Error {
  constructor(message, statusCode = STATUS_CODE.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
  }
}

class NotFoundResponse extends ErrorResponse {
  constructor(message = REASON_PHRASES.NOT_FOUND) {
    super(message, STATUS_CODE.NOT_FOUND);
  }
}

class BadRequestResponse extends ErrorResponse {
  constructor(message = REASON_PHRASES.BAD_REQUEST) {
    super(message, STATUS_CODE.BAD_REQUEST);
  }
}

class UnauthorizedResponse extends ErrorResponse {
  constructor(message = REASON_PHRASES.UNAUTHORIZED) {
    super(message, STATUS_CODE.UNAUTHORIZED);
  }
}

class ForbiddenResponse extends ErrorResponse {
  constructor(message = REASON_PHRASES.FORBIDDEN) {
    super(message, STATUS_CODE.FORBIDDEN);
  }
}

class ConflictResponse extends ErrorResponse {
  constructor(message = REASON_PHRASES.CONFLICT) {
    super(message, STATUS_CODE.CONFLICT);
  }
}


module.exports = {
  ErrorResponse,
  NotFoundResponse,
  BadRequestResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
  ConflictResponse,
};
