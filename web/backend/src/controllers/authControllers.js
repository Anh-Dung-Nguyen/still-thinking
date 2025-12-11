import User from "../models/User.js";
import { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } from "../utils/email.js";
import { generateToken, generateVerificationCode } from "../utils/generation.js";
import { sendVerificationSMS } from "../utils/phone.js";

export const checkAvailability = async (req, res) => {
    try {
        const {field, value} = req.body;

        if (!field || !value) {
            return res.status(400).json({
                success: false,
                message: "Field and value are required",
            });
        }

        const validFields = ["nickname", "email", "phoneNumber"];
        if (!validFields.includes(field)) {
            return res.status(400).json({
                success: false,
                message: "Invalid field",
            });
        }

        const query = {[field]: field === "email" || field === "nickname" ? value.toLowerCase() : value};
        const exists = await User.findOne(query);

        res.status(200).json({
            success: true,
            available: !exists,
            message: exists ? `This ${field} is already taken` : `This ${field} is available`,
        });

    } catch (error) {
        console.error("Check availability error: ", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const signup = async (req, res) => {
    try {
        const {fullname, nickname, email, password, phoneNumber, dateOfBirth, gender, verificationMethod} = req.body;
    
        if (!fullname || !nickname || !email || !password || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
                fields: ["fullname", "nickname", "email", "password", "phoneNumber"],
            });
        }

        if (!verificationMethod || !["email", "phone"].includes(verificationMethod)) {
            return res.status(400).json({
                success: false,
                message: "Please select a verification method (email or phone)",
                field: "verificationMethod",
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
                field: "email",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
                field: "password",
            });
        }

        const nicknameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!nicknameRegex.test(nickname)) {
            return res.status(400).json({
                success: false,
                message: "Nickname must be 3-20 characters and contains only letters, numbers and underscores",
                field: "nickname",
            });
        }

        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber.replace(/[\s()-]/g, ''))) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number format",
                field: "phoneNumber",
            });
        }

        if (dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 18) {
                return res.status(400).json({
                    success: false,
                    message: "You must be at least 18 years old to register",
                    field: "dateOfBirth",
                });
            }
        }

        const existingUser = await User.findOne({
            $or: [
                {email: email.toLowerCase()},
                {nickname: nickname.toLowerCase()},
                {phoneNumber},
            ],
        });

        if (existingUser) {
            let field = "";
            let message = "";

            if (existingUser.email == email.toLowerCase()) {
                field = "email";
                message = "Email is already registered";
            } else if (existingUser.nickname == nickname.toLowerCase()) {
                field = "nickname";
                message = "Nickname is already taken";
            } else if (existingUser.phoneNumber == phoneNumber) {
                field = "phoneNumber";
                message = "Phone number is already registered";
            }

            return res.status(409).json({
                success: false,
                message,
                field,
            });
        }

        const verificationCode = generateVerificationCode();
        const verificationExpires = Date.now() + 30 * 60 * 1000;

        const user = await User.create({
            fullname,
            nickname: nickname.toLowerCase(),
            email: email.toLowerCase(),
            password,
            phoneNumber,
            dateOfBirth: dateOfBirth || undefined,
            gender: gender || undefined,
            accountStatus: "pending",
            isOnboarded: false,
            onboardingStep: 0,
            verificationCode,
            verificationExpires,
            verificationMethod,
        });

        try {
            if (verificationMethod === "email") {
                await sendVerificationEmail(
                    user.email,
                    verificationCode,
                    user.fullname,
                );
            } else if (verificationMethod === "phone") {
                await sendVerificationSMS(
                    user.phoneNumber,
                    verificationCode,
                );
            }
        } catch (error) {
            console.error("Verification sending error: ", error);
        }

        const token = generateToken(user._id);

        const userResponse = {
            id: user._id,
            fullname: user.fullname,
            nickname: user.nickname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            accountStatus: user.accountStatus,
            isOnboarded: user.isOnboarded,
            verificationMethod,
            verification: {
                email: user.verification.email,
                phone: user.verification.phone,
            },
        };

        const message = verificationMethod === "email"
            ? "Account created successfully. Please check your email for verification."
            : "Account created successfully. Please check your phone for verification code.";

        res.status(201).json({
            success: true,
            message,
            user: userResponse,
            token,
        });

    } catch (error) {
        console.error("Signup error: ", error);
        res.status(500).json({
            success: false,
            message: "Server error during registration",
        });
    }
};

