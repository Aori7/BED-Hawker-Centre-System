// stall details routes done by dayana

const express = require("express");
const router = express.Router();

const stallDetailsController =
    require("../controllers/stallDetailsController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

// get one stall's inspection history
router.get(
    "/:stallID/inspections",
    authenticateToken,
    authorizeRoles("NEA Officer"),
    stallDetailsController.getStallInspectionHistory
);

// get one stall's details
router.get(
    "/:stallID",
    authenticateToken,
    authorizeRoles("NEA Officer"),
    stallDetailsController.getStallDetails
);

module.exports = router;