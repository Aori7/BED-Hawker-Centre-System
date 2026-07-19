// dashboard routes done by dayana

const express = require("express");

const dashboardController = require(
    "../controllers/dashboardController"
);

const router = express.Router();


// get dashboard statistics
router.get(
    "/statistics",
    dashboardController.getDashboardStatistics
);


// get recent inspections
router.get(
    "/recent",
    dashboardController.getRecentInspections
);


// get today's inspection count
router.get(
    "/today",
    dashboardController.getTodayInspectionCount
);


// update inspection status
router.put(
    "/inspection/:id/status",
    dashboardController.updateInspectionStatus
);


module.exports = router;