const operatorDashboardModel =
    require("../models/operatorDashboardModel");

// get operator dashboard data
async function getDashboardData(req, res) {
    try {
        const operatorID =
            parseInt(
                req.params.operatorID
            );

        const hawkerCentreID =
            parseInt(
                req.params.hawkerCentreID
            );

        if (
            isNaN(operatorID) ||
            operatorID <= 0
        ) {
            return res.status(400).json({
                error:
                    "Invalid operator ID"
            });
        }

        if (
            isNaN(hawkerCentreID) ||
            hawkerCentreID <= 0
        ) {
            return res.status(400).json({
                error:
                    "Invalid hawker centre ID"
            });
        }

        const dashboardData =
            await operatorDashboardModel
                .getDashboardData(
                    operatorID,
                    hawkerCentreID
                );

        if (!dashboardData) {
            return res.status(404).json({
                error:
                    "Hawker centre not found or is not managed by this operator"
            });
        }

        res.status(200).json(
            dashboardData
        );

    } catch (error) {
        console.error(
            "Get operator dashboard error:",
            error
        );

        res.status(500).json({
            error:
                "Error retrieving dashboard data"
        });
    }
}

module.exports = {
    getDashboardData
};