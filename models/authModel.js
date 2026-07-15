const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getUserByEmail(email) {
    const connection = await sql.connect(dbConfig);

    const result = await connection
        .request()
        .input("Email", sql.VarChar(100), email)
        .query(`
            SELECT
                hu.UserID,
                hu.Email,
                hu.PasswordHash,
                r.RoleID,
                r.RoleName
            FROM HawkerUser hu
            INNER JOIN Role r
                ON hu.RoleID = r.RoleID
            WHERE hu.Email = @Email
        `);

    return result.recordset[0];
}

module.exports = {
    getUserByEmail
};