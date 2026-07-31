const maintenanceScheduleModel =
    require("../models/operatorMaintenanceModel");

async function getAllMaintenanceSchedules(req, res) {

    try {

        const schedules =
            await maintenanceScheduleModel.getAllMaintenanceSchedules();

        res.status(200).json(schedules);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to retrieve maintenance schedules."
        });

    }

}

// GET by ID
async function getMaintenanceScheduleById(req, res) {
    try {
        const maintenanceID =
            parseInt(req.params.id);

        if (
            isNaN(maintenanceID) ||
            maintenanceID <= 0
        ) {
            return res.status(400).json({
                message: "Invalid maintenance ID"
            });
        }

        const schedule =
            await maintenanceScheduleModel
                .getMaintenanceScheduleById(
                    maintenanceID
                );

        if (!schedule) {
            return res.status(404).json({
                message:
                    "Maintenance schedule not found"
            });
        }

        res.status(200).json(schedule);
    } catch (error) {
        console.error(
            "Error retrieving maintenance schedule:",
            error
        );

        res.status(500).json({
            message:
                "Unable to retrieve maintenance schedule"
        });
    }
}

// POST
async function createMaintenanceSchedule(req, res) {
    try {
        const {
            HawkerCentreID,
            MaintenanceTitle,
            ScheduledDate,
            StartTime,
            EndTime
        } = req.body;

        if (
            !Number.isInteger(
                Number(HawkerCentreID)
            ) ||
            Number(HawkerCentreID) <= 0
        ) {
            return res.status(400).json({
                message:
                    "Valid HawkerCentreID is required"
            });
        }

        if (
            !MaintenanceTitle ||
            !ScheduledDate
        ) {
            return res.status(400).json({
                message:
                    "MaintenanceTitle and ScheduledDate are required"
            });
        }

        if (
            StartTime &&
            EndTime &&
            StartTime >= EndTime
        ) {
            return res.status(400).json({
                message:
                    "EndTime must be later than StartTime"
            });
        }

        const newSchedule =
            await maintenanceScheduleModel
                .createMaintenanceSchedule(
                    req.body
                );

        res.status(201).json({
            message:
                "Maintenance schedule created successfully",
            data: newSchedule
        });
    } catch (error) {
        console.error(
            "Error creating maintenance schedule:",
            error
        );

        res.status(500).json({
            message:
                "Unable to create maintenance schedule"
        });
    }
}

// PUT
async function updateMaintenanceSchedule(req, res) {
    try {
        const maintenanceID =
            parseInt(req.params.id);

        if (
            isNaN(maintenanceID) ||
            maintenanceID <= 0
        ) {
            return res.status(400).json({
                message: "Invalid maintenance ID"
            });
        }

        const {
            HawkerCentreID,
            MaintenanceTitle,
            ScheduledDate,
            StartTime,
            EndTime,
            Status
        } = req.body;

        if (
            !Number.isInteger(
                Number(HawkerCentreID)
            ) ||
            Number(HawkerCentreID) <= 0
        ) {
            return res.status(400).json({
                message:
                    "Valid HawkerCentreID is required"
            });
        }

        if (
            !MaintenanceTitle ||
            !ScheduledDate ||
            !Status
        ) {
            return res.status(400).json({
                message:
                    "MaintenanceTitle, ScheduledDate and Status are required"
            });
        }

        if (
            StartTime &&
            EndTime &&
            StartTime >= EndTime
        ) {
            return res.status(400).json({
                message:
                    "EndTime must be later than StartTime"
            });
        }

        const existingSchedule =
            await maintenanceScheduleModel
                .getMaintenanceScheduleById(
                    maintenanceID
                );

        if (!existingSchedule) {
            return res.status(404).json({
                message:
                    "Maintenance schedule not found"
            });
        }

        const updatedSchedule =
            await maintenanceScheduleModel
                .updateMaintenanceSchedule(
                    maintenanceID,
                    req.body
                );

        res.status(200).json({
            message:
                "Maintenance schedule updated successfully",
            data: updatedSchedule
        });
    } catch (error) {
        console.error(
            "Error updating maintenance schedule:",
            error
        );

        res.status(500).json({
            message:
                "Unable to update maintenance schedule"
        });
    }
}

// DELETE — soft delete
async function deleteMaintenanceSchedule(req, res) {
    try {
        const maintenanceID =
            parseInt(req.params.id);

        if (
            isNaN(maintenanceID) ||
            maintenanceID <= 0
        ) {
            return res.status(400).json({
                message: "Invalid maintenance ID"
            });
        }

        const existingSchedule =
            await maintenanceScheduleModel
                .getMaintenanceScheduleById(
                    maintenanceID
                );

        if (!existingSchedule) {
            return res.status(404).json({
                message:
                    "Maintenance schedule not found"
            });
        }

        const cancelledSchedule =
            await maintenanceScheduleModel
                .deleteMaintenanceSchedule(
                    maintenanceID
                );

        res.status(200).json({
            message:
                "Maintenance schedule cancelled successfully",
            data: cancelledSchedule
        });
    } catch (error) {
        console.error(
            "Error cancelling maintenance schedule:",
            error
        );

        res.status(500).json({
            message:
                "Unable to cancel maintenance schedule"
        });
    }
}

module.exports = {
    getAllMaintenanceSchedules,
    getMaintenanceScheduleById,
    createMaintenanceSchedule,
    updateMaintenanceSchedule,
    deleteMaintenanceSchedule
};