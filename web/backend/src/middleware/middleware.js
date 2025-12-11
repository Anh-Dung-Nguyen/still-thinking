import jwt from "jsonwebtoken";
import User from "../models/User";

export const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please sign in",
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

            const user = await User.findById(decoded.id).select("-password");

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found",
                });
            }

            if (user.deletedAt) {
                return res.status(403).json({
                    success: false,
                    message: "Account has been deleted",
                });
            }

            if (user.accountStatus !== "active") {
                return res.status(403).json({
                    success: false,
                    message: `Account is ${user.accountStatus}`,
                });
            }

            req.user = user;
            next();

        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    message: "Token expired. Please sign in again",
                });
            }

            if (error.name === "JsonWebTokenError") {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token",
                });
            }

            throw error;
        }

    } catch (error) {
        console.error("Auth middleware error: ", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return next();
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const user = await User.findById(decoded.id).select("-password");

            if (user && !user.deletedAt && user.accountStatus === "active") {
                req.user = user;
            }

        } catch (error) {
            console.log("Optional auth - invalid token: ", error.message);
        }

        next();

    } catch (error) {
        console.error("Optional auth error: ", error);
        next();
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized",
            });
        }

        const hasRole = roles.some(role => req.user.roles.includes(role));

        if (!hasRole) {
            return res.status(403).json({
                success: false,
                message: `User role is not authorized to access this route. Required roles: ${roles.join(", ")}`,
            });
        }

        next();
    }
};

export const isOwner = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Not authorized",
        });
    }

    const resourceUserId = req.params.id || req.params.userId;

    if (resourceUserId && resourceUserId !== req.params.id.toString()) {
        return res.status(403).json({
            success: false,
            message: "Not authorized to access this resource",
        });
    }
};