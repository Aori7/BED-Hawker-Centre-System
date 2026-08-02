/*
npm test -- vendorMenuModel.test.js
 */
// vendorMenuModel.test.js
const vendorMenuModel = require("../models/vendorMenuModel");
const sql = require("mssql");

jest.mock("mssql"); // Mock the mssql library

describe("vendorMenuModel.getMenuItemsByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve all menu items from the database", async () => {
    const mockMenuItems = [
      {
        MenuItemID: 1,
        StallID: 1,
        ItemName: "Chicken Rice",
        ItemDescription: "Steamed chicken with rice",
        ItemPrice: 6.5,
        ItemCategory: "Main",
        ImageURL: "chicken-rice.jpg",
        IsAvailable: true,
        IsActive: true,
        PromotionID: null,
        PromotionName: null,
      },
      {
        MenuItemID: 2,
        StallID: 1,
        ItemName: "Laksa",
        ItemDescription: "Spicy noodle soup",
        ItemPrice: 8,
        ItemCategory: "Main",
        ImageURL: "laksa.jpg",
        IsAvailable: true,
        IsActive: true,
        PromotionID: 1,
        PromotionName: "Lunch Special",
      },
    ];

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: mockMenuItems,
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const menuItems = await vendorMenuModel.getMenuItemsByStallId(1);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockRequest.input).toHaveBeenCalledWith("stallId", sql.Int, 1);
    expect(menuItems).toHaveLength(2);
    expect(menuItems[0].MenuItemID).toBe(1);
    expect(menuItems[0].ItemName).toBe("Chicken Rice");
    expect(menuItems[0].ItemPrice).toBe(6.5);
    expect(menuItems[0].IsAvailable).toBe(true);
    expect(menuItems[1].MenuItemID).toBe(2);
    expect(menuItems[1].ItemName).toBe("Laksa");
    expect(menuItems[1].PromotionName).toBe("Lunch Special");
  });

  it("should return an empty array when no menu items are found", async () => {
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [],
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const menuItems = await vendorMenuModel.getMenuItemsByStallId(1);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(menuItems).toEqual([]);
  });

  it("should handle errors when retrieving menu items", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(vendorMenuModel.getMenuItemsByStallId(1)).rejects.toThrow(
      errorMessage,
    );
  });
});

describe("vendorMenuModel.createMenuItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a menu item in the database", async () => {
    const mockMenuItem = {
      MenuItemID: 1,
      StallID: 1,
      ItemName: "Chicken Rice",
      ItemDescription: "Steamed chicken with rice",
      ItemPrice: 6.5,
      ItemCategory: "Main",
      PromotionID: null,
      ImageURL: "chicken-rice.jpg",
      IsAvailable: true,
      IsActive: true,
    };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [mockMenuItem],
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const menuItemData = {
      ItemName: "Chicken Rice",
      ItemDescription: "Steamed chicken with rice",
      ItemPrice: 6.5,
      ItemCategory: "Main",
      ImageURL: "chicken-rice.jpg",
      IsAvailable: true,
    };

    const menuItem = await vendorMenuModel.createMenuItem(1, menuItemData);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockRequest.input).toHaveBeenCalledWith("StallID", sql.Int, 1);
    expect(mockRequest.input).toHaveBeenCalledWith(
      "ItemName",
      sql.VarChar(100),
      "Chicken Rice",
    );
    expect(mockRequest.input).toHaveBeenCalledWith(
      "ItemDescription",
      sql.VarChar(500),
      "Steamed chicken with rice",
    );
    expect(mockRequest.input).toHaveBeenCalledWith(
      "ItemPrice",
      sql.Decimal(8, 2),
      6.5,
    );
    expect(mockRequest.input).toHaveBeenCalledWith(
      "ItemCategory",
      sql.VarChar(50),
      "Main",
    );
    expect(mockRequest.input).toHaveBeenCalledWith(
      "ImageURL",
      sql.VarChar(255),
      "chicken-rice.jpg",
    );
    expect(mockRequest.input).toHaveBeenCalledWith(
      "IsAvailable",
      sql.Bit,
      true,
    );
    expect(menuItem).toEqual(mockMenuItem);
  });

  it("should handle errors when creating a menu item", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    const menuItemData = {
      ItemName: "Chicken Rice",
      ItemDescription: "Steamed chicken with rice",
      ItemPrice: 6.5,
      ItemCategory: "Main",
      ImageURL: "chicken-rice.jpg",
      IsAvailable: true,
    };

    await expect(
      vendorMenuModel.createMenuItem(1, menuItemData),
    ).rejects.toThrow(errorMessage);
  });
});

