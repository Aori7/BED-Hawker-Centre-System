const stallDetailsModel =
    require("../models/stallDetailsModel");

// get one food stall's details
async function getStallDetails(req, res) {
    try {
        const stallID = Number(
            req.params.stallID
        );

        if (
            !Number.isInteger(stallID) ||
            stallID <= 0
        ) {
            return res.status(400).json({
                error:
                    "Invalid food stall ID"
            });
        }

        const stallDetails =
            await stallDetailsModel
                .getStallDetails(stallID);

        if (!stallDetails) {
            return res.status(404).json({
                error:
                    "Food stall not found"
            });
        }

        res.status(200).json(
            stallDetails
        );

    } catch (error) {
        console.error(
            "Get stall details error:",
            error
        );

        res.status(500).json({
            error:
                "Error retrieving food stall details"
        });
    }
}

// get one food stall's inspection history
async function getStallInspectionHistory(
    req,
    res
) {
    try {
        const stallID = Number(
            req.params.stallID
        );

        if (
            !Number.isInteger(stallID) ||
            stallID <= 0
        ) {
            return res.status(400).json({
                error:
                    "Invalid food stall ID"
            });
        }

        const inspectionHistory =
            await stallDetailsModel
                .getStallInspectionHistory(
                    stallID
                );

        res.status(200).json(
            inspectionHistory
        );

    } catch (error) {
        console.error(
            "Get stall inspection history error:",
            error
        );

        res.status(500).json({
            error:
                "Error retrieving stall inspection history"
        });
    }
}

module.exports = {
    getStallDetails,
    getStallInspectionHistory
};