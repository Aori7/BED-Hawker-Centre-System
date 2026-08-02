const express = require("express");
const router = express.Router();

const inspectionController =
    require("../controllers/inspectionController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

// get all inspection records
router.get(
    "/",
    authenticateToken,
    authorizeRoles("NEA Officer"),
    inspectionController.getAllInspections
);

// create a completed inspection
router.post(
    "/",
    authenticateToken,
    authorizeRoles("NEA Officer"),
    inspectionController.createInspection
);

module.exports = router;