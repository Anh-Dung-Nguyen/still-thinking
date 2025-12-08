import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            maxlength: 2000,
        },

        category: {
            type: String,
            enum: ["city", "landmark", "nature", "beach", "mountain", "museum", "restaurant", "attraction", "other"],
            required: true,
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },

            coordinates: {
                type: [Number],
                required: true,
                index: "2dsphere",
            },

            address: String,
            city: String,

            country: {
                type: String,
                required: true,
            },
        },

        photos: [String],

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        reviewCount: {
            type: Number,
            default: 0,
        },

        tags: [String],

        openingHours: {
            monday: {
                open: String,
                close: String,
            },

            tuesday: {
                open: String,
                close: String,
            },

            wednesday: {
                open: String,
                close: String,
            },

            thursday: {
                open: String,
                close: String,
            },

            friday: {
                open: String,
                close: String,
            },

            saturday: {
                open: String,
                close: String,
            },

            sunday: {
                open: String,
                close: String,
            },
        },

        website: String,
        phoneNumber: String,

        priceLevel: {
            type: String,
            enum: ["free", "budget", "moderate", "expensive", "luxury"],
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        savedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        visitedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },

    {
        timestamps: true,
    },
);

placeSchema.index({"location.coordinates": "2dsphere"});
placeSchema.index({category: 1});
placeSchema.index({rating: -1});
placeSchema.index({name: "text", description: "text"});

const Place = mongoose.model("Place", placeSchema);

export default Place;