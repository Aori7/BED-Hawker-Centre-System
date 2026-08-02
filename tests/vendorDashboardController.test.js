/*
npm test -- vendorDashboardController.test.js
*/
const vendorDashboardController = require("../controllers/vendorDashboardController");
const vendorDashboardModel = require("../models/vendorDashboardModel");

jest.mock("../models/vendorDashboardModel"); // Mock the vendor dashboard model

describe("vendorDashboardController.getRevenueByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve revenue and return a JSON response", async () => {
    const mockRevenue = {
      Revenue: 500,
    };

    vendorDashboardModel.getRevenueByStallId.mockResolvedValue(mockRevenue);

    const req = {
      params: {
        stallId: "1",
      },
      query: {
        startDate: "2026-07-01",
        endDate: "2026-08-01",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorDashboardController.getRevenueByStallId(req, res);

    expect(vendorDashboardModel.getRevenueByStallId).toHaveBeenCalledTimes(1);
    expect(vendorDashboardModel.getRevenueByStallId).toHaveBeenCalledWith(
      "1",
      "2026-07-01",
      "2026-08-01",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockRevenue);
  });

  it("should handle errors when retrieving revenue", async () => {
    const errorMessage = "Database Error";

    vendorDashboardModel.getRevenueByStallId.mockRejectedValue(
      new Error(errorMessage),
    );

    const req = {
      params: {
        stallId: "1",
      },
      query: {
        startDate: "2026-07-01",
        endDate: "2026-08-01",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorDashboardController.getRevenueByStallId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to retrieve revenue.",
    });
  });
});

describe("vendorDashboardController.getTotalOrdersByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve total orders and return a JSON response", async () => {
    const mockTotalOrders = {
      TotalOrders: 10,
    };

    vendorDashboardModel.getTotalOrdersByStallId.mockResolvedValue(
      mockTotalOrders,
    );

    const req = {
      params: {
        stallId: "1",
      },
      query: {
        startDate: "2026-07-01",
        endDate: "2026-08-01",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorDashboardController.getTotalOrdersByStallId(req, res);

    expect(vendorDashboardModel.getTotalOrdersByStallId).toHaveBeenCalledWith(
      "1",
      "2026-07-01",
      "2026-08-01",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockTotalOrders);
  });

  it("should handle errors when retrieving total orders", async () => {
    vendorDashboardModel.getTotalOrdersByStallId.mockRejectedValue(
      new Error("Database Error"),
    );

    const req = {
      params: {
        stallId: "1",
      },
      query: {
        startDate: "2026-07-01",
        endDate: "2026-08-01",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorDashboardController.getTotalOrdersByStallId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to retrieve total orders.",
    });
  });
});

describe("vendorDashboardController.getTotalUnavailableItemsByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve unavailable item totals and return a JSON response", async () => {
    const mockUnavailableItems = {
      TotalUnavailableItems: 2,
      TotalMenuItems: 8,
    };

    vendorDashboardModel.getTotalUnavailableItemsByStallId.mockResolvedValue(
      mockUnavailableItems,
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

    await vendorDashboardController.getTotalUnavailableItemsByStallId(req, res);

    expect(
      vendorDashboardModel.getTotalUnavailableItemsByStallId,
    ).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUnavailableItems);
  });

  it("should handle errors when retrieving unavailable item totals", async () => {
    vendorDashboardModel.getTotalUnavailableItemsByStallId.mockRejectedValue(
      new Error("Database Error"),
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

    await vendorDashboardController.getTotalUnavailableItemsByStallId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to retrieve total unavailable items.",
    });
  });
});

describe("vendorDashboardController.getTotalComplaintsByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve total complaints and return a JSON response", async () => {
    const mockTotalComplaints = {
      TotalComplaints: 3,
    };

    vendorDashboardModel.getTotalComplaintsByStallId.mockResolvedValue(
      mockTotalComplaints,
    );

    const req = {
      params: {
        stallId: "1",
      },
      query: {
        startDate: "2026-07-01",
        endDate: "2026-08-01",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorDashboardController.getTotalComplaintsByStallId(req, res);

    expect(
      vendorDashboardModel.getTotalComplaintsByStallId,
    ).toHaveBeenCalledWith("1", "2026-07-01", "2026-08-01");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockTotalComplaints);
  });

  it("should handle errors when retrieving total complaints", async () => {
    vendorDashboardModel.getTotalComplaintsByStallId.mockRejectedValue(
      new Error("Database Error"),
    );

    const req = {
      params: {
        stallId: "1",
      },
      query: {
        startDate: "2026-07-01",
        endDate: "2026-08-01",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorDashboardController.getTotalComplaintsByStallId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to retrieve total complaints.",
    });
  });
});

