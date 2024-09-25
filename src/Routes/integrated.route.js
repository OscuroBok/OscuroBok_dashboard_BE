const controller = require("../controller/integrated.controller");
const { userVendorLoginValidation } = require("../validations/integrated.validation");

module.exports = [
	// user and vendor login
	{
		method: "POST",
		path: "/auth/login",
		options: {
			tags: ["api", "Integrated"],
			handler: controller.userVendorLogin,
			description: "User & Vendor Login",
			validate: {
				...userVendorLoginValidation,
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
];
