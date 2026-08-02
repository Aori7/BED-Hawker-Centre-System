// file tested: vendorOrdersModel.js
/* 
npm test -- vendorOrdersModel.test.js
*/

const vendorOrdersModel = require("../models/vendorOrdersModel");
const sql = require("mssql");

jest.mock("mssql");

describe("vendorOrdersModel.getOrdersByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve all orders and order items for a stall", async () => {
    const mockOrders = [
      {
        OrderID: 1,
        CustomerID: 1,
        CustomerName: "John Tan",
        OrderType: "Pickup",
        OrderDateTime: new Date("2026-08-01T12:00:00"),
        OrderStatus: "Pending",
        Subtotal: 6.5,
        DeliveryFee: 0,
        TotalAmount: 6.5,
        SpecialRequest: null,
        CreatedAt: new Date("2026-08-01T12:00:00"),
      },
      {
        OrderID: 2,
        CustomerID: 2,
        CustomerName: "Mary Lim",
        OrderType: "Dine-in",
        OrderDateTime: new Date("2026-08-01T13:00:00"),
        OrderStatus: "Preparing",
        Subtotal: 8,
        DeliveryFee: 0,
        TotalAmount: 8,
        SpecialRequest: "No chilli",
        CreatedAt: new Date("2026-08-01T13:00:00"),
      },
    ];

    const mockOrderOneItems = [
      {
        OrderItemID: 1,
        MenuItemID: 1,
        ItemName: "Chicken Rice",
        Quantity: 1,
        UnitPrice: 6.5,
        Subtotal: 6.5,
        SpecialRequest: null,
      },
    ];

    const mockOrderTwoItems = [
      {
        OrderItemID: 2,
        MenuItemID: 2,
        ItemName: "Laksa",
        Quantity: 1,
        UnitPrice: 8,
        Subtotal: 8,
        SpecialRequest: "No chilli",
      },
    ];

    const mockOrderRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: mockOrders,
      }),
    };

    const mockOrderOneItemRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: mockOrderOneItems,
      }),
    };

    const mockOrderTwoItemRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: mockOrderTwoItems,
      }),
    };

    const mockConnection = {
      request: jest
        .fn()
        .mockReturnValueOnce(mockOrderRequest)
        .mockReturnValueOnce(mockOrderOneItemRequest)
        .mockReturnValueOnce(mockOrderTwoItemRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const orders = await vendorOrdersModel.getOrdersByStallId(1);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));

    expect(mockOrderRequest.input).toHaveBeenCalledWith("stallId", sql.Int, 1);

    expect(mockOrderRequest.query).toHaveBeenCalledTimes(1);

    expect(mockOrderOneItemRequest.input).toHaveBeenCalledWith(
      "orderId",
      sql.Int,
      1,
    );

    expect(mockOrderTwoItemRequest.input).toHaveBeenCalledWith(
      "orderId",
      sql.Int,
      2,
    );

    expect(orders).toHaveLength(2);

    expect(orders[0].OrderID).toBe(1);
    expect(orders[0].CustomerName).toBe("John Tan");
    expect(orders[0].OrderItems).toEqual(mockOrderOneItems);

    expect(orders[1].OrderID).toBe(2);
    expect(orders[1].CustomerName).toBe("Mary Lim");
    expect(orders[1].OrderItems).toEqual(mockOrderTwoItems);
  });

  it("should return an empty array when no orders are found", async () => {
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

    const orders = await vendorOrdersModel.getOrdersByStallId(1);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));

    expect(mockRequest.input).toHaveBeenCalledWith("stallId", sql.Int, 1);

    expect(orders).toEqual([]);
  });

  it("should handle errors when retrieving orders", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(vendorOrdersModel.getOrdersByStallId(1)).rejects.toThrow(
      errorMessage,
    );
  });
});

describe("vendorOrdersModel.updateOrderStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update and return the order successfully", async () => {
    const mockUpdatedOrder = {
      OrderID: 1,
      CustomerID: 1,
      StallID: 1,
      OrderType: "Pickup",
      OrderDateTime: new Date("2026-08-01T12:00:00"),
      OrderStatus: "Preparing",
      Subtotal: 6.5,
      DeliveryFee: 0,
      TotalAmount: 6.5,
      SpecialRequest: null,
      CreatedAt: new Date("2026-08-01T12:00:00"),
    };
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [mockUpdatedOrder],
      }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const updatedOrder = await vendorOrdersModel.updateOrderStatus(
      1,
      1,
      "Preparing",
    );

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockRequest.input).toHaveBeenCalledWith("stallId", sql.Int, 1);
    expect(mockRequest.input).toHaveBeenCalledWith("orderId", sql.Int, 1);
    expect(mockRequest.input).toHaveBeenCalledWith(
      "orderStatus",
      sql.VarChar(30),
      "Preparing",
    );
    expect(mockRequest.query).toHaveBeenCalledTimes(1);
    expect(updatedOrder).toEqual(mockUpdatedOrder);
    expect(updatedOrder.OrderStatus).toBe("Preparing");
  });

  it("should return null when the order is not found", async () => {
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

    const updatedOrder = await vendorOrdersModel.updateOrderStatus(
      1,
      999,
      "Preparing",
    );
    expect(updatedOrder).toBeNull();
  });

  it("should handle errors when updating an order", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));
    await expect(
      vendorOrdersModel.updateOrderStatus(1, 1, "Preparing"),
    ).rejects.toThrow(errorMessage);
  });
});
