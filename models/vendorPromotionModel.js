const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Create new promotion [POST]
// test run: http://localhost:3000/vendor-promotions
    // {
    //   "StallId": 1,
    //   "PromotionName": "Lunch Special",
    //   "PromotionDescription": "Enjoy $2 off during lunchtime",
    //   "DiscountValue": 2,
    //   "StartDate": "2026-07-20",
    //   "EndDate": "2026-07-31",
    //   "IsActive": true
    // }
async function createPromotion(promotionData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `INSERT INTO Promotion (StallID, PromotionName, PromotionDescription, DiscountValue, StartDate, EndDate, IsActive)
    VALUES (@StallID, @PromotionName, @PromotionDescription, @DiscountValue, @StartDate, @EndDate, @IsActive);
    SELECT SCOPE_IDENTITY() AS id;`;
    const request = connection.request();
    request.input("StallID", promotionData.StallID);
    request.input("PromotionName", promotionData.PromotionName);
    request.input("PromotionDescription", promotionData.PromotionDescription);
    request.input("DiscountValue", promotionData.DiscountValue);
    request.input("StartDate", promotionData.StartDate);
    request.input("EndDate", promotionData.EndDate);
    request.input("IsActive", promotionData.IsActive);

    const result = await request.query(query);

    const newPromotionId = result.recordset[0].id;
    return await getPromotionById(newPromotionId);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
    // TODO: remove 'finally'?
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
  createPromotion,
};
