const menuItemModel =
    require("../models/menuItemModel");

async function getMenuItemsByStall(req, res) {
    try {
        const stallID =
            parseInt(req.params.stallID);

        if (isNaN(stallID) || stallID <= 0) {
            return res.status(400).json({
                error: "Invalid stall ID"
            });
        }

        const menuItems =
            await menuItemModel.getMenuItemsByStall(
                stallID
            );

        res.status(200).json(menuItems);

    } catch (error) {
        console.error(
            "Get menu items by stall error:",
            error
        );

        res.status(500).json({
            error: "Error retrieving menu items"
        });
    }
}

module.exports = {
    getMenuItemsByStall
};