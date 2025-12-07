import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        // Basic Information
        fullname: {
            type: String,
            required: true,
            trim: true,
        },

        nickname: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        phoneNumber: {
            type: String,
            required: true,
            unique: true,
        },

        dateOfBirth: {
            type: Date,
        },

        gender: {
            type: String,
            enum: ["male", "female", "other", "prefer-not-to-say"],
        },

        // Profile Information
        bio: {
            type: String,
            default: "",
            maxlength: 500,
        },

        profilePic: {
            type: String,
            default: "",
        },

        coverPhoto: {
            type: String,
            default: ""
        },

        // Location Information
        currentLocation: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },

            coordinates: {
                type: [Number],
                index: "2dsphere",
            },

            city: String,
            country: String,
            formattedAddress: String,
        },

        address: {
            street: String,
            city: String,
            postalCode: String,
            country: String,
            state: String,
        },

        // Verification and Trust
        verification: {
            email: {
                type: Boolean,
                default: false,
            },

            phone: {
                type: Boolean,
                default: false,
            },

            identity: {
                type: Boolean,
                default: false,
            },

            verifyAt: Date,

            identityDocument: {
                type: String, // Encrypted reference or ID
                select: false, // Don't return by default
            },
        },

        trustScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        // User Roles
        roles: [
            {
                type: String,
                enum: ["driver", "passenger", "host", "traveler"],
            },
        ],

        // User Preferences
        preferences: {
            smoking: {
                type: String,
                enum: ["yes", "no", "outside"],
                default: "no",
            },

            pets: {
                type: String,
                enum: ["yes", "no", "small-only"],
                default: "no",
            },

            music: {
                type: Boolean,
                default: true,
            },

            chattiness: {
                type: String,
                enum: ["quite", "moderate", "chatty"],
                default: "moderate",
            },

            languages: [String],

            currency: {
                type: String,
                default: "EUR",
            },
        },

        // Driver Profile
        driverProfile: {
            licenseNumber: {
                type: String,
                select: false,
            },

            licenseExpiry: Date,

            licenseVerified: {
                type: Boolean,
                default: false,
            },

            vehicules: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Vehicule",
                },
            ],

            totalRides: {
                type: Number,
                default: 0,
            },

            completedRides: {
                type: Number,
                default: 0,
            },

            cancelledRides: {
                type: Number,
                default: 0,
            },

            driverRating: {
                type: Number,
                default: 0,
                min: 0,
                max: 5,
            },

            driverReviewCount: {
                type: Number,
                default: 0,
            },
        },

        // Passenger Profile
        passengerProfile: {
            totalTrips: {
                type: Number,
                default: 0,
            },

            completedTrips: {
                type: Number,
                default: 0,
            },

            cancelledTrips: {
                type: Number,
                default: 0,
            },

            passengerRating: {
                type: Number,
                default: 0,
                min: 0,
                max: 5,
            },

            passengerReviewCount: {
                type: Number,
                default: 0,
            },
        },

        // Host Profile
        hostProfile: {
            listings: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Listing",
                },
            ],

            totalBookings: {
                type: Number,
                default: 0,
            },

            hostRating: {
                type: Number,
                default: 0,
                min: 0,
                max: 5,
            },

            hostReviewCount: {
                type: Number,
                default: 0,
            },

            responseRate: {
                type: Number,
                default: 0,
                min: 0,
                max: 100,
            },

            responseTime: Number,

            isSuperhost: {
                type: Boolean,
                default: false,
            },
        },

        // Relations
        connections: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Connection",
            },
        ],

        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        // Activity References
        trips: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Trip",
            },
        ],

        bookings: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Booking",
            },
        ],

        reviewsReceived: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Review",
            },
        ],

        reviewsGiven: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Review",
            },
        ],

        // Saved and Favorited Items
        savedTrips: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Trip",
            },
        ],

        savedListings: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Listing",
            },
        ],

        savedPlaces: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Place",
            },
        ],

        // Payment and Financial
        wallet: {
            balance: {
                type: Number,
                default: 0,
            },

            currency: {
                type: String,
                default: "EUR",
            },

            pendingBalance: {
                type: Number,
                default: 0,
            },
        },

        paymentMethods: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "PaymentMethod",
            },
        ],

        stripeCustomerId: {
            type: String,
            select: false,
        },

        stripeAccountId: {
            type: String,
            select: false,
        },

        // Safety and Emergency
        emergencyContact: {
            name: String,
            phone: String,
            relationship: String,
        },

        blockedUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        reports: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Report",
            },
        ],

        // Account status and settings
        accountStatus: {
            type: String,
            enum: ["active", "suspend", "banned", "pending", "deactivated"],
            default: "active",
        },

        isOnboarded: {
            type: Boolean,
            default: false,
        },

        onboardingStep: {
            type: Number,
            default: 0,
        },

        lastActive: {
            type: Date,
            default: Date.now,
        },

        // Notification preferences
        notifications: {
            email: {
                marketing: {
                    type: Boolean,
                    default: true,
                },

                bookings: {
                    type: Boolean,
                    default: true,
                },

                messages: {
                    type: Boolean,
                    default: true,
                },

                reviews: {
                    type: Boolean,
                    default: true,
                },

                trips: {
                    type: Boolean,
                    default: true,
                },
            },

            push: {
                enabled: {
                    type: Boolean,
                    default: true,
                },

                bookings: {
                    type: Boolean,
                    default: true,
                },

                messages: {
                    type: Boolean,
                    default: true,
                },

                reviews: {
                    type: Boolean,
                    default: true,
                },

                trips: {
                    type: Boolean,
                    default: true,
                },
            },

            sms: {
                enabled: {
                    type: Boolean,
                    default: false,
                },

                bookings: {
                    type: Boolean,
                    default: false,
                },

                emergencies: {
                    type: Boolean,
                    default: true,
                },
            },
        },

        // Push notification tokens
        pushTokens: [
            {
                token: String,
                platform: {
                    type: String,
                    enum: ["ios", "android", "web"],
                },

                deviceId: String,

                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        // Privacy settings
        privacy: {
            profileVisibility: {
                type: String,
                enum: ["public", "private", "friends"],
                default: "public",
            },

            showEmail: {
                type: Boolean,
                default: false,
            },

            showPhone: {
                type: Boolean,
                default: false,
            },

            showLocation: {
                type: Boolean,
                default: true,
            },

            showTrips: {
                type: Boolean,
                default: true,
            },
        },

        // Soft delete
        deletedAt: {
            type: Date,
            default: null,
        },

        // Login & Security
        lastLogin: Date,

        loginAttempts: {
            type: Number,
            default: 0,
        },

        lockUntil: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        emailVerificationToken: String,
        emailVerificationExpires: Date,

        // Statistics
        stats: {
            totalDistanceTraveled: {
                type: Number,
                default: 0,
            }, // in km

            totalDistanceDriven: {
                type: Number,
                default: 0,
            }, // in km

            countriesVisited: [String],
            citiesVisited: [String],

            co2Saved: {
                type: Number,
                default: 0,
            }, // in kg
        },
    },

    {
        timestamps: true,
    },
);

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });
userSchema.index({ nickname: 1 });
userSchema.index({ "currentLocation.coordinates": "2dsphere" });
userSchema.index({ accountStatus: 1 });
userSchema.index({ deletedAt: 1 });
userSchema.index({ "driverProfile.driverRating": -1 });
userSchema.index({ "hostProfile.hostRating": -1 });
userSchema.index({ trustScore: -1 });
userSchema.index({ lastActive: -1 });

