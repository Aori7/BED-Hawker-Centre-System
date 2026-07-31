const express = require("express");
const announcementController =
    require("../controllers/operatorAnnouncementController");

const router = express.Router();

router.get(
    "/",
    announcementController.getAllAnnouncements
);

module.exports = router;