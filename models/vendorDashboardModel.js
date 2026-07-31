const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get revenue by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/revenue?startDate=2026-07-01&endDate=2026-08-01
async function getRevenueByStallId(stallId, startDate, endDate) {
  let connection;
  try {
    // connects your Node.js application to Microsoft SQL Server
    connection = await sql.connect(dbConfig);
    // SQL query used to retive data
    const query = `SELECT
      COALESCE(SUM(TotalAmount), 0) AS Revenue
      FROM Orders
      WHERE StallID = @stallId
        AND OrderStatus = 'Completed'
        AND OrderDateTime >= @startDate
        AND OrderDateTime < @endDate`;
    // declaring parameters
    const request = connection.request();
    request.input("stallId", sql.Int, stallId);
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);
    // send quuery to the DB
    const result = await request.query(query);
    // return retrived data
    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Get total orders by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/total-orders?startDate=2026-07-01&endDate=2026-08-01
async function getTotalOrdersByStallId(stallId, startDate, endDate) {
  try {
    const connection = await sql.connect(dbConfig);

    const query = `
      SELECT
        COUNT(OrderID) AS TotalOrders
      FROM Orders
      WHERE StallID = @stallId
        AND OrderStatus = 'Completed'
        AND OrderDateTime >= @startDate
        AND OrderDateTime < @endDate
    `;

    const request = connection.request();

    request.input("stallId", sql.Int, stallId);
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);

    const result = await request.query(query);

    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Get total unavailable items by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/total-unavailable-items?startDate=2026-07-01&endDate=2026-08-01
async function getTotalUnavailableItemsByStallId(stallId, startDate, endDate) {
  try {
    const connection = await sql.connect(dbConfig);

    const query = `
      SELECT
        COUNT(OrderID) AS TotalOrders
      FROM Orders
      WHERE StallID = @stallId
        AND OrderStatus = 'Completed'
        AND OrderDateTime >= @startDate
        AND OrderDateTime < @endDate
    `;

    const request = connection.request();

    request.input("stallId", sql.Int, stallId);
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);

    const result = await request.query(query);

    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Get total unavailable items by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/total-unavailable-items
async function getTotalUnavailableItemsByStallId(stallId) {
  try {
    const connection = await sql.connect(dbConfig);

    const query = `
      SELECT
        COUNT(MenuItemID) AS TotalUnavailableItems
      FROM MenuItem
      WHERE StallID = @stallId
        AND IsAvailable = 0
    `;

    const request = connection.request();

    request.input("stallId", sql.Int, stallId);

    const result = await request.query(query);

    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Get total complaints by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/total-complaints?startDate=2026-07-01&endDate=2026-08-01
async function getTotalComplaintsByStallId(stallId, startDate, endDate) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const query = `
      SELECT
        COUNT(SubmissionID) AS TotalComplaints
      FROM ContactSubmission
      WHERE TargetType = 'Stall'
        AND StallID = @stallId
        AND SubmissionType = 'Complaint'
        AND CreatedAt >= @startDate
        AND CreatedAt < @endDate`;

    const request = connection.request();

    request.input("stallId", sql.Int, stallId);
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);

    const result = await request.query(query);

    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Get breakdown of orders by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/orders-breakdown?startDate=2026-07-01&endDate=2026-08-01
async function getOrdersBreakdownByStallId(stallId, startDate, endDate) {
  let connection;

  try {
    connection = await sql.connect(dbConfig);

    const query = `
      SELECT
        SUM(
          CASE
            WHEN OrderStatus <> 'Cancelled' THEN 1
            ELSE 0
          END
        ) AS TotalOrders,

        SUM(
          CASE
            WHEN OrderType = 'Dine-in'
              AND OrderStatus <> 'Cancelled'
            THEN 1
            ELSE 0
          END
        ) AS DineIn,

        SUM(
          CASE
            WHEN OrderType = 'Pickup'
              AND OrderStatus <> 'Cancelled'
            THEN 1
            ELSE 0
          END
        ) AS Pickup,

        SUM(
          CASE
            WHEN OrderType = 'Delivery'
              AND OrderStatus <> 'Cancelled'
            THEN 1
            ELSE 0
          END
        ) AS Delivery,

        SUM(
          CASE
            WHEN OrderStatus = 'Cancelled' THEN 1
            ELSE 0
          END
        ) AS CancelledOrders

      FROM Orders
      WHERE StallID = @stallId
        AND OrderDateTime >= @startDate
        AND OrderDateTime < @endDate`;

    const request = connection.request();

    request.input("stallId", sql.Int, stallId);
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);

    const result = await request.query(query);

    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Get order trends by stall ID
// test run: http://localhost:3000/vendor-dashboard/1/order-trend?startDate=2026-07-01&endDate=2026-08-01&filterType=monthly
async function getOrderTrendByStallId(stallId, startDate, endDate, filterType) {
  try {
    const connection = await sql.connect(dbConfig);

    let periodSelect;
    let periodGroupBy;

    // Group daily and weekly filters by individual dates
    if (filterType === "daily" || filterType === "weekly") {
      periodSelect = `
        CAST(OrderDateTime AS DATE)
      `;
      periodGroupBy = `
        CAST(OrderDateTime AS DATE)
      `;
    }

    // Group monthly filter into weekly periods
    else if (filterType === "monthly") {
      periodSelect = `
        DATEADD(
          WEEK,
          DATEDIFF(WEEK, @startDate, OrderDateTime),
          CAST(@startDate AS DATE)
        )
      `;
      periodGroupBy = `
        DATEADD(
          WEEK,
          DATEDIFF(WEEK, @startDate, OrderDateTime),
          CAST(@startDate AS DATE)
        )
      `;
    }

    // Group yearly filter by month
    else if (filterType === "yearly") {
      periodSelect = `
        DATEFROMPARTS(
          YEAR(OrderDateTime),
          MONTH(OrderDateTime),
          1
        )
      `;
      periodGroupBy = `
        DATEFROMPARTS(
          YEAR(OrderDateTime),
          MONTH(OrderDateTime),
          1
        )
      `;
    }

    const query = `
      SELECT
        ${periodSelect} AS PeriodStart,
        COUNT(OrderID) AS TotalOrders
      FROM Orders
      WHERE StallID = @stallId
        AND OrderStatus <> 'Cancelled'
        AND OrderDateTime >= @startDate
        AND OrderDateTime < @endDate
      GROUP BY ${periodGroupBy}
      ORDER BY PeriodStart ASC`;

    const request = connection.request();

    request.input("stallId", sql.Int, stallId);
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);

    const result = await request.query(query);

    return result.recordset;
  } catch (error) {
    console.error("Error getting order trend:", error);
    throw error;
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
