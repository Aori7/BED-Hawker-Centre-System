const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();
// base path: /auth
router.post("/login", authController.loginUser);

module.exports = router;