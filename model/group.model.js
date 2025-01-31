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
  getAllGroupMemebers: async (groupId) => {
    try {
      // Insert the group with the unique code
      let groupQuery = await client.query(`SELECT * FROM tbl_group_members WHERE group_id = $1`, [groupId]);

      return groupQuery.rows;
    } catch (error) {
      console.error("Error in creating group:", error.message);
      throw error;
    }
  },
  getAllGroups: async (userId) => {
    try {
      // SQL query to get all the required information
      const query = `
        SELECT
          g.group_id,
          g.group_name,
          gt.type_name AS group_type,
          g.total_amount,
          g.is_settled,
          (
            SELECT COUNT(*) 
            FROM tbl_group_members gm_count 
            WHERE gm_count.group_id = g.group_id
          ) AS total_members_count,
          CASE 
            WHEN g.admin_user = $1 THEN true
            ELSE false
          END AS is_you_admin,
          ARRAY(
            SELECT u.avatar
            FROM tbl_users u
            JOIN tbl_group_members gm2 ON gm2.user_id = u.user_id
            WHERE gm2.group_id = g.group_id
          ) AS members_avatars
        FROM tbl_groups g
        LEFT JOIN tbl_group_types gt ON g.group_type_id = gt.group_type_id
        WHERE g.group_id IN (SELECT gm.group_id FROM tbl_group_members gm WHERE gm.user_id = $1)
      `;

      // Execute the query with the provided userId
      const groupQuery = await client.query(query, [userId]);

      // Process the result
      const groups = groupQuery.rows.map((group) => {
        const avatars = group.members_avatars || [];
        return {
          ...group,
          members: avatars.slice(0, 5), // Only first 5 avatars
          remaining_members: avatars.length > 5 ? avatars.length - 5 : undefined, // Remaining count
          members_avatars: undefined, // Removing the raw avatars array
        };
      });

      return groups;
    } catch (error) {
      console.error("Error in fetching groups:", error.message);
      throw error;
    }
  },
  getGroupDataById: async (values) => {
    try {
      // SQL query to get all the required information
      const query = `
        SELECT
          g.group_id,
          g.group_name,
          gt.type_name AS group_type,
          g.total_amount,
          g.is_settled,
          COUNT(gm.member_id) AS total_members_count,
          COUNT(e.expense_id) AS total_expenses_count,
          CASE 
            WHEN g.admin_user = $2 THEN true
            ELSE false
          END AS is_you_admin,
          ARRAY(
            SELECT JSON_BUILD_OBJECT('name', u.name, 'avatar', u.avatar)
            FROM tbl_users u
            JOIN tbl_group_members gm2 ON gm2.user_id = u.user_id
            WHERE gm2.group_id = g.group_id
          ) AS members
        FROM tbl_groups g
        LEFT JOIN tbl_group_types gt ON g.group_type_id = gt.group_type_id
        LEFT JOIN tbl_group_members gm ON gm.group_id = g.group_id
        LEFT JOIN tbl_expenses e ON e.group_id = g.group_id
        WHERE g.group_id = $1
        GROUP BY g.group_id, gt.type_name
      `;

      // Execute the query with the provided groupId
      const groupQuery = await client.query(query, [values.groupId, values.userId]);

      if (groupQuery.rows.length === 0) {
        throw new Error("Group not found");
      }

      // Structure the result
      const groupData = groupQuery.rows[0];
      const result = {
        ...groupData,
        members: groupData.members.map((member) => ({
          name: member.name,
          avatar: member.avatar,
        })),
      };

      return result;
    } catch (error) {
      console.error("Error in fetching group data:", error.message);
      throw error;
    }
  },
};
