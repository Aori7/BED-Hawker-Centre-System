/*
npm test -- vendorPromotionModel.test.js
*/
const vendorPromotionModel = require("../models/vendorPromotionModel");
const sql = require("mssql");

jest.mock("mssql"); // Mock the mssql library

describe("vendorPromotionModel.getPromotionsByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve all promotions from the database", async () => {
    const mockPromotionRows = [
      {
        PromotionID: 1,
        PromotionName: "Lunch Special",
        PromotionDescription: "10% off lunch items",
        DiscountType: "Percentage",
        DiscountValue: 10,
        StartDate: "2026-08-01",
        EndDate: "2026-08-31",
        IsActive: true,
        MenuItemID: 1,
        ItemName: "Chicken Rice",
      },
      {
        PromotionID: 1,
        PromotionName: "Lunch Special",
        PromotionDescription: "10% off lunch items",
        DiscountType: "Percentage",
        DiscountValue: 10,
        StartDate: "2026-08-01",
        EndDate: "2026-08-31",
        IsActive: true,
        MenuItemID: 2,
        ItemName: "Laksa",
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
        MenuItemID: null,
        ItemName: null,
      },
    ];

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: mockPromotionRows,
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const promotions = await vendorPromotionModel.getPromotionsByStallId(1);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockRequest.input).toHaveBeenCalledWith("stallId", sql.Int, 1);
    expect(promotions).toHaveLength(2);
    expect(promotions[0].PromotionID).toBe(1);
    expect(promotions[0].PromotionName).toBe("Lunch Special");
    expect(promotions[0].AffectedMenuItems).toHaveLength(2);
    expect(promotions[0].AffectedMenuItems[0].ItemName).toBe("Chicken Rice");
    expect(promotions[0].AffectedMenuItems[1].ItemName).toBe("Laksa");
    expect(promotions[1].PromotionID).toBe(2);
    expect(promotions[1].AffectedMenuItems).toHaveLength(0);
  });

  it("should return an empty array when no promotions are found", async () => {
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

    const promotions = await vendorPromotionModel.getPromotionsByStallId(1);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(promotions).toEqual([]);
  });

  it("should handle errors when retrieving promotions", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(
      vendorPromotionModel.getPromotionsByStallId(1),
    ).rejects.toThrow(errorMessage);
  });
});

describe("vendorPromotionModel.createPromotion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a promotion in the database", async () => {
    const mockConnection = {};

    const mockTransaction = {
      begin: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      _aborted: false,
    };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest
        .fn()
        .mockResolvedValueOnce({
          recordset: [],
        })
        .mockResolvedValueOnce({
          recordset: [
            {
              id: 1,
            },
          ],
        })
        .mockResolvedValueOnce({
          rowsAffected: [1],
        }),
    };

    sql.connect.mockResolvedValue(mockConnection);
    sql.Transaction.mockImplementation(() => mockTransaction);
    sql.Request.mockImplementation(() => mockRequest);

    const promotionData = {
      PromotionName: "Lunch Special",
      PromotionDescription: "10% off lunch items",
      DiscountType: "Percentage",
      DiscountValue: 10,
      StartDate: "2026-08-01",
      EndDate: "2026-08-31",
      IsActive: true,
      MenuItemIDs: [1],
    };

    const promotion = await vendorPromotionModel.createPromotion(
      1,
      promotionData,
    );

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockTransaction.begin).toHaveBeenCalledTimes(1);
    expect(mockRequest.input).toHaveBeenCalledWith("StallID", sql.Int, 1);
    expect(mockRequest.input).toHaveBeenCalledWith(
      "PromotionName",
      sql.VarChar(100),
      "Lunch Special",
    );
    expect(mockRequest.input).toHaveBeenCalledWith(
      "DiscountType",
      sql.VarChar(20),
      "Percentage",
    );
    expect(mockRequest.input).toHaveBeenCalledWith(
      "DiscountValue",
      sql.Decimal(10, 2),
      10,
    );
    expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
    expect(promotion.PromotionID).toBe(1);
    expect(promotion.StallID).toBe(1);
    expect(promotion.PromotionName).toBe("Lunch Special");
    expect(promotion.DiscountValue).toBe(10);
  });

  it("should handle duplicate promotions", async () => {
    const mockConnection = {};

    const mockTransaction = {
      begin: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      _aborted: false,
    };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [
          {
            PromotionID: 1,
          },
        ],
      }),
    };

    sql.connect.mockResolvedValue(mockConnection);
    sql.Transaction.mockImplementation(() => mockTransaction);
    sql.Request.mockImplementation(() => mockRequest);

    const promotionData = {
      PromotionName: "Lunch Special",
      PromotionDescription: "10% off lunch items",
      DiscountType: "Percentage",
      DiscountValue: 10,
      StartDate: "2026-08-01",
      EndDate: "2026-08-31",
      IsActive: true,
      MenuItemIDs: [1],
    };

    await expect(
      vendorPromotionModel.createPromotion(1, promotionData),
    ).rejects.toThrow("An identical promotion already exists for this stall");

    expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
  });

  it("should handle errors when creating a promotion", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    const promotionData = {
      PromotionName: "Lunch Special",
      PromotionDescription: "10% off lunch items",
      DiscountType: "Percentage",
      DiscountValue: 10,
      StartDate: "2026-08-01",
      EndDate: "2026-08-31",
      IsActive: true,
      MenuItemIDs: [1],
    };

    await expect(
      vendorPromotionModel.createPromotion(1, promotionData),
    ).rejects.toThrow(errorMessage);
  });
});

