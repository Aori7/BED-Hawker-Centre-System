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
  } finally {
    // TODO: remove or not?
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Get revenue by stall ID
// test run: GET /api/stalls/1/revenue?period=monthly&date=2026-07-18
async function getTotalOrdersByStallId(stallId, startDate, endDate) {
  let connection;
  try {
    // connects your Node.js application to Microsoft SQL Server
    connection = await sql.connect(dbConfig);
    // SQL query used to retive data
    const query = `SELECT
      COALESCE(SUM(TotalAmount), 0) AS TotalOrders
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
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

module.exports = {
  getRevenueByStallId
};
