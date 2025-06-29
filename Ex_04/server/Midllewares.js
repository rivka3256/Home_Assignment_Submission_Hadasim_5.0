import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config(); // load environment variables from .env file

export const jwtMiddleware = (req, res, next) => {
    console.log("jwtMiddleware called");
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access Denied. No token provided" });
    }

    const token = authHeader.split(" ")[1]; // take the token from the header
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET); // verify the token
        req.user = verified; 
        console.log("req.user", req.user)
        next(); //go to the next function
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session expired. Please log in again." });
        } else {
            return res.status(403).json({ message: "token." });
        }
    }
};

//Middleware to check if the user is an owner
export const GroceryOwnerOnly = (req, res, next) => {
    console.log("GroceryOwnerOnly")
    if (req.user.role !== "owner") {
        return res.status(403).json({ message: "Only to store owner." });
    }
    next();
};

// Middleware to check if the user is a supplier
export const SupplierOnly = (req, res, next) => {
    if (req.user.role !== "supplier") {
        return res.status(403).json({ message: "just for suppliers" });
    }
    console.log("SupplierOnly")
    console.log("req.user", req.user)
    next();
};
