const express = require("express");
const orderController = require("../controllers/orderController");
const {authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/customer/:customerID/recent",authenticateToken,authorizeRoles("Customer"),orderController.getRecentOrders);
router.post("/", authenticateToken, authorizeRoles("Customer"), orderController.createOrder);
router.get("/customer/:customerID",authenticateToken,authorizeRoles("Customer"),orderController.getAllOrders);
router.get("/customer/:customerID/:orderID/receipt",authenticateToken,authorizeRoles("Customer"),orderController.getReceipt);
module.exports = router;