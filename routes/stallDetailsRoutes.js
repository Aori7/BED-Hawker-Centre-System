// stall details routes done by dayana

const express = require("express");
const router = express.Router();

const stallDetailsController =
    require("../controllers/stallDetailsController");

// get one food stall's details
router.get(
    "/:stallID",
    stallDetailsController.getStallDetails
);

// get one food stall's inspection history
router.get(
    "/:stallID/inspections",
    stallDetailsController
        .getStallInspectionHistory
);

module.exports = router;