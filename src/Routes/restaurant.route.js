const { Authentication } = require("../config/auth");
const controller = require("../controller/restaurant.controller");
const {
	restaurantAdminValidation,
	restaurantProfileUpdateValidation,
	restaurantPasswordChangeValidation,
	restaurantProfileDeletionValidation,
	restaurantProfileDeletionByAdminValidation,
	restaurantPostUploadValidation,
	restaurantPostUpdateValidation,
	restaurantPostDeleteValidation,
	restaurantMenuUploadValidation,
	restaurantMenuUpdateValidation,
	restaurantMenuDeleteValidation,
} = require("../validations/restaurant.validation");

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

	// profile deletion by restaurant
	{
		method: "DELETE",
		path: "/restaurant-profile-deletion",
		options: {
			tags: ["api", "Restaurant"],
			handler: controller.restaurantProfileDeletionByUser,
			description: "Restaurant Profile Deletion by Restaurant",
			pre: [Authentication],
			validate: {
				...restaurantProfileDeletionValidation,
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
		path: "/restaurant-profile-deletion-admin",
		options: {
			tags: ["api", "Restaurant"],
			handler: controller.restaurantProfileDeletionByAdmin,
			description: "Restaurant Profile Deletion by Admin",
			// pre: [Authentication],
			validate: {
				...restaurantProfileDeletionByAdminValidation,
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

	// restaurant-post-uploadation
	{
		method: "POST",
		path: "/restaurant-post-uploadation",
		options: {
			tags: ["api", "Restaurant"],
			handler: controller.restaurantPostUploadation,
			description: "Restaurant Post Uploadation",
			pre: [Authentication],
			validate: {
				...restaurantPostUploadValidation,
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

	// restaurant-post-updation
	{
		method: "GET",
		path: "/restaurant-post",
		options: {
			tags: ["api", "Restaurant"],
			handler: controller.restaurantPosts,
			pre: [Authentication],
			description: "Get Restaurant Post(s)",
		},
	},

	// restaurant-post-updation
	{
		method: "PUT",
		path: "/restaurant-post-update",
		options: {
			tags: ["api", "Restaurant"],
			handler: controller.restaurantPostUpdation,
			description: "Update Restaurant's Post",
			pre: [Authentication],
			validate: {
				...restaurantPostUpdateValidation,
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

	// post deletion by restaurant
	{
		method: "DELETE",
		path: "/restaurant-post-deletion",
		options: {
			tags: ["api", "Restaurant"],
			handler: controller.restaurantPostDeletion,
			description: "Restaurant's Post Deletion by Restaurant",
			pre: [Authentication],
			validate: {
				...restaurantPostDeleteValidation,
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

	// restaurant-menu-uploadation
	{
		method: "POST",
		path: "/restaurant-menu-uploadation",
		options: {
			tags: ["api", "Restaurant"],
			handler: controller.restaurantMenuUploadation,
			description: "Restaurant Menu Uploadation",
			pre: [Authentication],
			validate: {
				...restaurantMenuUploadValidation,
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

	// restaurant-menu-display
	{
		method: "GET",
		path: "/restaurant-menu",
		options: {
			tags: ["api", "Restaurant"],
			handler: controller.restaurantMenuDisplay,
			pre: [Authentication],
			description: "Get Restaurant Menu(s)",
		},
	},

	// restaurant-menu-updation
	{
		method: "PUT",
		path: "/restaurant-menu-update",
		options: {
			tags: ["api", "Restaurant"],
			handler: controller.restaurantMenuUpdation,
			description: "Update Restaurant's Menu",
			pre: [Authentication],
			validate: {
				...restaurantMenuUpdateValidation,
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

	// menu deletion by restaurant
	{
		method: "DELETE",
		path: "/restaurant-menu-deletion",
		options: {
			tags: ["api", "Restaurant"],
			handler: controller.restaurantMenuDeletion,
			description: "Restaurant's Menu Deletion by Restaurant",
			pre: [Authentication],
			validate: {
				...restaurantMenuDeleteValidation,
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

	// restaurant-reviews-display
	{
		method: "GET",
		path: "/restaurant-reviews",
		options: {
			tags: ["api", "Restaurant"],
			handler: controller.fetchRestaurantReviews,
			pre: [Authentication],
			description: "Display Restaurant's Reviews",
		},
	},
];
