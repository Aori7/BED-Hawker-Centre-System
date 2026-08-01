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

async function createAnnouncement(req, res) {

    try {

        const {
            Title,
            Content,
            CreatedBy,
            ExpiryDate,
            Status
        } = req.body;

        if (
            !Title ||
            !Content ||
            !CreatedBy
        ) {
            return res.status(400).json({
                message: "Title, Content and CreatedBy are required."
            });
        }

        const announcement =
            await announcementModel.createAnnouncement(req.body);

        res.status(201).json({
            message: "Announcement created successfully",
            data: announcement
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to create announcement"
        });

    }

}

async function updateAnnouncement(req, res) {
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

        const {
            Title,
            Content,
            CreatedBy,
            ExpiryDate,
            Status
        } = req.body;

        if (
            !Title ||
            !Content ||
            !CreatedBy
        ) {
            return res.status(400).json({
                message:
                    "Title, Content and CreatedBy are required."
            });
        }

        const existingAnnouncement =
            await announcementModel.getAnnouncementById(
                announcementID
            );

        if (!existingAnnouncement) {
            return res.status(404).json({
                message: "Announcement not found"
            });
        }

        const updatedAnnouncement =
            await announcementModel.updateAnnouncement(
                announcementID,
                req.body
            );

        res.status(200).json({
            message: "Announcement updated successfully",
            data: updatedAnnouncement
        });
    } catch (error) {
        console.error(
            "Error updating announcement:",
            error
        );

        res.status(500).json({
            message: "Unable to update announcement"
        });
    }
}

module.exports = {
    getAllAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement
};