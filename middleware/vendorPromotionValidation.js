const Joi = require("joi");
const sql = require("mssql");
const dbConfig = require("../dbConfig");

// validate if promo data inputted by user
// validate promoID 
// validate menu item selected selected as affected

// Validation schema for promotion data
const promotionSchema = Joi.object({
  PromotionName: Joi.string().trim().min(1).max(100).required().messages({
    "string.base": "Promotion name must be a string",
    "string.empty": "Promotion name cannot be empty",
    "string.min": "Promotion name must be at least 1 character long",
    "string.max": "Promotion name cannot exceed 100 characters",
    "any.required": "Promotion name is required",
  }),

  PromotionDescription: Joi.string()
    .trim()
    .max(500)
    .allow("", null)
    .optional()
    .messages({
      "string.base": "Promotion description must be a string",
      "string.max": "Promotion description cannot exceed 500 characters",
    }),

  DiscountType: Joi.string()
    .valid("Percentage", "Fixed Amount", "Free Item")
    .required()
    .messages({
      "any.only": "Discount type must be Percentage, Fixed Amount or Free Item",
      "any.required": "Discount type is required",
    }),

  DiscountValue: Joi.number().precision(2).positive().required().messages({
    "number.base": "Discount value must be a number",
    "number.positive": "Discount value must be greater than 0",
    "any.required": "Discount value is required",
  }),

  StartDate: Joi.date().iso().required().messages({
    "date.base": "Start date must be a valid date",
    "any.required": "Start date is required",
  }),

  EndDate: Joi.date().iso().min(Joi.ref("StartDate")).required().messages({
    "date.base": "End date must be a valid date",
    "date.min": "End date cannot be earlier than start date",
    "any.required": "End date is required",
  }),

  IsActive: Joi.boolean().default(true).messages({
    "boolean.base": "IsActive must be true or false",
  }),

  MenuItemIDs: Joi.array()
    .items(Joi.number().integer().positive())
    .unique()
    .default([])
    .messages({
      "array.base": "Menu items must be an array",
      "array.unique": "Duplicate menu items are not allowed",
      "number.base": "Menu item ID must be a number",
      "number.integer": "Menu item ID must be an integer",
      "number.positive": "Menu item ID must be greater than 0",
    }),
});

// Validate promotion input
function validatePromotionInput(req, res, next) {
  const { error, value } = promotionSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      error: error.details.map((detail) => detail.message).join(", "),
    });
  }

  req.body = value;

  // Validate percentage discount
  if (req.body.DiscountType === "Percentage" && req.body.DiscountValue > 100) {
    return res.status(400).json({
      error: "Percentage discount cannot exceed 100%.",
    });
  }

  // Validate active promotion period
  if (req.body.IsActive) {
    const today = new Date();
    const startDate = new Date(req.body.StartDate);
    const endDate = new Date(req.body.EndDate);

    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (today < startDate || today > endDate) {
      return res.status(400).json({
        error: "Only promotions within the promotion period can be activated.",
      });
    }
  }
  next();
}

// Validate promotion ID
function validatePromotionId(req, res, next) {
  req.params.promotionId = parseInt(req.params.promotionId, 10);

  if (Number.isNaN(req.params.promotionId) || req.params.promotionId <= 0) {
    return res.status(400).json({
      error: "Valid promotion ID is required.",
    });
  }
  next();
}

// Validate menu items
async function validateAffectedMenuItems(req, res, next) {
  try {
    const menuItemIds = req.body.MenuItemIDs || [];

    if (menuItemIds.length === 0) {
      return next();
    }

    const connection = await sql.connect(dbConfig);

    const request = connection.request();

    request.input("stallId", sql.Int, req.params.stallId);
    request.input("promotionId", sql.Int, req.params.promotionId || null);

    // Create SQL parameters for each menu item ID
    const parameterNames = menuItemIds.map((id, index) => {
      const parameterName = `menuItemId${index}`;

      request.input(parameterName, sql.Int, id);

      return `@${parameterName}`;
    });

    const query = `
      SELECT MenuItemID
      FROM MenuItem
      WHERE StallID = @stallId
        AND (
          PromotionID IS NULL
          OR PromotionID = @promotionId
        )
        AND MenuItemID IN (${parameterNames.join(",")})`;

    const result = await request.query(query);

    if (result.recordset.length !== menuItemIds.length) {
      return res.status(400).json({
        error:
          "One or more selected menu items are invalid or already belong to another promotion.",
      });
    }
    next();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to validate menu items.",
    });
  }
}

module.exports = {
  validatePromotionInput,
  validatePromotionId,
  validateAffectedMenuItems,
};
