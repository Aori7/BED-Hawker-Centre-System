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

module.exports = {
    getStallsByHawkerCentre,
    getFoodStallById
};