describe("vendorDashboardController.getOrdersBreakdownByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve the order breakdown and return a JSON response", async () => {
    const mockBreakdown = {
      TotalOrders: 10,
      DineIn: 3,
      Pickup: 4,
      Delivery: 3,
      CancelledOrders: 1,
    };

    vendorDashboardModel.getOrdersBreakdownByStallId.mockResolvedValue(
      mockBreakdown,
    );

    const req = {
      params: {
        stallId: "1",
      },
      query: {
        startDate: "2026-07-01",
        endDate: "2026-08-01",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorDashboardController.getOrdersBreakdownByStallId(req, res);

    expect(
      vendorDashboardModel.getOrdersBreakdownByStallId,
    ).toHaveBeenCalledWith("1", "2026-07-01", "2026-08-01");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockBreakdown);
  });

  it("should handle errors when retrieving the order breakdown", async () => {
    vendorDashboardModel.getOrdersBreakdownByStallId.mockRejectedValue(
      new Error("Database Error"),
    );

    const req = {
      params: {
        stallId: "1",
      },
      query: {
        startDate: "2026-07-01",
        endDate: "2026-08-01",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorDashboardController.getOrdersBreakdownByStallId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to retrieve breakdown of orders.",
    });
  });
});

describe("vendorDashboardController.getOrderTrendByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve the order trend and return a JSON response", async () => {
    const mockOrderTrend = [
      {
        PeriodStart: "2026-07-01",
        TotalOrders: 4,
      },
      {
        PeriodStart: "2026-07-08",
        TotalOrders: 6,
      },
    ];

    vendorDashboardModel.getOrderTrendByStallId.mockResolvedValue(
      mockOrderTrend,
    );

    const req = {
      params: {
        stallId: "1",
      },
      query: {
        startDate: "2026-07-01",
        endDate: "2026-08-01",
        filterType: "monthly",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorDashboardController.getOrderTrendByStallId(req, res);

    expect(vendorDashboardModel.getOrderTrendByStallId).toHaveBeenCalledWith(
      "1",
      "2026-07-01",
      "2026-08-01",
      "monthly",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      filterType: "monthly",
      startDate: "2026-07-01",
      endDate: "2026-08-01",
      orderTrend: mockOrderTrend,
    });
  });

  it("should handle errors when retrieving the order trend", async () => {
    vendorDashboardModel.getOrderTrendByStallId.mockRejectedValue(
      new Error("Database Error"),
    );

    const req = {
      params: {
        stallId: "1",
      },
      query: {
        startDate: "2026-07-01",
        endDate: "2026-08-01",
        filterType: "monthly",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorDashboardController.getOrderTrendByStallId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to retrieve order trend.",
    });
  });
});

describe("vendorDashboardController.getTopMenuItemsByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve the top menu items and return a JSON response", async () => {
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

    vendorDashboardModel.getTopMenuItemsByStallId.mockResolvedValue(
      mockTopMenuItems,
    );

    const req = {
      params: {
        stallId: "1",
      },
      query: {
        startDate: "2026-07-01",
        endDate: "2026-08-01",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorDashboardController.getTopMenuItemsByStallId(req, res);

    expect(vendorDashboardModel.getTopMenuItemsByStallId).toHaveBeenCalledWith(
      "1",
      "2026-07-01",
      "2026-08-01",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockTopMenuItems);
  });

  it("should handle errors when retrieving the top menu items", async () => {
    vendorDashboardModel.getTopMenuItemsByStallId.mockRejectedValue(
      new Error("Database Error"),
    );

    const req = {
      params: {
        stallId: "1",
      },
      query: {
        startDate: "2026-07-01",
        endDate: "2026-08-01",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorDashboardController.getTopMenuItemsByStallId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to retrieve top menu items.",
    });
  });
});

describe("vendorDashboardController.getUnavailableMenuItemsByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve unavailable menu items and return a JSON response", async () => {
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

    vendorDashboardModel.getUnavailableMenuItemsByStallId.mockResolvedValue(
      mockUnavailableItems,
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

    await vendorDashboardController.getUnavailableMenuItemsByStallId(req, res);

    expect(
      vendorDashboardModel.getUnavailableMenuItemsByStallId,
    ).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUnavailableItems);
  });

  it("should handle errors when retrieving unavailable menu items", async () => {
    vendorDashboardModel.getUnavailableMenuItemsByStallId.mockRejectedValue(
      new Error("Database Error"),
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

    await vendorDashboardController.getUnavailableMenuItemsByStallId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to retrieve unavailable menu items.",
    });
  });
});

describe("vendorDashboardController.getActivePromotionsByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve active promotions and return a JSON response", async () => {
    const mockActivePromotions = [
      {
        PromotionID: 1,
        PromotionName: "Lunch Special",
        StartDate: "2026-08-01",
        EndDate: "2026-08-31",
      },
    ];

    vendorDashboardModel.getActivePromotionsByStallId.mockResolvedValue(
      mockActivePromotions,
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

    await vendorDashboardController.getActivePromotionsByStallId(req, res);

    expect(
      vendorDashboardModel.getActivePromotionsByStallId,
    ).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockActivePromotions);
  });

  it("should handle errors when retrieving active promotions", async () => {
    vendorDashboardModel.getActivePromotionsByStallId.mockRejectedValue(
      new Error("Database Error"),
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

    await vendorDashboardController.getActivePromotionsByStallId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to retrieve active promotions.",
    });
  });
});
