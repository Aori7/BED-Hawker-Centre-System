const Joi = require("joi");
const sql = require("mssql");
const dbConfig = require("../dbConfig");

// validate menu item data inputted by user during put and post
// validate menu item id
// validate menu item belongs to stall
// validate duplicate menu item

// Validation schema for menu item
const menuItemSchema = Joi.object({
  ItemName: Joi.string().trim().min(1).max(100).required().messages({
    "string.base": "Item name must be a string",
    "string.empty": "Item name cannot be empty",
    "string.min": "Item name must be at least 1 character long",
    "string.max": "Item name cannot exceed 100 characters",
    "any.required": "Item name is required",
  }),

  ItemDescription: Joi.string()
    .trim()
    .max(500)
    .allow("", null)
    .optional()
    .messages({
      "string.base": "Item description must be a string",
      "string.max": "Item description cannot exceed 500 characters",
    }),

  ItemPrice: Joi.number()
    .positive()
    .max(999999.99)
    .precision(2)
    .required()
    .messages({
      "number.base": "Item price must be a number",
      "number.positive": "Item price must be greater than 0",
      "number.max": "Item price cannot exceed 999999.99",
      "any.required": "Item price is required",
    }),

  ItemCategory: Joi.string().trim().min(1).max(50).required().messages({
    "string.base": "Item category must be a string",
    "string.empty": "Item category cannot be empty",
    "string.max": "Item category cannot exceed 50 characters",
    "any.required": "Item category is required",
  }),

  ImageURL: Joi.string().trim().max(255).allow("", null).optional().messages({
    "string.base": "Image URL must be a string",
    "string.max": "Image URL cannot exceed 255 characters",
  }),

  IsAvailable: Joi.boolean().default(true).messages({
    "boolean.base": "IsAvailable must be true or false",
  }),
});

// Validate menu item input
function validateMenuItemInput(req, res, next) {
  const { error, value } = menuItemSchema.validate(req.body, {
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

// Validate menu item ID
function validateMenuItemId(req, res, next) {
  req.params.menuItemId = parseInt(req.params.menuItemId, 10);

  if (Number.isNaN(req.params.menuItemId) || req.params.menuItemId <= 0) {
    return res.status(400).json({
      error: "Valid menu item ID is required.",
    });
  }
  next();
}

// Validate menu item belongs to stall
async function validateMenuBelongsToStall(req, res, next) {
  try {
    const connection = await sql.connect(dbConfig);

    const request = connection.request();

    request.input("stallId", sql.Int, req.params.stallId);
    request.input("menuItemId", sql.Int, req.params.menuItemId);

    const result = await request.query(`
      SELECT MenuItemID
      FROM MenuItem
      WHERE StallID = @stallId
        AND MenuItemID = @menuItemId`);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        error: "Menu item not found for this stall.",
      });
    }
    next();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to validate menu item.",
    });
  }
}

// Validate duplicate menu item
async function validateDuplicateMenuItem(req, res, next) {
  try {
    const connection = await sql.connect(dbConfig);

    const request = connection.request();

    request.input("stallId", sql.Int, req.params.stallId);
    request.input("itemName", sql.VarChar(100), req.body.ItemName);

    let query = `
        SELECT MenuItemID
        FROM MenuItem
        WHERE StallID = @stallId
            AND LOWER(ItemName) = LOWER(@itemName)`;

    // Ignore current menu item when updating
    if (req.params.menuItemId) {
      request.input("menuItemId", sql.Int, req.params.menuItemId);

      query += `
        AND MenuItemID <> @menuItemId`;
    }

    const result = await request.query(query);

    if (result.recordset.length > 0) {
      return res.status(409).json({
        error: "A menu item with the same name already exists.",
      });
    }

    next();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to validate duplicate menu item.",
    });
  }
}

module.exports = {
  validateMenuItemInput,
  validateMenuItemId,
  validateMenuBelongsToStall,
  validateDuplicateMenuItem,
};
