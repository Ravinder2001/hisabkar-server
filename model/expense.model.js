const client = require("../configuration/db");

module.exports = {
  addExpense: async (values) => {
    const { expenseName, amount, groupId, paidBy, members } = values;
    try {
      await client.query("BEGIN");

      // Step 1: Add Expense
      const expenseResult = await client.query(
        `INSERT INTO tbl_expenses (group_id, expense_name, amount, paid_by) 
         VALUES ($1, $2, $3, $4) RETURNING expense_id`,
        [groupId, expenseName, amount, paidBy]
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

      await client.query("COMMIT");
      return;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error in creating group:", error.message);
      throw error;
    }
  },
};
