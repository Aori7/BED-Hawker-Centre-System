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

    res.status(200).json(revenue);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to retrieve revenue.",
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

    res.status(200).json(totalOrders);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to retrieve total orders.",
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

    res.status(200).json(totalUnavailableItems);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to retrieve total unavailable items.",
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

    res.status(200).json(totalComplaints);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to retrieve total complaints.",
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

    res.status(200).json(ordersBreakdown);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to retrieve breakdown of orders.",
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

// Get Top 3 menu items by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/top-menu-items?startDate=2026-07-01&endDate=2026-08-01
async function getTopMenuItemsByStallId(req, res) {
  try {
    const topMenuItems = await vendorDashboardModel.getTopMenuItemsByStallId(
      req.params.stallId,
      req.query.startDate,
      req.query.endDate,
    );

    res.status(200).json(topMenuItems);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to retrieve top menu items.",
    });
  }
}

// Get unavailable menu items by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/unavailable-menu-items
async function getUnavailableMenuItemsByStallId(req, res) {
  try {
    const unavailableMenuItems =
      await vendorDashboardModel.getUnavailableMenuItemsByStallId(
        req.params.stallId,
      );

    res.status(200).json(unavailableMenuItems);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to retrieve unavailable menu items.",
    });
  }
}

// Get active promotions by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/active-promotions
async function getActivePromotionsByStallId(req, res) {
  try {
    const activePromotions =
      await vendorDashboardModel.getActivePromotionsByStallId(
        req.params.stallId,
      );

    res.status(200).json(activePromotions);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to retrieve active promotions.",
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
  getTopMenuItemsByStallId,
  getUnavailableMenuItemsByStallId,
  getActivePromotionsByStallId,
};