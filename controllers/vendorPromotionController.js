const vendorPromotionModel = require("../models/vendorPromotionModel");

// Get all promotions by stall ID
// test run: http://localhost:3000/vendor-promotions/1
async function getPromotionsByStallId(req, res) {
  try {
    const promotions = await vendorPromotionModel.getPromotionsByStallId(
      req.params.stallId,
    );

    res.status(200).json(promotions);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to retrieve promotions.",
    });
  }
}

// Create new promotion [POST]
// test run: http://localhost:3000/vendor-promotions/1
async function createPromotion(req, res) {
  try {
    const newPromotion = await vendorPromotionModel.createPromotion(
      req.params.stallId,
      req.body,
    );

    res.status(201).json(newPromotion);
  } catch (error) {
    console.error("Controller error:", error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: "Unable to create new promotion",
    });
  }
}

// delete promotion [DELETE]
// test run: http://localhost:3000/vendor-promotions/1/1
async function deletePromotion(req, res) {
  try {
    const deleted = await vendorPromotionModel.deletePromotion(
      req.params.stallId,
      req.params.promotionId,
    );

    if (!deleted) {
      return res.status(404).json({
        error: "Promotion not found.",
      });
    }

    res.status(200).json({
      message: "Promotion deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to delete promotion.",
    });
  }
}

module.exports = {
  getPromotionsByStallId,
  createPromotion,
  deletePromotion,
};
