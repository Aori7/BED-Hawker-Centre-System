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

// get customer profile by CustomerID
async function getCustomerProfileById(customerID) {
    const connection = await sql.connect(dbConfig);

    try {
        const result = await connection
            .request()
            .input("CustomerID", sql.Int, customerID)
            .query(`
                SELECT
                    c.CustomerID,
                    c.UserID,
                    c.CustomerName,
                    c.ContactNo,
                    c.ProfileImage,
                    c.Address,
                    hu.Email
                FROM Customer c
                INNER JOIN HawkerUser hu
                    ON c.UserID = hu.UserID
                WHERE c.CustomerID = @CustomerID
            `);

        return result.recordset[0];

    } finally {
        await connection.close();
    }
}

// update customer profile
async function updateCustomerProfile(
    customerID,
    customerName,
    email,
    contactNo,
    address
) {
    const connection = await sql.connect(dbConfig);
    const transaction = new sql.Transaction(connection);

    try {
        await transaction.begin();

        // retrieve the UserID belonging to this customer
        const customerResult = await new sql.Request(transaction)
            .input("CustomerID", sql.Int, customerID)
            .query(`
                SELECT UserID
                FROM Customer
                WHERE CustomerID = @CustomerID
            `);

        if (customerResult.recordset.length === 0) {
            await transaction.rollback();
            return null;
        }

        const userID = customerResult.recordset[0].UserID;

        // update customer table
        await new sql.Request(transaction)
            .input("CustomerID", sql.Int, customerID)
            .input(
                "CustomerName",
                sql.VarChar(100),
                customerName
            )
            .input(
                "ContactNo",
                sql.Char(8),
                contactNo || null
            )
            .input(
                "Address",
                sql.VarChar(255),
                address || null
            )
            .query(`
                UPDATE Customer
                SET
                    CustomerName = @CustomerName,
                    ContactNo = @ContactNo,
                    Address = @Address
                WHERE CustomerID = @CustomerID
            `);

        // update email in HawkerUser table
        await new sql.Request(transaction)
            .input("UserID", sql.Int, userID)
            .input("Email", sql.VarChar(100), email)
            .query(`
                UPDATE HawkerUser
                SET
                    Email = @Email,
                    UpdatedAt = GETDATE()
                WHERE UserID = @UserID
            `);

        await transaction.commit();

        return await getCustomerProfileById(customerID);

    } catch (error) {
        await transaction.rollback();
        throw error;

    } finally {
        await connection.close();
    }
}

// get password hash for password verification
async function getPasswordByUserId(userID) {
    const connection = await sql.connect(dbConfig);

    try {
        const result = await connection
            .request()
            .input("UserID", sql.Int, userID)
            .query(`
                SELECT UserID, PasswordHash
                FROM HawkerUser
                WHERE UserID = @UserID
            `);

        return result.recordset[0];

    } finally {
        await connection.close();
    }
}

// update user's password hash
async function updatePassword(userID, newPasswordHash) {
    const connection = await sql.connect(dbConfig);

    try {
        const result = await connection
            .request()
            .input("UserID", sql.Int, userID)
            .input(
                "PasswordHash",
                sql.VarChar(255),
                newPasswordHash
            )
            .query(`
                UPDATE HawkerUser
                SET
                    PasswordHash = @PasswordHash,
                    UpdatedAt = GETDATE()
                WHERE UserID = @UserID
            `);

        return result.rowsAffected[0] > 0;

    } finally {
        await connection.close();
    }
}


module.exports = {
    getAllCustomers,
    createCustomer,
    getCustomerByEmail,
    getCustomerProfileById,
    updateCustomerProfile,
    getPasswordByUserId,
    updatePassword
};