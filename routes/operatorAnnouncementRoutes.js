const express = require("express");
const announcementController =
    require("../controllers/operatorAnnouncementController");

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

module.exports = router;