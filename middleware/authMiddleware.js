<<<<<<< HEAD
// ruimin could be missing

// the literal middleware
// jwt.verify(token, secret)

const jwt = require("jsonwebtoken");

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Invalid token format",
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid token",
      });
    }
    req.user = decoded;
    next();
  });
}

module.exports = {
  verifyJWT,
};
=======
const jwt = require("jsonwebtoken"); //for so that the backend can verify jwt access token

//this func is to check whether the req contains a valid token or not
//use this to check if token is valid
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"]; //gets the auth header

    const token = authHeader && authHeader.split(" ")[1]; //split to take only the token part

    if (!token) { //if no token provided
        return res.status(401).json({
            error: "Access token required"
        });
    }

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (error, decodedUser) => {
            if (error) {
                return res.status(403).json({
                    error: "Invalid or expired token"
                });
            }
            req.user = decodedUser;
            next();
        }
    );
}

//to check whether the logged in usre is allowed to access the route or not
//show error whennot allowed 
function authorizeRoles(...allowedRoles) {
    return function (req, res, next) {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: "You do not have permission"
            });
        }
        next();
    };
}

module.exports = {
    authenticateToken,
    authorizeRoles
};
>>>>>>> 3a1493f9dc26ff4b86098cd3e4449df4fff7ba90
