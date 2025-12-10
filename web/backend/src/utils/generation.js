import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateToken = (userId) => {
    return jwt.sign({id: userId}, process.env.JWT_SECRET_KEY, {
        expiresIn: "7d",
    });
};

export const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

export const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};