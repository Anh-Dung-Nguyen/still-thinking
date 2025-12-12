import User from "../models/User.js";
import Trip from "../models/Trip.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import Vehicule from "../models/Vehicule.js";
import { filterProfileByPrivacy, selectPublicFields } from "../utils/profileFilter.js";

export const getPublicProfile = async (req, res) => {
    try {
        const {userId} = req.params;

        const user = await User.findOne({
            _id: userId,
            deletedAt: null,
        }).select(selectPublicFields());

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const filteredProfile = filterProfileByPrivacy(user, req.user);

        res.status(200).json({
            success: true,
            data: filteredProfile,
        });

    } catch (error) {
        console.error("Error in getPublicProfile: ", error);
        res.status(500).json({
            success: true,
            message: "Server error",
            error: error.message,
        });
    }
};

export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: "driverProfile.vehicules",
                select: "brand model year color licensePlate category seats comfort features photos isVerified",
            })
            .populate({
                path: "connections",
                select: "requester recipient status createdAt",
                populate: {
                    path: "requester recipient",
                    select: "fullname nickname profilePic"
                },
            })
            .populate({
                path: "followers",
                select: "fullname nickname profilePic trustScore",
            })
            .populate({
                path: "following",
                select: "fullname nickname profilePic trustScore",
            })
            .select("-password -passwordResetToken -passwordResetExpires -verificationCode -verificationExpires");
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: user,
        });
    
    } catch (error) {
        console.error("Error in getMyProfile: ", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

export const getCompleteProfile = async (req, res) => {
    try {
        const {userId} = req.params;
        const isOwnProfile = req.user && req.user._id.toString === userId;

        const user = await User.findOne({
            _id: userId,
            deletedAt: null,
        }).select(selectPublicFields());

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.privacy?.profileVisibility === "private" && !isOwnProfile) {
            return res.status(403).json({
                success: false,
                message: "This profile is private",
            });
        }

        const canSeeTrips = isOwnProfile || user.privacy?.showTrips !== false;

        let trips = [];
        if (canSeeTrips) {
            trips = await Trip.find({
                driver: userId,
                status: {
                    $in: ["published", "in-progress", "completed"],
                },
            })
                .populate("vehicule", "brand model year category seats comfort")
                .sort({departureDate: -1})
                .limit(10)
                .select("origin destination departureDate departureTime pricePerSeat availableSeats status");            
        }

        let bookings = [];
        if (isOwnProfile) {
            bookings = await Booking.find({guest: userId})
                .populate("listing", "title propertyType location.city photos pricing.basePrice")
                .populate("host", "fullname nickname profilePic")
                .sort({createdAt: -1})
                .limit(10)
                .select("checkInDate checkOutDate status pricing")
        }

        const reviewsReceived = await Review.find({
            recipient: userId,
            isVisible: true,
        })
            .populate("author", "fullname nickname profilePic")
            .sort({createdAt: -1})
            .limit(10)
            .select("rating comment reviewType createdAt");

        let reviewGiven = [];
        if (isOwnProfile) {
            reviewGiven = await Review.find({
                author: userId,
            })
                .populate("recipient", "fullname nickname profilePic")
                .sort({createdAt: -1})
                .limit(10)
                .select("rating comment reviewType createdAt");
        }

        let vehicules = [];
        if (user.roles?.includes("driver")) {
            vehicules = await Vehicule.find({
                owner: userId,
                isActive: true,
            }).select("brand model year color category seats comfort features photos isVerified");
        }

        const stats = {
            totalTripsAsDriver: user.driverProfile?.totalRides || 0,
            completedTripsAsDriver: user.driverProfile?.completedRides || 0,
            totalTripsAsPassenger: user.passengerProfile?.totalTrips || 0,
            completedTripsAsPassenger: user.passengerProfile?.completedTrips || 0,
            totalBookingsAsHost: user.hostProfile?.totalBookings || 0,
            reviewsReceivedCount: reviewsReceived.length,
            averageRating: user.overallRating || 0,
            trustScore: user.trustScore,
        };

        const filteredProfile = filterProfileByPrivacy(user, req.user);

        res.status(200).json({
            success: true,
            data: {
                profile: filteredProfile,
                trips: canSeeTrips ? trips : [],
                bookings: isOwnProfile ? bookings : [],
                reviewsReceived,
                reviewGiven: isOwnProfile ? reviewGiven : [],
                vehicules,
                stats,
            },
        });

    } catch (error) {
        console.error("Error in getCompletedProfile: ", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};