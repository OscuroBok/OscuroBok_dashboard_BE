const { adminAuth } = require("../config/auth");
const controller = require("../controller/Admin/admin");
const { adminLoginValidation, getAllRestaurantsValidation, adminSentOtpValidation, adminVerifyOtpValidation, adminResetPasswordValidation } = require("../validations/admin");

module.exports = [
    // login with email
    {
        method: "POST",
        path: "/admin/login",
        options: {
            tags: ["api", "Admin"],
            handler: controller.adminLogin,
            description: "Admin Login",
            validate: {
                ...adminLoginValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(
                        (detail) => detail.message
                    );
                    return h
                        .response({
                            statusCode: 400,
                            error: "Bad Request",
                            message: customErrorMessages,
                        })
                        .code(400)
                        .takeover();
                },
            },

        },
    },

    //  fetch all restaurant list
    {
        method: 'GET',
        path: '/admin/all-restaurants',
        options: {
            tags: ['api', 'Admin'],
            handler: controller.fetchAllRestaurant,
            pre: [adminAuth],
            description: "Fetch All Registered restaurants List",
            validate: {
                ...getAllRestaurantsValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(
                        (detail) => detail.message
                    );
                    return h
                        .response({
                            statusCode: 400,
                            error: "Bad Request",
                            message: customErrorMessages,
                        })
                        .code(400)
                        .takeover();
                },
            },
        }
    },

    // inactive restaurant
    {
        method: 'GET',
        path: '/admin/inactive-restaurants',
        options: {
            tags: ['api', 'Admin'],
            handler: controller.fetchInActiveRestaurants,
            pre: [adminAuth],
            description: "Fetch All InActive restaurant List",
            validate: {
                ...getAllRestaurantsValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(
                        (detail) => detail.message
                    );
                    return h
                        .response({
                            statusCode: 400,
                            error: "Bad Request",
                            message: customErrorMessages,
                        })
                        .code(400)
                        .takeover();
                },
            },
        }
    },

    // counter api
    {
        method: 'GET',
        path: '/admin/count-restaurants-data',
        options: {
            tags: ['api', 'Admin'],
            handler: controller.restaurantCounter,
            pre: [adminAuth],
            description: "Counter Api For All restaurants",
        }
    },


    // sent otp for forget password
    {
        method: "POST",
        path: "/admin/forget-password/sent-otp",
        options: {
            tags: ["api", "Admin"],
            handler: controller.sentOtpForForgetpassword,
            description: "Sent OTP For Forget Password (Admin)",
            validate: {
                ...adminSentOtpValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(
                        (detail) => detail.message
                    );
                    return h
                        .response({
                            statusCode: 400,
                            error: "Bad Request",
                            message: customErrorMessages,
                        })
                        .code(400)
                        .takeover();
                },
            },

        },
    },

    // verify otp for forget password
    {
        method: "POST",
        path: "/admin/forget-password/verify-otp",
        options: {
            tags: ["api", "Admin"],
            handler: controller.verifyOTP,
            description: "Verify OTP For Forget Password (Admin)",
            validate: {
                ...adminVerifyOtpValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(
                        (detail) => detail.message
                    );
                    return h
                        .response({
                            statusCode: 400,
                            error: "Bad Request",
                            message: customErrorMessages,
                        })
                        .code(400)
                        .takeover();
                },
            },

        },
    },
    // reset password for forget password
    {
        method: "POST",
        path: "/admin/forget-password/reset-password",
        options: {
            tags: ["api", "Admin"],
            handler: controller.resetPasswordAfterVerification,
            description: "Reset Password For Forget Password (Admin)",
            validate: {
                ...adminResetPasswordValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(
                        (detail) => detail.message
                    );
                    return h
                        .response({
                            statusCode: 400,
                            error: "Bad Request",
                            message: customErrorMessages,
                        })
                        .code(400)
                        .takeover();
                },
            },
        }
    }
]