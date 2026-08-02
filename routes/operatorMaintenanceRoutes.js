const express = require("express");
const maintenanceScheduleController =
    require("../controllers/operatorMaintenanceController");
const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/",
    maintenanceScheduleController.getAllMaintenanceSchedules
);

// GET by ID
router.get(
    "/:id",
    maintenanceScheduleController
        .getMaintenanceScheduleById
);

// POST
router.post(
    "/",
    maintenanceScheduleController
        .createMaintenanceSchedule
);

// PUT
router.put(
    "/:id",
    maintenanceScheduleController
        .updateMaintenanceSchedule
);

// DELETE / cancel
router.delete(
    "/:id",
    maintenanceScheduleController
        .deleteMaintenanceSchedule
);
router.get(
    "/",
    authenticateToken,
    authorizeRoles("Operator"),
    maintenanceScheduleController.getAllMaintenanceSchedules
);

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("Operator"),
    maintenanceScheduleController.getMaintenanceScheduleById
);

router.post(
    "/",
    authenticateToken,
    authorizeRoles("Operator"),
    maintenanceScheduleController.createMaintenanceSchedule
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("Operator"),
    maintenanceScheduleController.updateMaintenanceSchedule
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("Operator"),
    maintenanceScheduleController.deleteMaintenanceSchedule
);
module.exports = router;