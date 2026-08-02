const sql = require("mssql");
const dbConfig = require("../dbConfig");

// GET all inspection schedules/records
async function getAllInspections() {
    const connection = await sql.connect(dbConfig);

    try {
        const result = await connection
            .request()
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

                    fs.StallName,
                    fs.StallUnitNo,

                    hc.HawkerCentreID,
                    hc.HCName,

                    nof.OfficerName,
                    nof.ContactNo AS OfficerContactNo,

                    ir.Remark

                FROM Inspection i

                INNER JOIN FoodStall fs
                    ON i.StallID = fs.StallID

                INNER JOIN HawkerCentre hc
                    ON fs.HawkerCentreID =
                        hc.HawkerCentreID

                INNER JOIN NEA_Officer nof
                    ON i.OfficerID = nof.OfficerID

                LEFT JOIN InspectionRemark ir
                    ON ir.RemarkID = (
                        SELECT TOP 1 RemarkID
                        FROM InspectionRemark
                        WHERE InspectionID =
                            i.InspectionID
                        ORDER BY CreatedAt DESC
                    )

                ORDER BY
                    i.InspectionDate DESC,
                    i.InspectionID DESC;
            `);

        return result.recordset;

    } finally {
        await connection.close();
    }
}

// GET inspection by ID
async function getInspectionById(inspectionID) {
    const connection = await sql.connect(dbConfig);

    try {
        const result = await connection
            .request()
            .input(
                "InspectionID",
                sql.Int,
                inspectionID
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

                    fs.StallName,
                    fs.StallUnitNo,

                    hc.HawkerCentreID,
                    hc.HCName,

                    nof.OfficerName,
                    nof.ContactNo AS OfficerContactNo,

                    ir.Remark

                FROM Inspection i

                INNER JOIN FoodStall fs
                    ON i.StallID = fs.StallID

                INNER JOIN HawkerCentre hc
                    ON fs.HawkerCentreID =
                        hc.HawkerCentreID

                INNER JOIN NEA_Officer nof
                    ON i.OfficerID = nof.OfficerID

                LEFT JOIN InspectionRemark ir
                    ON ir.RemarkID = (
                        SELECT TOP 1 RemarkID
                        FROM InspectionRemark
                        WHERE InspectionID =
                            i.InspectionID
                        ORDER BY CreatedAt DESC
                    )

                WHERE i.InspectionID =
                    @InspectionID;
            `);

        return result.recordset[0];

    } finally {
        await connection.close();
    }
}

// GET inspections belonging to one hawker centre
async function getInspectionsByHawkerCentre(
    hawkerCentreID
) {
    const connection = await sql.connect(dbConfig);

    try {
        const result = await connection
            .request()
            .input(
                "HawkerCentreID",
                sql.Int,
                hawkerCentreID
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

                    fs.StallName,
                    fs.StallUnitNo,

                    hc.HawkerCentreID,
                    hc.HCName,

                    nof.OfficerName,
                    nof.ContactNo AS OfficerContactNo,

                    ir.Remark

                FROM Inspection i

                INNER JOIN FoodStall fs
                    ON i.StallID = fs.StallID

                INNER JOIN HawkerCentre hc
                    ON fs.HawkerCentreID =
                        hc.HawkerCentreID

                INNER JOIN NEA_Officer nof
                    ON i.OfficerID = nof.OfficerID

                LEFT JOIN InspectionRemark ir
                    ON ir.RemarkID = (
                        SELECT TOP 1 RemarkID
                        FROM InspectionRemark
                        WHERE InspectionID =
                            i.InspectionID
                        ORDER BY CreatedAt DESC
                    )

                WHERE hc.HawkerCentreID =
                    @HawkerCentreID

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
    getAllInspections,
    getInspectionById,
    getInspectionsByHawkerCentre
};