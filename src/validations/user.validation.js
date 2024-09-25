const Joi = require("joi");

const contactNoPattern = /^(\+|\d)[0-9]{7,16}$/;

// user-registration
const createUserValidation = {
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

// edit user details
const editUserValidation = {
  payload: Joi.object({
    name: Joi.string().optional().label("name"),
    contact_no: Joi.string()
      .regex(contactNoPattern)
      .message("Please provide a valid contact number")
      .optional().label("contact_no"),
    street_address: Joi.string().optional().label("street_address"),
    city: Joi.string().optional().label("city"),
    state: Joi.string().optional().label("state"),
    country: Joi.string().optional().label("country"),
    pin_code: Joi.string().optional().label("pin_code"),
    landmark: Joi.string().optional().label("landmark(if any)"),
    gender: Joi.string().optional().label("gender"),
    profile_image: Joi.any()
      .meta({ swaggerType: "file" })
      .description("File to upload")
      .optional()
      .label("profile_image"),
  }),
};

// change password with existing password
const userPasswordChangeValidation = {
  payload: Joi.object({
    password: Joi.string().required().label("password"),
    new_password: Joi.string().required().label("new password"),
  }),
};

// profile deletion by user
const userProfileDeletionValidation = {
  payload: Joi.object({
    reason: Joi.string().required().label("reason"),
  }),
};

// profile deletion by admin
const userProfileDeletionByAdminValidation = {
  payload: Joi.object({
    userId: Joi.number().required().label("userId"),
    reason: Joi.string().required().label("reason"),
  }),
};

module.exports = {
  createUserValidation,
  editUserValidation,
  userPasswordChangeValidation,
  userProfileDeletionValidation,
  userProfileDeletionByAdminValidation,
};
