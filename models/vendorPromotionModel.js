const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Create new promotion [POST]
// test run: http://localhost:3000/vendor-promotions
// {
//   "StallID": 1,
//   "PromotionName": "Lunch Special",
//   "PromotionDescription": "Enjoy $2 off during lunchtime",
//   "DiscountValue": 2,
//   "StartDate": "2026-07-20",
//   "EndDate": "2026-07-31",
//   "IsActive": true
// }
// order of codes:
    // connect
    // create request
    // add inputs
    // run duplicate query
    // check duplicate result
    // run insert query
    // return result
async function createPromotion(promotionData) {
  try {
    const connection = await sql.connect(dbConfig);
    const request = connection.request();

    if (duplicateResult.recordset.length > 0) {
      const error = new Error(
        "An identical promotion already exists for this stall",
      );
      error.statusCode = 409;
      throw error;
    }

    const request = connection.request();
    request.input("StallID", sql.Int, promotionData.StallID);
    request.input(
      "PromotionName",
      sql.VarChar(100),
      promotionData.PromotionName,
    );
    request.input(
      "PromotionDescription",
      sql.VarChar(500),
      promotionData.PromotionDescription || null,
    );
    request.input(
      "DiscountValue",
      sql.Decimal(10, 2),
      promotionData.DiscountValue,
    );
    request.input("StartDate", sql.Date, promotionData.StartDate);
    request.input("EndDate", sql.Date, promotionData.EndDate);
    request.input(
      "IsActive",
      sql.Bit,
      promotionData.IsActive === undefined ? true : promotionData.IsActive,
    );

    // prevent duplicate promotions in the same stall
    const duplicateQuery = `
      SELECT PromotionID
      FROM Promotion
      WHERE StallID = @StallID
        AND PromotionName = @PromotionName
        AND StartDate = @StartDate
        AND EndDate = @EndDate
        AND DiscountValue = @DiscountValue
    `;
    const duplicateResult = await request.query(duplicateQuery);

    if (duplicateResult.recordset.length > 0) {
      const error = new Error(
        "An identical promotion already exists for this stall",
      );

      error.statusCode = 409;
      throw error;
    }

    // insert query
    const query = `INSERT INTO Promotion (StallID, PromotionName, PromotionDescription, DiscountValue, StartDate, EndDate, IsActive)
    VALUES (@StallID, @PromotionName, @PromotionDescription, @DiscountValue, @StartDate, @EndDate, @IsActive);
    SELECT SCOPE_IDENTITY() AS id;`;

    const result = await request.query(query);
    const newPromotionId = Number(result.recordset[0].id);
    // return await getPromotionById(newPromotionId);
    
    return {
      PromotionID: newPromotionId,
      StallID: promotionData.StallID,
      PromotionName: promotionData.PromotionName,
      PromotionDescription: promotionData.PromotionDescription || null,
      DiscountValue: promotionData.DiscountValue,
      StartDate: promotionData.StartDate,
      EndDate: promotionData.EndDate,
      IsActive:
        promotionData.IsActive === undefined ? true : promotionData.IsActive,
    };
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// delete promotion [DELETE]
// test run (need to have 1 promo min.): http://localhost:3000/vendor-promotions/1
async function deletePromotion(promotionId) {
  try {
    const connection = await sql.connect(dbConfig);
    const query = `
      DELETE FROM Promotion
      WHERE PromotionID = @PromotionID
    `;

    const request = connection.request();

    request.input("PromotionID", sql.Int, promotionId);

    const result = await request.query(query);

    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

module.exports = {
  createPromotion,
  deletePromotion,
};
