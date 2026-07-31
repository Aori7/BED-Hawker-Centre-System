const express = require("express");
const router = express.Router();

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

module.exports = router;
