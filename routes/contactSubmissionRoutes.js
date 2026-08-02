const express = require("express");

const contactSubmissionController = require("../controllers/contactSubmissionController");

const router = express.Router();

router.get("/targets", contactSubmissionController.getContactTargets);

router.post("/", contactSubmissionController.createContactSubmission);

module.exports = router;
