const express = require("express");
const maintenanceScheduleController =
    require("../controllers/operatorMaintenanceController");

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

module.exports = router;