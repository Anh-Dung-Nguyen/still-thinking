import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
    {
        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        vehicule: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicule",
            required: true,
        },

        origin: {
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

            address: {
                type: String,
                required: true,
            },

            city: String,
            country: String,
        },

        destination: {
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

            address: {
                type: String,
                required: true,
            },

            city: String,
            country: String,
        },

        waypoints: [
            {
                type: {
                    type: String,
                    enum: ["Point"],
                    default: "Point",
                },

                coordinates: [Number],
                address: String,
                city: String,
                stopDuration: Number,
            },
        ],

        departureDate: {
            type: Date,
            required: true,
        },

        departureTime: {
            type: String,
            required: true,
        },

        arrivalDate: Date,
        arrivalTime: String,
        estimatedDuration: Number,
        distance: Number,

        availableSeats: {
            type: Number,
            required: true,
            min: 1,
        },

        totalSeats: {
            type: Number,
            required: true,
        },

        pricePerSeat: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            default: "EUR",
        },

        passengers: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },

                seats: {
                    type: Number,
                    default: 1,
                },

                status: {
                    type: String,
                    enum: ["pending", "confirmed", "cancelled", "completed"],
                    default: "pending",
                },

                bookedAt: {
                    type: Date,
                    default: Date.now,
                },

                pickupPoint: {
                    type: {
                        type: String,
                        enum: ["Point"],
                        default: "Point",
                    },

                    coordinates: [Number],
                    address: String,
                },

                dropoffPoint: {
                    type: {
                        type: String,
                        enum: ["Point"],
                        default: "Point",
                    },

                    coordinates: [Number],
                    address: String,
                },
            },
        ],

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

            maxTwoInBack: {
                type: Boolean,
                default: false,
            },
        },

        bookingOptions: {
            instantBooking: {
                type: Boolean,
                default: false,
            },

            requiredApproval: {
                type: Boolean,
                default: true,
            },
        },

        status: {
            type: String,
            enum: ["draft", "published", "in-progress", "completed", "cancelled"],
            default: "published",
        },

        recurring: {
            isRecurring: {
                type: Boolean,
                default: false,
            },

            frequency: {
                type: String,
                enum: ["daily", "weekly", "monthly"],
            },

            daysOfWeek: [Number],
            endDate: Date,
        },

        notes: String,
        cancellationReason: String,

        reviews: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Review",
            },
        ],
    },

    {
        timestamps: true,
    },
);

tripSchema.index({driver: 1});
tripSchema.index({"origin.coordinates": "2dsphere"});
tripSchema.index({"destination.coordinates": "2dsphere"});
tripSchema.index({departureDate: 1});
tripSchema.index({status: 1});
tripSchema.index({pricePerSeat: 1});
tripSchema.index({availableSeats: 1});

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;