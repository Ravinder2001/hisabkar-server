const client = require("../configuration/db");

const getExpenseById = async (values) => {
  try {
    const expenseQuery = await client.query(
      `
      SELECT 
        e.expense_id,
        e.expense_name,
        e.expense_type_id,
        e.description,
        e.split_type,
        e.amount,
        e.paid_by,
        e.created_at,
        COUNT(em.user_id) AS members_count,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', em.user_id,  
            'amount', em.amount
          )
        ) AS members,
        CASE 
        WHEN e.paid_by = $2 THEN TRUE 
        ELSE FALSE 
      END AS is_own_expense

      FROM 
        tbl_expenses e
      INNER JOIN 
        tbl_expense_members em ON e.expense_id = em.expense_id
      WHERE 
        e.group_id = $1 AND e.is_active = TRUE AND e.expense_id = $3
      GROUP BY 
        e.expense_id, e.paid_by
      ORDER BY 
        e.created_at DESC
      `,
      [values.groupId, values.userId, values.expenseId]
    );

    const expenseList = expenseQuery.rows;

    return expenseList;
  } catch (error) {
    console.error("Error in fetching expenses:", error.message);
    throw error;
  }
};

module.exports = {
  addExpense: async (values) => {
    const { expenseName, expenseTypeId, description, amount, groupId, paidBy, members, splitType } = values;
    try {
      await client.query("BEGIN");

      // Step 1: Add Expense
      const expenseResult = await client.query(
        `WITH inserted_expense AS (
          INSERT INTO tbl_expenses (
              group_id,
              expense_type_id, 
              expense_name, 
              amount, 
              paid_by,
              description,
              split_type
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING expense_id, paid_by
      )
      SELECT inserted_expense.expense_id, tbl_users.name
      FROM inserted_expense
      LEFT JOIN tbl_users ON tbl_users.user_id = inserted_expense.paid_by;
      `,
        [groupId, expenseTypeId, expenseName, amount, paidBy, description, splitType]
      );
      const expense_data = expenseResult.rows[0];
      const expense_id = expenseResult.rows[0].expense_id;

      // Step 2: Add Expense Members
      for (const member of members) {
        await client.query(
          `INSERT INTO tbl_expense_members (expense_id, user_id, amount) 
           VALUES ($1, $2, $3)`,
          [expense_id, member.userId, member.amount]
        );
      }

      await client.query(
        `UPDATE tbl_groups
        SET total_amount = total_amount + $2
        WHERE group_id = $1`,
        [groupId, amount]
      );

      const groupData = await client.query(
        `
          SELECT 
          g.group_name, 
          jsonb_agg(m.user_id) AS user_ids
          FROM tbl_groups g
          LEFT JOIN tbl_group_members m ON g.group_id = m.group_id
          WHERE g.group_id = $1
          GROUP BY g.group_name
        `,
        [groupId]
      );

      const expenseData = await getExpenseById({ groupId, userId: paidBy, expenseId: expense_id });
      await client.query("COMMIT");
      return { expenseData, groupData: groupData.rows[0], expense_data };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error in creating group:", error.message);
      throw error;
    }
  },
  editExpense: async (values) => {
    const { expenseId, expenseName, expenseTypeId, amount, paidBy, members, description, splitType } = values;
    try {
      await client.query("BEGIN");

      // Step 1: Fetch old expense details
      const oldExpense = await client.query(`SELECT amount, paid_by FROM tbl_expenses WHERE expense_id = $1`, [expenseId]);

      const oldAmount = oldExpense.rows[0].amount;

      // Step 2: Fetch old expense members
      const oldMembers = await client.query(`SELECT user_id, amount FROM tbl_expense_members WHERE expense_id = $1`, [expenseId]);

      const oldMemberMap = new Map();
      oldMembers.rows.forEach(({ user_id, amount }) => {
        oldMemberMap.set(user_id, amount);
      });

      // Step 3: Update Expense Details
      const expenseResult = await client.query(
        `UPDATE tbl_expenses
         SET expense_name = $1, expense_type_id = $2, amount = $3, paid_by = $4, description = $5, split_type = $6
         WHERE expense_id = $7 RETURNING group_id`,
        [expenseName, expenseTypeId, amount, paidBy, description, splitType, expenseId]
      );

      const groupId = expenseResult.rows[0].group_id;

      // Step 5: Update expense members table
      await client.query(`DELETE FROM tbl_expense_members WHERE expense_id = $1`, [expenseId]);
      for (const { userId, amount } of members) {
        await client.query(`INSERT INTO tbl_expense_members (expense_id, user_id, amount) VALUES ($1, $2, $3)`, [expenseId, userId, amount]);
      }

      // Step 6: Update Group's Total Amount
      await client.query(
        `UPDATE tbl_groups 
         SET total_amount = total_amount - $1 + $2
         WHERE group_id = $3`,
        [oldAmount, amount, groupId]
      );

      const expenseData = await getExpenseById({ groupId, userId: paidBy, expenseId });
      await client.query("COMMIT");

      return { oldAmount, groupId, expenseData };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error in editing expense:", error.message);
      throw error;
    }
  },
  getAllExpenses: async (values) => {
    try {
      const expenseQuery = await client.query(
        `
        SELECT 
          e.expense_id,
          e.expense_name,
          e.expense_type_id,
          e.description,
          e.split_type,
          e.amount,
          e.paid_by,
          e.created_at,
          COUNT(em.user_id) AS members_count,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', em.user_id,  
              'amount', em.amount
            )
          ) AS members,
          CASE 
          WHEN e.paid_by = $2 THEN TRUE 
          ELSE FALSE 
        END AS is_own_expense

        FROM 
          tbl_expenses e
        INNER JOIN 
          tbl_expense_members em ON e.expense_id = em.expense_id
        WHERE 
          e.group_id = $1 AND e.is_active = TRUE
        GROUP BY 
          e.expense_id, e.paid_by
        ORDER BY 
          e.created_at DESC
        `,
        [values.groupId, values.userId]
      );

      const expenseList = expenseQuery.rows;

      return expenseList;
    } catch (error) {
      console.error("Error in fetching expenses:", error.message);
      throw error;
    }
  },
  deleteExpense: async (expenseId) => {
    try {
      await client.query("BEGIN");

      // Step 1: Fetch the Expense Details
      const expenseResult = await client.query(`SELECT group_id, paid_by FROM tbl_expenses WHERE expense_id = $1`, [expenseId]);

      if (expenseResult.rows.length === 0) {
        throw new Error("Expense not found");
      }

      const { group_id } = expenseResult.rows[0];

      // Step 3: Remove Expense Members
      await client.query(`DELETE FROM tbl_expense_members WHERE expense_id = $1`, [expenseId]);

      // Step 4: Remove Expense from tbl_expenses
      await client.query(`DELETE FROM tbl_expenses WHERE expense_id = $1`, [expenseId]);

      await client.query("COMMIT");
      console.log("Expense deleted successfully.");
      return {
        groupId: group_id,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error in deleting expense:", error.message);
      throw error;
    }
  },
  logExpenseChange: async ({ groupId, expenseId, userId, actionType, oldAmount = null, newAmount = null }) => {
    try {
      // Insert into log table
      await client.query(
        `INSERT INTO tbl_group_logs (group_id, expense_id, user_id, action_type, old_amount, new_amount)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [groupId, expenseId, userId, actionType, oldAmount, newAmount]
      );
    } catch (error) {
      console.error("Error in fetching expenses:", error.message);
      throw error;
    }
  },
  getExpenseLogs: async (groupId) => {
    try {
      const logs = await client.query(
        `SELECT 
          u.name,
          u.avatar,
          el.action_type,
          el.old_amount,
          el.new_amount,
          el.created_at 
         FROM tbl_group_logs el
         JOIN tbl_users u ON el.user_id = u.user_id
         WHERE el.group_id = $1 
         ORDER BY el.created_at DESC`,
        [groupId]
      );
      return logs.rows;
    } catch (error) {
      console.error("Error in fetching expenses:", error.message);
      throw error;
    }
  },
  getExpenseTypeList: async () => {
    try {
      const logs = await client.query(
        `SELECT
         expense_type_id as id,
         type_name as name,
         icon
         FROM tbl_expense_types
        `
      );
      return logs.rows;
    } catch (error) {
      console.error("Error in fetching expenses:", error.message);
      throw error;
    }
  },
  getExpenseDataById: async (values) => {
    try {
      const logs = await client.query(
        `SELECT
         *
        FROM tbl_expenses
        WHERE expense_id = $1
        `,
        [values.expense_id]
      );
      return logs.rows[0];
    } catch (error) {
      console.error("Error in fetching expenses:", error.message);
      throw error;
    }
  },
};
