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

// Get total unavailable items by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/total-unavailable-items?startDate=2026-07-01&endDate=2026-08-01
router.get(
  "/:stallId/total-unavailable-items",
  vendorDashboardController.getTotalUnavailableItemsByStallId,
);

// Get total complaints by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/total-complaints?startDate=2026-07-01&endDate=2026-08-01
router.get(
  "/:stallId/total-complaints",
  vendorDashboardController.getTotalComplaintsByStallId,
);

// Get breakdown of orders by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/orders-breakdown?startDate=2026-07-01&endDate=2026-08-01
router.get(
  "/:stallId/orders-breakdown",
  vendorDashboardController.getOrdersBreakdownByStallId,
);

// Get order trends by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/order-trend?startDate=2026-07-01&endDate=2026-08-01&filterType=monthly
router.get("/:stallId/order-trend", vendorDashboardController.getOrderTrendByStallId);

module.exports = router;
