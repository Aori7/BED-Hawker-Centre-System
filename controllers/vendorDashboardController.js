const vendorDashboardModel = require("../models/vendorDashboardModel");

// Get revenue by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/revenue?startDate=2026-07-01&endDate=2026-08-01
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
    res.json(revenue);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving revenue" });
  }
}

// Get total orders by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/total-orders?startDate=2026-07-01&endDate=2026-08-01
async function getTotalOrdersByStallId(req, res) {
  try {
    const stallId = parseInt(req.params.stallId, 10);

    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    if (Number.isNaN(stallId) || stallId <= 0 || !startDate || !endDate) {
      return res.status(400).json({
        error: "Valid stallId, startDate and endDate are required",
      });
    }

    const totalOrders = await vendorDashboardModel.getTotalOrdersByStallId(
      stallId,
      startDate,
      endDate,
    );

    res.json(totalOrders);
  } catch (error) {
    console.error("Controller error:", error);

    res.status(500).json({
      error: "Error retrieving total orders",
    });
  }
}

module.exports = {
  getRevenueByStallId,
  getTotalOrdersByStallId
};
