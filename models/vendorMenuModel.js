const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all menu items by stall ID [GET]
// test run: http://localhost:3000/vendor-menu/1
async function getMenuItemsByStallId(stallId) {
  try {
    const connection = await sql.connect(dbConfig);

    const request = connection.request();

    request.input("stallId", sql.Int, stallId);

    const query = `
      SELECT
        MI.MenuItemID,
        MI.ItemName,
        MI.ItemDescription,
        MI.ItemPrice,
        MI.ItemCategory,
        MI.ImageURL,
        MI.IsAvailable,
        MI.CreatedAt,
        MI.UpdatedAt,
        P.PromotionID,
        P.PromotionName
      FROM MenuItem MI
      LEFT JOIN Promotion P
        ON MI.PromotionID = P.PromotionID
      WHERE MI.StallID = @stallId
        AND MI.IsActive = 1
      ORDER BY
        MI.ItemCategory,
        MI.ItemName`;

    const result = await request.query(query);

    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Create new menu item [POST]
// test run: http://localhost:3000/vendor-menu/1
async function createMenuItem(stallId, menuItemData) {
  try {
    const connection = await sql.connect(dbConfig);

    const request = connection.request();

    request.input("StallID", sql.Int, stallId);
    request.input("ItemName", sql.VarChar(100), menuItemData.ItemName);
    request.input(
      "ItemDescription",
      sql.VarChar(500),
      menuItemData.ItemDescription || null,
    );
    request.input("ItemPrice", sql.Decimal(10, 2), menuItemData.ItemPrice);
    request.input("ItemCategory", sql.VarChar(50), menuItemData.ItemCategory);
    request.input("ImageURL", sql.VarChar(255), menuItemData.ImageURL || null);
    request.input("IsAvailable", sql.Bit, menuItemData.IsAvailable);
    request.input("IsActive", sql.Bit, true);

    const query = `
        INSERT INTO MenuItem
        (
            StallID,
            ItemName,
            ItemDescription,
            ItemPrice,
            ItemCategory,
            ImageURL,
            IsAvailable,
            IsActive
        )
        VALUES
        (
            @StallID,
            @ItemName,
            @ItemDescription,
            @ItemPrice,
            @ItemCategory,
            @ImageURL,
            @IsAvailable,
            @IsActive
        );
        SELECT SCOPE_IDENTITY() AS id`;

    const result = await request.query(query);

    const newMenuItemId = Number(result.recordset[0].id);

    return {
      MenuItemID: newMenuItemId,
      StallID: stallId,
      ItemName: menuItemData.ItemName,
      ItemDescription: menuItemData.ItemDescription || null,
      ItemPrice: menuItemData.ItemPrice,
      ItemCategory: menuItemData.ItemCategory,
      ImageURL: menuItemData.ImageURL || null,
      IsAvailable: menuItemData.IsAvailable,
      IsActive: menuItemData.IsActive,
    };
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Update menu item [PUT]
// test run: http://localhost:3000/vendor-menu/1/1
async function updateMenuItem(stallId, menuItemId, menuItemData) {
  try {
    const connection = await sql.connect(dbConfig);
    const request = connection.request();

    request.input("StallID", sql.Int, stallId);
    request.input("MenuItemID", sql.Int, menuItemId);
    request.input("ItemName", sql.VarChar(100), menuItemData.ItemName);
    request.input(
      "ItemDescription",
      sql.VarChar(500),
      menuItemData.ItemDescription || null,
    );
    request.input("ItemPrice", sql.Decimal(10, 2), menuItemData.ItemPrice);
    request.input("ItemCategory", sql.VarChar(50), menuItemData.ItemCategory);
    request.input("ImageURL", sql.VarChar(255), menuItemData.ImageURL || null);
    request.input("IsAvailable", sql.Bit, menuItemData.IsAvailable);

    const query = `
      UPDATE MenuItem
      SET
        ItemName = @ItemName,
        ItemDescription = @ItemDescription,
        ItemPrice = @ItemPrice,
        ItemCategory = @ItemCategory,
        ImageURL = @ImageURL,
        IsAvailable = @IsAvailable,
        UpdatedAt = GETDATE()
      WHERE StallID = @StallID
        AND MenuItemID = @MenuItemID`;

    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return null;
    }

    return {
      MenuItemID: menuItemId,
      StallID: stallId,
      ItemName: menuItemData.ItemName,
      ItemDescription: menuItemData.ItemDescription || null,
      ItemPrice: menuItemData.ItemPrice,
      ItemCategory: menuItemData.ItemCategory,
      ImageURL: menuItemData.ImageURL || null,
      IsAvailable: menuItemData.IsAvailable,
      IsActive: menuItemData.IsActive,
    };
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Delete menu item [DELETE] --- actually just changing the IsActive status
// test run: http://localhost:3000/vendor-menu/1/1
async function deleteMenuItem(stallId, menuItemId) {
  try {
    const connection = await sql.connect(dbConfig);

    const request = connection.request();

    request.input("StallID", sql.Int, stallId);
    request.input("MenuItemID", sql.Int, menuItemId);

    const result = await request.query(`
      UPDATE MenuItem
      SET
        IsActive = 0,
        IsAvailable = 0,
        UpdatedAt = GETDATE()
      WHERE
        StallID = @StallID
        AND MenuItemID = @MenuItemID`);

    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

module.exports = {
  getMenuItemsByStallId,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
