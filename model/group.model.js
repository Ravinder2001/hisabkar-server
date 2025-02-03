const client = require("../configuration/db");
const generateOTP = require("../helpers/generateOTP");

module.exports = {
  createGroup: async (values) => {
    try {
      await client.query("BEGIN");
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
      const groupId = await client.query(
        `
        INSERT INTO tbl_groups(group_type_id, admin_user, code, group_name) 
        VALUES($1, $2, $3, $4)
        RETURNING group_id
        `,
        [values.groupTypeId, values.userId, code, values.groupName]
      );

      await client.query(
        `
        INSERT INTO tbl_group_members(group_id,user_id) VALUES($1,$2)`,
        [groupId.rows[0].group_id, values.userId]
      );
      await client.query("COMMIT");
      return code;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error in creating group:", error.message);
      throw error;
    }
  },
  joinGroup: async (values) => {
    try {
      await client.query("BEGIN");
      const groupIdQuery = await client.query(`SELECT * FROM tbl_groups WHERE code = $1`, [values.groupCode]);
      // Insert the group with the unique code
      let GroupID = groupIdQuery.rows[0].group_id;
      await client.query(
        `
        INSERT INTO tbl_group_members(group_id, user_id) 
        VALUES($1, $2)
        `,
        [GroupID, values.userId]
      );
      await client.query("COMMIT");
      return {
        group_id: GroupID,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error in creating group:", error.message);
      throw error;
    }
  },
  findGroupByCode: async (groupCode) => {
    try {
      // Insert the group with the unique code
      let groupQuery = await client.query(`SELECT * FROM tbl_groups WHERE code = $1`, [groupCode]);

      return groupQuery.rows[0];
    } catch (error) {
      console.error("Error in creating group:", error.message);
      throw error;
    }
  },
  getAllGroupMemebersByCode: async (groupCode) => {
    try {
      const GroupId = await client.query(`SELECT * FROM tbl_groups WHERE code = $1`, [groupCode]);

      // Insert the group with the unique code
      let groupQuery = await client.query(`SELECT * FROM tbl_group_members WHERE group_id = $1`, [GroupId.rows[0].group_id]);

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
          g.group_type_id,
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
      const query = `
        SELECT
          g.group_name,
          g.group_type_id,
          g.total_amount,
          g.is_settled,
          COUNT(DISTINCT gm.member_id) AS total_members_count,
          COUNT(DISTINCT e.expense_id) AS total_expenses_count,
          CASE 
            WHEN g.admin_user = $2 THEN true
            ELSE false
          END AS is_you_admin,
          ARRAY(
            SELECT JSON_BUILD_OBJECT(
              'id', u.user_id, 
              'name', u.name, 
              'avatar', u.avatar, 
              'total_spent', COALESCE(SUM(e.amount), 0)
            )
            FROM tbl_users u
            JOIN tbl_group_members gm2 ON gm2.user_id = u.user_id
            LEFT JOIN tbl_expenses e ON e.paid_by = u.user_id AND e.group_id = g.group_id
            WHERE gm2.group_id = g.group_id
            GROUP BY u.user_id
          ) AS members
        FROM tbl_groups g
        LEFT JOIN tbl_group_members gm ON gm.group_id = g.group_id
        LEFT JOIN tbl_expenses e ON e.group_id = g.group_id
        WHERE g.group_id = $1
        GROUP BY g.group_id
      `;

      const groupQuery = await client.query(query, [values.groupId, values.userId]);

      if (groupQuery.rows.length === 0) {
        throw new Error("Group not found");
      }

      const groupData = groupQuery.rows[0];
      return {
        ...groupData,
        total_amount: parseFloat(groupData.total_amount), // Convert to number
        members: groupData.members.map((member) => ({
          ...member,
          total_spent: parseFloat(member.total_spent), // Convert total_spent to number
        })),
      };
    } catch (error) {
      console.error("Error in fetching group data:", error.message);
      throw error;
    }
  },
  getGroupTypeList: async () => {
    try {
      // SQL query to get all the required information
      const query = `
        SELECT
          group_type_id as id,
          type_name as name,
          icon
        FROM tbl_group_types
      `;

      // Execute the query with the provided groupId
      const groupQuery = await client.query(query);

      return groupQuery.rows;
    } catch (error) {
      console.error("Error in fetching group data:", error.message);
      throw error;
    }
  },
};
