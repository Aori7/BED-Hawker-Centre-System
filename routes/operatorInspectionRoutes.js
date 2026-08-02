const express = require("express");

const operatorInspectionController =
    require("../controllers/operatorInspectionController");
const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

// GET inspections by hawker centre
router.get(
    "/hawker-centre/:hawkerCentreID",
    operatorInspectionController
        .getInspectionsByHawkerCentre
);

// GET all inspections
router.get(
    "/",
    operatorInspectionController
        .getAllInspections
);

// GET inspection by ID
router.get(
    "/:id",
    operatorInspectionController
        .getInspectionById
);
router.get(
    "/",
    authenticateToken,
    authorizeRoles("Operator"),
    operatorInspectionController.getAllInspections
);

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("Operator"),
    operatorInspectionController.getInspectionById
);

router.get(
    "/hawker-centre/:hawkerCentreID",
    authenticateToken,
    authorizeRoles("Operator"),
    operatorInspectionController.getInspectionsByHawkerCentre
);
module.exports = router;