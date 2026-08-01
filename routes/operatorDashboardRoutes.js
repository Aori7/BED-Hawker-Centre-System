const express = require("express");

const operatorDashboardController =
    require("../controllers/operatorDashboardController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

// Protected operator dashboard route
router.get(
    "/:operatorID/hawker-centre/:hawkerCentreID",
    authenticateToken,
    authorizeRoles("Operator"),
    operatorDashboardController.getDashboardData
);

module.exports = router;