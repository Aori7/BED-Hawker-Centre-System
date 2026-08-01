const express = require("express");
const router = express.Router();
const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const operatorAccountController =
    require("../controllers/operatorAccountController");

// get operator profile by ID
router.get(
    "/:id",
    operatorAccountController.getOperatorProfile
);

router.put(
    "/:id",
    operatorAccountController.updateOperatorProfile
);

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("Operator"),
    operatorAccountController.getOperatorProfile
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("Operator"),
    operatorAccountController.updateOperatorProfile
);
module.exports = router;
