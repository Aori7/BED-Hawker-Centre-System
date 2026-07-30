const express = require("express");
const orderController = require("../controllers/orderController");
const {authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, authorizeRoles("Customer"), orderController.createOrder);

module.exports = router;