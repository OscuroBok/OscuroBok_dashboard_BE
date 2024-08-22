const Joi = require('joi');

const contactNoPattern = /^(\+|\d)[0-9]{7,16}$/;

// user-registration
const createUserValidation = {
    payload: Joi.object({
        name: Joi.string().required().label('name'),
        email: Joi.string().required().label('email'),
        contact_no: Joi.string().regex(contactNoPattern).message('Please provide a valid contact number').required().label('contact_no'),
        location: Joi.string().required().label('location'),
        password: Joi.string().required().label('password'),
        role_id: Joi.number().required().label('role'),
        profile_image: Joi.any()
            .meta({ swaggerType: 'file' })
            .description('File to upload')
            .required().label('profile_image')
    }),
};

// login with email
const loginUserValidation = {
    payload: Joi.object({
        email: Joi.string().required().label('email'),
        password: Joi.string().required().label('password'),
    })
};

// edit user    
const editUserValidation = {
    payload: Joi.object({
        name: Joi.string().required().label('name'),
        contact_no: Joi.string().regex(contactNoPattern).message('Please provide a valid contact number').required().label('contact_no'),
        location: Joi.string().required().label('location'),
        profile_image: Joi.any()
            .meta({ swaggerType: 'file' })
            .description('File to upload')
            .optional().label('profile_image')
    }),
};

module.exports = {
    createUserValidation,
    loginUserValidation,
    editUserValidation,

}