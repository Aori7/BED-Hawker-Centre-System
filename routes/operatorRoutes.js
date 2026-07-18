const express = require("express");
const router = express.Router();

const operatorController =
require("../controllers/operatorController");

const operatorMiddleware =
require("../middleware/operatorMiddleware");

// ACCOUNT MANAGEMENT
// Get operator profile
router.get(
    "/:id",
    operatorController.getProfile
);

// Get lease statistics
router.get(
    "/:id/leases",
    operatorController.getLeaseStats
);

// Update profile
router.put(
    "/:id",
    operatorMiddleware.validateProfileUpdate,
    operatorController.updateProfile
);

// SCHEDULE & PLANNING

// Cleaning schedule
router.get(
    "/cleaning/:hawkerCentre",
    operatorController.getCleaningSchedules
);

// Maintenance schedule
router.get(
    "/maintenance/:hawkerCentre",
    operatorController.getMaintenanceSchedules
);

// Inspection schedule
router.get(
    "/inspection/:hawkerCentre",
    operatorController.getInspectionSchedules
);

module.exports = router;