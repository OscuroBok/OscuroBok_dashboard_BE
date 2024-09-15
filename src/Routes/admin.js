const { adminAuth } = require("../config/auth");
const controller = require("../controller/Admin/admin");
const { adminLoginValidation } = require("../validations/admin");

module.exports = [
    // login with email
    {
        method: "POST",
        path: "/admin/login",
        options: {
            tags: ["api", "Admin"],
            handler: controller.adminLogin,
            description: "Admin Login",
            // pre: [adminAuth],
            validate: {
                ...adminLoginValidation,
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

        },
    },
]