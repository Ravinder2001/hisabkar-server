module.exports = {
  USER_TYPES: {
    USER: "User",
  },
  TIME_FORMAT: {
    STANDARD_TIME_FORMAT: "YYYY-MM-DD HH:mm:ss",
  },
  HttpStatus: {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 300,
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    NOT_MODIFIED: 304,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    ALREADY_EXISTS: 403,
    NOT_FOUND: 404,
    NOT_ALLOWED: 405,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
  },
  TIME: {
    expiry_time: 10, //Minutes
  },

  SOCKET_EVENTS: {},
  VARIABLES: {
    REGEX: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])",
  },
};
