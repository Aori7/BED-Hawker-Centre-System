const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getContactTargets() {
  let connection;

  try {
    connection = await sql.connect(dbConfig);

    const hawkerResult = await connection.request().query(`
        SELECT
          HawkerCentreID AS id,
          HCName AS name
        FROM HawkerCentre
        WHERE IsActive = 1
        ORDER BY HCName
      `);

    const stallResult = await connection.request().query(`
        SELECT
          fs.StallID AS id,
          fs.StallName AS name,
          fs.HawkerCentreID AS hawkerCentreID,
          hc.HCName AS hawkerCentreName
        FROM FoodStall fs
        INNER JOIN HawkerCentre hc
          ON fs.HawkerCentreID = hc.HawkerCentreID
        WHERE fs.IsActive = 1
        ORDER BY fs.StallName
      `);

    const operatorResult = await connection.request().query(`
        SELECT
          OperatorID AS id,
          OperatorName AS name
        FROM Operator
        ORDER BY OperatorName
      `);

    return {
      hawkerCentres: hawkerResult.recordset,
      stalls: stallResult.recordset,
      operators: operatorResult.recordset,
    };
  } catch (error) {
    console.error("Get contact targets model error:", error);

    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function createContactSubmission(submissionData) {
  let connection;

  try {
    connection = await sql.connect(dbConfig);

    const result = await connection
      .request()
      .input("CustomerID", sql.Int, submissionData.customerID)
      .input("Name", sql.VarChar(100), submissionData.name)
      .input("Email", sql.VarChar(100), submissionData.email)
      .input("Subject", sql.VarChar(150), submissionData.subject)
      .input("Message", sql.VarChar(1000), submissionData.message)
      .input("SubmissionType", sql.VarChar(20), submissionData.submissionType)
      .input("TargetType", sql.VarChar(20), submissionData.targetType)
      .input("StallID", sql.Int, submissionData.stallID)
      .input("HawkerCentreID", sql.Int, submissionData.hawkerCentreID)
      .input("OperatorID", sql.Int, submissionData.operatorID).query(`
        INSERT INTO ContactSubmission
        (
          CustomerID,
          Name,
          Email,
          Subject,
          Message,
          SubmissionType,
          TargetType,
          StallID,
          HawkerCentreID,
          OperatorID
        )
        OUTPUT INSERTED.SubmissionID
        VALUES
        (
          @CustomerID,
          @Name,
          @Email,
          @Subject,
          @Message,
          @SubmissionType,
          @TargetType,
          @StallID,
          @HawkerCentreID,
          @OperatorID
        )
      `);

    return result.recordset[0];
  } catch (error) {
    console.error("Create contact submission model error:", error);

    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

module.exports = {
  getContactTargets,
  createContactSubmission,
};
