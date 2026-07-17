const express = require("express");
const customerController = require("../controllers/customerController");

const router = express.Router();

router.post("/register", customerController.registerCustomer);
router.post("/login", customerController.loginCustomer);

router.get("/:id/profile",customerController.getCustomerProfile);

router.put("/:id/profile",customerController.updateCustomerProfile);
router.put("/:userID/password",customerController.changeCustomerPassword);

module.exports = router;