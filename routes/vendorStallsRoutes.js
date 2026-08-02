const express = require("express");
const vendorStallController = require("../controllers/vendorStallsController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get stalls belonging to logged-in vendor [GET]
// test run: http://localhost:3000/vendor-stalls
router.get(
  "/",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  vendorStallController.getVendorStalls,
);

module.exports = router;
