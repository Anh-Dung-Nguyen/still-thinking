import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        reportedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        reportedTrip: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Trip",
        },

        reportedListing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing",
        },

        reportedReview: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        },

        reportType: {
            type: String,
            enum: ["user", "trip", "listing", "review"],
            required: true,
        },

        category: {
            type: String,
            enum: ["harassment", "inappropriate-content", "spam", "fraud", "safety-concern", "discrimination", "fake-profile", "no-show", "property-issue", "payment-issue", "other"],
            required: true,
        },

        description: {
            type: String,
            required: true,
            maxlength: 2000,
        },

        evidence: [String],

        status: {
            type: String,
            enum: ["pending", "under-review", "resolved", "dismissed"],
            default: "pending",
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium",
        },

        adminNotes: String,

        actionTaken: {
            type: String,
            enum: ["none", "warning", "suspension", "ban", "content-removed"],
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        reviewedAt: Date,
        resolvedAt: Date,
    },

    {
        timestamps: true,
    },
);

reportSchema.index({reporter: 1});
reportSchema.index({reportedUser: 1});
reportSchema.index({status: 1});
reportSchema.index({priority: -1});
reportSchema.index({category: 1});

const Report = mongoose.model("Report", reportSchema);

export default Report;