// dashboard controller done by dayana

const dashboardModel = require(
    "../models/dashboardModel"
);


// get dashboard statistics
async function getDashboardStatistics(req, res) {
    try {
        const statistics =
            await dashboardModel
                .getDashboardStatistics();

        res.json({
            totalInspections:
                statistics.TotalInspections || 0,

            compliantStalls:
                statistics.CompliantStalls || 0,

            nonCompliantStalls:
                statistics.NonCompliantStalls || 0,

            gradeAStalls:
                statistics.GradeAStalls || 0
        });

    } catch (error) {
        console.error(
            "Dashboard statistics error:",
            error
        );

        res.status(500).json({
            error:
                "Error retrieving dashboard statistics"
        });
    }
}


// get recent inspections
async function getRecentInspections(req, res) {
    try {
        const inspections =
            await dashboardModel
                .getRecentInspections();

        res.json(inspections);

    } catch (error) {
        console.error(
            "Recent inspections error:",
            error
        );

        res.status(500).json({
            error:
                "Error retrieving recent inspections"
        });
    }
}


// get today's inspection count
async function getTodayInspectionCount(req, res) {
    try {
        const result =
            await dashboardModel
                .getTodayInspectionCount();

        res.json({
            todayInspections:
                result.TodayInspections || 0
        });

    } catch (error) {
        console.error(
            "Today inspection count error:",
            error
        );

        res.status(500).json({
            error:
                "Error retrieving today's inspection count"
        });
    }
}


// update inspection status
async function updateInspectionStatus(req, res) {
    try {
        const inspectionID = Number(
            req.params.id
        );

        const {
            inspectionStatus
        } = req.body;

        const allowedStatuses = [
            "Scheduled",
            "Completed",
            "Cancelled"
        ];

        if (
            !Number.isInteger(inspectionID) ||
            inspectionID <= 0
        ) {
            return res.status(400).json({
                error:
                    "A valid inspection ID is required"
            });
        }

        if (!inspectionStatus) {
            return res.status(400).json({
                error:
                    "Inspection status is required"
            });
        }

        if (
            !allowedStatuses.includes(
                inspectionStatus
            )
        ) {
            return res.status(400).json({
                error:
                    "Inspection status must be Scheduled, Completed or Cancelled"
            });
        }

        const updatedInspection =
            await dashboardModel
                .updateInspectionStatus(
                    inspectionID,
                    inspectionStatus
                );

        if (!updatedInspection) {
            return res.status(404).json({
                error:
                    "Inspection record not found"
            });
        }

        res.status(200).json({
            message:
                "Inspection status updated successfully",

            inspection:
                updatedInspection
        });

    } catch (error) {
        console.error(
            "Update inspection status error:",
            error
        );

        res.status(500).json({
            error:
                "Error updating inspection status"
        });
    }
}


module.exports = {
    getDashboardStatistics,
    getRecentInspections,
    getTodayInspectionCount,
    updateInspectionStatus
};