// Virtual for full address
userSchema.virtual("fullAddress").get(function () {
    if (!this.address) {
        return "";
    }

    const { street, city, postalCode, country } = this.address;

    return [street, city, postalCode, country].filter(Boolean).join(", ");
});

// Virtual for age
userSchema.virtual("age").get(function () {
    if (!this.dateOfBirth) {
        return null;
    }

    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
});

// Virtual for overall rating (average of all ratings)
userSchema.virtual("overallRating").get(function () {
    const ratings = [];
    if (this.driverProfile?.driverRating > 0) {
        ratings.push(this.driverProfile.driverRating);
    }

    if (this.passengerProfile?.passengerRating > 0) {
        ratings.push(this.passengerProfile.passengerRating);
    }

    if (this.hostProfile?.hostRating > 0) {
        ratings.push(this.hostProfile.hostRating);
    }
    
    if (ratings.length === 0) {
        return 0;
    }
    
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
});

// Method to check if account is locked
userSchema.methods.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 },
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    const maxAttempts = 5;
    const lockTime = 2 * 60 * 60 * 1000; // 2 hours
    
    if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
        updates.$set = { lockUntil: Date.now() + lockTime };
    }
    
    return this.updateOne(updates);
};

// Method to update last active
userSchema.methods.updateLastActive = function () {
    this.lastActive = Date.now();
    return this.save();
};

// Ensure virtuals are included in JSON
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

// Pre-save hook to update trust score based on verifications
userSchema.pre("save", function (next) {
    if (this.isModified("verification")) {
        let score = 0;
        if (this.verification.email) score += 20;
        if (this.verification.phone) score += 30;
        if (this.verification.identity) score += 50;
        this.trustScore = score;
    }
    next();
});

const User = mongoose.model("User", userSchema);

export default User;