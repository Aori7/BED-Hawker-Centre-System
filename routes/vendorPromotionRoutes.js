const express = require("express");
const vendorPromotionController = require("../controllers/vendorPromotionController");
const vendorPromotionValidation = require("../middleware/vendorPromotionValidation");
// auth vendor - user and stall
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const { validateVendorStall } = require("../middleware/vendorValidation");

const router = express.Router();

// Get all promotions by stall ID [GET]
// test run: http://localhost:3000/vendor-promotions/1
router.get(
  "/:stallId",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorPromotionController.getPromotionsByStallId,
);

// create new promotion [POST]
// test run: http://localhost:3000/vendor-promotions/1
// {
//   "PromotionName":"Lunch Special",
//   "PromotionDescription":"Enjoy $2 off",
//   "DiscountType":"Fixed Amount",
//   "DiscountValue":2,
//   "StartDate":"2026-08-01",
//   "EndDate":"2026-08-31",
//   "IsActive":false,
//   "MenuItemIDs":[1,2,3]
// }
router.post(
  "/:stallId",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorPromotionValidation.validatePromotionInput,
  vendorPromotionValidation.validateAffectedMenuItems,
  vendorPromotionController.createPromotion,
);

// Update promotion [PUT]
// test run: http://localhost:3000/vendor-promotions/1/1
router.put(
  "/:stallId/:promotionId",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorPromotionValidation.validatePromotionId,
  vendorPromotionValidation.validatePromotionInput,
  vendorPromotionValidation.validateAffectedMenuItems,
  vendorPromotionController.updatePromotion,
);

// delete promotion [DELETE]
// test run: http://localhost:3000/vendor-promotions/1/1
router.delete(
  "/:stallId/:promotionId",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorPromotionValidation.validatePromotionId,
  vendorPromotionController.deletePromotion,
);

module.exports = router;