describe("vendorMenuModel.updateMenuItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a menu item in the database", async () => {
    const mockUpdatedMenuItem = {
      MenuItemID: 1,
      StallID: 1,
      ItemName: "Roasted Chicken Rice",
      ItemDescription: "Roasted chicken with rice",
      ItemPrice: 7,
      ItemCategory: "Main",
      PromotionID: null,
      ImageURL: "roasted-chicken-rice.jpg",
      IsAvailable: true,
      IsActive: true,
    };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [mockUpdatedMenuItem],
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const menuItemData = {
      ItemName: "Roasted Chicken Rice",
      ItemDescription: "Roasted chicken with rice",
      ItemPrice: 7,
      ItemCategory: "Main",
      ImageURL: "roasted-chicken-rice.jpg",
      IsAvailable: true,
    };

    const updatedMenuItem = await vendorMenuModel.updateMenuItem(
      1,
      1,
      menuItemData,
    );

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockRequest.input).toHaveBeenCalledWith("StallID", sql.Int, 1);
    expect(mockRequest.input).toHaveBeenCalledWith("MenuItemID", sql.Int, 1);
    expect(mockRequest.input).toHaveBeenCalledWith(
      "ItemName",
      sql.VarChar(100),
      "Roasted Chicken Rice",
    );
    expect(mockRequest.input).toHaveBeenCalledWith(
      "ItemPrice",
      sql.Decimal(8, 2),
      7,
    );
    expect(updatedMenuItem).toEqual(mockUpdatedMenuItem);
  });

  it("should return null when the menu item is not found", async () => {
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [],
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const menuItemData = {
      ItemName: "Roasted Chicken Rice",
      ItemDescription: "Roasted chicken with rice",
      ItemPrice: 7,
      ItemCategory: "Main",
      ImageURL: "roasted-chicken-rice.jpg",
      IsAvailable: true,
    };

    const updatedMenuItem = await vendorMenuModel.updateMenuItem(
      1,
      999,
      menuItemData,
    );

    expect(updatedMenuItem).toBeNull();
  });

  it("should handle errors when updating a menu item", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    const menuItemData = {
      ItemName: "Roasted Chicken Rice",
      ItemDescription: "Roasted chicken with rice",
      ItemPrice: 7,
      ItemCategory: "Main",
      ImageURL: "roasted-chicken-rice.jpg",
      IsAvailable: true,
    };

    await expect(
      vendorMenuModel.updateMenuItem(1, 1, menuItemData),
    ).rejects.toThrow(errorMessage);
  });
});

describe("vendorMenuModel.deleteMenuItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a menu item from the database", async () => {
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        rowsAffected: [1],
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const deleted = await vendorMenuModel.deleteMenuItem(1, 1);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockRequest.input).toHaveBeenCalledWith("StallID", sql.Int, 1);
    expect(mockRequest.input).toHaveBeenCalledWith("MenuItemID", sql.Int, 1);
    expect(deleted).toBe(true);
  });

  it("should return false when the menu item is not found", async () => {
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        rowsAffected: [0],
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const deleted = await vendorMenuModel.deleteMenuItem(1, 999);

    expect(deleted).toBe(false);
  });

  it("should handle errors when deleting a menu item", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(vendorMenuModel.deleteMenuItem(1, 1)).rejects.toThrow(
      errorMessage,
    );
  });
});
