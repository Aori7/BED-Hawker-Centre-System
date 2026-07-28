const sql = require("mssql");
const dbConfig = require("../dbConfig");

// get active food stalls belonging to one hawker centre
async function getStallsByHawkerCentre(hawkerCentreID) {
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
                    StallID,
                    HawkerCentreID,
                    OwnerID,
                    StallUnitNo,
                    StallName,
                    StallDescription,
                    ImageURL,
                    OpeningTime,
                    ClosingTime,
                    IsOpen,
                    IsActive
                FROM FoodStall
                WHERE HawkerCentreID = @HawkerCentreID
                AND IsActive = 1
                ORDER BY StallName
            `);

        return result.recordset;

    } finally {
        await connection.close();
    }
}

async function getFoodStallById(stallID) {
    const connection = await sql.connect(dbConfig);

    try {
        const result = await connection
            .request()
            .input("StallID", sql.Int, stallID)
            .query(`
                SELECT
                    StallID,
                    HawkerCentreID,
                    OwnerID,
                    StallUnitNo,
                    StallName,
                    StallDescription,
                    ImageURL,
                    OpeningTime,
                    ClosingTime,
                    IsOpen,
                    IsActive
                FROM FoodStall
                WHERE StallID = @StallID
                AND IsActive = 1
            `);

        return result.recordset[0];

    } finally {
        await connection.close();
    }
}

// get all food stalls with latest inspection details
async function getFoodStallsForNEASearch() {
    const connection = await sql.connect(dbConfig);

    try {

        const result = await connection
            .request()
            .query(`
                SELECT
                    fs.StallID,
                    fs.StallName,
                    fs.StallUnitNo,
                    fs.ImageURL,

                    hc.HCName,

                    i.InspectionDate,
                    i.InspectionScore,
                    i.HygieneGrade,
                    i.InspectionStatus

                FROM FoodStall fs

                INNER JOIN HawkerCentre hc
                    ON fs.HawkerCentreID = hc.HawkerCentreID

                LEFT JOIN Inspection i
                    ON i.InspectionID = (
                        SELECT TOP 1 InspectionID
                        FROM Inspection
                        WHERE StallID = fs.StallID
                        ORDER BY InspectionDate DESC
                    )

                WHERE fs.IsActive = 1

                ORDER BY fs.StallName;
            `);

        return result.recordset;

    }
    finally {

        await connection.close();

    }
}

module.exports = {
    getFoodStallsForNEASearch,
    getStallsByHawkerCentre,
    getFoodStallById
};