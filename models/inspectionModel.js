// inspection model done by dayana
const sql = require("mssql");
const dbConfig = require("../dbConfig");

// create a completed inspection and its remark
async function createInspection(inspectionData) {
    const connection = await sql.connect(dbConfig);

    const transaction =
        new sql.Transaction(connection);

    try {
        await transaction.begin();

        const inspectionResult =
            await new sql.Request(transaction)
                .input(
                    "OfficerID",
                    sql.Int,
                    inspectionData.officerID
                )
                .input(
                    "StallID",
                    sql.Int,
                    inspectionData.stallID
                )
                .input(
                    "InspectionDate",
                    sql.Date,
                    inspectionData.inspectionDate
                )
                .input(
                    "InspectionScore",
                    sql.Int,
                    inspectionData.inspectionScore
                )
                .input(
                    "HygieneGrade",
                    sql.Char(1),
                    inspectionData.hygieneGrade
                )
                .query(`
                    INSERT INTO Inspection (
                        OfficerID,
                        StallID,
                        InspectionDate,
                        InspectionScore,
                        HygieneGrade,
                        GradeExpiry,
                        InspectionStatus,
                        CreatedAt
                    )
                    OUTPUT
                        INSERTED.InspectionID,
                        INSERTED.OfficerID,
                        INSERTED.StallID,
                        INSERTED.InspectionDate,
                        INSERTED.InspectionScore,
                        INSERTED.HygieneGrade,
                        INSERTED.GradeExpiry,
                        INSERTED.InspectionStatus,
                        INSERTED.CreatedAt
                    VALUES (
                        @OfficerID,
                        @StallID,
                        @InspectionDate,
                        @InspectionScore,
                        @HygieneGrade,
                        DATEADD(YEAR, 1, @InspectionDate),
                        'Completed',
                        GETDATE()
                    );
                `);

        const newInspection =
            inspectionResult.recordset[0];

        const remarkResult =
            await new sql.Request(transaction)
                .input(
                    "InspectionID",
                    sql.Int,
                    newInspection.InspectionID
                )
                .input(
                    "Remark",
                    sql.VarChar(1000),
                    inspectionData.remark
                )
                .query(`
                    INSERT INTO InspectionRemark (
                        InspectionID,
                        Remark,
                        CreatedAt
                    )
                    OUTPUT
                        INSERTED.RemarkID,
                        INSERTED.InspectionID,
                        INSERTED.Remark,
                        INSERTED.CreatedAt
                    VALUES (
                        @InspectionID,
                        @Remark,
                        GETDATE()
                    );
                `);

        await transaction.commit();

        return {
            inspection: newInspection,
            remark: remarkResult.recordset[0]
        };

    } catch (error) {
        if (transaction._aborted !== true) {
            await transaction.rollback();
        }

        throw error;

    } finally {
        await connection.close();
    }
}

module.exports = {
    createInspection
};