// dashboard routes done by dayana

const express = require("express");

const dashboardController = require(
    "../controllers/dashboardController"
);

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

// get dashboard statistics
router.get(
    "/statistics",
    authenticateToken,
    authorizeRoles("NEA Officer"),
    dashboardController.getDashboardStatistics
);

// get recent inspections
router.get(
    "/recent",
    authenticateToken,
    authorizeRoles("NEA Officer"),
    dashboardController.getRecentInspections
);

// get today's inspection count
router.get(
    "/today",
    authenticateToken,
    authorizeRoles("NEA Officer"),
    dashboardController.getTodayInspectionCount
);

// update inspection status
router.put(
    "/inspection/:id/status",
    authenticateToken,
    authorizeRoles("NEA Officer"),
    dashboardController.updateInspectionStatus
);

module.exports = router;