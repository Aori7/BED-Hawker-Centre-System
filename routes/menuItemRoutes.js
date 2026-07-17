const express = require("express");
const router = express.Router();

const menuItemController =
    require("../controllers/menuItemController");

router.get(
    "/stall/:stallID",
    menuItemController.getMenuItemsByStall
);

module.exports = router;