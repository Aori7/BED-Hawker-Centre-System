// dashboard model done by dayana

const sql = require("mssql");
const dbConfig = require("../dbConfig");


// get dashboard statistics
async function getDashboardStatistics() {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const query = `
            SELECT
                COUNT(*) AS TotalInspections,

                COUNT(
                    DISTINCT CASE
                        WHEN HygieneGrade IN ('A', 'B')
                        THEN StallID
                    END
                ) AS CompliantStalls,

                COUNT(
                    DISTINCT CASE
                        WHEN HygieneGrade IN ('C', 'D')
                        THEN StallID
                    END
                ) AS NonCompliantStalls,

                COUNT(
                    DISTINCT CASE
                        WHEN HygieneGrade = 'A'
                        THEN StallID
                    END
                ) AS GradeAStalls

            FROM Inspection
            WHERE InspectionStatus = 'Completed'
        `;

        const result = await connection
            .request()
            .query(query);

        return result.recordset[0];

    } catch (error) {
        console.error("Database error:", error);
        throw error;

    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(
                    "Error closing connection:",
                    err
                );
            }
        }
    }
}


// get recent inspections
async function getRecentInspections() {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const query = `
            SELECT TOP 5
                i.InspectionID,
                fs.StallName,
                hc.HCName,
                i.InspectionDate,
                i.InspectionScore,
                i.HygieneGrade,
                i.InspectionStatus

            FROM Inspection i

            INNER JOIN FoodStall fs
                ON i.StallID = fs.StallID

            INNER JOIN HawkerCentre hc
                ON fs.HawkerCentreID =
                   hc.HawkerCentreID

            ORDER BY
                i.InspectionDate DESC,
                i.InspectionID DESC
        `;

        const result = await connection
            .request()
            .query(query);

        return result.recordset;

    } catch (error) {
        console.error("Database error:", error);
        throw error;

    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(
                    "Error closing connection:",
                    err
                );
            }
        }
    }
}


// get inspections completed today
async function getTodayInspectionCount() {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const query = `
            SELECT
                COUNT(*) AS TodayInspections

            FROM Inspection

            WHERE InspectionStatus = 'Completed'
              AND InspectionDate =
                  CAST(GETDATE() AS date)
        `;

        const result = await connection
            .request()
            .query(query);

        return result.recordset[0];

    } catch (error) {
        console.error("Database error:", error);
        throw error;

    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(
                    "Error closing connection:",
                    err
                );
            }
        }
    }
}


module.exports = {
    getDashboardStatistics,
    getRecentInspections,
    getTodayInspectionCount
};