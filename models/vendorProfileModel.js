const sql = require("mssql");
const bcrypt = require("bcrypt");
const dbConfig = require("../dbConfig");

// Get vendor profile [GET]
// test run: http://localhost:3000/vendor-profile
async function getVendorProfile(userID) {
  try {
    const connection = await sql.connect(dbConfig);

    const result = await connection.request().input("UserID", sql.Int, userID)
      .query(`
        SELECT
          HU.UserID,
          HU.Email,
          SO.OwnerID,
          SO.OwnerName,
          SO.ContactNo,
          SO.NRIC
        FROM HawkerUser HU

        INNER JOIN StallOwner SO
          ON HU.UserID = SO.UserID

        WHERE HU.UserID = @UserID`);

    return result.recordset[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Update vendor profile [PUT]
// test run: http://localhost:3000/vendor-profile
async function updateVendorProfile(userID, profileData) {
  try {
    const connection = await sql.connect(dbConfig);

    const request = connection.request();

    request.input("UserID", sql.Int, userID);
    request.input("OwnerName", sql.VarChar(100), profileData.OwnerName);
    request.input("ContactNo", sql.Char(8), profileData.ContactNo);

    const result = await request.query(`
      UPDATE StallOwner
      SET
        OwnerName = @OwnerName,
        ContactNo = @ContactNo
      WHERE UserID = @UserID`);

    if (result.rowsAffected[0] === 0) {
      return null;
    }

    return await getVendorProfile(userID);
  } catch (error) {
    console.error("Database error:", error);

    if (error.number === 2627 || error.number === 2601) {
      const duplicateError = new Error("Contact number is already in use.");
      duplicateError.statusCode = 409;
      throw duplicateError;
    }
    throw error;
  }
}

// Change password [PUT]
// test run: http://localhost:3000/vendor-profile/password
async function changePassword(userID, passwordData) {
  try {
    const connection = await sql.connect(dbConfig);

    const request = connection.request();

    request.input("UserID", sql.Int, userID);

    const result = await request.query(`
      SELECT PasswordHash
      FROM HawkerUser
      WHERE UserID = @UserID`);

    if (result.recordset.length === 0) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    const passwordMatches = await bcrypt.compare(
      passwordData.CurrentPassword,
      result.recordset[0].PasswordHash,
    );

    if (!passwordMatches) {
      const error = new Error("Current password is incorrect.");
      error.statusCode = 400;
      throw error;
    }

    const newPasswordHash = await bcrypt.hash(passwordData.NewPassword, 10);

    await connection
      .request()
      .input("UserID", sql.Int, userID)
      .input("PasswordHash", sql.VarChar(255), newPasswordHash).query(`
        UPDATE HawkerUser
        SET PasswordHash = @PasswordHash
        WHERE UserID = @UserID
      `);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

module.exports = {
  getVendorProfile,
  updateVendorProfile,
  changePassword,
};
