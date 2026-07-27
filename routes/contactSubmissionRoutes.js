const express = require("express");

const contactSubmissionController =
    require("../controllers/contactSubmissionController");

const router = express.Router();

router.post(
    "/",
    contactSubmissionController.createContactSubmission
);

module.exports = router;