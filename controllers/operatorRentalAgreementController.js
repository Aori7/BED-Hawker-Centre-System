const rentalAgreementModel =
    require("../models/operatorRentalAgreementModel");

// get all rental agreements
async function getAllRentalAgreements(req, res) {
    try {
        const rentalAgreements =
            await rentalAgreementModel
                .getAllRentalAgreements();

        res.status(200).json(
            rentalAgreements
        );

    } catch (error) {
        console.error(
            "Get rental agreements error:",
            error
        );

        res.status(500).json({
            error:
                "Error retrieving rental agreements"
        });
    }
}

// get rental agreement by ID
async function getRentalAgreementById(req, res) {
    try {
        const agreementID =
            parseInt(req.params.id);

        if (
            isNaN(agreementID) ||
            agreementID <= 0
        ) {
            return res.status(400).json({
                error:
                    "Invalid rental agreement ID"
            });
        }

        const rentalAgreement =
            await rentalAgreementModel
                .getRentalAgreementById(
                    agreementID
                );

        if (!rentalAgreement) {
            return res.status(404).json({
                error:
                    "Rental agreement not found"
            });
        }

        res.status(200).json(
            rentalAgreement
        );

    } catch (error) {
        console.error(
            "Get rental agreement by ID error:",
            error
        );

        res.status(500).json({
            error:
                "Error retrieving rental agreement"
        });
    }
}

