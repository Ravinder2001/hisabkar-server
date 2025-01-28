const client = require("../configuration/db");

module.exports = {
  checkNonVerifiedEmail: async (email) => {
    try {
      const emailCheck = await client.query(`SELECT COUNT(user_id) FROM tbl_users WHERE email = $1 AND is_verified = FALSE`, [email]);

      return emailCheck.rows[0].count;
    } catch (error) {
      console.error("Error in sending OTP:", error.message);
      throw error;
    }
  },
  checkVerifiedEmail: async (email) => {
    try {
      const emailCheck = await client.query(`SELECT COUNT(user_id) FROM tbl_users WHERE email = $1 AND is_verified = TRUE`, [email]);

      return emailCheck.rows[0].count;
    } catch (error) {
      console.error("Error in sending OTP:", error.message);
      throw error;
    }
  },
  sendOTP: async (values) => {
    try {
      const { email, otp } = values;

      // Attempt to update OTP for an existing user
      const updateResult = await client.query(
        `
        UPDATE tbl_users SET otp = $1 WHERE email = $2 RETURNING *
        `,
        [otp, email]
      );

      if (updateResult.rows.length > 0) {
        // User exists and OTP is updated
        return updateResult.rows[0];
      } else {
        // Insert new user with OTP if no existing user is found
        const insertResult = await client.query(
          `
          INSERT INTO tbl_users(email, otp) VALUES($1, $2) RETURNING *
          `,
          [email, otp]
        );
        return insertResult.rows[0];
      }
    } catch (error) {
      console.error("Error in sending OTP:", error.message);
      throw error;
    }
  },
  validateOTP: async (values) => {
    try {
      const { email, otp } = values;

      // Attempt to update OTP for an existing user
      const userData = await client.query(`SELECT COUNT(user_id) FROM tbl_users WHERE email = $1 AND otp = $2`, [email, otp]);
      return userData.rows[0].count;
    } catch (error) {
      console.error("Error in sending OTP:", error.message);
      throw error;
    }
  },
  register: async (values) => {
    try {
      await client.query("BEGIN");
      const updateUserRes = await client.query(
        `
        UPDATE tbl_users SET name = $1, is_verified = TRUE WHERE email = $2 RETURNING user_id
      `,
        [values.name, values.email]
      );

      const UserID = updateUserRes.rows[0].user_id;
      await client.query(
        `
        INSERT INTO tbl_upi_address(user_id,upi_address) VALUES($1,$2)
      `,
        [UserID, values.upiAddress]
      );
      await client.query("COMMIT");
      return;
    } catch (error) {
      await client.query("ROLLBACK");
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
