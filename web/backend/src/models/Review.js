import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        reviewType: {
            type: String,
            enum: ["trip", "listing", "driver", "passenger", "host", "guest"],
            required: true,
        },

        relatedTrip: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Trip",
        },

        relatedListing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing",
        },

        relatedBooking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
        },

        rating: {
            overall: {
                type: Number,
                required: true,
                min: 1,
                max: 5,
            },

            // For trips/drivers
            punctuality: {
                type: Number,
                min: 1,
                max: 5,
            },

            driving: {
                type: Number,
                min: 1,
                max: 5,
            },

            communication: {
                type: Number,
                min: 1,
                max: 5,
            },

            // For listings/hosts
            cleanliness: {
                type: Number,
                min: 1,
                max: 5,
            },

            accuracy: {
                type: Number,
                min: 1,
                max: 5,
            },

            checkIn: {
                type: Number,
                min: 1,
                max: 5,
            },

            value: {
                type: Number,
                min: 1,
                max: 5,
            },

            location: {
                type: Number,
                min: 1,
                max: 5,
            },
        },

        comment: {
            type: String,
            maxlength: 1000,
        },

        photos: [String],

        response: {
            comment: String,
            createdAt: Date,
        },

        isVisible: {
            type: Boolean,
            default: true,
        },

        isReported: {
            type: Boolean,
            default: false,
        },

        helpfulVotes: {
            type: Number,
            default: 0,
        },
    },

    {
        timestamps: true,
    },
);

reviewSchema.index({author: 1});
reviewSchema.index({recipient: 1});
reviewSchema.index({reviewType: 1});
reviewSchema.index({relatedTrip: 1});
reviewSchema.index({relatedListing: 1});
reviewSchema.index({relatedBooking: 1});
reviewSchema.index({"rating.overall": -1});

const Review = mongoose.model("Review", reviewSchema);

export default Review;