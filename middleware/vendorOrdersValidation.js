const Joi = require("joi");
const sql = require("mssql");
const dbConfig = require("../dbConfig");

// validate order id
// validate order belongs to stall
// validate order status

const orderStatusSchema = Joi.object({
  OrderStatus: Joi.string()
    .valid(
      "Pending",
      "Preparing",
      "Ready for Collection",
      "Completed",
      "Cancelled",
    )
    .required()
    .messages({
      "any.only": "Invalid order status.",
      "any.required": "Order status is required.",
    }),
});

// Validate order status input
function validateOrderStatus(req, res, next) {
  const { error, value } = orderStatusSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      error: error.details.map((detail) => detail.message).join(", "),
    });
  }

  req.body = value;

  next();
}

// Validate order ID
function validateOrderId(req, res, next) {
  req.params.orderId = parseInt(req.params.orderId, 10);

  if (Number.isNaN(req.params.orderId) || req.params.orderId <= 0) {
    return res.status(400).json({
      error: "Valid order ID is required.",
    });
  }

  next();
}

// Validate order belongs to stall
async function validateOrderBelongsToStall(req, res, next) {
  try {
    const connection = await sql.connect(dbConfig);

    const result = await connection
      .request()
      .input("stallId", sql.Int, req.params.stallId)
      .input("orderId", sql.Int, req.params.orderId).query(`
        SELECT OrderID
        FROM Orders
        WHERE StallID = @stallId
          AND OrderID = @orderId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        error: "Order not found for this stall.",
      });
    }

    next();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to validate order.",
    });
  }
}

module.exports = {
  validateOrderStatus,
  validateOrderId,
  validateOrderBelongsToStall,
};
