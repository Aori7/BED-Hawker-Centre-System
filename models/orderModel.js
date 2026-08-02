const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function createOrder(orderData) {
  const connection = await sql.connect(dbConfig);
  const transaction = new sql.Transaction(connection);

  try {
    await transaction.begin();

    const {
      customerID,
      stallID,
      orderType,
      paymentMethod,
      specialRequest,
      items,
    } = orderData;

    let subtotal = 0;
    const verifiedItems = [];

    // Retrieve every menu item from the database
    for (const item of items) {
      const menuItemResult = await new sql.Request(transaction)
        .input("MenuItemID", sql.Int, item.menuItemID)
        .input("StallID", sql.Int, stallID).query(`
                    SELECT
                        MenuItemID,
                        StallID,
                        ItemName,
                        ItemPrice,
                        IsAvailable
                    FROM MenuItem
                    WHERE MenuItemID = @MenuItemID
                    AND StallID = @StallID
                `);

      if (menuItemResult.recordset.length === 0) {
        throw new Error(
          `Menu item ${item.menuItemID} was not found in this stall`,
        );
      }

      const menuItem = menuItemResult.recordset[0];

      if (!menuItem.IsAvailable) {
        throw new Error(`${menuItem.ItemName} is currently unavailable`);
      }

      const quantity = parseInt(item.quantity);

      if (Number.isNaN(quantity) || quantity <= 0) {
        throw new Error(`Invalid quantity for ${menuItem.ItemName}`);
      }

      const unitPrice = Number(menuItem.ItemPrice);

      const itemSubtotal = unitPrice * quantity;

      subtotal += itemSubtotal;

      verifiedItems.push({
        menuItemID: menuItem.MenuItemID,

        itemName: menuItem.ItemName,

        quantity: quantity,

        unitPrice: unitPrice,

        subtotal: itemSubtotal,

        specialRequest: item.specialRequest || null,
      });
    }

    // Delivery currently has no calculated delivery fee
    const deliveryFee = 0;
    const totalAmount = subtotal + deliveryFee;

    /*
        For now, payment remains Pending because
        there is no real payment gateway yet.
        */
    const paymentStatus = "Pending";

    // Insert into Orders
    const orderResult = await new sql.Request(transaction)
      .input("CustomerID", sql.Int, customerID)
      .input("StallID", sql.Int, stallID)
      .input("OrderType", sql.VarChar(20), orderType)
      .input("Subtotal", sql.Decimal(10, 2), subtotal)
      .input("DeliveryFee", sql.Decimal(10, 2), deliveryFee)
      .input("TotalAmount", sql.Decimal(10, 2), totalAmount)
      .input("PaymentMethod", sql.VarChar(20), paymentMethod)
      .input("PaymentStatus", sql.VarChar(20), paymentStatus)
      .input("SpecialRequest", sql.VarChar(255), specialRequest || null).query(`
                    INSERT INTO Orders
                    (
                        CustomerID,
                        StallID,
                        OrderType,
                        Subtotal,
                        DeliveryFee,
                        TotalAmount,
                        PaymentMethod,
                        PaymentStatus,
                        SpecialRequest
                    )
                    OUTPUT INSERTED.OrderID
                    VALUES
                    (
                        @CustomerID,
                        @StallID,
                        @OrderType,
                        @Subtotal,
                        @DeliveryFee,
                        @TotalAmount,
                        @PaymentMethod,
                        @PaymentStatus,
                        @SpecialRequest
                    )
                `);

    const orderID = orderResult.recordset[0].OrderID;

    // Insert all OrderItem records
    for (const item of verifiedItems) {
      await new sql.Request(transaction)
        .input("OrderID", sql.Int, orderID)
        .input("MenuItemID", sql.Int, item.menuItemID)
        .input("ItemName", sql.VarChar(100), item.itemName)
        .input("Quantity", sql.Int, item.quantity)
        .input("UnitPrice", sql.Decimal(10, 2), item.unitPrice)
        .input("Subtotal", sql.Decimal(10, 2), item.subtotal)
        .input("SpecialRequest", sql.VarChar(255), item.specialRequest).query(`
                    INSERT INTO OrderItem
                    (
                        OrderID,
                        MenuItemID,
                        ItemName,
                        Quantity,
                        UnitPrice,
                        Subtotal,
                        SpecialRequest
                    )
                    VALUES
                    (
                        @OrderID,
                        @MenuItemID,
                        @ItemName,
                        @Quantity,
                        @UnitPrice,
                        @Subtotal,
                        @SpecialRequest
                    )
                `);
    }

    // Insert Payment record
    await new sql.Request(transaction)
      .input("OrderID", sql.Int, orderID)
      .input("PaymentMethod", sql.VarChar(20), paymentMethod)
      .input("PaymentAmount", sql.Decimal(10, 2), totalAmount)
      .input("PaymentStatus", sql.VarChar(20), paymentStatus).query(`
                INSERT INTO Payment
                (
                    OrderID,
                    PaymentMethod,
                    PaymentAmount,
                    PaymentStatus
                )
                VALUES
                (
                    @OrderID,
                    @PaymentMethod,
                    @PaymentAmount,
                    @PaymentStatus
                )
            `);

    await transaction.commit();

    return {
      orderID,
      subtotal,
      deliveryFee,
      totalAmount,
      paymentStatus,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function getRecentOrdersByCustomer(customerID) {
  const connection = await sql.connect(dbConfig);

  try {
    const result = await connection
      .request()
      .input("CustomerID", sql.Int, customerID).query(`
                SELECT TOP 5
                    o.OrderID,
                    o.OrderDateTime,
                    o.OrderStatus,
                    o.OrderType,
                    o.TotalAmount,
                    o.PaymentMethod,
                    o.PaymentStatus,
                    fs.StallName,
                    COALESCE(SUM(oi.Quantity), 0) AS ItemCount
                FROM Orders o

                INNER JOIN FoodStall fs
                    ON o.StallID = fs.StallID

                LEFT JOIN OrderItem oi
                    ON o.OrderID = oi.OrderID

                WHERE o.CustomerID = @CustomerID

                GROUP BY
                    o.OrderID,
                    o.OrderDateTime,
                    o.OrderStatus,
                    o.OrderType,
                    o.TotalAmount,
                    o.PaymentMethod,
                    o.PaymentStatus,
                    fs.StallName

                ORDER BY o.OrderDateTime DESC;
            `);

    return result.recordset;
  } finally {
    await connection.close();
  }
}
async function getAllOrdersByCustomer(customerID) {
  const connection = await sql.connect(dbConfig);

  try {
    const result = await connection
      .request()
      .input("CustomerID", sql.Int, customerID)
      .query(`
        SELECT
          o.OrderID,
          o.OrderDateTime,
          o.OrderStatus,
          o.OrderType,
          o.TotalAmount,
          o.PaymentMethod,
          o.PaymentStatus,
          fs.StallName,
          COALESCE(SUM(oi.Quantity), 0) AS ItemCount
        FROM Orders o

        INNER JOIN FoodStall fs
          ON o.StallID = fs.StallID

        LEFT JOIN OrderItem oi
          ON o.OrderID = oi.OrderID

        WHERE o.CustomerID = @CustomerID

        GROUP BY
          o.OrderID,
          o.OrderDateTime,
          o.OrderStatus,
          o.OrderType,
          o.TotalAmount,
          o.PaymentMethod,
          o.PaymentStatus,
          fs.StallName

        ORDER BY
          o.OrderDateTime DESC,
          o.OrderID DESC;
      `);

    return result.recordset;
  } finally {
    await connection.close();
  }
}
module.exports = {
  createOrder,
  getRecentOrdersByCustomer,
  getAllOrdersByCustomer,
};
