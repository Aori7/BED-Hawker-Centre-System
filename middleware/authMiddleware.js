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
