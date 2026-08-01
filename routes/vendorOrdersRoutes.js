const express = require("express");
const vendorOrdersController = require("../controllers/vendorOrdersController");
const vendorOrdersValidation = require("../middleware/vendorOrdersValidation");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const { validateVendorStall } = require("../middleware/vendorValidation");

const router = express.Router();

// Get all orders by stall ID [GET]
// test run: http://localhost:3000/vendor-orders/1
router.get(
  "/:stallId",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorOrdersController.getOrdersByStallId,
);

// Update order status [PUT]
// test run: http://localhost:3000/vendor-orders/1/1/status
// {
//   "OrderStatus":"Preparing"
// }
router.put(
  "/:stallId/:orderId/status",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorOrdersValidation.validateOrderId,
  vendorOrdersValidation.validateOrderBelongsToStall,
  vendorOrdersValidation.validateOrderStatus,
  vendorOrdersController.updateOrderStatus,
);

module.exports = router;
