// hygiene grade routes done by dayana

const express = require("express");
const router = express.Router();

const hygieneGradeController =
    require("../controllers/hygieneGradeController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

// get all latest hygiene grades
router.get(
    "/",
    authenticateToken,
    authorizeRoles("NEA Officer"),
    hygieneGradeController.getHygieneGrades
);

// update a hygiene grade
router.put(
    "/:inspectionID",
    authenticateToken,
    authorizeRoles("NEA Officer"),
    hygieneGradeController.updateHygieneGrade
);

module.exports = router;