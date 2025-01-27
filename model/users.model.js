const client = require("../configuration/db");

module.exports = {
  sendOTP: async (values) => {
    try {
      const { email, otp } = values;
      const emailCheck = await client.query(
        `
        SELECT user_id, is_verified FROM tbl_users WHERE email = $1
        `,
        [email]
      );

      if (emailCheck.rows.length > 0) {
        const user = emailCheck.rows[0];
        if (user.is_verified) {
          throw new Error("Email already exists and is verified. Please try another email.");
        } else {
          // Update OTP for unverified user
          const updateResult = await client.query(
            `
            UPDATE tbl_users SET otp = $1 WHERE email = $2
            `,
            [otp, email]
          );
          return updateResult.rows[0];
        }
      } else {
        // Insert new user with OTP
        const result = await client.query(
          `
          INSERT INTO tbl_users(email, otp) VALUES($1, $2)
          `,
          [email, otp]
        );
        return result.rows[0];
      }
    } catch (error) {
      console.error("Error in sending OTP:", error.message);
      throw error;
    }
  },
  register: async (values) => {
    try {
      const { username, email, password, full_name, gender } = values;

      const query = `
        INSERT INTO tbl_users 
        (username, email, password, full_name, gender) 
        VALUES ($1, $2, $3, $4, $5)
        RETURNING user_id, username;
      `;

      const params = [username, email, password, full_name, gender];

      const result = await client.query(query, params);

      return result.rows[0];
    } catch (error) {
      console.error("Error in registering user:", error.message);
      throw error;
    }
  },
  getUserDetailsByEmail: async (email) => {
    try {
      const query = `SELECT * FROM tbl_users WHERE email = $1`;

      const params = [email];

      const result = await client.query(query, params);

      return result.rows[0];
    } catch (error) {
      console.error("Error in getting user details by email:", error.message);
      throw error;
    }
  },
  getUserDetailsByID: async (user_id) => {
    try {
      const query = `SELECT * FROM tbl_users WHERE user_id = $1`;

      const params = [user_id];

      const result = await client.query(query, params);

      return result.rows[0];
    } catch (error) {
      console.error("Error in getting user details by ID:", error.message);
      throw error;
    }
  },
  usernameExists: async (username) => {
    try {
      const query = `SELECT * FROM tbl_users WHERE username = $1`;

      const params = [username];

      const result = await client.query(query, params);

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error in checking username:", error.message);
      throw error;
    }
  },
};
