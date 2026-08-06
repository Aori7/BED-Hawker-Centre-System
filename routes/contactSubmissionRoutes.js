const express = require("express");

const contactSubmissionController = require("../controllers/contactSubmissionController");
const {validateContactSubmission} = require("../middleware/contactSubmissionValidation");
const router = express.Router();
// base path: /contact-submissions
router.get("/targets", contactSubmissionController.getContactTargets);

router.post("/",validateContactSubmission, contactSubmissionController.createContactSubmission);

module.exports = router;