export const verifyCode = async (req, res) => {
    try {
        const {identifier, code} = req.body;

        if (!identifier || !code) {
            return res.status(400).json({
                success: false,
                message: "Identifier (email or phone) and verification code are required",
            });
        }

        const user = await User.findOne({
            $or: [
                {email: identifier.toLowerCase()},
                {phoneNumber: identifier},
            ],

            verificationCode: code,
            verificationExpires: {$gt: Date.now()},
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification code",
            });
        }

        if (user.verificationMethod === "email") {
            user.verification.email = true;
        } else if (user.verificationMethod === "phone") {
            user.verification.phone = true;
        }

        user.verification.verifyAt = new Date();
        user.verificationCode = undefined;
        user.verificationExpires = undefined;
        user.verificationMethod = undefined;

        if (user.accountStatus === "pending") {
            user.accountStatus = "active";
        }

        await user.save();

        try {
            await sendWelcomeEmail(user.email, user.fullname);
        } catch (error) {
            console.error("Welcome email error: ", error);
        }

        res.status(200).json({
            success: true,
            message: "Verification successful! Welcome to our platform!",
            user: {
                id: user._id,
                email: user.email,
                phoneNumber: user.phoneNumber,
                verified: user.verification.email || user.verification.phone,
                accountStatus: user.accountStatus,
            },
        });

    } catch (error) {
        console.error("Verification error: ", error);
        res.status(500).json({
            success: false,
            message: "Server error during verification",
        });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const {code} = req.body;
        const {email} = req.params;

        if (!code || !email) {
            return res.status(400).json({
                success: false,
                message: "Email and verification code are required",
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            verificationCode: code,
            verificationExpires: {$gt: Date.now()},
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token",
            });
        }

        user.verification.email = true;
        user.verification.verifyAt = new Date();
        user.verificationCode = undefined;
        user.verificationExpires = undefined;
        user.verificationMethod = undefined;

        if (user.accountStatus === "pending") {
            user.accountStatus = "active";
        }

        await user.save();

        try {
            await sendWelcomeEmail(user.email, user.fullname);
        } catch (error) {
            console.error("Welcome email error: ", error);
        }

        res.status(200).json({
            success: true,
            message: "Email verified successfully! Welcome to our platform.",
            user: {
                id: user._id,
                email: user.email,
                verified: user.verification.email,
                accountStatus: user.accountStatus,
            },
        });

    } catch (error) {
        console.error("Email verification error: ", error);
        res.status(500).json({
            success: false,
            message: "Server error during verification",
        });
    }
};

export const verifyPhone = async (req, res) => {
    try {
        const {phoneNumber, code} = req.body;

        if (!phoneNumber || !code) {
            return res.status(400).json({
                success: false,
                message: "Phone number and verification code are required.",
            });
        }

        const user = await User.findOne({
            phoneNumber,
            verificationToken: code,
            verificationExpires: {$gt: Date.now()},
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification code",
            });
        }

        user.verification.phone = true;
        user.verification.verifyAt = new Date();
        user.verificationCode = undefined;
        user.verificationExpires = undefined;
        user.verificationMethod = undefined;

        if (user.accountStatus === "pending") {
            user.accountStatus = "active";
        }

        await user.save();

        try {
            await sendWelcomeEmail(user.email, user.fullname);
        } catch (error) {
            console.error("Welcome email error: ", error);
        }

        res.status(200).json({
            success: true,
            message: "Phone verified successfully! Welcome to out platform.",
            user: {
                id: user._id,
                phoneNumber: user.phoneNumber,
                verified: user.verification.phone,
                accountStatus: user.accountStatus,
            },
        });

    } catch (error) {
        console.error("Phone verification error: ", error);
        res.status(500).json({
            success: false,
            message: "Server error during verification",
        });
    }
};

