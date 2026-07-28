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

// Get total unavailable items by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/total-unavailable-items
async function getTotalUnavailableItemsByStallId(req, res) {
  try {
    const stallId = parseInt(req.params.stallId, 10);

    if (Number.isNaN(stallId) || stallId <= 0) {
      return res.status(400).json({
        error: "Valid stallId are required",
      });
    }

    const totalUnavailableItems =
      await vendorDashboardModel.getTotalUnavailableItemsByStallId(stallId);

    res.json(totalUnavailableItems);
  } catch (error) {
    console.error("Controller error:", error);

    res.status(500).json({
      error: "Error retrieving total unavailable items",
    });
  }
}

// Get total orders by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/total-complaints?startDate=2026-07-01&endDate=2026-08-01
async function getTotalComplaintsByStallId(req, res) {
  try {
    const stallId = parseInt(req.params.stallId, 10);
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    if (Number.isNaN(stallId) || stallId <= 0 || !startDate || !endDate) {
      return res.status(400).json({
        error: "Valid stallId, startDate and endDate are required",
      });
    }

    const totalComplaints =
      await vendorDashboardModel.getTotalComplaintsByStallId(
        stallId,
        startDate,
        endDate,
      );

    res.json(totalComplaints);
  } catch (error) {
    console.error("Controller error:", error);

    res.status(500).json({
      error: "Error retrieving total orders",
    });
  }
}

// Get breakdown of orders by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/orders-breakdown?startDate=2026-07-01&endDate=2026-08-01
async function getOrdersBreakdownByStallId(req, res) {
  try {
    const stallId = parseInt(req.params.stallId, 10);
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    if (Number.isNaN(stallId) || stallId <= 0 || !startDate || !endDate) {
      return res.status(400).json({
        error: "Valid stallId, startDate and endDate are required",
      });
    }

    const OrdersBreakdown =
      await vendorDashboardModel.getOrdersBreakdownByStallId(
        stallId,
        startDate,
        endDate,
      );

    res.json(OrdersBreakdown);
  } catch (error) {
    console.error("Controller error:", error);

    res.status(500).json({
      error: "Error retrieving breakdown of orders",
    });
  }
}

// Get order trends by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/order-trend?startDate=2026-07-01&endDate=2026-08-01&filterType=monthly
async function getOrderTrendByStallId(req, res) {
  try {
    const stallId = Number(req.params.stallId);
    const { startDate, endDate, filterType } = req.query;

    // validate stall ID
    if (!Number.isInteger(stallId) || stallId <= 0) {
      return res.status(400).json({
        message: "A valid stall ID is required.",
      });
    }
    // validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Start date and end date are required.",
      });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    // validate dates
    if (
      Number.isNaN(parsedStartDate.getTime()) ||
      Number.isNaN(parsedEndDate.getTime())
    ) {
      return res.status(400).json({
        message: "Start date and end date must be valid dates.",
      });
    }
    if (parsedStartDate >= parsedEndDate) {
      return res.status(400).json({
        message: "End date must be later than start date.",
      });
    }

    // validate filter type
    const allowedFilterTypes = ["daily", "weekly", "monthly", "yearly"];

    if (!allowedFilterTypes.includes(filterType)) {
      return res.status(400).json({
        message: "Filter type must be daily, weekly, monthly or yearly.",
      });
    }

    const orderTrend = await vendorDashboardModel.getOrderTrendByStallId(
      stallId,
      startDate,
      endDate,
      filterType,
    );

    return res.status(200).json({
      filterType,
      startDate,
      endDate,
      orderTrend,
    });
  } catch (error) {
    console.error("Error in getOrderTrend controller:", error);

    return res.status(500).json({
      message: "Unable to retrieve order trend.",
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
