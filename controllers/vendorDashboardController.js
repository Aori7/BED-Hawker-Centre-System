const vendorDashboardModel = require("../models/vendorDashboardModel");

// Get revenue by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/revenue?startDate=2026-07-01&endDate=2026-08-01
async function getRevenueByStallId(req, res) {
  try {
    const revenue = await vendorDashboardModel.getRevenueByStallId(
      req.params.stallId,
      req.query.startDate,
      req.query.endDate,
    );

    res.json(revenue);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Database error",
    });
  }
}

// Get total orders by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/total-orders?startDate=2026-07-01&endDate=2026-08-01
async function getTotalOrdersByStallId(req, res) {
  try {
    const totalOrders = await vendorDashboardModel.getTotalOrdersByStallId(
      req.params.stallId,
      req.query.startDate,
      req.query.endDate,
    );

    res.json(totalOrders);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error retrieving total orders",
    });
  }
}

// Get total unavailable items by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/total-unavailable-items
async function getTotalUnavailableItemsByStallId(req, res) {
  try {
    const totalUnavailableItems =
      await vendorDashboardModel.getTotalUnavailableItemsByStallId(
        req.params.stallId,
      );

    res.json(totalUnavailableItems);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error retrieving total unavailable items",
    });
  }
}

// Get total complaints by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/total-complaints?startDate=2026-07-01&endDate=2026-08-01
async function getTotalComplaintsByStallId(req, res) {
  try {
    const totalComplaints =
      await vendorDashboardModel.getTotalComplaintsByStallId(
        req.params.stallId,
        req.query.startDate,
        req.query.endDate,
      );

    res.json(totalComplaints);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error retrieving total complaints",
    });
  }
}
// Get breakdown of orders by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/orders-breakdown?startDate=2026-07-01&endDate=2026-08-01
async function getOrdersBreakdownByStallId(req, res) {
  try {
    const ordersBreakdown =
      await vendorDashboardModel.getOrdersBreakdownByStallId(
        req.params.stallId,
        req.query.startDate,
        req.query.endDate,
      );

    res.json(ordersBreakdown);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error retrieving breakdown of orders",
    });
  }
}

// Get order trends by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/order-trend?startDate=2026-07-01&endDate=2026-08-01&filterType=monthly
async function getOrderTrendByStallId(req, res) {
  try {
    const orderTrend = await vendorDashboardModel.getOrderTrendByStallId(
      req.params.stallId,
      req.query.startDate,
      req.query.endDate,
      req.query.filterType,
    );

    res.status(200).json({
      filterType: req.query.filterType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      orderTrend,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to retrieve order trend.",
    });
  }
}

module.exports = {
  getRevenueByStallId,
  getTotalOrdersByStallId,
  getTotalUnavailableItemsByStallId,
  getTotalComplaintsByStallId,
  getOrdersBreakdownByStallId,
  getOrderTrendByStallId,
};

// notes:

// async - wait for DB results | req - conatins info sent by FE/PM | res - used to send results back to FE/PM
// await - Wait until the model finishes retrieving the result from SQL Server

// Get revenue by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/revenue?startDate=2026-07-01&endDate=2026-08-01
async function getRevenueByStallId(req, res) {
  try {
    // getting values from URL
    const stallId = parseInt(req.params.stallId);
    // use .query caus eeveyrthing after ? is a string
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    // validating values
    if (Number.isNaN(stallId) || !startDate || !endDate) {
      return res.status(400).json({
        error: "Valid stallId, startDate and endDate are required",
      });
    }
    // calls the model function and passes the values
    const revenue = await vendorDashboardModel.getRevenueByStallId(
      stallId,
      startDate,
      endDate,
    );
    // return revenue
    res.json(revenue);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving revenue" });
  }
}

// JWT
// ↓
// userID
// ↓
// VendorID
// ↓
// StallID
// ↓
// Model
