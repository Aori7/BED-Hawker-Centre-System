const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all orders by stall ID [GET]
// test run: http://localhost:3000/vendor-orders/1
async function getOrdersByStallId(stallId) {
  try {
    const connection = await sql.connect(dbConfig);

    const request = connection.request();

    request.input("stallId", sql.Int, stallId);

    const query = `
      SELECT
        O.OrderID,
        O.CustomerID,
        C.CustomerName,
        O.OrderType,
        O.OrderDateTime,
        O.OrderStatus,
        O.Subtotal,
        O.DeliveryFee,
        O.TotalAmount,
        O.SpecialRequest,
        O.CreatedAt
      FROM Orders O
      INNER JOIN Customer C
        ON O.CustomerID = C.CustomerID
      WHERE O.StallID = @stallId
      ORDER BY O.OrderDateTime DESC`;

    const orderResult = await request.query(query);

    const orders = orderResult.recordset;

    for (const order of orders) {
      const itemRequest = connection.request();

      itemRequest.input("orderId", sql.Int, order.OrderID);

      const itemResult = await itemRequest.query(`
        SELECT
          OrderItemID,
          MenuItemID,
          ItemName,
          Quantity,
          UnitPrice,
          Subtotal,
          SpecialRequest
        FROM OrderItem
        WHERE OrderID = @orderId
        ORDER BY OrderItemID ASC`);

      order.OrderItems = itemResult.recordset;
    }

    return orders;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Update order status [PUT]
// test run: http://localhost:3000/vendor-orders/1/1/status
async function updateOrderStatus(stallId, orderId, orderStatus) {
  try {
    const connection = await sql.connect(dbConfig);

    const request = connection.request();

    request.input("stallId", sql.Int, stallId);
    request.input("orderId", sql.Int, orderId);
    request.input("orderStatus", sql.VarChar(30), orderStatus);

    const query = `
      UPDATE Orders
      SET OrderStatus = @orderStatus
      WHERE StallID = @stallId
        AND OrderID = @orderId;

      SELECT
        OrderID,
        CustomerID,
        StallID,
        OrderType,
        OrderDateTime,
        OrderStatus,
        Subtotal,
        DeliveryFee,
        TotalAmount,
        SpecialRequest,
        CreatedAt
      FROM Orders
      WHERE StallID = @stallId
        AND OrderID = @orderId`;

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null;
    }

    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

module.exports = {
  getOrdersByStallId,
  updateOrderStatus,
};
