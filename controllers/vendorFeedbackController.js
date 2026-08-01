const vendorFeedbackModel = require("../models/vendorFeedbackModel");
// Get all feedback by stall ID [GET]
// test run: http://localhost:3000/vendor-feedback/1
async function getFeedbackByStallId(req, res) {
  try {
    const submissions = await vendorFeedbackModel.getFeedbackByStallId(
      req.params.stallId,
    );

    res.status(200).json(submissions);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to retrieve feedback.",
    });
  }
}

// Create vendor reply [POST]
// test run: http://localhost:3000/vendor-feedback/1/1/reply
async function createReply(req, res) {
  try {
    const newReply = await vendorFeedbackModel.createReply(
      req.params.submissionId,
      req.body,
    );

    res.status(201).json(newReply);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to create reply.",
    });
  }
}

// Delete reply [DELETE]
// test run: http://localhost:3000/vendor-feedback/1/1/reply/1
async function deleteReply(req, res) {
  try {
    const deleted = await vendorFeedbackModel.deleteReply(
      req.params.submissionId,
      req.params.replyId,
    );

    if (!deleted) {
      return res.status(404).json({
        error: "Reply not found.",
      });
    }

    res.status(200).json({
      message: "Reply deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to delete reply.",
    });
  }
}

module.exports = {
  getFeedbackByStallId,
  createReply,
  deleteReply,
};
