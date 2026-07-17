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

module.exports = {
    getStallsByHawkerCentre
};