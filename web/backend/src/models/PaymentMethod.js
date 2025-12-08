import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: {
            type: String,
            enum: ["card", "bank-account", "paypal", "other"],
            required: true,
        },

        cardDetails: {
            last4: String,
            brand: String,
            expiryMonth: Number,
            expiryYear: Number,
            cardholderName: String,
        },

        bankDetails: {
            accountHolderName: String,
            last4: String,
            bankName: String,
            country: String,
        },

        stripePaymentMethodId: {
            type: String,
            select: false,
        },

        isDefault: {
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

paymentMethodSchema.index({user: 1});
paymentMethodSchema.index({isDefault: 1});

const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);

export default PaymentMethod;