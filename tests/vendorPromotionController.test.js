/*
npm test -- vendorPromotionController.test.js
*/
const vendorPromotionController = require("../controllers/vendorPromotionController");
const vendorPromotionModel = require("../models/vendorPromotionModel");

jest.mock("../models/vendorPromotionModel"); // Mock the vendor promotion model

describe("vendorPromotionController.getPromotionsByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve all promotions and return a JSON response", async () => {
    const mockPromotions = [
      {
        PromotionID: 1,
        PromotionName: "Lunch Special",
        PromotionDescription: "10% off lunch items",
        DiscountType: "Percentage",
        DiscountValue: 10,
        StartDate: "2026-08-01",
        EndDate: "2026-08-31",
        IsActive: true,
        AffectedMenuItems: [
          {
            MenuItemID: 1,
            ItemName: "Chicken Rice",
          },
        ],
      },
      {
        PromotionID: 2,
        PromotionName: "Five Dollar Deal",
        PromotionDescription: "Five dollars off selected items",
        DiscountType: "Fixed Amount",
        DiscountValue: 5,
        StartDate: "2026-09-01",
        EndDate: "2026-09-30",
        IsActive: true,
        AffectedMenuItems: [],
      },
    ];

    vendorPromotionModel.getPromotionsByStallId.mockResolvedValue(
      mockPromotions,
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

    await vendorPromotionController.getPromotionsByStallId(req, res);

    expect(vendorPromotionModel.getPromotionsByStallId).toHaveBeenCalledTimes(
      1,
    );
    expect(vendorPromotionModel.getPromotionsByStallId).toHaveBeenCalledWith(
      "1",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockPromotions);
  });

  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Database Error";

    vendorPromotionModel.getPromotionsByStallId.mockRejectedValue(
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

    await vendorPromotionController.getPromotionsByStallId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to retrieve promotions.",
    });
  });
});

describe("vendorPromotionController.createPromotion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a promotion and return a JSON response", async () => {
    const mockPromotion = {
      PromotionID: 1,
      StallID: "1",
      PromotionName: "Lunch Special",
      PromotionDescription: "10% off lunch items",
      DiscountType: "Percentage",
      DiscountValue: 10,
      StartDate: "2026-08-01",
      EndDate: "2026-08-31",
      IsActive: true,
    };

    vendorPromotionModel.createPromotion.mockResolvedValue(mockPromotion);

    const req = {
      params: {
        stallId: "1",
      },
      body: {
        PromotionName: "Lunch Special",
        PromotionDescription: "10% off lunch items",
        DiscountType: "Percentage",
        DiscountValue: 10,
        StartDate: "2026-08-01",
        EndDate: "2026-08-31",
        IsActive: true,
        MenuItemIDs: [1],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorPromotionController.createPromotion(req, res);

    expect(vendorPromotionModel.createPromotion).toHaveBeenCalledTimes(1);
    expect(vendorPromotionModel.createPromotion).toHaveBeenCalledWith(
      "1",
      req.body,
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockPromotion);
  });

  it("should return the error status when a duplicate promotion exists", async () => {
    const duplicateError = new Error(
      "An identical promotion already exists for this stall",
    );

    duplicateError.statusCode = 409;

    vendorPromotionModel.createPromotion.mockRejectedValue(duplicateError);

    const req = {
      params: {
        stallId: "1",
      },
      body: {
        PromotionName: "Lunch Special",
        PromotionDescription: "10% off lunch items",
        DiscountType: "Percentage",
        DiscountValue: 10,
        StartDate: "2026-08-01",
        EndDate: "2026-08-31",
        IsActive: true,
        MenuItemIDs: [1],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorPromotionController.createPromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "An identical promotion already exists for this stall",
    });
  });

  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Database Error";

    vendorPromotionModel.createPromotion.mockRejectedValue(
      new Error(errorMessage),
    );

    const req = {
      params: {
        stallId: "1",
      },
      body: {
        PromotionName: "Lunch Special",
        PromotionDescription: "10% off lunch items",
        DiscountType: "Percentage",
        DiscountValue: 10,
        StartDate: "2026-08-01",
        EndDate: "2026-08-31",
        IsActive: true,
        MenuItemIDs: [1],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorPromotionController.createPromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to create new promotion",
    });
  });
});

