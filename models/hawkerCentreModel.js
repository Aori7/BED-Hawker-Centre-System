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
      .input("HawkerCentreID", sql.Int, hawkerCentreID).query(`
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

async function getAvailableHawkerCentres() {
  const connection = await sql.connect(dbConfig);

  try {
    const result = await connection.request().query(`
            SELECT
                hc.HawkerCentreID,
                hc.HCName,
                hc.HCAddress,
                hc.Latitude,
                hc.Longitude,
                hc.Description,
                hc.ImageURL,
                hc.OpeningHours,
                hc.OperatorID,
                hc.IsActive
            FROM HawkerCentre hc
            WHERE
                hc.IsActive = 1
                AND hc.ImageURL IS NOT NULL
                AND LTRIM(RTRIM(hc.ImageURL)) <> ''

                AND (
                    SELECT COUNT(*)
                    FROM FoodStall fs
                    WHERE fs.HawkerCentreID = hc.HawkerCentreID
                    AND fs.IsActive = 1
                ) >= 5

                AND NOT EXISTS (
                    SELECT 1
                    FROM FoodStall fs
                    WHERE fs.HawkerCentreID = hc.HawkerCentreID
                    AND fs.IsActive = 1
                    AND (
                        SELECT COUNT(*)
                        FROM MenuItem mi
                        WHERE mi.StallID = fs.StallID
                        AND mi.IsAvailable = 1
                    ) < 5
                )

            ORDER BY hc.HCName;
        `);

    return result.recordset;
  } finally {
    await connection.close();
  }
}

module.exports = {
  getAllHawkerCentres,
  getHawkerCentreById,
  getAvailableHawkerCentres,
};
