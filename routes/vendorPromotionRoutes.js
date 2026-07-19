const express = require("express");

const vendorPromotionController = require("../controllers/vendorPromotionController");
const vendorPromotionValidation = require("../middleware/vendorPromotionValidation");

const router = express.Router();

// create new promotion [POST]
// test run: http://localhost:3000/vendor-promotions
    // {
    //   "StallId": 1,
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

module.exports = router;
