const sql = require("mssql");
const dbConfig = require("../dbConfig");

// get operator profile by operator ID
async function getOperatorProfile(operatorID) {
    const connection = await sql.connect(dbConfig);

    try {
        const result = await connection
            .request()
            .input(
                "OperatorID",
                sql.Int,
                operatorID
            )
            .query(`
                SELECT
                    OperatorID,
                    UserID,
                    OperatorName,
                    ContactPerson,
                    ContactNo
                FROM Operator
                WHERE OperatorID = @OperatorID
            `);

        return result.recordset[0];

    } finally {
        await connection.close();
    }
}

// update operator profile
async function updateOperatorProfile(
    operatorID,
    operatorData
) {
    const connection = await sql.connect(dbConfig);

    try {
        const result = await connection
            .request()
            .input(
                "OperatorID",
                sql.Int,
                operatorID
            )
            .input(
                "OperatorName",
                sql.VarChar(100),
                operatorData.OperatorName
            )
            .input(
                "ContactPerson",
                sql.VarChar(100),
                operatorData.ContactPerson
            )
            .input(
                "ContactNo",
                sql.VarChar(20),
                operatorData.ContactNo
            )
            .query(`
                UPDATE Operator
                SET
                    OperatorName = @OperatorName,
                    ContactPerson = @ContactPerson,
                    ContactNo = @ContactNo
                WHERE OperatorID = @OperatorID;

                SELECT
                    OperatorID,
                    UserID,
                    OperatorName,
                    ContactPerson,
                    ContactNo
                FROM Operator
                WHERE OperatorID = @OperatorID;
            `);

        return result.recordset[0];

    } finally {
        await connection.close();
    }
}

module.exports = {
    getOperatorProfile,
    updateOperatorProfile
};