// create a new rental agreement
async function createRentalAgreement(req, res) {
    try {
        const ownerID =
            parseInt(req.body.ownerID);

        const stallID =
            parseInt(req.body.stallID);

        const operatorID =
            parseInt(req.body.operatorID);

        const startDate =
            req.body.startDate;

        const endDate =
            req.body.endDate;

        const termsAndConditions =
            req.body.termsAndConditions?.trim();

        const rentalPrice =
            parseFloat(req.body.rentalPrice);

        const agreementStatus =
            req.body.agreementStatus
                ?.trim();

        if (
            isNaN(ownerID) ||
            ownerID <= 0
        ) {
            return res.status(400).json({
                error: "Invalid owner ID"
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

        if (
            isNaN(operatorID) ||
            operatorID <= 0
        ) {
            return res.status(400).json({
                error: "Invalid operator ID"
            });
        }

        if (!startDate) {
            return res.status(400).json({
                error: "Start date is required"
            });
        }

        if (!endDate) {
            return res.status(400).json({
                error: "End date is required"
            });
        }

        const selectedStartDate =
            new Date(
                `${startDate}T00:00:00`
            );

        const selectedEndDate =
            new Date(
                `${endDate}T00:00:00`
            );

        if (
            isNaN(
                selectedStartDate.getTime()
            )
        ) {
            return res.status(400).json({
                error: "Invalid start date"
            });
        }

        if (
            isNaN(
                selectedEndDate.getTime()
            )
        ) {
            return res.status(400).json({
                error: "Invalid end date"
            });
        }

        if (
            selectedEndDate <=
            selectedStartDate
        ) {
            return res.status(400).json({
                error:
                    "End date must be after start date"
            });
        }

        if (!termsAndConditions) {
            return res.status(400).json({
                error:
                    "Terms and conditions are required"
            });
        }

        if (
            termsAndConditions.length >
            2000
        ) {
            return res.status(400).json({
                error:
                    "Terms and conditions cannot exceed 2000 characters"
            });
        }

        if (
            isNaN(rentalPrice) ||
            rentalPrice <= 0
        ) {
            return res.status(400).json({
                error:
                    "Rental price must be greater than 0"
            });
        }

        const allowedStatuses = [
            "Pending",
            "Active",
            "Expired",
            "Terminated"
        ];

        if (
            !allowedStatuses.includes(
                agreementStatus
            )
        ) {
            return res.status(400).json({
                error:
                    "Agreement status must be Pending, Active, Expired or Terminated"
            });
        }

        const newRentalAgreement =
            await rentalAgreementModel
                .createRentalAgreement({
                    ownerID,
                    stallID,
                    operatorID,
                    startDate,
                    endDate,
                    termsAndConditions,
                    rentalPrice,
                    agreementStatus
                });

        res.status(201).json({
            message:
                "Rental agreement created successfully",
            data: newRentalAgreement
        });

    } catch (error) {
        console.error(
            "Create rental agreement error:",
            error
        );

        if (
            error.number === 547 ||
            error.originalError?.info
                ?.number === 547
        ) {
            return res.status(400).json({
                error:
                    "The selected owner, stall or operator does not exist"
            });
        }

        res.status(500).json({
            error:
                "Error creating rental agreement"
        });
    }
}

// update an existing rental agreement
async function updateRentalAgreement(req, res) {
    try {
        const agreementID =
            parseInt(req.params.id);

        const ownerID =
            parseInt(req.body.ownerID);

        const stallID =
            parseInt(req.body.stallID);

        const operatorID =
            parseInt(req.body.operatorID);

        const startDate =
            req.body.startDate;

        const endDate =
            req.body.endDate;

        const termsAndConditions =
            req.body.termsAndConditions?.trim();

        const rentalPrice =
            parseFloat(req.body.rentalPrice);

        const agreementStatus =
            req.body.agreementStatus?.trim();

        if (
            isNaN(agreementID) ||
            agreementID <= 0
        ) {
            return res.status(400).json({
                error:
                    "Invalid rental agreement ID"
            });
        }

        if (
            isNaN(ownerID) ||
            ownerID <= 0
        ) {
            return res.status(400).json({
                error: "Invalid owner ID"
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

        if (
            isNaN(operatorID) ||
            operatorID <= 0
        ) {
            return res.status(400).json({
                error: "Invalid operator ID"
            });
        }

        if (!startDate || !endDate) {
            return res.status(400).json({
                error:
                    "Start date and end date are required"
            });
        }

        const selectedStartDate =
            new Date(`${startDate}T00:00:00`);

        const selectedEndDate =
            new Date(`${endDate}T00:00:00`);

        if (
            isNaN(selectedStartDate.getTime()) ||
            isNaN(selectedEndDate.getTime())
        ) {
            return res.status(400).json({
                error: "Invalid rental dates"
            });
        }

        if (
            selectedEndDate <=
            selectedStartDate
        ) {
            return res.status(400).json({
                error:
                    "End date must be after start date"
            });
        }

        if (!termsAndConditions) {
            return res.status(400).json({
                error:
                    "Terms and conditions are required"
            });
        }

        if (
            termsAndConditions.length >
            2000
        ) {
            return res.status(400).json({
                error:
                    "Terms and conditions cannot exceed 2000 characters"
            });
        }

        if (
            isNaN(rentalPrice) ||
            rentalPrice <= 0
        ) {
            return res.status(400).json({
                error:
                    "Rental price must be greater than 0"
            });
        }

        const allowedStatuses = [
            "Pending",
            "Active",
            "Expired",
            "Terminated"
        ];

        if (
            !allowedStatuses.includes(
                agreementStatus
            )
        ) {
            return res.status(400).json({
                error:
                    "Agreement status must be Pending, Active, Expired or Terminated"
            });
        }

        const updatedRentalAgreement =
            await rentalAgreementModel
                .updateRentalAgreement(
                    agreementID,
                    {
                        ownerID,
                        stallID,
                        operatorID,
                        startDate,
                        endDate,
                        termsAndConditions,
                        rentalPrice,
                        agreementStatus
                    }
                );

        if (!updatedRentalAgreement) {
            return res.status(404).json({
                error:
                    "Rental agreement not found"
            });
        }

        res.status(200).json({
            message:
                "Rental agreement updated successfully",
            data: updatedRentalAgreement
        });

    } catch (error) {
        console.error(
            "Update rental agreement error:",
            error
        );

        if (
            error.number === 547 ||
            error.originalError?.info?.number === 547
        ) {
            return res.status(400).json({
                error:
                    "The selected owner, stall or operator does not exist"
            });
        }

        res.status(500).json({
            error:
                "Error updating rental agreement"
        });
    }
}

// terminate a rental agreement
async function deleteRentalAgreement(req, res) {
    try {
        const agreementID =
            parseInt(req.params.id);

        if (
            isNaN(agreementID) ||
            agreementID <= 0
        ) {
            return res.status(400).json({
                error:
                    "Invalid rental agreement ID"
            });
        }

        const terminatedAgreement =
            await rentalAgreementModel
                .deleteRentalAgreement(
                    agreementID
                );

        if (!terminatedAgreement) {
            return res.status(404).json({
                error:
                    "Rental agreement not found"
            });
        }

        res.status(200).json({
            message:
                "Rental agreement terminated successfully",
            data: terminatedAgreement
        });

    } catch (error) {
        console.error(
            "Terminate rental agreement error:",
            error
        );

        res.status(500).json({
            error:
                "Error terminating rental agreement"
        });
    }
}

module.exports = {
    getAllRentalAgreements,
    getRentalAgreementById,
    createRentalAgreement,
    updateRentalAgreement,
    deleteRentalAgreement
}