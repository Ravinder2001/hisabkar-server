const client = require("../configuration/db");
const generateOTP = require("../helpers/generateOTP");

module.exports = {
  createGroup: async (values) => {
    try {
      let code;
      let isUnique = false;

      // Loop to ensure the generated code is unique
      do {
        code = generateOTP();
        const result = await client.query(`SELECT COUNT(*) AS count FROM tbl_groups WHERE code = $1`, [code]);
        if (result.rows[0].count === "0") {
          isUnique = true;
        }
      } while (!isUnique);

      // Insert the group with the unique code
      await client.query(
        `
        INSERT INTO tbl_groups(group_type_id, admin_user, code, group_name) 
        VALUES($1, $2, $3, $4)
        `,
        [values.groupTypeId, values.userId, code, values.groupName]
      );

      return code;
    } catch (error) {
      console.error("Error in creating group:", error.message);
      throw error;
    }
  },
  joinGroup: async (values) => {
    try {
      // Insert the group with the unique code
      await client.query(
        `
        INSERT INTO tbl_group_members(group_id, user_id) 
        VALUES($1, $2)
        `,
        [values.groupId, values.userId]
      );

      return;
    } catch (error) {
      console.error("Error in creating group:", error.message);
      throw error;
    }
  },
  findGroupById: async (grouoId) => {
    try {
      // Insert the group with the unique code
      let groupQuery = await client.query(`SELECT * FROM tbl_groups WHERE group_id = $1`, [grouoId]);

      return groupQuery.rows[0];
    } catch (error) {
      console.error("Error in creating group:", error.message);
      throw error;
    }
  },
};
