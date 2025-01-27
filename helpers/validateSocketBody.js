const validateSocketBody = (schema) => {
  return (socket, next) => {
    return (msg) => {
      const { error } = schema.validate(msg);
      if (error) {
        console.log(error);
        socket.emit("error", `Validation error: ${error.details[0].message}`);
      } else {
        next(msg);
      }
    };
  };
};

module.exports = validateSocketBody;
