const vendorMenuModel = require("../models/vendorMenuModel");

// Get all menu items by stall ID [GET]
// test run: http://localhost:3000/vendor-menu/1
async function getMenuItemsByStallId(req, res) {
  try {
    const menuItems = await vendorMenuModel.getMenuItemsByStallId(
      req.params.stallId,
    );

    res.status(200).json(menuItems);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to retrieve menu items.",
    });
  }
}

// Create new menu item [POST]
// test run: http://localhost:3000/vendor-menu/1
async function createMenuItem(req, res) {
  try {
    const newMenuItem = await vendorMenuModel.createMenuItem(
      req.params.stallId,
      req.body,
    );

    res.status(201).json(newMenuItem);
  } catch (error) {
    console.error("Controller error:", error);

    res.status(500).json({
      error: "Unable to create new menu item.",
    });
  }
}

// Update menu item [PUT]
// test run: http://localhost:3000/vendor-menu/1/1
async function updateMenuItem(req, res) {
  try {
    const updatedMenuItem = await vendorMenuModel.updateMenuItem(
      req.params.stallId,
      req.params.menuItemId,
      req.body,
    );

    if (!updatedMenuItem) {
      return res.status(404).json({
        error: "Menu item not found.",
      });
    }

    res.status(200).json(updatedMenuItem);
  } catch (error) {
    console.error("Controller error:", error);

    res.status(500).json({
      error: "Unable to update menu item.",
    });
  }
}

// Delete menu item [DELETE] --- actually just changing the IsActive status
// test run: http://localhost:3000/vendor-menu/1/1
async function deleteMenuItem(req, res) {
  try {
    const deleted = await vendorMenuModel.deleteMenuItem(
      req.params.stallId,
      req.params.menuItemId,
    );

    if (!deleted) {
      return res.status(404).json({
        error: "Menu item not found.",
      });
    }

    res.status(200).json({
      message: "Menu item deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to delete menu item.",
    });
  }
}

module.exports = {
  getMenuItemsByStallId,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
