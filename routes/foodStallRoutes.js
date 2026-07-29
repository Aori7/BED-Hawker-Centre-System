const express = require("express");
const router = express.Router();

const foodStallController =
    require("../controllers/foodStallController");

    //get all food stalls with their latest inspection details for nea search
router.get(
    "/search/nea",
    foodStallController.getFoodStallsForNEASearch
);

router.get("/hawker-centre/:hawkerCentreID",foodStallController.getStallsByHawkerCentre);
router.get("/:stallID",foodStallController.getFoodStallById);

module.exports = router;