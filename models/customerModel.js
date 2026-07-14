//customer model done by ada

const sql = require("mssql");
const dbConfig = require("../dbConfig");


// get all customers
async function getAllCustomers() {
    let connection;
    try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT customerid,userid,customername,contactno,profileimage,address FROM Customer";
    const result = await connection.request().query(query);
    return result.recordset;
    } catch (error) {
    console.error("Database error:", error);
    throw error;
    } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}


//create customer account
async function createCustomer(email, passwordHash, customerName) {
    const connection = await sql.connect(dbConfig);
    const transaction = new sql.Transaction(connection);

    try {
        await transaction.begin();

        // create the user's login account first
        const userResult = await new sql.Request(transaction)
            .input("Email", sql.VarChar(100), email)
            .input("PasswordHash", sql.VarChar(255), passwordHash)
            .query(`
                INSERT INTO HawkerUser (Email, PasswordHash, RoleID)
                OUTPUT INSERTED.UserID
                VALUES (
                    @Email,
                    @PasswordHash,
                    (
                        SELECT RoleID
                        FROM Role
                        WHERE RoleName = 'Customer'
                    )
                )
            `);

        // get the automatically generated UserID
        const userID = userResult.recordset[0].UserID;

        // create the matching customer record
        const customerResult = await new sql.Request(transaction)
            .input("UserID", sql.Int, userID)
            .input("CustomerName", sql.VarChar(100), customerName)
            .query(`
                INSERT INTO Customer (UserID, CustomerName)
                OUTPUT INSERTED.*
                VALUES (@UserID, @CustomerName)
            `);

        await transaction.commit();

        return customerResult.recordset[0];

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}


module.exports = {
    getAllCustomers,
    createCustomer,
};