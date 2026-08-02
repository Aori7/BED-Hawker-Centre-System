// purpose of this file: to make sure user is an authorised vendor AND the stall is owned by the vednor
// JWT -> UserID -> OwnderID -> StallID -> req.user.stallID
// JWT -> authenticateToken -> req.user.userID -> vendorValidation -> req.user.stallId -> Controller -> Model
// inside routes:
// Request -> authenticateToken -> authorizeRoles -> attachVendorStall -> Controller
// so you can change ```req.params.stallID``` to ```req.user.stallID```

const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Validate that the selected stall belongs to the logged in vendor
async function validateVendorStall(req, res, next) {
  try {
    const stallId = parseInt(req.params.stallId);

    if (Number.isNaN(stallId) || stallId <= 0) {
      return res.status(400).json({
        error: "Valid stall ID is required.",
      });
    }

    const connection = await sql.connect(dbConfig);

    const result = await connection
      .request()
      .input("userID", sql.Int, req.user.userID)
      .input("stallId", sql.Int, stallId).query(`
        SELECT FS.StallID
        FROM StallOwner SO
        INNER JOIN FoodStall FS
          ON SO.OwnerID = FS.OwnerID
        WHERE SO.UserID = @userID
          AND FS.StallID = @stallId
      `);

    if (result.recordset.length === 0) {
      return res.status(403).json({
        error: "You do not have permission to access this stall.",
      });
    }

    next();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to validate vendor stall.",
    });
  }
}

module.exports = {
  validateVendorStall,
};
