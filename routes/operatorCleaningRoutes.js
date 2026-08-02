const express = require("express");

const cleaningScheduleController =
    require("../controllers/operatorCleaningController");
const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

// GET all
router.get(
    "/",
    cleaningScheduleController
        .getAllCleaningSchedules
);

// GET by ID
router.get(
    "/:id",
    cleaningScheduleController
        .getCleaningScheduleById
);

// POST create
router.post(
    "/",
    cleaningScheduleController
        .createCleaningSchedule
);

// PUT update
router.put(
    "/:id",
    cleaningScheduleController
        .updateCleaningSchedule
);

// DELETE / cancel
router.delete(
    "/:id",
    cleaningScheduleController
        .deleteCleaningSchedule
);
router.get(
    "/",
    authenticateToken,
    authorizeRoles("Operator"),
    cleaningScheduleController.getAllCleaningSchedules
);

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("Operator"),
    cleaningScheduleController.getCleaningScheduleById
);

router.post(
    "/",
    authenticateToken,
    authorizeRoles("Operator"),
    cleaningScheduleController.createCleaningSchedule
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("Operator"),
    cleaningScheduleController.updateCleaningSchedule
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("Operator"),
    cleaningScheduleController.deleteCleaningSchedule
);
module.exports = router;