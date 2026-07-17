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


async function loginCustomer(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        const customer = await customerModel.getCustomerByEmail(email);

        if (!customer) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            customer.PasswordHash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                userID: customer.UserID,
                customerID: customer.CustomerID,
                customerName: customer.CustomerName,
                email: customer.Email,
                role: customer.RoleName
            }
        });

    } catch (error) {
        console.error("Customer login error:", error);

        res.status(500).json({
            error: "Error logging in"
        });
    }
}

// get one customer's profile
async function getCustomerProfile(req, res) {
    try {
        const customerID = parseInt(req.params.id);

        if (isNaN(customerID) || customerID <= 0) {
            return res.status(400).json({
                error: "Invalid customer ID"
            });
        }

        const customer =
            await customerModel.getCustomerProfileById(customerID);

        if (!customer) {
            return res.status(404).json({
                error: "Customer not found"
            });
        }

        res.status(200).json(customer);

    } catch (error) {
        console.error("Get customer profile error:", error);

        res.status(500).json({
            error: "Error retrieving customer profile"
        });
    }
}

// update customer profile details
async function updateCustomerProfile(req, res) {
    try {
        const customerID = parseInt(req.params.id);

        const {
            customerName,
            email,
            contactNo,
            address
        } = req.body;

        if (isNaN(customerID) || customerID <= 0) {
            return res.status(400).json({
                error: "Invalid customer ID"
            });
        }

        if (!customerName || !email) {
            return res.status(400).json({
                error: "Name and email are required"
            });
        }

        const trimmedName = customerName.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedContactNo = contactNo
            ? contactNo.trim()
            : null;
        const trimmedAddress = address
            ? address.trim()
            : null;

        if (trimmedName.length > 100) {
            return res.status(400).json({
                error: "Name cannot exceed 100 characters"
            });
        }

        if (trimmedEmail.length > 100) {
            return res.status(400).json({
                error: "Email cannot exceed 100 characters"
            });
        }

        if (
            trimmedContactNo &&
            !/^[0-9]{8}$/.test(trimmedContactNo)
        ) {
            return res.status(400).json({
                error: "Contact number must contain exactly 8 digits"
            });
        }

        if (
            trimmedAddress &&
            trimmedAddress.length > 255
        ) {
            return res.status(400).json({
                error: "Address cannot exceed 255 characters"
            });
        }

        const updatedCustomer =
            await customerModel.updateCustomerProfile(
                customerID,
                trimmedName,
                trimmedEmail,
                trimmedContactNo,
                trimmedAddress
            );

        if (!updatedCustomer) {
            return res.status(404).json({
                error: "Customer not found"
            });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            customer: updatedCustomer
        });

    } catch (error) {
        console.error("Update profile error:", error);

        // duplicate email or duplicate contact number
        if (error.number === 2601 || error.number === 2627) {
            return res.status(409).json({
                error:
                    "The email or contact number is already being used"
            });
        }

        res.status(500).json({
            error: "Error updating customer profile"
        });
    }
}


// change customer password
async function changeCustomerPassword(req, res) {
    try {
        const userID = parseInt(req.params.userID);

        const {
            currentPassword,
            newPassword
        } = req.body;

        if (isNaN(userID) || userID <= 0) {
            return res.status(400).json({
                error: "Invalid user ID"
            });
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error:
                    "Current password and new password are required"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                error:
                    "New password must be at least 8 characters"
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                error:
                    "New password must be different from current password"
            });
        }

        const user =
            await customerModel.getPasswordByUserId(userID);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        // compare normal current password with stored hash
        const passwordMatches = await bcrypt.compare(
            currentPassword,
            user.PasswordHash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                error: "Current password is incorrect"
            });
        }

        // hash the new password
        const newPasswordHash = await bcrypt.hash(
            newPassword,
            10
        );

        const updated =
            await customerModel.updatePassword(
                userID,
                newPasswordHash
            );

        if (!updated) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        res.status(200).json({
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error("Change password error:", error);

        res.status(500).json({
            error: "Error changing password"
        });
    }
}


module.exports = {
    getAllCustomers,
    registerCustomer,
    loginCustomer,
    getCustomerProfile,
    updateCustomerProfile,
    changeCustomerPassword
};