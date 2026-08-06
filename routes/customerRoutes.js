const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customerController");
const {authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");


router.post("/register", customerController.registerCustomer);
router.post("/login", customerController.loginCustomer);
//profile management
router.get("/:id/profile", authenticateToken, authorizeRoles("Customer"), customerController.getCustomerProfile);
router.put("/:id/profile",authenticateToken, authorizeRoles("Customer"),customerController.updateCustomerProfile);
router.put("/:userID/password",authenticateToken, authorizeRoles("Customer"),customerController.changeCustomerPassword);
router.delete("/:customerID/account",authenticateToken, authorizeRoles("Customer"),customerController.deleteCustomerAccount);

module.exports = router; 