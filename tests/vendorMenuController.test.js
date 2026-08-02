/*
npm test -- vendorMenuController.test.js
*/
const vendorMenuController = require("../controllers/vendorMenuController");
const vendorMenuModel = require("../models/vendorMenuModel");

jest.mock("../models/vendorMenuModel"); // Mock the vendor menu model

describe("vendorMenuController.getMenuItemsByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve all menu items and return a JSON response", async () => {
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

    vendorMenuModel.getMenuItemsByStallId.mockResolvedValue(mockMenuItems);

    const req = {
      params: {
        stallId: "1",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorMenuController.getMenuItemsByStallId(req, res);

    expect(vendorMenuModel.getMenuItemsByStallId).toHaveBeenCalledTimes(1);
    expect(vendorMenuModel.getMenuItemsByStallId).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockMenuItems);
  });

  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Database Error";

    vendorMenuModel.getMenuItemsByStallId.mockRejectedValue(
      new Error(errorMessage),
    );

    const req = {
      params: {
        stallId: "1",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorMenuController.getMenuItemsByStallId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to retrieve menu items.",
    });
  });
});

describe("vendorMenuController.createMenuItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a menu item and return a JSON response", async () => {
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

    vendorMenuModel.createMenuItem.mockResolvedValue(mockMenuItem);

    const req = {
      params: {
        stallId: "1",
      },
      body: {
        ItemName: "Chicken Rice",
        ItemDescription: "Steamed chicken with rice",
        ItemPrice: 6.5,
        ItemCategory: "Main",
        ImageURL: "chicken-rice.jpg",
        IsAvailable: true,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorMenuController.createMenuItem(req, res);

    expect(vendorMenuModel.createMenuItem).toHaveBeenCalledTimes(1);
    expect(vendorMenuModel.createMenuItem).toHaveBeenCalledWith(
      "1",
      req.body,
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockMenuItem);
  });

  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Database Error";

    vendorMenuModel.createMenuItem.mockRejectedValue(
      new Error(errorMessage),
    );

    const req = {
      params: {
        stallId: "1",
      },
      body: {
        ItemName: "Chicken Rice",
        ItemDescription: "Steamed chicken with rice",
        ItemPrice: 6.5,
        ItemCategory: "Main",
        ImageURL: "chicken-rice.jpg",
        IsAvailable: true,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorMenuController.createMenuItem(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to create new menu item.",
    });
  });
});

describe("vendorMenuController.updateMenuItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a menu item and return a JSON response", async () => {
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

    vendorMenuModel.updateMenuItem.mockResolvedValue(mockUpdatedMenuItem);

    const req = {
      params: {
        stallId: "1",
        menuItemId: "1",
      },
      body: {
        ItemName: "Roasted Chicken Rice",
        ItemDescription: "Roasted chicken with rice",
        ItemPrice: 7,
        ItemCategory: "Main",
        ImageURL: "roasted-chicken-rice.jpg",
        IsAvailable: true,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorMenuController.updateMenuItem(req, res);

    expect(vendorMenuModel.updateMenuItem).toHaveBeenCalledTimes(1);
    expect(vendorMenuModel.updateMenuItem).toHaveBeenCalledWith(
      "1",
      "1",
      req.body,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUpdatedMenuItem);
  });

  it("should return a 404 status when the menu item is not found", async () => {
    vendorMenuModel.updateMenuItem.mockResolvedValue(null);

    const req = {
      params: {
        stallId: "1",
        menuItemId: "999",
      },
      body: {
        ItemName: "Roasted Chicken Rice",
        ItemDescription: "Roasted chicken with rice",
        ItemPrice: 7,
        ItemCategory: "Main",
        ImageURL: "roasted-chicken-rice.jpg",
        IsAvailable: true,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorMenuController.updateMenuItem(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Menu item not found.",
    });
  });

  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Database Error";

    vendorMenuModel.updateMenuItem.mockRejectedValue(
      new Error(errorMessage),
    );

    const req = {
      params: {
        stallId: "1",
        menuItemId: "1",
      },
      body: {
        ItemName: "Roasted Chicken Rice",
        ItemDescription: "Roasted chicken with rice",
        ItemPrice: 7,
        ItemCategory: "Main",
        ImageURL: "roasted-chicken-rice.jpg",
        IsAvailable: true,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorMenuController.updateMenuItem(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to update menu item.",
    });
  });
});

describe("vendorMenuController.deleteMenuItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a menu item and return a JSON response", async () => {
    vendorMenuModel.deleteMenuItem.mockResolvedValue(true);

    const req = {
      params: {
        stallId: "1",
        menuItemId: "1",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorMenuController.deleteMenuItem(req, res);

    expect(vendorMenuModel.deleteMenuItem).toHaveBeenCalledTimes(1);
    expect(vendorMenuModel.deleteMenuItem).toHaveBeenCalledWith("1", "1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Menu item deleted successfully.",
    });
  });

  it("should return a 404 status when the menu item is not found", async () => {
    vendorMenuModel.deleteMenuItem.mockResolvedValue(false);

    const req = {
      params: {
        stallId: "1",
        menuItemId: "999",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorMenuController.deleteMenuItem(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Menu item not found.",
    });
  });

  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Database Error";

    vendorMenuModel.deleteMenuItem.mockRejectedValue(
      new Error(errorMessage),
    );

    const req = {
      params: {
        stallId: "1",
        menuItemId: "1",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorMenuController.deleteMenuItem(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to delete menu item.",
    });
  });
});