const Joi = require("joi");

// Validation schema for promotions
const promotionSchema = Joi.object({
  StallID: Joi.number().integer().positive().required().messages({
    "number.base": "Stall ID must be a number",
    "number.integer": "Stall ID must be an integer",
    "number.positive": "Stall ID must be a positive number",
    "any.required": "Stall ID is required",
  }),

  PromotionName: Joi.string().min(1).max(100).required().messages({
    "string.base": "Promotion name must be a string",
    "string.empty": "Promotion name cannot be empty",
    "string.min": "Promotion name must be at least 1 character long",
    "string.max": "Promotion name cannot exceed 100 characters",
    "any.required": "Promotion name is required",
  }),

  PromotionDescription: Joi.string()
    .max(500)
    .allow(null, "")
    .optional()
    .messages({
      "string.base": "Promotion description must be a string",
      "string.max":
        "Promotion description cannot exceed 500 characters",
    }),

  DiscountValue: Joi.number()
    .precision(2)
    .positive()
    .required()
    .messages({
      "number.base": "Discount value must be a number",
      "number.positive":
        "Discount value must be greater than 0",
      "any.required": "Discount value is required",
    }),

  StartDate: Joi.date().iso().required().messages({
    "date.base": "Start date must be a valid date",
    "date.format":
      "Start date must be in YYYY-MM-DD format",
    "any.required": "Start date is required",
  }),

  EndDate: Joi.date()
    .iso()
    .min(Joi.ref("StartDate"))
    .required()
    .messages({
      "date.base": "End date must be a valid date",
      "date.format":
        "End date must be in YYYY-MM-DD format",
      "date.min":
        "End date cannot be earlier than start date",
      "any.required": "End date is required",
    }),

  IsActive: Joi.boolean().optional().messages({
    "boolean.base": "Is active must be true or false",
  }),
});

// Middleware for validating promotion data
function validatePromotion(req, res, next) {
  const { error } = promotionSchema.validate(
    req.body,
    {
      abortEarly: false,
    }
  );

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");

    return res.status(400).json({
      error: errorMessage,
    });
  }

  next();
}

// Middleware for validating promotion ID
function validatePromotionId(req, res, next) {
  const promotionId = parseInt(
    req.params.promotionId,
    10
  );

  if (
    Number.isNaN(promotionId) ||
    promotionId <= 0
  ) {
    return res.status(400).json({
      error:
        "Invalid promotion ID. ID must be a positive number",
    });
  }

  next();
}

module.exports = {
  validatePromotion,
  validatePromotionId,
};