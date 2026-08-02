const cleaningScheduleModel =
    require("../models/operatorCleaningModel");

const allowedStatuses = [
    "Scheduled",
    "In Progress",
    "Completed",
    "Cancelled"
];

// GET all cleaning schedules
async function getAllCleaningSchedules(req, res) {
    try {
        const schedules =
            await cleaningScheduleModel
                .getAllCleaningSchedules();

        res.status(200).json(schedules);
    } catch (error) {
        console.error(
            "Get cleaning schedules error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to retrieve cleaning schedules"
        });
    }
}

// GET cleaning schedule by ID
async function getCleaningScheduleById(req, res) {
    try {
        const cleaningID =
            parseInt(req.params.id);

        if (
            isNaN(cleaningID) ||
            cleaningID <= 0
        ) {
            return res.status(400).json({
                message: "Invalid cleaning ID"
            });
        }

        const schedule =
            await cleaningScheduleModel
                .getCleaningScheduleById(
                    cleaningID
                );

        if (!schedule) {
            return res.status(404).json({
                message:
                    "Cleaning schedule not found"
            });
        }

        res.status(200).json(schedule);
    } catch (error) {
        console.error(
            "Get cleaning schedule error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to retrieve cleaning schedule"
        });
    }
}

// POST create cleaning schedule
async function createCleaningSchedule(req, res) {
    try {
        const hawkerCentreID =
            parseInt(req.body.HawkerCentreID);

        const cleaningTitle =
            req.body.CleaningTitle?.trim();

        const scheduledDate =
            req.body.ScheduledDate;

        const startTime =
            req.body.StartTime;

        const endTime =
            req.body.EndTime;

        const status =
            req.body.Status || "Scheduled";

        if (
            isNaN(hawkerCentreID) ||
            hawkerCentreID <= 0
        ) {
            return res.status(400).json({
                message:
                    "Valid HawkerCentreID is required"
            });
        }

        if (!cleaningTitle) {
            return res.status(400).json({
                message:
                    "CleaningTitle is required"
            });
        }

        if (cleaningTitle.length > 100) {
            return res.status(400).json({
                message:
                    "CleaningTitle cannot exceed 100 characters"
            });
        }

        if (!scheduledDate) {
            return res.status(400).json({
                message:
                    "ScheduledDate is required"
            });
        }

        if (
            startTime &&
            endTime &&
            startTime >= endTime
        ) {
            return res.status(400).json({
                message:
                    "EndTime must be later than StartTime"
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message:
                    "Status must be Scheduled, In Progress, Completed or Cancelled"
            });
        }

        const newSchedule =
            await cleaningScheduleModel
                .createCleaningSchedule({
                    ...req.body,
                    HawkerCentreID: hawkerCentreID,
                    CleaningTitle: cleaningTitle,
                    Status: status
                });

        res.status(201).json({
            message:
                "Cleaning schedule created successfully",
            data: newSchedule
        });
    } catch (error) {
        console.error(
            "Create cleaning schedule error:",
            error
        );

        if (
            error.number === 547 ||
            error.originalError?.info?.number === 547
        ) {
            return res.status(400).json({
                message:
                    "The selected hawker centre does not exist"
            });
        }

        res.status(500).json({
            message:
                "Unable to create cleaning schedule"
        });
    }
}

// PUT update cleaning schedule
async function updateCleaningSchedule(req, res) {
    try {
        const cleaningID =
            parseInt(req.params.id);

        const hawkerCentreID =
            parseInt(req.body.HawkerCentreID);

        const cleaningTitle =
            req.body.CleaningTitle?.trim();

        const scheduledDate =
            req.body.ScheduledDate;

        const startTime =
            req.body.StartTime;

        const endTime =
            req.body.EndTime;

        const status =
            req.body.Status;

        if (
            isNaN(cleaningID) ||
            cleaningID <= 0
        ) {
            return res.status(400).json({
                message: "Invalid cleaning ID"
            });
        }

        if (
            isNaN(hawkerCentreID) ||
            hawkerCentreID <= 0
        ) {
            return res.status(400).json({
                message:
                    "Valid HawkerCentreID is required"
            });
        }

        if (
            !cleaningTitle ||
            !scheduledDate ||
            !status
        ) {
            return res.status(400).json({
                message:
                    "CleaningTitle, ScheduledDate and Status are required"
            });
        }

        if (cleaningTitle.length > 100) {
            return res.status(400).json({
                message:
                    "CleaningTitle cannot exceed 100 characters"
            });
        }

        if (
            startTime &&
            endTime &&
            startTime >= endTime
        ) {
            return res.status(400).json({
                message:
                    "EndTime must be later than StartTime"
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message:
                    "Status must be Scheduled, In Progress, Completed or Cancelled"
            });
        }

        const existingSchedule =
            await cleaningScheduleModel
                .getCleaningScheduleById(
                    cleaningID
                );

        if (!existingSchedule) {
            return res.status(404).json({
                message:
                    "Cleaning schedule not found"
            });
        }

        const updatedSchedule =
            await cleaningScheduleModel
                .updateCleaningSchedule(
                    cleaningID,
                    {
                        ...req.body,
                        HawkerCentreID:
                            hawkerCentreID,
                        CleaningTitle:
                            cleaningTitle
                    }
                );

        res.status(200).json({
            message:
                "Cleaning schedule updated successfully",
            data: updatedSchedule
        });
    } catch (error) {
        console.error(
            "Update cleaning schedule error:",
            error
        );

        if (
            error.number === 547 ||
            error.originalError?.info?.number === 547
        ) {
            return res.status(400).json({
                message:
                    "The selected hawker centre does not exist"
            });
        }

        res.status(500).json({
            message:
                "Unable to update cleaning schedule"
        });
    }
}

// DELETE / cancel cleaning schedule
async function deleteCleaningSchedule(req, res) {
    try {
        const cleaningID =
            parseInt(req.params.id);

        if (
            isNaN(cleaningID) ||
            cleaningID <= 0
        ) {
            return res.status(400).json({
                message: "Invalid cleaning ID"
            });
        }

        const existingSchedule =
            await cleaningScheduleModel
                .getCleaningScheduleById(
                    cleaningID
                );

        if (!existingSchedule) {
            return res.status(404).json({
                message:
                    "Cleaning schedule not found"
            });
        }

        const cancelledSchedule =
            await cleaningScheduleModel
                .deleteCleaningSchedule(
                    cleaningID
                );

        res.status(200).json({
            message:
                "Cleaning schedule cancelled successfully",
            data: cancelledSchedule
        });
    } catch (error) {
        console.error(
            "Cancel cleaning schedule error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to cancel cleaning schedule"
        });
    }
}

module.exports = {
    getAllCleaningSchedules,
    getCleaningScheduleById,
    createCleaningSchedule,
    updateCleaningSchedule,
    deleteCleaningSchedule
};