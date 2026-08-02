/*
npm test -- vendorDashboardModel.test.js
*/
const vendorDashboardModel = require("../models/vendorDashboardModel");
const sql = require("mssql");

jest.mock("mssql"); // Mock the mssql library

describe("vendorDashboardModel.getRevenueByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve revenue from the database", async () => {
    const mockRevenue = {
      Revenue: 500,
    };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [mockRevenue],
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const revenue = await vendorDashboardModel.getRevenueByStallId(
      1,
      "2026-07-01",
      "2026-08-01",
    );

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockRequest.input).toHaveBeenCalledWith("stallId", sql.Int, 1);
    expect(revenue.Revenue).toBe(500);
  });

  it("should handle errors when retrieving revenue", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(
      vendorDashboardModel.getRevenueByStallId(1, "2026-07-01", "2026-08-01"),
    ).rejects.toThrow(errorMessage);
  });
});

describe("vendorDashboardModel.getTotalOrdersByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve total orders from the database", async () => {
    const mockTotalOrders = {
      TotalOrders: 10,
    };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [mockTotalOrders],
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const totalOrders = await vendorDashboardModel.getTotalOrdersByStallId(
      1,
      "2026-07-01",
      "2026-08-01",
    );

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(totalOrders.TotalOrders).toBe(10);
  });

  it("should handle errors when retrieving total orders", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(
      vendorDashboardModel.getTotalOrdersByStallId(
        1,
        "2026-07-01",
        "2026-08-01",
      ),
    ).rejects.toThrow(errorMessage);
  });
});

describe("vendorDashboardModel.getTotalUnavailableItemsByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve unavailable item totals from the database", async () => {
    const mockUnavailableItems = {
      TotalUnavailableItems: 2,
      TotalMenuItems: 8,
    };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [mockUnavailableItems],
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const unavailableItems =
      await vendorDashboardModel.getTotalUnavailableItemsByStallId(1);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockRequest.input).toHaveBeenCalledWith("stallId", sql.Int, 1);
    expect(unavailableItems.TotalUnavailableItems).toBe(2);
    expect(unavailableItems.TotalMenuItems).toBe(8);
  });

  it("should return zero when there are no menu items", async () => {
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [
          {
            TotalUnavailableItems: null,
            TotalMenuItems: 0,
          },
        ],
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const unavailableItems =
      await vendorDashboardModel.getTotalUnavailableItemsByStallId(1);

    expect(unavailableItems.TotalUnavailableItems).toBe(0);
    expect(unavailableItems.TotalMenuItems).toBe(0);
  });

  it("should handle errors when retrieving unavailable item totals", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(
      vendorDashboardModel.getTotalUnavailableItemsByStallId(1),
    ).rejects.toThrow(errorMessage);
  });
});

describe("vendorDashboardModel.getTotalComplaintsByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve total complaints from the database", async () => {
    const mockTotalComplaints = {
      TotalComplaints: 3,
    };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [mockTotalComplaints],
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const totalComplaints =
      await vendorDashboardModel.getTotalComplaintsByStallId(
        1,
        "2026-07-01",
        "2026-08-01",
      );

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(totalComplaints.TotalComplaints).toBe(3);
  });

  it("should handle errors when retrieving total complaints", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(
      vendorDashboardModel.getTotalComplaintsByStallId(
        1,
        "2026-07-01",
        "2026-08-01",
      ),
    ).rejects.toThrow(errorMessage);
  });
});

describe("vendorDashboardModel.getOrdersBreakdownByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve the order breakdown from the database", async () => {
    const mockBreakdown = {
      TotalOrders: 10,
      DineIn: 3,
      Pickup: 4,
      Delivery: 3,
      CancelledOrders: 1,
    };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [mockBreakdown],
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const breakdown = await vendorDashboardModel.getOrdersBreakdownByStallId(
      1,
      "2026-07-01",
      "2026-08-01",
    );

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(breakdown.TotalOrders).toBe(10);
    expect(breakdown.DineIn).toBe(3);
    expect(breakdown.Pickup).toBe(4);
    expect(breakdown.Delivery).toBe(3);
    expect(breakdown.CancelledOrders).toBe(1);
  });

  it("should handle errors when retrieving the order breakdown", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(
      vendorDashboardModel.getOrdersBreakdownByStallId(
        1,
        "2026-07-01",
        "2026-08-01",
      ),
    ).rejects.toThrow(errorMessage);
  });
});

