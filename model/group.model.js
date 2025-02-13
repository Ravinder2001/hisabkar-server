const client = require("../configuration/db");
const generateOTP = require("../helpers/generateOTP");
const Messages = require("../utils/constant/messages");

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
          ) AS members
        FROM tbl_groups g
        WHERE g.group_id IN (SELECT gm.group_id FROM tbl_group_members gm WHERE gm.user_id = $1) AND group_id = $2 AND g.is_active = TRUE
      `;

      // Execute the query with the provided userId
      const groupQuery = await client.query(query, [values.userId, groupId.rows[0].group_id]);

      await client.query("COMMIT");
      return { code, group_data: groupQuery.rows[0] };
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
  leaveGroup: async (values) => {
    try {
      const groupData = await client.query(`SELECT admin_user FROM tbl_groups WHERE group_id = $1`, [values.groupId]);

      if (groupData.rows[0].admin_user == values.userId) {
        throw new Error(Messages.ADMIN_NOT_LEFT);
      }

      await client.query(
        `
        DELETE FROM tbl_group_members WHERE group_id = $1 AND user_id = $2
        `,
        [values.groupId, values.userId]
      );
      return;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error in creating group:", error.message);
      throw error;
    }
  },
  findGroupByCode: async (groupCode) => {
    try {
      // Insert the group with the unique code
      let groupQuery = await client.query(`SELECT * FROM tbl_groups WHERE code = $1 AND is_active = TRUE`, [groupCode]);

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
            g.code,
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
        AND g.is_active = TRUE
        ORDER BY g.created_at DESC;
  
      `;

      // Execute the query with the provided userId
      const groupQuery = await client.query(query, [userId]);

      // Process the result
      const groups = groupQuery.rows.map((group) => {
        const avatars = group.members_avatars || [];
        return {
          ...group,
          members: avatars.slice(0, 2), // Only first 5 avatars
          remaining_members: avatars.length > 3 ? avatars.length - 3 : undefined, // Remaining count
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
        WHERE g.group_id = $1 AND g.is_active = TRUE
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
  getMyPairs: async ({ group_id, user_id }) => {
    try {
      // Fetch all expenses related to the group
      const expenseQuery = await client.query(
        `
        SELECT e.expense_id, e.amount AS total_amount, e.paid_by, em.user_id AS participant, em.amount AS share,
               u.name AS participant_name, up.name AS payer_name
        FROM tbl_expenses e
        JOIN tbl_expense_members em ON e.expense_id = em.expense_id
        JOIN tbl_users u ON em.user_id = u.user_id
        JOIN tbl_users up ON e.paid_by = up.user_id
        WHERE e.group_id = $1
        `,
        [group_id]
      );

      const transactions = expenseQuery.rows;
      const balances = new Map();

      transactions.forEach(({ paid_by, participant, share }) => {
        if (paid_by === participant) return; // Ignore self-payments

        // If user paid, others owe them
        if (paid_by === user_id) {
          balances.set(participant, (balances.get(participant) || 0) + parseFloat(share));
        }
        // If user participated, they owe the payer
        if (participant === user_id) {
          balances.set(paid_by, (balances.get(paid_by) || 0) - parseFloat(share));
        }
      });

      const send = [];
      const receive = [];

      // Process final balances
      balances.forEach((amount, user) => {
        if (amount > 0) {
          receive.push({ user_name: transactions.find((t) => t.participant === user)?.participant_name, amount });
        } else if (amount < 0) {
          send.push({ user_name: transactions.find((t) => t.paid_by === user)?.payer_name, amount: Math.abs(amount) });
        }
      });

      return { send, receive };
    } catch (error) {
      console.error("Error in fetching expense data:", error.message);
      throw error;
    }
  },
  toggleGroupSettlement: async ({ group_id, user_id }) => {
    try {
      const result = await client.query(
        `
        UPDATE tbl_groups 
        SET is_settled = NOT is_settled 
        WHERE group_id = $1 AND admin_user = $2
        RETURNING is_settled;
        `,
        [group_id, user_id]
      );

      return result.rows[0]; // Returning the updated value
    } catch (error) {
      console.error("Error in toggling group settlement:", error.message);
      throw error;
    }
  },
  toggleGroupVisibilty: async ({ group_id, user_id }) => {
    try {
      const result = await client.query(
        `
        UPDATE tbl_groups 
        SET is_active = NOT is_active 
        WHERE group_id = $1 AND admin_user = $2
        RETURNING is_active;
        `,
        [group_id, user_id]
      );

      return result.rows[0]; // Returning the updated value
    } catch (error) {
      console.error("Error in toggling group settlement:", error.message);
      throw error;
    }
  },
};
