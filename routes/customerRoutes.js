const express = require("express");
const customerController = require("../controllers/customerController");

const router = express.Router();

router.post("/register", customerController.registerCustomer);

module.exports = router;