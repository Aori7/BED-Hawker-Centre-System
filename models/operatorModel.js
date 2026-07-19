const sql = require("mssql");
const dbConfig = require("../dbConfig");

// ACCOUNT MANAGEMENT
async function getOperatorProfile(operatorId) {
  try {
    const connection = await sql.connect(dbConfig);

    const result = await connection.request()
      .input("operatorId", sql.Int, operatorId)
      .query(`
        SELECT
          OperatorID,
          Name,
          Email,
          Phone,
          HawkerCentresManaged
        FROM Operator
        WHERE OperatorID = @operatorId
      `);

    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

async function getLeaseStatistics(operatorId) {
  try {
    const connection = await sql.connect(dbConfig);

    const result = await connection.request()
      .input("operatorId", sql.Int, operatorId)
      .query(`
        SELECT
          COUNT(*) AS ActiveLeases
        FROM Lease
        WHERE OperatorID = @operatorId
      `);

    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// SCHEDULE & PLANNING

async function getCleaningSchedules(hawkerCentreId) {
  try {
    const connection = await sql.connect(dbConfig);

    const result = await connection.request()
      .input("hawkerCentreId", sql.Int, hawkerCentreId)
      .query(`
        SELECT *
        FROM CleaningSchedule
        WHERE HawkerCentreID = @hawkerCentreId
        ORDER BY CleaningDate
      `);

    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

async function getMaintenanceSchedules(hawkerCentreId) {
  try {
    const connection = await sql.connect(dbConfig);

    const result = await connection.request()
      .input("hawkerCentreId", sql.Int, hawkerCentreId)
      .query(`
        SELECT *
        FROM MaintenanceSchedule
        WHERE HawkerCentreID = @hawkerCentreId
        ORDER BY MaintenanceDate
      `);

    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

async function getInspectionSchedules(hawkerCentreId) {
  try {
    const connection = await sql.connect(dbConfig);

    const result = await connection.request()
      .input("hawkerCentreId", sql.Int, hawkerCentreId)
      .query(`
        SELECT *
        FROM InspectionSchedule
        WHERE HawkerCentreID = @hawkerCentreId
        ORDER BY InspectionDate
      `);

    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

module.exports = {
  getOperatorProfile,
  getLeaseStatistics,
  getCleaningSchedules,
  getMaintenanceSchedules,
  getInspectionSchedules
};