const vendorPromotionModel = require("../models/vendorPromotionModel");

// Create new promotion [POST]
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
async function createPromotion(req, res) {
  try {
    const newPromotion = await vendorPromotionModel.createPromotion(req.body);

    res.status(201).json(newPromotion);
  } catch (error) {
    console.error("Controller error:", error);

    if (error.statusCode === 409) {
      return res.status(409).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: "Error creating new promotion",
    });
  }
}

// delete promotion [DELETE]
// test run (need to have 1 promo min.): http://localhost:3000/vendor-promotions/1
async function deletePromotion(req, res) {
  try {
    const promotionId = parseInt(req.params.promotionId, 10);

    const deleted = await vendorPromotionModel.deletePromotion(promotionId);

    if (!deleted) {
      return res.status(404).json({
        error: "Promotion not found",
      });
    }

    res.status(200).json({
      message: "Promotion deleted successfully",
    });
  } catch (error) {
    console.error("Controller error:", error);

    res.status(500).json({
      error: "Error deleting promotion",
    });
  }
}
module.exports = {
  createPromotion,
  deletePromotion,
};
