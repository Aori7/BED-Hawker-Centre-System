const express = require("express");
const router = express.Router();

const foodStallController =
    require("../controllers/foodStallController");

router.get("/hawker-centre/:hawkerCentreID",foodStallController.getStallsByHawkerCentre);
router.get("/:stallID",foodStallController.getFoodStallById);

module.exports = router;