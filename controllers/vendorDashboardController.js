const vendorDashboardModel = require("../models/vendorDashboardModel");

// Get revenue by stall ID
async function getRevenueByStallId(req, res) {
  try {
    const stallId = parseInt(req.params.stallId);
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    if (Number.isNaN(stallId) || !startDate || !endDate) {
      return res.status(400).json({
        error: "Valid stallId, startDate and endDate are required",
      });
    }

    const revenue = await vendorDashboardModel.getRevenueByStallId(
      stallId,
      startDate,
      endDate,
    );
    res.json(book);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving book" });
  }
}

module.exports = {
  getRevenueByStallId,
};
