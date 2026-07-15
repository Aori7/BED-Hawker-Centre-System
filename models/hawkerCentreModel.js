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

module.exports = {
  getAllHawkerCentres,
};