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


// get customer by email, for login purposes
async function getCustomerByEmail(email) {
    const connection = await sql.connect(dbConfig);

    const result = await connection
        .request()
        .input("Email", sql.VarChar(100), email)
        .query(`
            SELECT
                hu.UserID,
                hu.Email,
                hu.PasswordHash,
                r.RoleName,
                c.CustomerID,
                c.CustomerName
            FROM HawkerUser hu
            INNER JOIN Role r
                ON hu.RoleID = r.RoleID
            INNER JOIN Customer c
                ON hu.UserID = c.UserID
            WHERE hu.Email = @Email
              AND r.RoleName = 'Customer'
        `);

    return result.recordset[0];
}



module.exports = {
    getAllCustomers,
    createCustomer,
    getCustomerByEmail
};