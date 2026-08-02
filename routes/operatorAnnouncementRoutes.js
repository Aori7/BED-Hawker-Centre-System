const express = require("express");
const announcementController =
    require("../controllers/operatorAnnouncementController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/",
    announcementController.getAllAnnouncements
);

router.get(
    "/:id",
    announcementController.getAnnouncementById
);

router.post(
    "/",
    announcementController.createAnnouncement
);

router.put(
    "/:id",
    announcementController.updateAnnouncement
);
router.get(
    "/",
    authenticateToken,
    authorizeRoles("Operator"),
    announcementController.getAllAnnouncements
);

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("Operator"),
    announcementController.getAnnouncementById
);

router.post(
    "/",
    authenticateToken,
    authorizeRoles("Operator"),
    announcementController.createAnnouncement
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("Operator"),
    announcementController.updateAnnouncement
);
module.exports = router;