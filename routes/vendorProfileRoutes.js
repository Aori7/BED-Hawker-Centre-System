const express = require("express");
const vendorProfileController = require("../controllers/vendorProfileController");
const vendorProfileValidation = require("../middleware/vendorProfileValidation");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get vendor profile [GET]
// test run: http://localhost:3000/vendor-profile
router.get(
  "/",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  vendorProfileController.getVendorProfile,
);

// Update vendor profile [PUT]
// test run: http://localhost:3000/vendor-profile
// {
//   "OwnerName":"John Tan",
//   "ContactNo":"81234567"
// }
router.put(
  "/",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  vendorProfileValidation.validateProfileInput,
  vendorProfileController.updateVendorProfile,
);

// Change password [PUT]
// test run: http://localhost:3000/vendor-profile/password
// {
//   "CurrentPassword":"stallowner123",
//   "NewPassword":"newpassword123",
//   "ConfirmPassword":"newpassword123"
// }
router.put(
  "/password",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  vendorProfileValidation.validatePasswordInput,
  vendorProfileController.changePassword,
);

module.exports = router;
