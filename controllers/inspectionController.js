const inspectionModel =
    require("../models/inspectionModel");

// get all inspection records
async function getAllInspections(req, res) {
    try {
        const inspections =
            await inspectionModel.getAllInspections();

        res.status(200).json(inspections);

    } catch (error) {
        console.error(
            "Get inspection history error:",
            error
        );

        res.status(500).json({
            error:
                "Error retrieving inspection history"
        });
    }
}

// create a new completed inspection
async function createInspection(req, res) {
    try {
        const officerID =
            parseInt(req.body.officerID);

        const stallID =
            parseInt(req.body.stallID);

        const inspectionScore =
            parseInt(req.body.inspectionScore);

        const inspectionDate =
            req.body.inspectionDate;

        const hygieneGrade =
            req.body.hygieneGrade
                ?.trim()
                .toUpperCase();

        const remark =
            req.body.remark?.trim();

        if (
            isNaN(officerID) ||
            officerID <= 0
        ) {
            return res.status(400).json({
                error: "Invalid officer ID"
            });
        }

        if (
            isNaN(stallID) ||
            stallID <= 0
        ) {
            return res.status(400).json({
                error: "Invalid stall ID"
            });
        }

        if (!inspectionDate) {
            return res.status(400).json({
                error:
                    "Inspection date is required"
            });
        }

        const selectedDate =
            new Date(
                `${inspectionDate}T00:00:00`
            );

        if (isNaN(selectedDate.getTime())) {
            return res.status(400).json({
                error: "Invalid inspection date"
            });
        }

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        if (selectedDate > today) {
            return res.status(400).json({
                error:
                    "Inspection date cannot be in the future"
            });
        }

        if (
            isNaN(inspectionScore) ||
            inspectionScore < 0 ||
            inspectionScore > 100
        ) {
            return res.status(400).json({
                error:
                    "Inspection score must be between 0 and 100"
            });
        }

        if (
            !["A", "B", "C", "D"].includes(
                hygieneGrade
            )
        ) {
            return res.status(400).json({
                error:
                    "Hygiene grade must be A, B, C or D"
            });
        }

        if (!remark) {
            return res.status(400).json({
                error:
                    "Inspection remark is required"
            });
        }

        if (remark.length > 1000) {
            return res.status(400).json({
                error:
                    "Inspection remark cannot exceed 1000 characters"
            });
        }

        const newInspection =
            await inspectionModel.createInspection({
                officerID,
                stallID,
                inspectionDate,
                inspectionScore,
                hygieneGrade,
                remark
            });

        res.status(201).json({
            message:
                "Inspection recorded successfully",
            data: newInspection
        });

    } catch (error) {
        console.error(
            "Create inspection error:",
            error
        );

        if (
            error.number === 547 ||
            error.originalError?.info?.number === 547
        ) {
            return res.status(400).json({
                error:
                    "The selected officer or food stall does not exist"
            });
        }

        res.status(500).json({
            error:
                "Error recording inspection"
        });
    }
}

module.exports = {
    getAllInspections,
    createInspection
};