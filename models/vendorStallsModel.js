const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get stalls belonging to logged-in vendor [GET]
// test run: http://localhost:3000/vendor-stalls
async function getVendorStalls(userID) {
  try {
    const connection = await sql.connect(dbConfig);

    const request = connection.request();

    request.input("userID", sql.Int, userID);

    const result = await request.query(`
      SELECT
        FS.StallID,
        FS.StallName,
        FS.StallUnitNo,
        FS.HawkerCentreID,
        FS.ImageURL,
        FS.IsOpen,
        HC.HCName
      FROM StallOwner SO

      INNER JOIN FoodStall FS
        ON SO.OwnerID=FS.OwnerID

      INNER JOIN HawkerCentre HC
        ON FS.HawkerCentreID=HC.HawkerCentreID

      WHERE SO.UserID=@userID
        AND FS.IsActive=1

      ORDER BY FS.StallName
    `);

    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

module.exports = {
  getVendorStalls,
};
