const vendorOrdersModel = require("../models/vendorOrdersModel");

// Get all orders by stall ID [GET]
// test run: http://localhost:3000/vendor-orders/1
async function getOrdersByStallId(req, res) {
  try {
    const orders = await vendorOrdersModel.getOrdersByStallId(
      req.params.stallId,
    );

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to retrieve orders.",
    });
  }
}

// Update order status [PUT]
// test run: http://localhost:3000/vendor-orders/1/1/status
async function updateOrderStatus(req, res) {
  try {
    const updatedOrder = await vendorOrdersModel.updateOrderStatus(
      req.params.stallId,
      req.params.orderId,
      req.body.OrderStatus,
    );

    if (!updatedOrder) {
      return res.status(404).json({
        error: "Order not found.",
      });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to update order status.",
    });
  }
}

module.exports = {
  getOrdersByStallId,
  updateOrderStatus,
};
