const { Authentication } = require("../config/auth");
const controller = require("../controller/user.controller");
const Joi = require("joi");
const {
	createUserValidation,
	userOtpValidation,
	verifyOtpValidation,
	editUserValidation,
	userPasswordChangeValidation,
	userProfileDeletionValidation,
	userProfileDeletionByAdminValidation,
	followRestaurantprofileValidation,
	unfollowRestaurantprofileValidation,
} = require("../validations/user.validation");
const contactNoPattern = /^(\+|\d)[0-9]{7,16}$/;

module.exports = [
	// user registration
	{
		method: "POST",
		path: "/user-registration",
		options: {
			tags: ["api", "User"],
			handler: controller.createUser,
			description: "User Registration",
			validate: {
				...createUserValidation,
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
			payload: {
				parse: true,
				allow: ["application/json"],
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "json",
					responseMessages: [],
				},
			},
		},
	},

	// profile
	{
		method: "GET",
		path: "/my-profile",
		options: {
			tags: ["api", "User"],
			handler: controller.showUserProfile,
			pre: [Authentication],
			description: "Get user profile",
		},
	},

	// edit profile
	{
		method: "PUT",
		path: "/edit-me",
		options: {
			tags: ["api", "User"],
			handler: controller.editMyProfile,
			description: "Update Profile",
			pre: [Authentication],
			validate: {
				...editUserValidation,
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
			payload: {
				output: "stream",
				parse: true,
				allow: "multipart/form-data",
				multipart: true,
				maxBytes: 10485760, // 10MB limit
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "form",
					responseMessages: [],
				},
			},
		},
	},

	// change-user-password
	{
		method: "POST",
		path: "/user-password-change",
		options: {
			tags: ["api", "User"],
			handler: controller.changeUserPassword,
			description: "User profile's Password Change",
			pre: [Authentication],
			validate: {
				...userPasswordChangeValidation,
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
			payload: {
				parse: true,
				allow: ["application/json"],
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "json",
					responseMessages: [],
				},
			},
		},
	},

	// profile deletion by user
	{
		method: "DELETE",
		path: "/user-profile-deletion",
		options: {
			tags: ["api", "User"],
			handler: controller.profileDeletionByUser,
			description: "User profile deletion by user",
			pre: [Authentication],
			validate: {
				...userProfileDeletionValidation,
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
			payload: {
				parse: true,
				allow: ["application/json"],
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "json",
					responseMessages: [],
				},
			},
		},
	},

	// profile deletion by admin
	{
		method: "DELETE",
		path: "/user-profile-deletion-admin",
		options: {
			tags: ["api", "User"],
			handler: controller.profileDeletionByAdmin,
			description: "User profile deletion by Admin",
			validate: {
				...userProfileDeletionByAdminValidation,
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
			payload: {
				parse: true,
				allow: ["application/json"],
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "json",
					responseMessages: [],
				},
			},
		},
	},

	// follow restaurant profile
	{
		method: "POST",
		path: "/follow-restaurant-profile",
		options: {
			tags: ["api", "User"],
			handler: controller.followRestaurantprofile,
			description: "Follow Restaurant's Profile",
			pre: [Authentication],
			validate: {
				...followRestaurantprofileValidation,
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
			payload: {
				allow: ["application/json"],
				parse: true,
			},
		},
	},

	// unfollow restaurant profile unfollow
	{
		method: "POST",
		path: "/unfollow-restaurant-profile",
		options: {
			tags: ["api", "User"],
			handler: controller.unfollowRestaurantProfile,
			description: "Unfollow Restaurant's Profile",
			pre: [Authentication],
			validate: {
				...unfollowRestaurantprofileValidation,
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
			payload: {
				allow: ["application/json"],
				parse: true,
			},
		},
	},

	// get all followed restaurants
	{
		method: "GET",
		path: "/followed-restaurants-list",
		options: {
			tags: ["api", "User"],
			handler: controller.showFollowedRestaurants,
			pre: [Authentication],
			description: "Get all followed restaurant profile(s)",
		},
	},
];
