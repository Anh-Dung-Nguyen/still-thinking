export const filterProfileByPrivacy = (user, requestingUser) => {
    const isOwnProfile = requestingUser && user._id.toString() === requestingUser._id.toString();

    if (isOwnProfile) {
        return user;
    }

    const privacy = user.privacy || {};
    const filteredUser = user.toObject();

    if (privacy.profileVisibility === "private" && !isOwnProfile) {
        return {
            _id: filteredUser._id,
            fullname: filteredUser.fullname,
            nickname: filteredUser.nickname,
            profilePic: filteredUser.profilePic,
            message: "This profile is private",
        };
    }

    if (!privacy.showEmail) {
        delete filteredUser.email;
    }

    if (!privacy.showPhone) {
        delete filteredUser.phoneNumber;
    }

    if (!privacy.showLocation) {
        delete filteredUser.currentLocation;
        delete filteredUser.address;
    }

    if (!privacy.showTrips) {
        delete filteredUser.trips;
        delete filteredUser.saveTrips;
    }

    delete filteredUser.password;
    delete filteredUser.verification.identityDocument;
    delete filteredUser.stripeCustomerId;
    delete filteredUser.stripeAccountId;
    delete filteredUser.driverProfile?.licenseNumber;
    delete filteredUser.passwordResetToken;
    delete filteredUser.passwordResetExpires;
    delete filteredUser.verificationCode;
    delete filteredUser.verificationExpires;
    delete filteredUser.loginAttempts;
    delete filteredUser.lockUntil;
    delete filteredUser.paymentMethods;
    delete filteredUser.wallet;
    delete filteredUser.blockedUsers;
    delete filteredUser.reports;
    delete filteredUser.pushTokens;

    return filteredUser;
};

export const selectPublicFields = () => {
    return `
        fullname nickname email phoneNumber dateOfBirth gender
        bio profilePic coverPhoto
        currentLocation address
        verification.email verification.phone verification.identity verification.verifyAt
        trustScore roles preferences
        driverProfile.licenseExpiry driverProfile.licenseVerified driverProfile.totalRides 
        driverProfile.completedRides driverProfile.driverRating driverProfile.driverReviewCount
        passengerProfile.totalTrips passengerProfile.completedTrips 
        passengerProfile.passengerRating passengerProfile.passengerReviewCount
        hostProfile.totalBookings hostProfile.hostRating hostProfile.hostReviewCount 
        hostProfile.responseRate hostProfile.responseTime hostProfile.isSuperhost
        privacy accountStatus isOnboarded lastActive
        stats
        createdAt updatedAt
    `;
};