const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all promotions by stall ID
// test run: http://localhost:3000/vendor-promotions/1
async function getPromotionsByStallId(stallId) {
  try {
    const connection = await sql.connect(dbConfig);

    const query = `
      SELECT
        P.PromotionID,
        P.PromotionName,
        P.PromotionDescription,
        P.DiscountType,
        P.DiscountValue,
        P.StartDate,
        P.EndDate,
        P.IsActive,
        MI.MenuItemID,
        MI.ItemName
      FROM Promotion P
      LEFT JOIN MenuItem MI
        ON P.PromotionID = MI.PromotionID
      WHERE P.StallID = @stallId
      ORDER BY
        P.PromotionID,
        MI.ItemName`;

    const request = connection.request();

    request.input("stallId", sql.Int, stallId);

    const result = await request.query(query);

    const promotions = [];

    result.recordset.forEach((row) => {
      let promotion = promotions.find((p) => p.PromotionID === row.PromotionID);

      if (!promotion) {
        promotion = {
          PromotionID: row.PromotionID,
          PromotionName: row.PromotionName,
          PromotionDescription: row.PromotionDescription,
          DiscountType: row.DiscountType,
          DiscountValue: row.DiscountValue,
          StartDate: row.StartDate,
          EndDate: row.EndDate,
          IsActive: row.IsActive,
          AffectedMenuItems: [],
        };
        promotions.push(promotion);
      }

      if (row.MenuItemID) {
        promotion.AffectedMenuItems.push({
          MenuItemID: row.MenuItemID,
          ItemName: row.ItemName,
        });
      }
    });

    return promotions;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Create new promotion [POST]
// test run: http://localhost:3000/vendor-promotions/1
// order of codes:
// connect
// create request
// add inputs
// run duplicate query
// check duplicate result
// run insert query
// return result
async function createPromotion(stallId, promotionData) {
  try {
    const connection = await sql.connect(dbConfig);
    const request = connection.request();

    request.input("StallID", sql.Int, stallId);
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
    request.input("DiscountType", sql.VarChar(20), promotionData.DiscountType);
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
        AND DiscountType = @DiscountType
        AND DiscountValue = @DiscountValue`;

    const duplicateResult = await request.query(duplicateQuery);

    if (duplicateResult.recordset.length > 0) {
      const error = new Error(
        "An identical promotion already exists for this stall",
      );

      error.statusCode = 409;
      throw error;
    }

    // insert query
    const query = `
      INSERT INTO Promotion
      (
        StallID,
        PromotionName,
        PromotionDescription,
        DiscountType,
        DiscountValue,
        StartDate,
        EndDate,
        IsActive
      )
      VALUES
      (
        @StallID,
        @PromotionName,
        @PromotionDescription,
        @DiscountType,
        @DiscountValue,
        @StartDate,
        @EndDate,
        @IsActive
      );
      SELECT SCOPE_IDENTITY() AS id;`;

    const result = await request.query(query);
    const newPromotionId = Number(result.recordset[0].id);

    // Link selected menu items to the promotion
    if (promotionData.MenuItemIDs && promotionData.MenuItemIDs.length > 0) {
      for (const menuItemId of promotionData.MenuItemIDs) {
        await connection
          .request()
          .input("PromotionID", sql.Int, newPromotionId)
          .input("MenuItemID", sql.Int, menuItemId)
          .input("StallID", sql.Int, stallId).query(`
        UPDATE MenuItem
        SET PromotionID = @PromotionID
        WHERE MenuItemID = @MenuItemID
          AND StallID = @StallID
      `);
      }
    }

    return {
      PromotionID: newPromotionId,
      StallID: stallId,
      PromotionName: promotionData.PromotionName,
      PromotionDescription: promotionData.PromotionDescription || null,
      DiscountType: promotionData.DiscountType,
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
// test run: http://localhost:3000/vendor-promotions/1/1
async function deletePromotion(stallId, promotionId) {
  try {
    const connection = await sql.connect(dbConfig);

    const query = `
      DELETE FROM Promotion
      WHERE PromotionID = @promotionId
        AND StallID = @stallId
    `;

    const request = connection.request();

    request.input("promotionId", sql.Int, promotionId);
    request.input("stallId", sql.Int, stallId);

    const result = await request.query(query);

    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

module.exports = {
  getPromotionsByStallId,
  createPromotion,
  deletePromotion,
};
