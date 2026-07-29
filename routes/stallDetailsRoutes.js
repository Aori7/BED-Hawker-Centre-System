const express = require("express");
const router = express.Router();

const stallDetailsController =
    require("../controllers/stallDetailsController");

// get one stall's inspection history
router.get(
    "/:stallID/inspections",
    stallDetailsController.getStallInspectionHistory
);

// get one stall's details
router.get(
    "/:stallID",
    stallDetailsController.getStallDetails
);

module.exports = router;