const vendorPromotionModel = require("../models/vendorPromotionModel");

// Create new promotion [POST]
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
async function createPromotion(req, res) {
  try {
    const newPromotion = await vendorPromotionModel.createPromotion(req.body);
    res.status(201).json(newPromotion);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error creating new promotion" });
  }
}

module.exports = {
  createPromotion,
};
