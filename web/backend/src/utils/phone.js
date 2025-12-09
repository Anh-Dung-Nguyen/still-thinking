import twilio from "twilio";

const createTwilioClient = () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
        console.warn("Twilio credentials not configured");
        return null;
    }

    return twilio(accountSid, authToken);
};

export const sendVerificationSMS = async (phoneNumber, code) => {
    try {
        const client = createTwilioClient();

        if (!client) {
            console.log(`Phone number: ${phoneNumber.padEnd(27)}`);
            console.log(`Verification code: ${code.padEnd(22)}`);

            return {
                success: true,
                message: "Development mode - SMS logged to console",
                code: code,
            };
        }

        const message = await client.messages.create({
            body: `Your ${process.env.APP_NAME} code is: ${code}\n\nThis code will expire in 30 minutes`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        });

        console.log("Verification SMS sent successfully: ", message.sid);
        console.log(`To: ${phoneNumber}`);
        console.log(`Status: ${message.status}`);

        return {
            success: true,
            messageId: message.sid,
            status: message.status
        };

    } catch (error) {
        console.error("Error sending verification SMS: ", error.message);
        throw new Error(`Failed to send SMS: ${error.message}`);
    }
};