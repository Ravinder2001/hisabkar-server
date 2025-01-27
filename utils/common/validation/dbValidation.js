/**
 * Validates a database record based on the provided ID, table name, and column name.
 *
 * This function is an asynchronous function that validates a database record.
 * It first checks if the provided ID is valid. If the ID is not provided, is "null", or is not a number, it returns a HTTP 400 Bad Request status.
 * It then runs a database query to select the record from the provided table where the provided column equals the provided ID.
 * If the query returns no rows, it returns a HTTP 404 Not Found status.
 * If the query returns rows, it returns a HTTP 200 OK status.
 * If an error occurs during the operation, it throws an error.
 *
 * @param {string} id - The ID of the record to validate.
 * @param {string} tbl_name - The name of the table where the record is located.
 * @param {string} column_name - The name of the column where the ID is located.
 * @returns {Promise<number>} A promise that resolves to a HTTP status code.
 * @throws {Error} If an error occurs during the database query.
 */

const db = require("../../../configuration/db");
const { HttpStatus } = require("../../constant/constant");

const dbValidation = async (id, tbl_name, column_name, added_condition) => {
  if (!id || id === "null" || isNaN(parseInt(id))) {
    return HttpStatus.BAD_REQUEST;
  }
  try {
    let query = `SELECT * FROM ${tbl_name} WHERE ${column_name} = $1`;
    let params = [id];

    if (added_condition) {
      query += ` AND ${added_condition}`;
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return HttpStatus.NOT_FOUND;
    }
    return HttpStatus.OK;
  } catch (error) {
    throw new Error(error.message);
  }
};
module.exports = dbValidation;
