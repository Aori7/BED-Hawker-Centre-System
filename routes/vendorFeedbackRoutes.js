const express = require("express");
const vendorFeedbackController = require("../controllers/vendorFeedbackController");
const vendorFeedbackValidation = require("../middleware/vendorFeedbackValidation");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const { validateVendorStall } = require("../middleware/vendorValidation");

const router = express.Router();

// Get all feedback for stall [GET]
// test run: http://localhost:3000/vendor-feedback/1
router.get(
  "/:stallId",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorFeedbackController.getFeedbackByStallId,
);

// Create reply [POST]
// test run: http://localhost:3000/vendor-feedback/1/1/reply
// {
//   "ReplyMessage":"We apologise for the inconvenience."
// }
router.post(
  "/:stallId/:submissionId/reply",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorFeedbackValidation.validateSubmissionId,
  vendorFeedbackValidation.validateSubmissionBelongsToStall,
  vendorFeedbackValidation.validateSubmissionIsOpen,
  vendorFeedbackValidation.validateReplyInput,
  vendorFeedbackController.createReply,
);

// Delete reply [DELETE]
// test run: http://localhost:3000/vendor-feedback/1/1/reply/1
router.delete(
  "/:stallId/:submissionId/reply/:replyId",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorFeedbackValidation.validateSubmissionId,
  vendorFeedbackValidation.validateReplyId,
  vendorFeedbackValidation.validateSubmissionBelongsToStall,
  vendorFeedbackValidation.validateReplyBelongsToSubmission,
  vendorFeedbackController.deleteReply,
);

module.exports = router;
