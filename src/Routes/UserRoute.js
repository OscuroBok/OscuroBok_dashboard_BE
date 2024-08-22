const { Authentication } = require("../config/auth");
const controller = require("../controller/user")
const Joi = require('joi');
const { createUserValidation, loginUserValidation, userOtpValidation, verifyOtpValidation, editUserValidation } = require("../validations/user");
const contactNoPattern = /^(\+|\d)[0-9]{7,16}$/;

module.exports = [
    // user registration
    {
        method: 'POST',
        path: '/user-registration',
        options: {
            tags: ['api', 'User'],
            handler: controller.createUser,
            description: "User Registration",
            validate: {
                ...createUserValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(detail => detail.message);
                    return h.response({
                        statusCode: 400,
                        error: 'Bad Request',
                        message: customErrorMessages
                    }).code(400).takeover();
                }
            },
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 10485760, // 10MB limit
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: []
                }
            }
        }

    },

    // login with email
    {
        method: 'POST',
        path: '/login',
        options: {
            tags: ['api', 'User'],
            handler: controller.userLogin,
            description: 'User Login',
            // validate: loginUserValidation,
            validate: {
                ...loginUserValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(detail => detail.message);
                    return h.response({
                        statusCode: 400,
                        error: 'Bad Request',
                        message: customErrorMessages
                    }).code(400).takeover();
                }
            },
            payload: {
                allow: ['application/json'],
                parse: true,
            },
        },
    },

    // profile
    {
        method: 'GET',
        path: '/my-profile',
        options: {
            tags: ['api', 'User'],
            handler: controller.me,
            pre: [Authentication],
            description: "Get user profile",
        }
    },

    // edit profile
    {
        method: 'PUT',
        path: '/edit-me',
        options: {
            tags: ['api', 'User'],
            handler: controller.editMyProfile,
            description: "Update Profile",
            pre: [Authentication],
            validate: {
                ...editUserValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(detail => detail.message);
                    return h.response({
                        statusCode: 400,
                        error: 'Bad Request',
                        message: customErrorMessages
                    }).code(400).takeover();
                }
            },
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 10485760, // 10MB limit
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: []
                }
            }
        }

    },
]