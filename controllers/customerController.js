// customer controller done by ada

const bcrypt = require("bcrypt");
const customerModel = require('../models/customerModel');

// Get all customers
async function getAllCustomers(req, res) {
  try {
    const customers = await customerModel.getAllCustomers();
    res.json(customers);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving customers" });
  }
}

//register customer
async function registerCustomer(req, res) {
    try {
        const { email, name, password } = req.body;

        // check whether all required values were sent
        if (!email || !name || !password) {
            return res.status(400).json({
                error: "Name, email and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                error: "Password must be at least 8 characters"
            });
        }

        // turn the original password into a password hash
        const passwordHash = await bcrypt.hash(password, 10);

        const customer = await customerModel.createCustomer(
            email,
            passwordHash,
            name
        );

        res.status(201).json({
            message: "Customer registered successfully",
            customer: customer
        });

    } catch (error) {
        console.error("Customer registration error:", error);

        // SQL Server duplicate/unique constraint errors
        if (error.number === 2601 || error.number === 2627) {
            return res.status(409).json({
                error: "An account with this email already exists"
            });
        }

        res.status(500).json({
            error: "Error registering customer"
        });
    }
}

module.exports = {
    getAllCustomers,
    registerCustomer
};  