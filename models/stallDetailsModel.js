// stall details model done by dayana

const sql = require("mssql");
const dbConfig = require("../dbConfig");

// get one food stall and its latest inspection
async function getStallDetails(stallID) {
    const connection = await sql.connect(
        dbConfig
    );

    try {
        const result = await connection
            .request()
            .input(
                "StallID",
                sql.Int,
                stallID
            )
            .query(`
                SELECT
                    fs.StallID,
                    fs.HawkerCentreID,
                    fs.OwnerID,
                    fs.StallName,
                    fs.StallUnitNo,
                    fs.ImageURL,

                    hc.HCName,
                    hc.Address,

                    latestInspection.InspectionID,
                    latestInspection.OfficerID,
                    latestInspection.InspectionDate,
                    latestInspection.InspectionScore,
                    latestInspection.HygieneGrade,
                    latestInspection.GradeExpiry,
                    latestInspection.InspectionStatus,

                    latestRemark.Remark,

                    CASE
                        WHEN latestInspection.HygieneGrade
                            IN ('A', 'B')
                            THEN 'Compliant'

                        WHEN latestInspection.HygieneGrade
                            IN ('C', 'D')
                            THEN 'Non-Compliant'

                        ELSE 'Not Inspected'
                    END AS ComplianceStatus

                FROM FoodStall fs

                INNER JOIN HawkerCentre hc
                    ON fs.HawkerCentreID =
                        hc.HawkerCentreID

                OUTER APPLY (
                    SELECT TOP 1
                        i.InspectionID,
                        i.OfficerID,
                        i.InspectionDate,
                        i.InspectionScore,
                        i.HygieneGrade,
                        i.GradeExpiry,
                        i.InspectionStatus

                    FROM Inspection i

                    WHERE
                        i.StallID = fs.StallID

                    ORDER BY
                        i.InspectionDate DESC,
                        i.InspectionID DESC
                ) latestInspection

                OUTER APPLY (
                    SELECT TOP 1
                        ir.Remark

                    FROM InspectionRemark ir

                    WHERE
                        ir.InspectionID =
                            latestInspection.InspectionID

                    ORDER BY
                        ir.CreatedAt DESC,
                        ir.RemarkID DESC
                ) latestRemark

                WHERE
                    fs.StallID = @StallID;
            `);

        if (result.recordset.length === 0) {
            return null;
        }

        return result.recordset[0];

    } finally {
        await connection.close();
    }
}

// get all inspections for one food stall
async function getStallInspectionHistory(
    stallID
) {
    const connection = await sql.connect(
        dbConfig
    );

    try {
        const result = await connection
            .request()
            .input(
                "StallID",
                sql.Int,
                stallID
            )
            .query(`
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

                    latestRemark.Remark

                FROM Inspection i

                OUTER APPLY (
                    SELECT TOP 1
                        ir.Remark

                    FROM InspectionRemark ir

                    WHERE
                        ir.InspectionID =
                            i.InspectionID

                    ORDER BY
                        ir.CreatedAt DESC,
                        ir.RemarkID DESC
                ) latestRemark

                WHERE
                    i.StallID = @StallID

                ORDER BY
                    i.InspectionDate DESC,
                    i.InspectionID DESC;
            `);

        return result.recordset;

    } finally {
        await connection.close();
    }
}

module.exports = {
    getStallDetails,
    getStallInspectionHistory
};