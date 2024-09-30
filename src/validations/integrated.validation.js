const Joi = require("joi");

// user and vendor login
const userVendorLoginValidation = {
	payload: Joi.object({
		email: Joi.string().required().label("email"),
		password: Joi.string().required().label("password"),
	}),
};

module.exports = { userVendorLoginValidation };
