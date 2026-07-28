const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function createContactSubmission(submissionData) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection
            .request()
            .input(
                "CustomerID",
                sql.Int,
                submissionData.customerID
            )
            .input(
                "Name",
                sql.VarChar(100),
                submissionData.name
            )
            .input(
                "Email",
                sql.VarChar(100),
                submissionData.email
            )
            .input(
                "Subject",
                sql.VarChar(150),
                submissionData.subject
            )
            .input(
                "Message",
                sql.VarChar(1000),
                submissionData.message
            )
            .input(
                "SubmissionType",
                sql.VarChar(20),
                submissionData.submissionType
            )
            .query(`
                INSERT INTO ContactSubmission
                (
                    CustomerID,
                    Name,
                    Email,
                    Subject,
                    Message,
                    SubmissionType
                )
                OUTPUT INSERTED.SubmissionID
                VALUES
                (
                    @CustomerID,
                    @Name,
                    @Email,
                    @Subject,
                    @Message,
                    @SubmissionType
                )
            `);

        return result.recordset[0];

    } catch (error) {
        console.error(
            "Create contact submission model error:",
            error
        );

        throw error;

    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    createContactSubmission
};