describe("vendorPromotionModel.updatePromotion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a promotion in the database", async () => {
    const mockConnection = {};

    const mockTransaction = {
      begin: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      _aborted: false,
    };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest
        .fn()
        .mockResolvedValueOnce({
          recordset: [
            {
              PromotionID: 1,
            },
          ],
        })
        .mockResolvedValueOnce({
          rowsAffected: [1],
        })
        .mockResolvedValueOnce({
          rowsAffected: [1],
        })
        .mockResolvedValueOnce({
          rowsAffected: [1],
        }),
    };

    sql.connect.mockResolvedValue(mockConnection);
    sql.Transaction.mockImplementation(() => mockTransaction);
    sql.Request.mockImplementation(() => mockRequest);

    const promotionData = {
      PromotionName: "Updated Lunch Special",
      PromotionDescription: "20% off lunch items",
      DiscountType: "Percentage",
      DiscountValue: 20,
      StartDate: "2026-08-01",
      EndDate: "2026-08-31",
      IsActive: true,
      MenuItemIDs: [1],
    };

    const updatedPromotion = await vendorPromotionModel.updatePromotion(
      1,
      1,
      promotionData,
    );

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockTransaction.begin).toHaveBeenCalledTimes(1);
    expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
    expect(updatedPromotion.PromotionID).toBe(1);
    expect(updatedPromotion.StallID).toBe(1);
    expect(updatedPromotion.PromotionName).toBe("Updated Lunch Special");
    expect(updatedPromotion.DiscountValue).toBe(20);
  });

  it("should return null when the promotion is not found", async () => {
    const mockConnection = {};

    const mockTransaction = {
      begin: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      _aborted: false,
    };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [],
      }),
    };

    sql.connect.mockResolvedValue(mockConnection);
    sql.Transaction.mockImplementation(() => mockTransaction);
    sql.Request.mockImplementation(() => mockRequest);

    const promotionData = {
      PromotionName: "Updated Lunch Special",
      PromotionDescription: "20% off lunch items",
      DiscountType: "Percentage",
      DiscountValue: 20,
      StartDate: "2026-08-01",
      EndDate: "2026-08-31",
      IsActive: true,
      MenuItemIDs: [1],
    };

    const updatedPromotion = await vendorPromotionModel.updatePromotion(
      1,
      999,
      promotionData,
    );

    expect(updatedPromotion).toBeNull();
    expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
  });

  it("should handle errors when updating a promotion", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    const promotionData = {
      PromotionName: "Updated Lunch Special",
      PromotionDescription: "20% off lunch items",
      DiscountType: "Percentage",
      DiscountValue: 20,
      StartDate: "2026-08-01",
      EndDate: "2026-08-31",
      IsActive: true,
      MenuItemIDs: [1],
    };

    await expect(
      vendorPromotionModel.updatePromotion(1, 1, promotionData),
    ).rejects.toThrow(errorMessage);
  });
});

describe("vendorPromotionModel.deletePromotion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a promotion from the database", async () => {
    const mockConnection = {};

    const mockTransaction = {
      begin: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      _aborted: false,
    };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest
        .fn()
        .mockResolvedValueOnce({
          rowsAffected: [1],
        })
        .mockResolvedValueOnce({
          rowsAffected: [1],
        }),
    };

    sql.connect.mockResolvedValue(mockConnection);
    sql.Transaction.mockImplementation(() => mockTransaction);
    sql.Request.mockImplementation(() => mockRequest);

    const deleted = await vendorPromotionModel.deletePromotion(1, 1);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockRequest.input).toHaveBeenCalledWith("stallId", sql.Int, 1);
    expect(mockRequest.input).toHaveBeenCalledWith("promotionId", sql.Int, 1);
    expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
    expect(deleted).toBe(true);
  });

  it("should return false when the promotion is not found", async () => {
    const mockConnection = {};

    const mockTransaction = {
      begin: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      _aborted: false,
    };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest
        .fn()
        .mockResolvedValueOnce({
          rowsAffected: [0],
        })
        .mockResolvedValueOnce({
          rowsAffected: [0],
        }),
    };

    sql.connect.mockResolvedValue(mockConnection);
    sql.Transaction.mockImplementation(() => mockTransaction);
    sql.Request.mockImplementation(() => mockRequest);

    const deleted = await vendorPromotionModel.deletePromotion(1, 999);

    expect(deleted).toBe(false);
  });

  it("should handle errors when deleting a promotion", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(vendorPromotionModel.deletePromotion(1, 1)).rejects.toThrow(
      errorMessage,
    );
  });
});
