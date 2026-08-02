// Validate submission ID
function validateSubmissionId(req, res, next) {
  req.params.submissionId = parseInt(req.params.submissionId, 10);

  if (Number.isNaN(req.params.submissionId) || req.params.submissionId <= 0) {
    return res.status(400).json({
      error: "Valid submission ID is required.",
    });
  }
  next();
}

// Validate reply ID
function validateReplyId(req, res, next) {
  req.params.replyId = parseInt(req.params.replyId, 10);

  if (Number.isNaN(req.params.replyId) || req.params.replyId <= 0) {
    return res.status(400).json({
      error: "Valid reply ID is required.",
    });
  }
  next();
}

// Validate reply input
function validateReplyInput(req, res, next) {
  const { error, value } = replySchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      error: error.details.map((detail) => detail.message).join(", "),
    });
  }
  req.body = value;
  next();
}

// Validate submission belongs to stall
async function validateSubmissionBelongsToStall(req, res, next) {
  try {
    const connection = await sql.connect(dbConfig);

    const result = await connection
      .request()
      .input("stallId", sql.Int, req.params.stallId)
      .input("submissionId", sql.Int, req.params.submissionId).query(`
        SELECT SubmissionID
        FROM ContactSubmission
        WHERE SubmissionID = @submissionId
          AND StallID = @stallId
          AND TargetType = 'Stall'
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        error: "Submission not found for this stall.",
      });
    }
    next();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to validate submission.",
    });
  }
}

// Validate submission is open
async function validateSubmissionIsOpen(req, res, next) {
  try {
    const connection = await sql.connect(dbConfig);

    const result = await connection
      .request()
      .input("submissionId", sql.Int, req.params.submissionId).query(`
        SELECT Status
        FROM ContactSubmission
        WHERE SubmissionID = @submissionId`);

    if (
      result.recordset.length === 0 ||
      result.recordset[0].Status === "Closed"
    ) {
      return res.status(400).json({
        error: "Replies cannot be added to closed submissions.",
      });
    }
    next();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to validate submission status.",
    });
  }
}

// Validate reply belongs to submission
async function validateReplyBelongsToSubmission(req, res, next) {
  try {
    const connection = await sql.connect(dbConfig);

    const result = await connection
      .request()
      .input("replyId", sql.Int, req.params.replyId)
      .input("submissionId", sql.Int, req.params.submissionId).query(`
        SELECT ReplyID
        FROM ContactReply
        WHERE ReplyID = @replyId
          AND SubmissionID = @submissionId
          AND SenderType = 'Vendor'`);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        error: "Reply not found.",
      });
    }
    next();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to validate reply.",
    });
  }
}

module.exports = {
  validateSubmissionId,
  validateReplyId,
  validateReplyInput,
  validateSubmissionBelongsToStall,
  validateSubmissionIsOpen,
  validateReplyBelongsToSubmission,
};
