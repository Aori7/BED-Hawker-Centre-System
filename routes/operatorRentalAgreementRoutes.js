const express = require("express");

const router = express.Router();

const rentalAgreementController =
    require("../controllers/operatorRentalAgreementController");



// get all rental agreements
router.get(
    "/",
    rentalAgreementController.getAllRentalAgreements
);

router.get(
    "/:id", rentalAgreementController.getRentalAgreementById);

module.exports = router;

router.post(
    "/",
    rentalAgreementController.createRentalAgreement
);

router.put(
    "/:id",
    rentalAgreementController.updateRentalAgreement
);

router.delete(
    "/:id",
    rentalAgreementController.deleteRentalAgreement
);