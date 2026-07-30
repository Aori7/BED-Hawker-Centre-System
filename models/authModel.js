const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getUserByEmail(email) {
    const connection = await sql.connect(dbConfig);

    const result = await connection
        .request()
        .input("Email", sql.VarChar, email)
        .query(`
            SELECT
                HU.UserID,
                HU.Email,
                HU.PasswordHash,
                R.RoleName,
                C.CustomerID,
                C.CustomerName
            FROM HawkerUser HU
            INNER JOIN Role R
                ON HU.RoleID = R.RoleID
            LEFT JOIN Customer C
                ON HU.UserID = C.UserID
            WHERE HU.Email = @Email
        `);

    return result.recordset[0];
}

module.exports = {
    getUserByEmail
};