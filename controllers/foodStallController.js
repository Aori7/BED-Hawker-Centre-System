const foodStallModel =
    require("../models/foodStallModel");

// get stalls belonging to a hawker centre
async function getStallsByHawkerCentre(req, res) {
    try {
        const hawkerCentreID =
            parseInt(req.params.hawkerCentreID);

        if (
            isNaN(hawkerCentreID) ||
            hawkerCentreID <= 0
        ) {
            return res.status(400).json({
                error: "Invalid hawker centre ID"
            });
        }

        const stalls =
            await foodStallModel.getStallsByHawkerCentre(
                hawkerCentreID
            );

        res.status(200).json(stalls);

    } catch (error) {
        console.error(
            "Get stalls by hawker centre error:",
            error
        );

        res.status(500).json({
            error: "Error retrieving food stalls"
        });
    }
}


async function getFoodStallById(req, res) {
    try {
        const stallID =
            parseInt(req.params.stallID);

        if (isNaN(stallID) || stallID <= 0) {
            return res.status(400).json({
                error: "Invalid stall ID"
            });
        }

        const stall =
            await foodStallModel.getFoodStallById(
                stallID
            );

        if (!stall) {
            return res.status(404).json({
                error: "Food stall not found"
            });
        }

        res.status(200).json(stall);

    } catch (error) {
        console.error(
            "Get food stall by ID error:",
            error
        );

        res.status(500).json({
            error: "Error retrieving food stall"
        });
    }
}


module.exports = {
    getStallsByHawkerCentre,
    getFoodStallById
};