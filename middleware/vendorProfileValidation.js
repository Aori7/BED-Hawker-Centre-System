const Joi = require("joi");

// validate profile input
// validate password input

const profileSchema = Joi.object({
  OwnerName: Joi.string().trim().min(1).max(100).required().messages({
    "string.empty": "Owner name is required.",
    "string.max": "Owner name cannot exceed 100 characters.",
  }),

  ContactNo: Joi.string()
    .pattern(/^[89]\d{7}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Contact number must be a valid Singapore mobile number.",
      "any.required": "Contact number is required.",
    }),
});

const passwordSchema = Joi.object({
  CurrentPassword: Joi.string().required().messages({
    "any.required": "Current password is required.",
  }),

  NewPassword: Joi.string().min(8).max(100).required().messages({
    "string.min": "New password must be at least 8 characters.",
    "string.max": "New password cannot exceed 100 characters.",
    "any.required": "New password is required.",
  }),

  ConfirmPassword: Joi.any().valid(Joi.ref("NewPassword")).required().messages({
    "any.only": "Passwords do not match.",
    "any.required": "Please confirm your password.",
  }),
});

// Validate profile input
function validateProfileInput(req, res, next) {
  const { error, value } = profileSchema.validate(req.body, {
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

// Validate password input
function validatePasswordInput(req, res, next) {
  const { error, value } = passwordSchema.validate(req.body, {
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

module.exports = {
  validateProfileInput,
  validatePasswordInput,
};
