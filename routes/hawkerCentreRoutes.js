const express = require("express");
const hawkerCentreController = require("../controllers/hawkerCentreController");

const router = express.Router();

router.get("/", hawkerCentreController.getAllHawkerCentres);
router.get("/available", hawkerCentreController.getAvailableHawkerCentres);
router.get("/:id", hawkerCentreController.getHawkerCentreById);

module.exports = router;