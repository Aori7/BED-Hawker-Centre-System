const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authModel = require("../models/authModel");

async function loginUser(req, res) {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        error: "Email, password and role are required",
      });
    }

    const user = await authModel.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.PasswordHash);

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    if (user.RoleName !== role) {
      return res.status(403).json({
        error: "This account does not belong to the selected role",
      });
    }

    // ruimin new JWT token
    const token = jwt.sign(
      {
        userID: user.UserID,
        role: user.RoleName,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.status(200).json({
      message: "Login successful",
      accessToken: token,

      user: {
        userID: user.UserID,
        email: user.Email,
        role: user.RoleName,

        customerID: user.CustomerID ?? null,

        customerName: user.CustomerName ?? null,
      },
    });
  } catch (error) {
    console.error("Auth controller error:", error);

    res.status(500).json({
      error: "Error logging in",
    });
  }
}

module.exports = {
  loginUser,
};

// ruimin might be missing

// JWT creation
// const token = jwt.sign(
//     payload,
//     process.env.ACCESS_TOKEN_SECRET,
//     {
//         expiresIn:"1h"
//     }
// );
