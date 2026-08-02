// ada
const request = require("supertest");

jest.mock("../middleware/authMiddleware", () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = {
      userID: 1,
      role: "Customer",
    };

    next();
  }),

  authorizeRoles: jest.fn(() => {
    return (req, res, next) => next();
  }),
}));

/*
  Mock the model so the unit tests do not use the real database.
*/
jest.mock("../models/orderModel", () => ({
  createOrder: jest.fn(),
  getRecentOrdersByCustomer: jest.fn(),
  getAllOrdersByCustomer: jest.fn(),
  getReceiptByOrderID: jest.fn(),
}));

const app = require("../app");

const orderModel =
  require("../models/orderModel");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

describe("Orders REST API", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    /*
      Restore successful authentication before every test.
    */
    authenticateToken.mockImplementation(
      (req, res, next) => {
        req.user = {
          userID: 1,
          role: "Customer",
        };

        next();
      }
    );
  });

  /*
    CREATE
    Tests successful order creation.
  */
  test("POST /orders creates a valid order", async () => {
    orderModel.createOrder.mockResolvedValue({
      orderID: 101,
      totalAmount: 15.5,
    });

    const response = await request(app)
      .post("/orders")
      .send({
        customerID: 1,
        stallID: 1,
        orderType: "Delivery",
        paymentMethod: "PayNow",
        specialRequest: "Less spicy",
        items: [
          {
            menuItemID: 1,
            quantity: 2,
          },
        ],
      });

    expect(response.statusCode).toBe(201);

    expect(
      orderModel.createOrder
    ).toHaveBeenCalledTimes(1);

    expect(
      orderModel.createOrder
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        customerID: 1,
        stallID: 1,
        orderType: "Delivery",
        paymentMethod: "PayNow",
      })
    );
  });

  /*
    VALIDATION
    Tests that an order cannot be created without items.
  */
  test("POST /orders rejects an empty order", async () => {
    const response = await request(app)
      .post("/orders")
      .send({
        customerID: 1,
        stallID: 1,
        orderType: "Pickup",
        paymentMethod: "Cash",
        items: [],
      });

    expect(response.statusCode).toBe(400);

    expect(response.body).toHaveProperty(
      "error"
    );

    expect(
      orderModel.createOrder
    ).not.toHaveBeenCalled();
  });

  /*
    VALIDATION
    Tests an invalid order type.
  */
  test("POST /orders rejects an invalid order type", async () => {
    const response = await request(app)
      .post("/orders")
      .send({
        customerID: 1,
        stallID: 1,
        orderType: "Teleport",
        paymentMethod: "PayNow",
        items: [
          {
            menuItemID: 1,
            quantity: 1,
          },
        ],
      });

    expect(response.statusCode).toBe(400);

    expect(response.body).toHaveProperty(
      "error"
    );

    expect(
      orderModel.createOrder
    ).not.toHaveBeenCalled();
  });

  /*
    SECURITY
    Tests that the route rejects a missing or invalid token.
  */
  test("POST /orders rejects an unauthenticated request", async () => {
    authenticateToken.mockImplementationOnce(
      (req, res) => {
        return res.status(401).json({
          error: "Access token required",
        });
      }
    );

    const response = await request(app)
      .post("/orders")
      .send({
        customerID: 1,
        stallID: 1,
        orderType: "Pickup",
        paymentMethod: "Cash",
        items: [
          {
            menuItemID: 1,
            quantity: 1,
          },
        ],
      });

    expect(response.statusCode).toBe(401);

    expect(response.body.error).toBe(
      "Access token required"
    );

    expect(
      orderModel.createOrder
    ).not.toHaveBeenCalled();
  });

  /*
    RETRIEVE
    Tests the five most recent customer orders.
  */
  test("GET /orders/customer/:customerID/recent returns recent orders", async () => {
    orderModel
      .getRecentOrdersByCustomer
      .mockResolvedValue([
        {
          OrderID: 46,
          OrderStatus: "Pending",
          TotalAmount: 7.5,
        },
        {
          OrderID: 45,
          OrderStatus: "Preparing",
          TotalAmount: 5,
        },
      ]);

    const response = await request(app)
      .get("/orders/customer/1/recent");

    expect(response.statusCode).toBe(200);

    expect(Array.isArray(response.body))
      .toBe(true);

    expect(response.body).toHaveLength(2);

    expect(
      orderModel.getRecentOrdersByCustomer
    ).toHaveBeenCalledWith(1);
  });

  /*
    RETRIEVE
    Tests the complete order history.
  */
  test("GET /orders/customer/:customerID returns all customer orders", async () => {
    orderModel
      .getAllOrdersByCustomer
      .mockResolvedValue([
        {
          OrderID: 46,
          OrderStatus: "Pending",
        },
        {
          OrderID: 45,
          OrderStatus: "Preparing",
        },
        {
          OrderID: 44,
          OrderStatus: "Completed",
        },
      ]);

    const response = await request(app)
      .get("/orders/customer/1");

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveLength(3);

    expect(
      orderModel.getAllOrdersByCustomer
    ).toHaveBeenCalledWith(1);
  });

  /*
    VALIDATION
    Tests an invalid customer ID.
  */
  test("GET order history rejects an invalid customer ID", async () => {
    const response = await request(app)
      .get("/orders/customer/abc");

    expect(response.statusCode).toBe(400);

    expect(response.body).toHaveProperty(
      "error"
    );

    expect(
      orderModel.getAllOrdersByCustomer
    ).not.toHaveBeenCalled();
  });

  /*
    RETRIEVE
    Tests retrieval of one receipt.
  */
  test("GET receipt returns the customer's order receipt", async () => {
    orderModel
      .getReceiptByOrderID
      .mockResolvedValue({
        OrderID: 46,
        StallName: "Nasi Lemak Corner",
        TotalAmount: 7.5,
        PaymentMethod: "PayNow",
        PaymentStatus: "Paid",
        Items: [
          {
            ItemName: "Classic Nasi Lemak",
            Quantity: 1,
            UnitPrice: 7.5,
            Subtotal: 7.5,
          },
        ],
      });

    const response = await request(app)
      .get(
        "/orders/customer/1/46/receipt"
      );

    expect(response.statusCode).toBe(200);

    expect(response.body.OrderID).toBe(46);

    expect(response.body.Items).toHaveLength(
      1
    );

    expect(
      orderModel.getReceiptByOrderID
    ).toHaveBeenCalledWith(46, 1);
  });

  /*
    ERROR HANDLING
    Tests a receipt that does not exist or does not belong
    to the customer.
  */
  test("GET receipt returns 404 when receipt is not found", async () => {
    orderModel
      .getReceiptByOrderID
      .mockResolvedValue(null);

    const response = await request(app)
      .get(
        "/orders/customer/1/999/receipt"
      );

    expect(response.statusCode).toBe(404);

    expect(response.body).toHaveProperty(
      "error"
    );
  });

  /*
    ERROR HANDLING
    Tests that a backend/database failure returns a controlled
    error instead of crashing the application.
  */
  test("POST /orders returns 500 when order creation fails", async () => {
    orderModel.createOrder.mockRejectedValue(
      new Error("Database connection failed")
    );

    const response = await request(app)
      .post("/orders")
      .send({
        customerID: 1,
        stallID: 1,
        orderType: "Dine-in",
        paymentMethod: "Cash",
        items: [
          {
            menuItemID: 1,
            quantity: 1,
          },
        ],
      });

    expect(response.statusCode).toBe(500);

    expect(response.body).toHaveProperty(
      "error"
    );
  });
});