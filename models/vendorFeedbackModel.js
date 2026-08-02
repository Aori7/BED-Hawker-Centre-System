const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all feedback/complaints for stall [GET]
// test run: http://localhost:3000/vendor-feedback/1
async function getFeedbackByStallId(stallId) {
  try {
    const connection = await sql.connect(dbConfig);

    const request = connection.request();

    request.input("stallId", sql.Int, stallId);

    const query = `
      SELECT
        CS.SubmissionID,
        CS.CustomerID,
        C.CustomerName,
        CS.Name,
        CS.Email,
        CS.Subject,
        CS.Message,
        CS.SubmissionType,
        CS.Status,
        CS.CreatedAt,

        CR.ReplyID,
        CR.SenderType,
        CR.ReplyMessage,
        CR.CreatedAt AS ReplyCreatedAt

      FROM ContactSubmission CS

      LEFT JOIN Customer C
        ON CS.CustomerID = C.CustomerID

      LEFT JOIN ContactReply CR
        ON CS.SubmissionID = CR.SubmissionID

      WHERE
        CS.TargetType = 'Stall'
        AND CS.StallID = @stallId

      ORDER BY
        CS.CreatedAt DESC,
        CR.CreatedAt ASC`;

    const result = await request.query(query);

    const submissions = [];

    result.recordset.forEach((row) => {
      let submission = submissions.find(
        (submission) => submission.SubmissionID === row.SubmissionID,
      );

      if (!submission) {
        submission = {
          SubmissionID: row.SubmissionID,
          CustomerID: row.CustomerID,
          CustomerName: row.CustomerName || row.Name,
          Email: row.Email,
          Subject: row.Subject,
          Message: row.Message,
          SubmissionType: row.SubmissionType,
          Status: row.Status,
          CreatedAt: row.CreatedAt,
          Replies: [],
        };

        submissions.push(submission);
      }

      if (row.ReplyID) {
        submission.Replies.push({
          ReplyID: row.ReplyID,
          SenderType: row.SenderType,
          ReplyMessage: row.ReplyMessage,
          CreatedAt: row.ReplyCreatedAt,
        });
      }
    });

    return submissions;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Create vendor reply [POST]
// test run: http://localhost:3000/vendor-feedback/1/1/reply
async function createReply(submissionId, replyData) {
  try {
    const connection = await sql.connect(dbConfig);

    const request = connection.request();

    request.input("SubmissionID", sql.Int, submissionId);
    request.input("SenderType", sql.VarChar(20), "Vendor");
    request.input("ReplyMessage", sql.VarChar(1000), replyData.ReplyMessage);

    const query = `
      INSERT INTO ContactReply
      (
        SubmissionID,
        SenderType,
        ReplyMessage
      )
      VALUES
      (
        @SubmissionID,
        @SenderType,
        @ReplyMessage
      );

      SELECT SCOPE_IDENTITY() AS id`;

    const result = await request.query(query);

    const newReplyId = Number(result.recordset[0].id);

    // Update submission status once vendor replies
    await connection.request().input("SubmissionID", sql.Int, submissionId)
      .query(`
        UPDATE ContactSubmission
        SET Status = 'In Progress'
        WHERE SubmissionID = @SubmissionID
          AND Status = 'Pending'`);

    return {
      ReplyID: newReplyId,
      SubmissionID: submissionId,
      SenderType: "Vendor",
      ReplyMessage: replyData.ReplyMessage,
    };
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Delete reply [DELETE]
// test run: http://localhost:3000/vendor-feedback/1/1/reply/1
async function deleteReply(submissionId, replyId) {
  try {
    const connection = await sql.connect(dbConfig);

    const request = connection.request();

    request.input("SubmissionID", sql.Int, submissionId);
    request.input("ReplyID", sql.Int, replyId);
    request.input("SenderType", sql.VarChar(20), "Vendor");

    const result = await request.query(`
      DELETE FROM ContactReply
      WHERE SubmissionID = @SubmissionID
        AND ReplyID = @ReplyID
        AND SenderType = @SenderType
    `);

    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

module.exports = {
  getFeedbackByStallId,
  createReply,
  deleteReply,
};
