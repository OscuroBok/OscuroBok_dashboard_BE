
const Joi = require("joi");

const adminLoginValidation = {
    payload: Joi.object({
        email: Joi.string().email().required().label("email"),
        password: Joi.string().required().label("password"),
    })
}

const getAllRestaurantsValidation = {
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1).description('Page number for pagination'),
        limit: Joi.number().integer().min(1).max(15).default(5).description('Number of items per page'),
        search_field: Joi.string().valid('restaurant_name', 'contact_no', 'email', 'location', 'restaurant_code', 'restaurant_type').optional().label('search_field'),
        search_input: Joi.string().optional().label('search_input'),
    })
}


module.exports = {
    adminLoginValidation,
    getAllRestaurantsValidation,

}