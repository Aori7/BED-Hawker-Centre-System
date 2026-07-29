const express = require("express");
const router = express.Router();

const inspectionController =
    require("../controllers/inspectionController");

// get all inspection records
router.get(
    "/",
    inspectionController.getAllInspections
);

// create a completed inspection
router.post(
    "/",
    inspectionController.createInspection
);

module.exports = router;