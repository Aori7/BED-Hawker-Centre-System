// hygiene grade controller done by dayana

const sql = require("mssql");
const dbConfig = require("../dbConfig");

// get the latest inspection for every food stall
async function getHygieneGrades() {
    const connection = await sql.connect(
        dbConfig
    );

    try {
        const result = await connection
            .request()
            .query(`
                WITH LatestInspection AS (
                    SELECT
                        i.InspectionID,
                        i.OfficerID,
                        i.StallID,
                        i.InspectionDate,
                        i.InspectionScore,
                        i.HygieneGrade,
                        i.GradeExpiry,
                        i.InspectionStatus,
                        i.CreatedAt,

                        ROW_NUMBER() OVER (
                            PARTITION BY i.StallID
                            ORDER BY
                                i.InspectionDate DESC,
                                i.InspectionID DESC
                        ) AS RowNumber

                    FROM Inspection i

                    WHERE
                        i.InspectionStatus = 'Completed'
                )

                SELECT
                    li.InspectionID,
                    li.OfficerID,
                    li.StallID,
                    li.InspectionDate,
                    li.InspectionScore,
                    li.HygieneGrade,
                    li.GradeExpiry,
                    li.InspectionStatus,

                    fs.StallName,
                    fs.StallUnitNo,
                    fs.ImageURL,

                    hc.HawkerCentreID,
                    hc.HCName,

                    CASE
                        WHEN li.HygieneGrade IN ('A', 'B')
                            THEN 'Compliant'
                        ELSE 'Non-Compliant'
                    END AS ComplianceStatus,

                    latestRemark.Remark

                FROM LatestInspection li

                INNER JOIN FoodStall fs
                    ON li.StallID = fs.StallID

                INNER JOIN HawkerCentre hc
                    ON fs.HawkerCentreID =
                        hc.HawkerCentreID

                OUTER APPLY (
                    SELECT TOP 1
                        ir.Remark
                    FROM InspectionRemark ir
                    WHERE
                        ir.InspectionID =
                            li.InspectionID
                    ORDER BY
                        ir.CreatedAt DESC,
                        ir.RemarkID DESC
                ) latestRemark

                WHERE li.RowNumber = 1

                ORDER BY
                    fs.StallName ASC;
            `);

        return result.recordset;

    } finally {
        await connection.close();
    }
}

// update an inspection grade and create a new remark
async function updateHygieneGrade(
    inspectionID,
    updateData
) {
    const connection = await sql.connect(
        dbConfig
    );

    const transaction =
        new sql.Transaction(connection);

    try {
        await transaction.begin();

        const inspectionResult =
            await new sql.Request(transaction)
                .input(
                    "InspectionID",
                    sql.Int,
                    inspectionID
                )
                .input(
                    "HygieneGrade",
                    sql.Char(1),
                    updateData.hygieneGrade
                )
                .query(`
                    UPDATE Inspection

                    SET
                        HygieneGrade =
                            @HygieneGrade,
                        GradeExpiry =
                            DATEADD(
                                YEAR,
                                1,
                                InspectionDate
                            )

                    OUTPUT
                        INSERTED.InspectionID,
                        INSERTED.StallID,
                        INSERTED.InspectionDate,
                        INSERTED.InspectionScore,
                        INSERTED.HygieneGrade,
                        INSERTED.GradeExpiry,
                        INSERTED.InspectionStatus

                    WHERE
                        InspectionID =
                            @InspectionID;
                `);

        if (
            inspectionResult.recordset.length === 0
        ) {
            await transaction.rollback();

            return null;
        }

        const remarkResult =
            await new sql.Request(transaction)
                .input(
                    "InspectionID",
                    sql.Int,
                    inspectionID
                )
                .input(
                    "Remark",
                    sql.VarChar(1000),
                    updateData.remark
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
            inspection:
                inspectionResult.recordset[0],
            remark:
                remarkResult.recordset[0]
        };

    } catch (error) {
        try {
            await transaction.rollback();
        } catch (rollbackError) {
            console.error(
                "Hygiene grade rollback error:",
                rollbackError
            );
        }

        throw error;

    } finally {
        await connection.close();
    }
}

module.exports = {
    getHygieneGrades,
    updateHygieneGrade
};