function validateCreateOrder(req, res, next) {
    const {
        customerID,
        stallID,
        orderType,
        paymentMethod,
        items
    } = req.body;

    if (!customerID || customerID <= 0) {
        return res.status(400).json({
            error: "Valid customer ID is required."
        });
    }

    if (!stallID || stallID <= 0) {
        return res.status(400).json({
            error: "Valid stall ID is required."
        });
    }

    const orderTypes = ["Dine-in", "Pickup", "Delivery"];

    if (!orderTypes.includes(orderType)) {
        return res.status(400).json({
            error: "Invalid order type."
        });
    }

    const paymentMethods = [
        "PayNow",
        "Credit Card",
        "Cash"
    ];

    if (!paymentMethods.includes(paymentMethod)) {
        return res.status(400).json({
            error: "Invalid payment method."
        });
    }

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            error: "Order must contain at least one item."
        });
    }

    next();
}

module.exports = {
    validateCreateOrder
};