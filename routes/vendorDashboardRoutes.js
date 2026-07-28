const express = require("express");

const vendorDashboardController = require("../controllers/vendorDashboardController");

const router = express.Router();

// Get revenue by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/revenue?startDate=2026-07-01&endDate=2026-08-01
router.get("/:stallId/revenue", vendorDashboardController.getRevenueByStallId);
// Get total orders by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/total-orders?startDate=2026-07-01&endDate=2026-08-01
router.get(
  "/:stallId/total-orders",
  vendorDashboardController.getTotalOrdersByStallId,
);

module.exports = router;
