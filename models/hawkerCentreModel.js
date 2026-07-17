const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getAllHawkerCentres() {
  try {
    const connection = await sql.connect(dbConfig);

    const result = await connection.request().query(`
      SELECT
        HawkerCentreID,
        HCName,
        HCAddress,
        Latitude,
        Longitude,
        Description,
        ImageURL,
        OpeningHours,
        OperatorID,
        IsActive
      FROM HawkerCentre
      WHERE IsActive = 1
      ORDER BY HCName
    `);

    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

async function getHawkerCentreById(hawkerCentreID) {
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
                    HawkerCentreID,
                    HCName,
                    HCAddress,
                    Latitude,
                    Longitude,
                    Description,
                    ImageURL,
                    OpeningHours,
                    OperatorID,
                    IsActive
                FROM HawkerCentre
                WHERE HawkerCentreID = @HawkerCentreID
                AND IsActive = 1
            `);

        return result.recordset[0];

    } finally {
        await connection.close();
    }
}
module.exports = {
  getAllHawkerCentres,
  getHawkerCentreById
};