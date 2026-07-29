// hygiene grade controller done by dayana

const hygieneGradeModel =
    require("../models/hygieneGradeModel");

// get all latest hygiene grades
async function getHygieneGrades(req, res) {
    try {
        const hygieneGrades =
            await hygieneGradeModel
                .getHygieneGrades();

        res.status(200).json(
            hygieneGrades
        );

    } catch (error) {
        console.error(
            "Get hygiene grades error:",
            error
        );

        res.status(500).json({
            error:
                "Error retrieving hygiene grades"
        });
    }
}

// update an existing hygiene grade
async function updateHygieneGrade(req, res) {
    try {
        const inspectionID =
            parseInt(
                req.params.inspectionID
            );

        const hygieneGrade =
            req.body.hygieneGrade
                ?.trim()
                .toUpperCase();

        const remark =
            req.body.remark?.trim();

        if (
            isNaN(inspectionID) ||
            inspectionID <= 0
        ) {
            return res.status(400).json({
                error:
                    "Invalid inspection ID"
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
                    "Update remarks are required"
            });
        }

        if (remark.length > 1000) {
            return res.status(400).json({
                error:
                    "Update remarks cannot exceed 1000 characters"
            });
        }

        const updatedGrade =
            await hygieneGradeModel
                .updateHygieneGrade(
                    inspectionID,
                    {
                        hygieneGrade,
                        remark
                    }
                );

        if (!updatedGrade) {
            return res.status(404).json({
                error:
                    "Inspection record not found"
            });
        }

        res.status(200).json({
            message:
                "Hygiene grade updated successfully",
            data: updatedGrade
        });

    } catch (error) {
        console.error(
            "Update hygiene grade error:",
            error
        );

        res.status(500).json({
            error:
                "Error updating hygiene grade"
        });
    }
}

module.exports = {
    getHygieneGrades,
    updateHygieneGrade
}