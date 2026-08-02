// Validate stall ID
function validateStallId(req, res, next) {
  const stallId = parseInt(req.params.stallId, 10);

  if (Number.isNaN(stallId) || stallId <= 0) {
    return res.status(400).json({
      error: "Valid stall ID is required.",
    });
  }

  req.params.stallId = stallId;
  next();
}

// Validate date range
function validateDateRange(req, res, next) {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      error: "Start date and end date are required.",
    });
  }

  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);

  if (
    Number.isNaN(parsedStartDate.getTime()) ||
    Number.isNaN(parsedEndDate.getTime())
  ) {
    return res.status(400).json({
      error: "Start date and end date must be valid dates.",
    });
  }

  if (parsedStartDate >= parsedEndDate) {
    return res.status(400).json({
      error: "End date must be later than start date.",
    });
  }
  next();
}

// Validate order trend filter
function validateOrderTrendFilter(req, res, next) {
  const allowedFilterTypes = ["daily", "weekly", "monthly", "yearly"];
  const filterType = req.query.filterType?.trim().toLowerCase();

  if (!allowedFilterTypes.includes(filterType)) {
    return res.status(400).json({
      error: "Filter type must be daily, weekly, monthly or yearly.",
    });
  }

  req.query.filterType = filterType;
  next();
}

module.exports = {
  validateStallId,
  validateDateRange,
  validateOrderTrendFilter,
};
