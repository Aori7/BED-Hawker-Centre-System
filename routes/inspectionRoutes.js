// inspection routes done by dayana
const express = require("express");
const router = express.Router();

const inspectionController =
    require("../controllers/inspectionController");

// create a completed inspection
router.post(
    "/",
    inspectionController.createInspection
);

module.exports = router;