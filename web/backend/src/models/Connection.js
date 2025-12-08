import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
    {
        requester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "declined", "blocked"],
            default: "pending",
        },

        message: String,
        respondedAt: Date,
    },

    {
        timestamps: true,
    },
);

connectionSchema.index({requester: 1, recipient: 1}, {unique: true});
connectionSchema.index({requester: 1});
connectionSchema.index({recipient: 1});
connectionSchema.index({status: 1});

const Connection = mongoose.model("Connection", connectionSchema);

export default Connection;