const express = require("express");

const rentalAgreementController =
    require("../controllers/operatorRentalAgreementController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

// GET all rental agreements
router.get(
    "/",
    authenticateToken,
    authorizeRoles("Operator"),
    rentalAgreementController.getAllRentalAgreements
);

// GET rental agreement by ID
router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("Operator"),
    rentalAgreementController.getRentalAgreementById
);

// POST create rental agreement
router.post(
    "/",
    authenticateToken,
    authorizeRoles("Operator"),
    rentalAgreementController.createRentalAgreement
);

// PUT update rental agreement
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("Operator"),
    rentalAgreementController.updateRentalAgreement
);

// DELETE / terminate rental agreement
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("Operator"),
    rentalAgreementController.deleteRentalAgreement
);

module.exports = router;