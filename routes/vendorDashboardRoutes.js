const express = require("express");
const vendorDashboardController = require("../controllers/vendorDashboardController");

const router = express.Router();

// Get revenue by stall ID
router.get("/:stallId/revenue", vendorDashboardController.getRevenueByStallId);

module.exports = router;
