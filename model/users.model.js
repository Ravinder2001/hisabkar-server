const client = require("../configuration/db");
const generateTimestamp = require("../utils/common/generateTimestamp");

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
  sendLoginOTP: async (values) => {
    try {
      const { email, otp } = values;

      // Attempt to update OTP for an existing user
      await client.query(
        `
        UPDATE tbl_users SET otp = $1 WHERE email = $2 RETURNING *
        `,
        [otp, email]
      );
      return;
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
        UPDATE tbl_users SET name = $1,avatar = $2, is_verified = TRUE WHERE email = $3 RETURNING user_id
      `,
        [values.name, values.avatar, values.email]
      );

      const UserID = updateUserRes.rows[0].user_id;
      await client.query(
        `
        INSERT INTO tbl_upi_address(user_id,upi_address) VALUES($1,$2)
      `,
        [UserID, values.upiAddress]
      );
      await client.query(
        `
        INSERT INTO tbl_user_options(user_id,availibilty_status,created_at) VALUES($1,$2,$3)
      `,
        [UserID, true, generateTimestamp()]
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
  sWSubscribe: async (values) => {
    try {
      await client.query(
        `INSERT INTO tbl_sw_subscriptions (user_id, endpoint, p256dh, auth, created_at) 
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id) 
         DO UPDATE SET endpoint = $2, p256dh = $3, auth = $4, created_at = $5`,
        [values.userId, values.endpoint, values.keys.p256dh, values.keys.auth, generateTimestamp()]
      );

      return;
    } catch (error) {
      console.error("Error in checking username:", error.message);
      throw error;
    }
  },
  getUsersSWData: async (usersArray) => {
    try {
      const { rows } = await client.query(
        `SELECT user_id, endpoint, 
              jsonb_build_object('p256dh', p256dh, 'auth', auth) AS keys
       FROM tbl_sw_subscriptions 
       WHERE user_id = ANY($1)`,
        [usersArray]
      );

      return rows; // Return the fetched subscription data
    } catch (error) {
      console.error("Error in fetching user subscriptions:", error.message);
      throw error;
    }
  },
  getUserProfileDetails: async (user_id) => {
    try {
      const { rows } = await client.query(
        `
        SELECT 
        u.email,
        u.name,
        u.avatar,
        u.created_at,
        u.role,
        uo.availibilty_status as is_available
        FROM tbl_users u
        LEFT JOIN tbl_user_options uo ON uo.user_id = u.user_id
       WHERE u.user_id = $1`,
        [user_id]
      );

      return rows[0]; // Return the fetched subscription data
    } catch (error) {
      console.error("Error in fetching user subscriptions:", error.message);
      throw error;
    }
  },
  updateProfileDetails: async (values) => {
    try {
      await client.query("BEGIN");
      await client.query(`UPDATE tbl_users SET name = $1, avatar = $2 WHERE user_id = $3`, [values.name, values.avatar, values.userId]);
      await client.query(`UPDATE tbl_user_options SET availibilty_status = $1 WHERE user_id = $2`, [values.is_available, values.userId]);

      await client.query("COMMIT");
      return;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error in fetching user subscriptions:", error.message);
      throw error;
    }
  },
  toggleAvailiblityStatus: async (user_id) => {
    try {
      await client.query(
        `
        UPDATE tbl_user_options SET availibilty_status = NOT availibilty_status WHERE user_id = $1`,
        [user_id]
      );

      return; // Return the fetched subscription data
    } catch (error) {
      console.error("Error in fetching user subscriptions:", error.message);
      throw error;
    }
  },
};
