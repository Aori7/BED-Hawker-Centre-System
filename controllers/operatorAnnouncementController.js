const announcementModel = require("../models/operatorAnnouncementModel");

async function getAllAnnouncements(req, res) {
    try {
        const announcements =
            await announcementModel.getAllAnnouncements();

        res.status(200).json(announcements);
    } catch (error) {
        console.error("Error retrieving announcements:", error);

        res.status(500).json({
            message: "Unable to retrieve announcements"
        });
    }
}

async function getAnnouncementById(req, res) {
    try {
        const announcementID = parseInt(req.params.id);

        if (
            isNaN(announcementID) ||
            announcementID <= 0
        ) {
            return res.status(400).json({
                message: "Invalid announcement ID"
            });
        }

        const announcement =
            await announcementModel.getAnnouncementById(
                announcementID
            );

        if (!announcement) {
            return res.status(404).json({
                message: "Announcement not found"
            });
        }

        res.status(200).json(announcement);
    } catch (error) {
        console.error(
            "Error retrieving announcement:",
            error
        );

        res.status(500).json({
            message: "Unable to retrieve announcement"
        });
    }
}

module.exports = {
    getAllAnnouncements,
    getAnnouncementById
};