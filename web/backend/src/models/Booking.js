import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        guest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing",
            required: true,
        },

        checkInDate: {
            type: Date,
            required: true,
        },

        checkOutDate: {
            type: Date,
            required: true,
        },

        guests: {
            adults: {
                type: Number,
                required: true,
                min: 1,
            },

            children: {
                type: Number,
                default: 0,
            },

            infants: {
                type: Number,
                default: 0,
            },

            pets: {
                type: Number,
                default:0,
            },
        },

        numberOfNights: {
            type: Number,
            required: true,
        },

        pricing: {
            basePrice: {
                type: Number,
                required: true,
            },

            cleaningFee: {
                type: Number,
                default: 0,
            },

            serviceFee: {
                type: Number,
                default: 0,
            },

            discount: {
                type: Number,
                default: 0,
            },

            totalPrice: {
                type: Number,
                required: true,
            },

            currency: {
                type: String,
                default: "EUR",
            },
        },

        payment: {
            status: {
                type: String,
                enum: ["pending", "completed", "refunded", "failed"],
                default: "pending",
            },

            method: String,
            transactionId: String,
            paidAt: Date,
            refundedAt: Date,
            refundAmount: Number,
        },

        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled-by-guest", "cancelled-by-host", "declined", "completed"],
            default: "pending",
        },

        specialRequests: String,
        cancellationReason: String,

        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        cancelledAt: Date,
        confirmedAt: Date,
        completedAt: Date,

        review: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        },
    },

    {
        timestamps: true,
    },
);

bookingSchema.index({guest: 1});
bookingSchema.index({host: 1});
bookingSchema.index({listing: 1});
bookingSchema.index({status: 1});
bookingSchema.index({checkInDate: 1});
bookingSchema.index({checkOutDate: 1});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;