export const resendVerificationCode = async (req, res) => {
    try {
        const {identifier} = req.body;

        if (!identifier) {
            return res.status(400).json({
                success: false,
                message: "Email or phone number is required",
            });
        }

        const user = await User.findOne({
            $or: [
                {email: email.toLowerCase()},
                {phoneNumber: identifier},
            ],
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.verification.email && user.verification.phone) {
            return res.status(400).json({
                success: false,
                message: "Account is already verified",
            });
        }

        const verificationCode = generateVerificationCode();
        const verificationExpires = Date.now() + 30 * 60 * 1000;

        user.verificationCode = verificationCode;
        user.verificationExpires = verificationExpires;

        await user.save();

        try {
            if (user.verificationMethod === "email" || identifier.includes("@")) {
                await sendVerificationEmail(user.email, verificationCode, user.fullname);
            } else {
                await sendVerificationSMS(user.phoneNumber, verificationCode);
            }

        } catch (error) {
            console.error("Resend verification error: ", error);
            return res.status(500).json({
                success: false,
                message: "Failed to send verification code",
            });
        }

        res.status(200).json({
            success: true,
            message: "Verification code sent successfully",
        });

    } catch (error) {
        console.error("Resend verification error: ", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const resendVerificationEmail = async (req, res) => {
    try {
        const {email} = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.verification.email) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified",
            });
        }

        const verificationCode = generateVerificationCode();
        const verificationExpires = Date.now() + 30 * 60 * 1000;

        user.verificationCode = verificationCode;
        user.verificationExpires = verificationExpires;

        await user.save();

        await sendVerificationEmail(user.email, verificationCode, user.fullname);

        res.status(200).json({
            success: true,
            message: "Verification code sent successfully",
        });
    } catch (error) {
        console.error("Resend verification error: ", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const resendVerificationPhone = async (req, res) => {
    try {
        const {phoneNumber} = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }

        const user = await User.findOne({phoneNumber});

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.verification.phone) {
            return res.status(400).json({
                success: false,
                message: "Phone is already verified",
            });
        }

        const verificationCode = generateVerificationCode();
        const verificationExpires = Date.now() + 30 * 60 * 1000;

        user.verificationCode = verificationCode;
        user.verificationExpires = verificationExpires;

        await user.save();

        await sendVerificationSMS(user.phoneNumber, verificationCode);

        res.status(200).json({
            success: true,
            message: "Verification code sent successfully",
        });

    } catch (error) {
        console.error("Resend phone verification error: ", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const signin = async (req, res) => {
    try {
        const {identifier, password} = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide identifier (email/nickname/phone) and password",
            });
        }

        const user = User.findOne({
            $or: [
                {email: identifier.toLowerCase()},
                {nickname: identifier.toLowerCase()},
                {phoneNumber: identifier},
            ],

            deletedAt: null
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        if (user.isLock()) {
            return res.status(423).json({
                success: false,
                message: "Account is temporarily locked due to multiple failed login attempts",
                lockUntil: user.lockUntil,
            });
        }

        if (user.accountStatus === "suspended") {
            return res.status(403).json({
                success: false,
                message: "Your account has been suspended. Please contact support",
            });
        }

        if (user.accountStatus === "banned") {
            return res.status(403).json({
                success: false,
                message: "Your account has been banned. Please contact support.",
            });
        }

        if (user.accountStatus === "deactivated") {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivate. Please contact support to reactivate",
            });
        }

        const isPasswordCorrect = await user.matchPassword(password);

        if (!isPasswordCorrect) {
            await user.incLoginAttemps();

            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        if (user.accountStatus === "pending") {
            return res.status(403).json({
                success: false,
                message: "Please verify your email or phone number before signing in",
                needsVerification: true,
                verificationMethod: user.verificationMethod,
            });
        }

        if (user.loginAttempts > 0) {
            user.loginAttempts = 0;
            user.lockUntil = undefined;
        }

        user.lastLogin = Date.now();
        user.lastActive = Date.now();
        
        await user.save();

        const token = generateToken(user._id);

        const userResponse = {
            id: user._id,
            fullname: user.fullname,
            nickname: user.nickname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            profilePic: user.profilePic,
            bio: user.bio,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            accountStatus: user.accountStatus,
            isOnboarded: user.isOnboarded,
            roles: user.roles,
            trustScore: user.trustScore,
            verification: {
                email: user.verification.email,
                phone: user.verification.phone,
                identity: user.verification.identity,
            },
            preferences: user.preferences,
            createdAt: user.createdAt,
        };

        res.status(200).json({
            success: true,
            message: "Sign in successful",
            user: userResponse,
            token,
        });

    } catch (error) {
        console.error("Sign in error: ", error);
        res.status(500).json({
            success: false,
            message: "Server error during signing in",
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const {email} = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            deletedAt: null,
        });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, a password reset code will be sent",
            });
        }

        const resetCode = generateVerificationCode();
        const resetExpires = Date.now() + 30 * 60 * 1000;

        user.passwordResetToken = resetCode;
        user.passwordResetExpires = resetExpires;

        await user.save();

        try {
            await sendPasswordResetEmail(user.email, resetCode, user.fullname);
        } catch (error) {
            console.error("Password reset email error: ", error);
            return res.status(500).json({
                success: false,
                message: "Failed to send password reset email",
            });
        }

        res.status(200).json({
            success: true,
            message: "If an account exists with this email, a password reset code will be sent",
        });

    } catch (error) {
        console.error("Forgot password error: ", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: "Email and reset code are required",
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            passwordResetToken: code,
            passwordResetExpires: { $gt: Date.now() },
            deletedAt: null,
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset code",
            });
        }

        res.status(200).json({
            success: true,
            message: "Reset code verified successfully",
        });

    } catch (error) {
        console.error("Verify reset code error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, reset code, and new password are required",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long",
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            passwordResetToken: code,
            passwordResetExpires: { $gt: Date.now() },
            deletedAt: null,
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset code",
            });
        }

        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successfully. You can now sign in with your new password.",
        });

    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('roles');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                fullname: user.fullname,
                nickname: user.nickname,
                email: user.email,
                phoneNumber: user.phoneNumber,
                profilePic: user.profilePic,
                coverPhoto: user.coverPhoto,
                bio: user.bio,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                accountStatus: user.accountStatus,
                isOnboarded: user.isOnboarded,
                onboardingStep: user.onboardingStep,
                roles: user.roles,
                trustScore: user.trustScore,
                verification: user.verification,
                preferences: user.preferences,
                currentLocation: user.currentLocation,
                stats: user.stats,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });

    } catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};