// hygiene grade routes done by dayana

const express = require("express");
const router = express.Router();

const hygieneGradeController =
    require("../controllers/hygieneGradeController");

// get all latest hygiene grades
router.get(
    "/",
    hygieneGradeController.getHygieneGrades
);

// update a hygiene grade
router.put(
    "/:inspectionID",
    hygieneGradeController.updateHygieneGrade
);

module.exports = router;