describe("vendorDashboardModel.getOrderTrendByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve the daily order trend from the database", async () => {
    const mockOrderTrend = [
      {
        PeriodStart: "2026-07-01",
        TotalOrders: 4,
      },
      {
        PeriodStart: "2026-07-02",
        TotalOrders: 6,
      },
    ];

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: mockOrderTrend,
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const orderTrend = await vendorDashboardModel.getOrderTrendByStallId(
      1,
      "2026-07-01",
      "2026-08-01",
      "daily",
    );

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(orderTrend).toHaveLength(2);
    expect(orderTrend[0].TotalOrders).toBe(4);
  });

  it("should retrieve the monthly order trend from the database", async () => {
    const mockOrderTrend = [
      {
        PeriodStart: "2026-07-01",
        TotalOrders: 10,
      },
    ];

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: mockOrderTrend,
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const orderTrend = await vendorDashboardModel.getOrderTrendByStallId(
      1,
      "2026-07-01",
      "2026-08-01",
      "monthly",
    );

    expect(orderTrend).toEqual(mockOrderTrend);
  });

  it("should retrieve the yearly order trend from the database", async () => {
    const mockOrderTrend = [
      {
        PeriodStart: "2026-01-01",
        TotalOrders: 20,
      },
    ];

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: mockOrderTrend,
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const orderTrend = await vendorDashboardModel.getOrderTrendByStallId(
      1,
      "2026-01-01",
      "2027-01-01",
      "yearly",
    );

    expect(orderTrend).toEqual(mockOrderTrend);
  });

  it("should handle an invalid filter type", async () => {
    const mockConnection = {};

    sql.connect.mockResolvedValue(mockConnection);

    await expect(
      vendorDashboardModel.getOrderTrendByStallId(
        1,
        "2026-07-01",
        "2026-08-01",
        "invalid",
      ),
    ).rejects.toThrow("Invalid filterType received: invalid");
  });

  it("should handle errors when retrieving the order trend", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(
      vendorDashboardModel.getOrderTrendByStallId(
        1,
        "2026-07-01",
        "2026-08-01",
        "monthly",
      ),
    ).rejects.toThrow(errorMessage);
  });
});

describe("vendorDashboardModel.getTopMenuItemsByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve the top menu items from the database", async () => {
    const mockTopMenuItems = [
      {
        ItemName: "Chicken Rice",
        ImageURL: "chicken-rice.jpg",
        TotalOrders: 20,
      },
      {
        ItemName: "Laksa",
        ImageURL: "laksa.jpg",
        TotalOrders: 15,
      },
    ];

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: mockTopMenuItems,
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const topMenuItems = await vendorDashboardModel.getTopMenuItemsByStallId(
      1,
      "2026-07-01",
      "2026-08-01",
    );

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(topMenuItems).toHaveLength(2);
    expect(topMenuItems[0].ItemName).toBe("Chicken Rice");
    expect(topMenuItems[0].TotalOrders).toBe(20);
  });

  it("should return an empty array when no top menu items are found", async () => {
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

    const topMenuItems = await vendorDashboardModel.getTopMenuItemsByStallId(
      1,
      "2026-07-01",
      "2026-08-01",
    );

    expect(topMenuItems).toEqual([]);
  });

  it("should handle errors when retrieving the top menu items", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(
      vendorDashboardModel.getTopMenuItemsByStallId(
        1,
        "2026-07-01",
        "2026-08-01",
      ),
    ).rejects.toThrow(errorMessage);
  });
});

describe("vendorDashboardModel.getUnavailableMenuItemsByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve unavailable menu items from the database", async () => {
    const mockUnavailableItems = [
      {
        MenuItemID: 1,
        ItemName: "Chicken Rice",
      },
      {
        MenuItemID: 2,
        ItemName: "Laksa",
      },
    ];

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: mockUnavailableItems,
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const unavailableItems =
      await vendorDashboardModel.getUnavailableMenuItemsByStallId(1);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(unavailableItems).toHaveLength(2);
    expect(unavailableItems[0].ItemName).toBe("Chicken Rice");
  });

  it("should return an empty array when no unavailable items are found", async () => {
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

    const unavailableItems =
      await vendorDashboardModel.getUnavailableMenuItemsByStallId(1);

    expect(unavailableItems).toEqual([]);
  });

  it("should handle errors when retrieving unavailable menu items", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(
      vendorDashboardModel.getUnavailableMenuItemsByStallId(1),
    ).rejects.toThrow(errorMessage);
  });
});

describe("vendorDashboardModel.getActivePromotionsByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve active promotions from the database", async () => {
    const mockActivePromotions = [
      {
        PromotionID: 1,
        PromotionName: "Lunch Special",
        StartDate: "2026-08-01",
        EndDate: "2026-08-31",
      },
    ];

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: mockActivePromotions,
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const activePromotions =
      await vendorDashboardModel.getActivePromotionsByStallId(1);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockRequest.input).toHaveBeenCalledWith("stallId", sql.Int, 1);
    expect(activePromotions).toHaveLength(1);
    expect(activePromotions[0].PromotionName).toBe("Lunch Special");
  });

  it("should return an empty array when no active promotions are found", async () => {
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

    const activePromotions =
      await vendorDashboardModel.getActivePromotionsByStallId(1);

    expect(activePromotions).toEqual([]);
  });

  it("should handle errors when retrieving active promotions", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(
      vendorDashboardModel.getActivePromotionsByStallId(1),
    ).rejects.toThrow(errorMessage);
  });
});
