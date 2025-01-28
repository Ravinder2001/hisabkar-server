let Messages = {
  // General
  SUCCESS: "Request completed successfully.",
  FAILED: "Request failed. Please try again.",
  SERVER_ERROR: "Internal server error. Please try again later.",
  NOT_FOUND: "Resource not found.",
  UNAUTHORIZED: "Unauthorized access.",
  FORBIDDEN: "You do not have permission to access this resource.",
  BAD_REQUEST: "Invalid request data.",
  VALIDATION_ERROR: "Request data validation failed.",
  INVALID_FILE_TYPE: "Invalid file type. Please upload a valid file.",
  INVALID_FILE_SIZE: (min, max) => `File size must be between ${min} and ${max}.`,
  NO_DATA: "No data found.",
  DATA_ADDED: "Data added successfully.",
  DATA_UPDATED: "Data updated successfully.",
  DATA_DELETED: "Data deleted successfully.",
  INVALID_TYPE: "Invalid type.",
  PARAMETERS_REQ: "Request parameters are required",
  INVALID_PAYLOAD: "Not a valid payload",
  ALREADY_EXISTS: (field, fieldName) => `${fieldName}: ${field} is already exists.`,
  WRONG_OTP: "OTP is incorrect",

  // Authentication & Authorization
  AUTH_REQUIRED: "Authentication required. Please log in.",
  LOGIN_SUCCESS: "Login successful.",
  LOGIN_FAILED: "Login failed. Please check your credentials.",
  LOGOUT_SUCCESS: "Logout successful.",
  TOKEN_EXPIRED: "Your session has expired. Please log in again.",
  ACCESS_DENIED: "Access denied. You do not have the necessary permissions.",
  PASSWORD_RESET: "Password reset successful.",
  INVALID_CREDS: "Invalid credentials provided.",
  INVALID_USER_ID: "Invalid user ID.",
  WRONG_PASSWORD: "Incorrect password. Please try again.",
  OTP_SENT: "OTP has been sent to your email address.",

  // Database Operations
  DATA_FETCH_SUCCESS: "Data fetched successfully.",
  DATA_FETCH_FAILED: "Failed to fetch data.",
  DATA_SAVE_SUCCESS: "Data saved successfully.",
  DATA_SAVE_FAILED: "Failed to save data.",
  DATA_UPDATE_SUCCESS: "Data updated successfully.",
  DATA_UPDATE_FAILED: "Failed to update data.",
  DATA_DELETE_SUCCESS: "Data deleted successfully.",
  DATA_DELETE_FAILED: "Failed to delete data.",

  // User Management
  USER_REGISTER_SUCCESS: "User registered successfully.",
  USER_REGISTER_FAILED: "User registration failed.",
  USER_NOT_FOUND: "User not found.",
  USER_UPDATE_SUCCESS: "User details updated successfully.",
  USER_UPDATE_FAILED: "Failed to update user details.",
  USER_DELETE_SUCCESS: "User deleted successfully.",
  USER_DELETE_FAILED: "Failed to delete user.",
  USER_ALREADY_EXISTS: "User already exists.",
  USER_DEACTIVATED: "Your account is currently deactivated. Please contact the administrator for assistance.",
  FRIEND_REQ: "Friend request sent successfully.",

  // Form Validation
  REQUIRED_FIELD: (field) => `${field} is required.`,
  INVALID_EMAIL: "Invalid email format.",
  INVALID_PHONE: "Invalid phone number.",
  PASSWORD_TOO_WEAK: "Password is too weak. Please choose a stronger password.",
  PASSWORD_MISMATCH: "Passwords do not match.",

  // API Specific
  API_LIMIT_EXCEEDED: "API rate limit exceeded. Please wait and try again.",
  INVALID_REQUEST: "Invalid request format.",
  MISSING_PARAMETERS: "Required parameters are missing.",

  // Pagination
  PAGE_NOT_FOUND: "Requested page not found.",
  INVALID_PAGE_NUMBER: "Invalid page number.",

  // Networking
  CONNECTION_ERROR: "Network connection error. Please check your internet connection.",
  TIMEOUT_ERROR: "The request timed out. Please try again.",

  // Chat
  MSG_DELETED: "This message was deleted.",
  CHANNEL_CREATED: "Channel created successfully.",
};

module.exports = Messages;
