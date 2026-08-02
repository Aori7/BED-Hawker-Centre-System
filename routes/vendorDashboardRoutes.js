const express = require("express");
const vendorDashboardController = require("../controllers/vendorDashboardController");
const vendorDashboardValidation = require("../middleware/vendorDashboardValidation");
// auth vendor - user & stall
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const { validateVendorStall } = require("../middleware/vendorValidation");

const router = express.Router();

// Get revenue by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/revenue?startDate=2026-07-01&endDate=2026-08-01
router.get(
  "/:stallId/revenue",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorDashboardValidation.validateDateRange,
  vendorDashboardController.getRevenueByStallId,
);
// Get total orders by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/total-orders?startDate=2026-07-01&endDate=2026-08-01
router.get(
  "/:stallId/total-orders",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorDashboardValidation.validateDateRange,
  vendorDashboardController.getTotalOrdersByStallId,
);

// Get total unavailable items by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/total-unavailable-items?startDate=2026-07-01&endDate=2026-08-01
router.get(
  "/:stallId/total-unavailable-items",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorDashboardController.getTotalUnavailableItemsByStallId,
);

// Get total complaints by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/total-complaints?startDate=2026-07-01&endDate=2026-08-01
router.get(
  "/:stallId/total-complaints",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorDashboardValidation.validateDateRange,
  vendorDashboardController.getTotalComplaintsByStallId,
);

// Get breakdown of orders by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/orders-breakdown?startDate=2026-07-01&endDate=2026-08-01
router.get(
  "/:stallId/orders-breakdown",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorDashboardValidation.validateDateRange,
  vendorDashboardController.getOrdersBreakdownByStallId,
);

// Get order trends by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/order-trend?startDate=2026-07-01&endDate=2026-08-01&filterType=monthly
router.get(
  "/:stallId/order-trend",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorDashboardValidation.validateDateRange,
  vendorDashboardValidation.validateOrderTrendFilter,
  vendorDashboardController.getOrderTrendByStallId,
);

// Get top 3 menu items by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/top-menu-items?startDate=2026-07-01&endDate=2026-08-01
router.get(
  "/:stallId/top-menu-items",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorDashboardValidation.validateDateRange,
  vendorDashboardController.getTopMenuItemsByStallId,
);

// Get unavailable menu items by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/unavailable-menu-items
router.get(
  "/:stallId/unavailable-menu-items",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorDashboardController.getUnavailableMenuItemsByStallId,
);

// Get active promotions by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/active-promotions
router.get(
  "/:stallId/active-promotions",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorDashboardController.getActivePromotionsByStallId,
);

module.exports = router;
