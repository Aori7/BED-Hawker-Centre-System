const operatorInspectionModel =
    require("../models/operatorInspectionModel");

// GET all inspections
async function getAllInspections(req, res) {
    try {
        const inspections =
            await operatorInspectionModel
                .getAllInspections();

        res.status(200).json(inspections);

    } catch (error) {
        console.error(
            "Get operator inspections error:",
            error
        );

        res.status(500).json({
            error:
                "Error retrieving inspection records"
        });
    }
}

// GET inspection by ID
async function getInspectionById(req, res) {
    try {
        const inspectionID =
            parseInt(req.params.id);

        if (
            isNaN(inspectionID) ||
            inspectionID <= 0
        ) {
            return res.status(400).json({
                error: "Invalid inspection ID"
            });
        }

        const inspection =
            await operatorInspectionModel
                .getInspectionById(
                    inspectionID
                );

        if (!inspection) {
            return res.status(404).json({
                error:
                    "Inspection record not found"
            });
        }

        res.status(200).json(inspection);

    } catch (error) {
        console.error(
            "Get inspection by ID error:",
            error
        );

        res.status(500).json({
            error:
                "Error retrieving inspection record"
        });
    }
}

// GET inspections by hawker centre
async function getInspectionsByHawkerCentre(
    req,
    res
) {
    try {
        const hawkerCentreID =
            parseInt(
                req.params.hawkerCentreID
            );

        if (
            isNaN(hawkerCentreID) ||
            hawkerCentreID <= 0
        ) {
            return res.status(400).json({
                error:
                    "Invalid hawker centre ID"
            });
        }

        const inspections =
            await operatorInspectionModel
                .getInspectionsByHawkerCentre(
                    hawkerCentreID
                );

        res.status(200).json(inspections);

    } catch (error) {
        console.error(
            "Get inspections by hawker centre error:",
            error
        );

        res.status(500).json({
            error:
                "Error retrieving inspections for hawker centre"
        });
    }
}

module.exports = {
    getAllInspections,
    getInspectionById,
    getInspectionsByHawkerCentre
};