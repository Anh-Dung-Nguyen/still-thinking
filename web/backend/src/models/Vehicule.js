import mongoose from "mongoose";

const vehiculeSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        brand: {
            type: String,
            required: true,
        },

        model: {
            type: String,
            required: true,
        },

        year: {
            type: Number,
            required: true,
        },

        color: String,

        licensePlate: {
            type: String,
            required: true,
            unique: true,
        },

        category: {
            type: String,
            enum: ["sedan", "suv", "hatchback", "van", "coupe", "convertible", "other"],
            default: "sedan",
        },

        seats: {
            type: Number,
            required: true,
            min: 1,
            max: 9,
        },

        comfort: {
            type: String,
            enum: ["basic", "standard", "comfort", "luxury"],
            default: "standard",
        },

        features: {
            airConditioning: {
                type: Boolean,
                default: false,
            },

            wifi: {
                type: Boolean,
                default: false,
            },

            bluetooth: {
                type: Boolean,
                default: false,
            },

            usbCharging: {
                type: Boolean,
                default: false,
            },

            gps: {
                type: Boolean,
                default: false,
            },
        },

        photos: [String],

        isVerified: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },

    {
        timestamps: true,
    },
);

vehiculeSchema.index({owner: 1});
vehiculeSchema.index({licensePlate: 1});

const Vehicule = mongoose.model("Vehicule", vehiculeSchema);

export default Vehicule;