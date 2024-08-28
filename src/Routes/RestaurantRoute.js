const { Authentication } = require("../config/auth");
const controller = require("../controller/restaurant");
const {
	restaurantAdminValidation,
	restaurantLoginValidation,
	restaurantProfileUpdateValidation,
	restaurantPasswordChangeValidation
} = require("../validations/restaurant");

module.exports = [
	// restaurant registration
	{
		method: "POST",
		path: "/restaurant-registration",
		options: {
			tags: ["api", "Restaurant"],
			handler: controller.restaurantAdminRegistration,
			description: "Restaurant Admin Registration",
			validate: {
				...restaurantAdminValidation,
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

	// restaurant-admin-login
	{
		method: "POST",
		path: "/restaurant-login",
		options: {
			tags: ["api", "Restaurant"],
			handler: controller.restaurantLogin,
			description: "Restaurant Login",
			validate: {
				...restaurantLoginValidation,
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

	// restaurant-admin-profile
	{
		method: "GET",
		path: "/restaurant-profile",
		options: {
			tags: ["api", "Restaurant"],
			handler: controller.restaurantProfile,
			pre: [Authentication],
			description: "Get Restaurant Profile",
		},
	},

	// restaurant-profile-updation
	{
		method: "PUT",
		path: "/restaurant-profile-update",
		options: {
			tags: ["api", "Restaurant"],
			handler: controller.restaurantProfileUpdate,
			description: "Update Restaurant Profile",
			pre: [Authentication],
			validate: {
				...restaurantProfileUpdateValidation,
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
				maxBytes: 41943040,
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "form",
					responseMessages: [],
				},
			},
		},
	},

	// change-restaurant's-password
	{
		method: "POST",
		path: "/restaurant-password-change",
		options: {
			tags: ["api", "Restaurant"],
			handler: controller.changeRestaurantPassword,
			description: "Restaurant Profile Password Change",
			pre: [Authentication],
			validate: {
				...restaurantPasswordChangeValidation,
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
];
