const express = require("express");
const hawkerCentreController =
  require("../controllers/hawkerCentreController");

const router = express.Router();

router.get("/", hawkerCentreController.getAllHawkerCentres);

module.exports = router;