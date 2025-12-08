import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
    {
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
            maxlength: 100,
        },

        description: {
            type: String,
            required: true,
            maxlength: 2000,
        },

        propertyType: {
            type: String,
            enum: ["apartment", "house", "villa", "cabin", "cottage", "bungalow", "hotel", "hostel", "guesthouse", "other"],
            required: true,
        },

        roomType: {
            type: String,
            enum: ["entire-place", "private-room", "shared-room"],
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

            address: {
                type: String,
                required: true,
            },

            city: {
                type: String,
                required: true,
            },

            state: String,

            country: {
                type: String,
                required: true,
            },

            postalCode: String,
        },

        capacity: {
            guests: {
                type: Number,
                required: true,
                min: 1,
            },

            bedrooms: {
                type: Number,
                required: true,
                min: 1,
            },

            beds: {
                type: Number,
                required: true,
                min: 1,
            },

            bathrooms: {
                type: Number,
                required: true,
                min: 1,
            },
        },

        amenities: {
            essentials: {
                wifi: {
                    type: Boolean,
                    default: false,
                },

                kitchen: {
                    type: Boolean,
                    default: false,
                },

                washer: {
                    type: Boolean,
                    default: false,
                },

                dryer: {
                    type: Boolean,
                    default: false,
                },

                airConditioning: {
                    type: Boolean,
                    default: false,
                },

                heating: {
                    type: Boolean,
                    default: false,
                },

                tv: {
                    type: Boolean,
                    default: false,
                },

                parking: {
                    type: Boolean,
                    default: false,
                },
            },

            features: {
                pool: {
                    type: Boolean,
                    default: false,
                },

                hotTub: {
                    type: Boolean,
                    default: false,
                },

                gym: {
                    type: Boolean,
                    default: false,
                },

                elevator: {
                    type: Boolean,
                    default: false,
                },

                fireplace: {
                    type: Boolean,
                    default: false,
                },

                workspace: {
                    type: Boolean,
                    default: false,
                },
            },

            safety: {
                smokeAlarm: {
                    type: Boolean, 
                    default: false,
                },

                carbonMonoxideAlarm: {
                    type: Boolean,
                    default: false,
                },

                firstAidKit: {
                    type: Boolean,
                    default: false,
                },

                fireExtinguisher: {
                    type: Boolean,
                    default: false,
                },
            },
        },

        photos: {
            type: [String],
            required: true,
            validate: [arr => arr.length > 0, "At least one photo is required"],
        },

        pricing: {
            basePrice: {
                type: Number,
                required: true,
                min: 0,
            },

            currency: {
                type: String,
                default: "EUR",
            },

            cleaningFee: {
                type: Number,
                default: 0,
            },

            serviceFee: {
                type: Number,
                default: 0,
            },

            weeklyDiscount: {
                type: Number,
                default: 0, 
                min: 0,
                max: 100,
            },

            monthlyDiscount: {
                type: Number,
                default: 0,
                min: 0,
                max: 100,
            },
        },

        availability: {
            minNights: {
                type: Number,
                default: 1,
                min: 1,
            },

            maxNights: {
                type: Number,
                default: 365,
            },

            advanceNotice: {
                type: Number,
                default: 0,
            },

            preparationTime: {
                type: Number,
                default: 1,
            },

            blockedDates: [
                {
                    startDate: Date,
                    endDate: Date,
                    reason: String,
                },
            ],
        },

        houseRules: {
            checkInTime: {
                type: String,
                default: "15:00",
            },

            checkOutTime: {
                type: String,
                default: "11:00",
            },

            smoking: {
                type: Boolean,
                default: false,
            },

            pets: {
                type: Boolean,
                default: false,
            },

            parties: {
                type: Boolean,
                default: false,
            },

            children: {
                type: Boolean,
                default: true,
            },

            additionalRules: [String],
        },

        cancellationPolicy: {
            type: String,
            enum: ["flexible", "moderate", "strict", "super-strict"],
            default: "moderate",
        },

        instantBooking: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["draft", "published", "unlisted", "suspended"],
            default: "draft",
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

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

        bookings: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Booking",
            },
        ],

        reviews: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Review",
            },
        ],

        views: {
            type: Number,
            default: 0,
        },

        favorites: {
            type: Number,
            default: 0,
        },
    },

    {
        timestamps: true,
    },
);

listingSchema.index({host: 1});
listingSchema.index({"location.coordinates": "2dsphere"});
listingSchema.index({status: 1});
listingSchema.index({"pricing.basePrice": 1});
listingSchema.index({rating: -1});
listingSchema.index({propertyType: 1});
listingSchema.index({roomType: 1});

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;