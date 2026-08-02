const express = require("express");
const vendorMenuController = require("../controllers/vendorMenuController");
const vendorMenuValidation = require("../middleware/vendorMenuValidation");
// auth vendor - user and stall
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const { validateVendorStall } = require("../middleware/vendorValidation");

const router = express.Router();

// Get all menu items by stall ID [GET]
// test run: http://localhost:3000/vendor-menu/1
router.get(
  "/:stallId",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorMenuController.getMenuItemsByStallId,
);

// Create new menu item [POST]
// test run: http://localhost:3000/vendor-menu/1
// {
//   "ItemName":"Chicken Rice",
//   "ItemDescription":"Roasted chicken served with fragrant rice.",
//   "ItemPrice":5.50,
//   "ItemCategory":"Main",
//   "ImageURL":".img",
//   "IsAvailable":true
// }
router.post(
  "/:stallId",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorMenuValidation.validateMenuItemInput,
  vendorMenuValidation.validateDuplicateMenuItem,
  vendorMenuController.createMenuItem,
);

// Update menu item [PUT]
// test run: http://localhost:3000/vendor-menu/1/1
router.put(
  "/:stallId/:menuItemId",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorMenuValidation.validateMenuItemId,
  vendorMenuValidation.validateMenuBelongsToStall,
  vendorMenuValidation.validateMenuItemInput,
  vendorMenuValidation.validateDuplicateMenuItem,
  vendorMenuController.updateMenuItem,
);

// Delete menu item [DELETE] --- actually just changing the IsActive status
// test run: http://localhost:3000/vendor-menu/1/1
router.delete(
  "/:stallId/:menuItemId",
  authenticateToken,
  authorizeRoles("Stall Owner"),
  validateVendorStall,
  vendorMenuValidation.validateMenuItemId,
  vendorMenuValidation.validateMenuBelongsToStall,
  vendorMenuController.deleteMenuItem,
);

module.exports = router;