describe("vendorPromotionController.updatePromotion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a promotion and return a JSON response", async () => {
    const mockUpdatedPromotion = {
      PromotionID: "1",
      StallID: "1",
      PromotionName: "Updated Lunch Special",
      PromotionDescription: "20% off lunch items",
      DiscountType: "Percentage",
      DiscountValue: 20,
      StartDate: "2026-08-01",
      EndDate: "2026-08-31",
      IsActive: true,
      MenuItemIDs: [1, 2],
    };

    vendorPromotionModel.updatePromotion.mockResolvedValue(
      mockUpdatedPromotion,
    );

    const req = {
      params: {
        stallId: "1",
        promotionId: "1",
      },
      body: {
        PromotionName: "Updated Lunch Special",
        PromotionDescription: "20% off lunch items",
        DiscountType: "Percentage",
        DiscountValue: 20,
        StartDate: "2026-08-01",
        EndDate: "2026-08-31",
        IsActive: true,
        MenuItemIDs: [1, 2],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorPromotionController.updatePromotion(req, res);

    expect(vendorPromotionModel.updatePromotion).toHaveBeenCalledTimes(1);
    expect(vendorPromotionModel.updatePromotion).toHaveBeenCalledWith(
      "1",
      "1",
      req.body,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUpdatedPromotion);
  });

  it("should return a 404 status when the promotion is not found", async () => {
    vendorPromotionModel.updatePromotion.mockResolvedValue(null);

    const req = {
      params: {
        stallId: "1",
        promotionId: "999",
      },
      body: {
        PromotionName: "Updated Lunch Special",
        PromotionDescription: "20% off lunch items",
        DiscountType: "Percentage",
        DiscountValue: 20,
        StartDate: "2026-08-01",
        EndDate: "2026-08-31",
        IsActive: true,
        MenuItemIDs: [1],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorPromotionController.updatePromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Promotion not found.",
    });
  });

  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Database Error";

    vendorPromotionModel.updatePromotion.mockRejectedValue(
      new Error(errorMessage),
    );

    const req = {
      params: {
        stallId: "1",
        promotionId: "1",
      },
      body: {
        PromotionName: "Updated Lunch Special",
        PromotionDescription: "20% off lunch items",
        DiscountType: "Percentage",
        DiscountValue: 20,
        StartDate: "2026-08-01",
        EndDate: "2026-08-31",
        IsActive: true,
        MenuItemIDs: [1],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorPromotionController.updatePromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to update promotion.",
    });
  });
});

describe("vendorPromotionController.deletePromotion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a promotion and return a JSON response", async () => {
    vendorPromotionModel.deletePromotion.mockResolvedValue(true);

    const req = {
      params: {
        stallId: "1",
        promotionId: "1",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorPromotionController.deletePromotion(req, res);

    expect(vendorPromotionModel.deletePromotion).toHaveBeenCalledTimes(1);
    expect(vendorPromotionModel.deletePromotion).toHaveBeenCalledWith("1", "1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Promotion deleted successfully.",
    });
  });

  it("should return a 404 status when the promotion is not found", async () => {
    vendorPromotionModel.deletePromotion.mockResolvedValue(false);

    const req = {
      params: {
        stallId: "1",
        promotionId: "999",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorPromotionController.deletePromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Promotion not found.",
    });
  });

  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Database Error";

    vendorPromotionModel.deletePromotion.mockRejectedValue(
      new Error(errorMessage),
    );

    const req = {
      params: {
        stallId: "1",
        promotionId: "1",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorPromotionController.deletePromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to delete promotion.",
    });
  });
});
