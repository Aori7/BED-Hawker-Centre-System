const orderModel = require("../models/orderModel");

async function createOrder(req, res) {
    try {
        const {
            customerID,
            stallID,
            orderType,
            paymentMethod,
            specialRequest,
            items
        } = req.body;

        if (
            !customerID ||
            !stallID ||
            !orderType ||
            !paymentMethod
        ) {
            return res.status(400).json({
                error:
                    "Customer ID, stall ID, order type and payment method are required"
            });
        }

        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return res.status(400).json({
                error:
                    "At least one order item is required"
            });
        }

        const allowedOrderTypes = [
            "Dine-in",
            "Pickup",
            "Delivery"
        ];

        if (!allowedOrderTypes.includes(orderType)) {
            return res.status(400).json({
                error: "Invalid order type"
            });
        }

        const allowedPaymentMethods = [
            "PayNow",
            "Credit Card",
            "Cash"
        ];

        if (
            !allowedPaymentMethods.includes(
                paymentMethod
            )
        ) {
            return res.status(400).json({
                error: "Invalid payment method"
            });
        }

        for (const item of items) {
            if (
                !item.menuItemID ||
                !item.quantity ||
                parseInt(item.quantity) <= 0
            ) {
                return res.status(400).json({
                    error:
                        "Every item must have a valid menu item ID and quantity"
                });
            }
        }

        const result =
            await orderModel.createOrder({
                customerID:
                    parseInt(customerID),

                stallID:
                    parseInt(stallID),

                orderType,

                paymentMethod,

                specialRequest:
                    specialRequest || null,

                items
            });

        res.status(201).json({
            message:
                "Order created successfully",

            orderID:
                result.orderID,

            subtotal:
                result.subtotal,

            deliveryFee:
                result.deliveryFee,

            totalAmount:
                result.totalAmount,

            paymentStatus:
                result.paymentStatus
        });
    } catch (error) {
        console.error(
            "Create order controller error:",
            error
        );

        res.status(500).json({
            error:
                error.message ||
                "Error creating order"
        });
    }
}

module.exports = {
    createOrder
};