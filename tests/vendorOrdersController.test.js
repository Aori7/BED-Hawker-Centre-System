/*
npm test -- vendorOrdersController.test.js
 */

const vendorOrdersController = require("../controllers/vendorOrdersController");
const vendorOrdersModel = require("../models/vendorOrdersModel");

jest.mock("../models/vendorOrdersModel");

describe("vendorOrdersController.getOrdersByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve all orders and return a JSON response", async () => {
    const mockOrders = [
      {
        OrderID: 1,
        CustomerID: 1,
        CustomerName: "John Tan",
        OrderType: "Pickup",
        OrderStatus: "Pending",
        TotalAmount: 6.5,
      },
      {
        OrderID: 2,
        CustomerID: 2,
        CustomerName: "Mary Lim",
        OrderType: "Dine-in",
        OrderStatus: "Preparing",
        TotalAmount: 8,
      },
    ];

    vendorOrdersModel.getOrdersByStallId.mockResolvedValue(mockOrders);

    const req = {
      params: {
        stallId: "1",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorOrdersController.getOrdersByStallId(req, res);

    expect(vendorOrdersModel.getOrdersByStallId).toHaveBeenCalledTimes(1);
    expect(vendorOrdersModel.getOrdersByStallId).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockOrders);
  });

  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Database Error";

    vendorOrdersModel.getOrdersByStallId.mockRejectedValue(
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

    await vendorOrdersController.getOrdersByStallId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to retrieve orders.",
    });
  });
});

describe("vendorOrdersController.updateOrderStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update the order status and return a JSON response", async () => {
    const mockUpdatedOrder = {
      OrderID: 1,
      StallID: 1,
      OrderStatus: "Preparing",
    };

    vendorOrdersModel.updateOrderStatus.mockResolvedValue(mockUpdatedOrder);

    const req = {
      params: {
        stallId: "1",
        orderId: "1",
      },
      body: {
        OrderStatus: "Preparing",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorOrdersController.updateOrderStatus(req, res);

    expect(vendorOrdersModel.updateOrderStatus).toHaveBeenCalledTimes(1);
    expect(vendorOrdersModel.updateOrderStatus).toHaveBeenCalledWith(
      1,
      1,
      "Preparing",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUpdatedOrder);
  });

  it("should return a 404 status when the order is not found", async () => {
    vendorOrdersModel.updateOrderStatus.mockResolvedValue(null);

    const req = {
      params: {
        stallId: "1",
        orderId: "999",
      },
      body: {
        OrderStatus: "Preparing",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorOrdersController.updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Order not found.",
    });
  });

  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Database Error";

    vendorOrdersModel.updateOrderStatus.mockRejectedValue(
      new Error(errorMessage),
    );

    const req = {
      params: {
        stallId: "1",
        orderId: "1",
      },
      body: {
        OrderStatus: "Preparing",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorOrdersController.updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to update order status.",
    });
  });
});
