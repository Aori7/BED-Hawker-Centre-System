const operatorAccountModel =
    require("../models/operatorAccountModel");

// get operator profile by ID
async function getOperatorProfile(req, res) {
    try {
        const operatorID =
            parseInt(req.params.id);

        if (
            isNaN(operatorID) ||
            operatorID <= 0
        ) {
            return res.status(400).json({
                error:
                    "Invalid operator ID"
            });
        }

        const operator =
            await operatorAccountModel
                .getOperatorProfile(
                    operatorID
                );

        if (!operator) {
            return res.status(404).json({
                error:
                    "Operator not found"
            });
        }

        res.status(200).json(operator);

    } catch (error) {
        console.error(
            "Get operator profile error:",
            error
        );

        res.status(500).json({
            error:
                "Error retrieving operator profile"
        });
    }
}

// update operator profile
async function updateOperatorProfile(req, res) {
    try {
        const operatorID =
            parseInt(req.params.id);

        const {
            OperatorName,
            ContactPerson,
            ContactNo
        } = req.body;

        if (
            isNaN(operatorID) ||
            operatorID <= 0
        ) {
            return res.status(400).json({
                error: "Invalid operator ID"
            });
        }

        if (
            !OperatorName ||
            !ContactPerson ||
            !ContactNo
        ) {
            return res.status(400).json({
                error:
                    "Operator name, contact person and contact number are required"
            });
        }

        const updatedOperator =
            await operatorAccountModel
                .updateOperatorProfile(
                    operatorID,
                    {
                        OperatorName,
                        ContactPerson,
                        ContactNo
                    }
                );

        if (!updatedOperator) {
            return res.status(404).json({
                error: "Operator not found"
            });
        }

        res.status(200).json({
            message:
                "Operator profile updated successfully",
            data: updatedOperator
        });

    } catch (error) {
        console.error(
            "Update operator profile error:",
            error
        );

        res.status(500).json({
            error:
                "Error updating operator profile"
        });
    }
}

module.exports = {
    getOperatorProfile,
    updateOperatorProfile
};