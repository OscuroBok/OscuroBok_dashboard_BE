
const Joi = require("joi");

const adminLoginValidation = {
    payload: Joi.object({
        email: Joi.string().email().required().label("email"),
        password: Joi.string().required().label("password"),
    })
}

module.exports = {
    adminLoginValidation,

}