const express = require("express");

const vendorPromotionController = require("../controllers/vendorPromotionController");
const vendorPromotionValidation = require("../middleware/vendorPromotionValidation");

const router = express.Router();

// create new promotion [POST]
// test run: http://localhost:3000/vendor-promotions
// {
//   "StallID": 1,
//   "PromotionName": "Lunch Special",
//   "PromotionDescription": "Enjoy $2 off during lunchtime",
//   "DiscountValue": 2,
//   "StartDate": "2026-07-20",
//   "EndDate": "2026-07-31",
//   "IsActive": true
// }
router.post(
  "/",
  vendorPromotionValidation.validatePromotion,
  vendorPromotionController.createPromotion,
);
// delete promotion [DELETE]
// test run (need to have 1 promo min.): http://localhost:3000/vendor-promotions/1
router.delete(
  "/:promotionId",
  vendorPromotionValidation.validatePromotionId,
  vendorPromotionController.deletePromotion,
);

module.exports = router;
