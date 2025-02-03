const client = require("../configuration/db");

module.exports = {
  addExpense: async (values) => {
    const { expenseName, expenseTypeId, description, amount, groupId, paidBy, members } = values;
    try {
      await client.query("BEGIN");

      // Step 1: Add Expense
      const expenseResult = await client.query(
        `INSERT INTO tbl_expenses (group_id,expense_type_id, expense_name, amount, paid_by,description) 
         VALUES ($1, $2, $3, $4, $5,$6) RETURNING expense_id`,
        [groupId, expenseTypeId, expenseName, amount, paidBy, description]
      );
      const expense_id = expenseResult.rows[0].expense_id;

      // Step 2: Add Expense Members
      for (const member of members) {
        await client.query(
          `INSERT INTO tbl_expense_members (expense_id, user_id, amount) 
           VALUES ($1, $2, $3)`,
          [expense_id, member.userId, member.amount]
        );
      }

      // Step 3: Manage Group Pairs
      for (const member of members) {
        const sender = member.userId;
        const receiver = paidBy;
        const pairAmount = member.amount;

        // Only proceed if sender and receiver are different
        if (sender !== receiver) {
          // Update or Insert Pair for Sender → Receiver
          await client.query(
            `INSERT INTO tbl_group_pairs (group_id, sender_user, receiver_user, amount) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (group_id, sender_user, receiver_user)
             DO UPDATE SET amount = tbl_group_pairs.amount + $4`,
            [groupId, sender, receiver, pairAmount]
          );

          // Update or Insert Pair for Receiver → Sender
          await client.query(
            `INSERT INTO tbl_group_pairs (group_id, sender_user, receiver_user, amount) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (group_id, sender_user, receiver_user)
             DO UPDATE SET amount = tbl_group_pairs.amount + $4`,
            [groupId, receiver, sender, -pairAmount]
          );
        }
      }

      await client.query(
        `UPDATE tbl_groups
        SET total_amount = total_amount + $2
        WHERE group_id = $1`,
        [groupId, amount]
      );

      await client.query("COMMIT");
      return;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error in creating group:", error.message);
      throw error;
    }
  },
  editExpense: async (values) => {
    const { expenseId, expenseName, expenseTypeId, amount, paidBy, members, description } = values;
    try {
      await client.query("BEGIN");

      const oldExpenseAmount = await client.query(`SELECT amount FROM tbl_expenses WHERE expense_id = $1`, [expenseId]);

      // Step 1: Update Expense
      const expenseResult = await client.query(
        `UPDATE tbl_expenses
         SET expense_name = $1, expense_type_id = $2, amount = $3, paid_by = $4, description = $5
         WHERE expense_id = $6 RETURNING group_id`,
        [expenseName, expenseTypeId, amount, paidBy, description, expenseId]
      );

      const groupId = expenseResult.rows[0].group_id;

      // Step 2: Delete Old Expense Members
      await client.query(`DELETE FROM tbl_expense_members WHERE expense_id = $1`, [expenseId]);

      // Remove old pair balances from tbl_group_pairs
      await client.query(
        `DELETE FROM tbl_group_pairs
         WHERE group_id = $1`,
        [groupId]
      );

      // Step 3: Add Updated Expense Members
      for (const member of members) {
        await client.query(
          `INSERT INTO tbl_expense_members (expense_id, user_id, amount) 
           VALUES ($1, $2, $3)`,
          [expenseId, member.userId, member.amount]
        );
      }

      // Step 4: Manage Group Pairs with Updated Amounts
      for (const member of members) {
        const sender = member.userId;
        const receiver = paidBy;
        const pairAmount = member.amount;

        // Only proceed if sender and receiver are different
        if (sender !== receiver) {
          // Remove old balances from tbl_group_pairs first
          await client.query(
            `UPDATE tbl_group_pairs
             SET amount = amount - $1
             WHERE group_id = $2 AND sender_user = $3 AND receiver_user = $4`,
            [pairAmount, groupId, sender, receiver]
          );

          await client.query(
            `UPDATE tbl_group_pairs
             SET amount = amount + $1
             WHERE group_id = $2 AND sender_user = $3 AND receiver_user = $4`,
            [pairAmount, groupId, receiver, sender]
          );

          // Now update new pair balances after modifying amounts
          await client.query(
            `INSERT INTO tbl_group_pairs (group_id, sender_user, receiver_user, amount) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (group_id, sender_user, receiver_user)
             DO UPDATE SET amount = tbl_group_pairs.amount + $4`,
            [groupId, sender, receiver, pairAmount]
          );

          // Update the reverse pair as well
          await client.query(
            `INSERT INTO tbl_group_pairs (group_id, sender_user, receiver_user, amount) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (group_id, sender_user, receiver_user)
             DO UPDATE SET amount = tbl_group_pairs.amount + $4`,
            [groupId, receiver, sender, -pairAmount]
          );
        }
      }

      await client.query("COMMIT");
      return {
        oldAmount: oldExpenseAmount.rows[0].amount,
        groupId,
      };
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

      const { group_id, paid_by } = expenseResult.rows[0];

      // Step 2: Fetch Expense Members
      const membersResult = await client.query(`SELECT user_id, amount FROM tbl_expense_members WHERE expense_id = $1`, [expenseId]);

      const members = membersResult.rows;

      // Step 3: Remove Expense Members
      await client.query(`DELETE FROM tbl_expense_members WHERE expense_id = $1`, [expenseId]);

      // Step 4: Remove Expense from tbl_expenses
      await client.query(`DELETE FROM tbl_expenses WHERE expense_id = $1`, [expenseId]);

      // Step 5: Update Group Pairs for Expense Removal
      for (const member of members) {
        const sender = member.user_id;
        const receiver = paid_by; // Paid by the one who initially paid for the expense
        const pairAmount = member.amount;

        if (sender !== receiver) {
          // Subtract from Sender → Receiver
          await client.query(
            `UPDATE tbl_group_pairs
             SET amount = amount - $1
             WHERE group_id = $2 AND sender_user = $3 AND receiver_user = $4`,
            [pairAmount, group_id, sender, receiver]
          );

          // Subtract from Receiver → Sender
          await client.query(
            `UPDATE tbl_group_pairs
             SET amount = amount + $1
             WHERE group_id = $2 AND sender_user = $3 AND receiver_user = $4`,
            [pairAmount, group_id, receiver, sender]
          );

          // Ensure non-existent pairs are created (optional for consistency)
          await client.query(
            `INSERT INTO tbl_group_pairs (group_id, sender_user, receiver_user, amount) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (group_id, sender_user, receiver_user)
             DO NOTHING`,
            [group_id, sender, receiver, 0]
          );

          await client.query(
            `INSERT INTO tbl_group_pairs (group_id, sender_user, receiver_user, amount) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (group_id, sender_user, receiver_user)
             DO NOTHING`,
            [group_id, receiver, sender, 0]
          );
        }
      }

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
        `INSERT INTO tbl_expense_logs (group_id, expense_id, user_id, action_type, old_amount, new_amount)
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
         FROM tbl_expense_logs el
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
};
