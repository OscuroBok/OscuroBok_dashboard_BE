const Joi = require("joi");

const contactNoPattern = /^(\+|\d)[0-9]{7,16}$/;

// restaurant-registration
const restaurantAdminValidation = {
	payload: Joi.object({
		name: Joi.string().required().label("name"),
		email: Joi.string().required().label("email"),
		contact_no: Joi.string()
			.regex(contactNoPattern)
			.message("Please provide a valid contact number")
			.required()
			.label("contact_no"),
		password: Joi.string().required().label("password"),
		role_id: Joi.number().required().label("role"),
	}),
};

// restaurant-admin-login
const restaurantLoginValidation = {
	payload: Joi.object({
		email: Joi.string().required().label("email"),
		password: Joi.string().required().label("password"),
	}),
};

// restaurant-admin-profile-update
const restaurantProfileUpdateValidation = {
	payload: Joi.object({
		restaurant_name: Joi.string().optional().label("restaurant_name"),
		owner_name: Joi.string().optional().label("owner_name"),
		contact_no: Joi.string()
			.regex(contactNoPattern)
			.message("Please provide a valid contact number")
			.optional()
			.label("contact_no"),
		address: Joi.string().optional().label("address"),
		whatsapp_no: Joi.string()
			.regex(contactNoPattern)
			.message("Please provide a valid contact number")
			.optional()
			.label("whatsapp_no"),
		geo_loc_lat: Joi.number().optional().label("geo_loc_lat"),
		geo_loc_lng: Joi.number().optional().label("geo_loc_lng"),
		date_of_estd: Joi.date().optional().label("date_of_estd"),
		biography: Joi.string().optional().label("biography"),
		restaurant_capacity: Joi.number()
			.optional()
			.label("reataurant_capacity"),
		restaurant_type: Joi.string().optional().label("restaurant_type"),
		services: Joi.string().optional().label("services"),
		open_time: Joi.string().optional().label("open_time"),
		close_time: Joi.string().optional().label("close_time"),
		types_of_cuisines: Joi.string().optional().label("types_of_cusines"),
		operational_days: Joi.string().optional().label("operational_days"),
		insta_link: Joi.string().optional().label("insta_link"),
		fb_link: Joi.string().optional().label("fb_link"),
		x_link: Joi.string().optional().label("x_link"),
		menu: Joi.string().optional().label("menu"),
		logo: Joi.any()
			.meta({ swaggerType: "file" })
			.description("File to upload")
			.optional()
			.label("logo"),
		cover_img: Joi.any()
			.meta({ swaggerType: "file" })
			.description("File to upload")
			.optional()
			.label("cover_img"),
		rating: Joi.number().optional().label("rating"),
		average_price: Joi.number().optional().label("average_price"),
		restaurant_verification: Joi.string()
			.optional()
			.valid("Pending", "Hold", "Approved", "Rejected")
			.label("restaurant_verification"),
		restaurant_verification_remarks: Joi.string()
			.optional()
			.label("restaurant_verification_remarks"),
		is_active: Joi.boolean().optional().label("is_active"),
		aadhar_no: Joi.string().optional().label("aadhar_no"),
		passport_no: Joi.string().optional().label("passport_no"),
		reg_cert_no: Joi.string().optional().label("reg_cert_no"),
		fssai_no: Joi.string().optional().label("fssai_no"),
		gstin_no: Joi.string().optional().label("gstin_no"),
		aadhar_file: Joi.any()
			.meta({ swaggerType: "file" })
			.description("File to upload")
			.optional()
			.label("aadhar_file"),
		passport_file: Joi.any()
			.meta({ swaggerType: "file" })
			.description("File to upload")
			.optional()
			.label("passport_file"),
		reg_cert_file: Joi.any()
			.meta({ swaggerType: "file" })
			.description("File to upload")
			.optional()
			.label("reg_cert_file"),
		fssai_file: Joi.any()
			.meta({ swaggerType: "file" })
			.description("File to upload")
			.optional()
			.label("fssai_file"),
		gstin_file: Joi.any()
			.meta({ swaggerType: "file" })
			.description("File to upload")
			.optional()
			.label("gstin_file"),
		bank_name: Joi.string().optional().label("bank_name"),
		bank_ac_name: Joi.string().optional().label("bank_ac_name"),
		bank_ac_no: Joi.string().optional().label("bank_ac_no"),
		bank_branch: Joi.string().optional().label("bank_branch"),
		bank_ifsc: Joi.string().optional().label("bank_ifsc"),
		bank_micr: Joi.string().optional().label("bank_micr"),
	}),
};

// change password with existing password
const restaurantPasswordChangeValidation = {
	payload: Joi.object({
		password: Joi.string().required().label("password"),
		new_password: Joi.string().required().label("new_password"),
	}),
};

module.exports = {
	restaurantAdminValidation,
	restaurantLoginValidation,
	restaurantProfileUpdateValidation,
	restaurantPasswordChangeValidation,
};
