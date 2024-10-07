const prisma = require("../../config/DbConfig");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { ROLES } = require("../../utills/constant");
const { tarnsporter } = require("../../helper");

const adminLogin = async (req, h) => {
    try {
        const { email, password } = req.payload;

        const admin = await prisma.admin.findFirst({
            where: {
                email: email,
                deleted_at: null,
            },
            include: {
                role: {
                    select: {
                        id: true,
                        role: true,
                    }
                }
            }
        });


        if (!admin) {
            return h.response({ message: "Admin not found" }).code(404);
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return h.response({ message: "Invalid password" }).code(400);
        }

        const token = jwt.sign({ email: admin.email }, SECRET, {
            expiresIn: "1d",
        });

        return h.response({ success: true, message: "Login successful", token: token, data: admin });


    } catch (error) {
        console.log(error)
        return h.response({ message: "Error while login admin", error: error });
    }
}

// fetch restaurant list
const fetchAllRestaurant = async (req, h) => {
    try {
        const admin = req.rootAdmin;
        if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(admin.role.role)) {
            return h.response({ message: "You are not allowed to access this information!" }).code(401);
        }

        const page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 5;
        if (page < 0) {
            page = 1;
        }
        if (limit <= 0 || limit >= 5) {
            limit = 5;
        }
        const skip = (page - 1) * limit;
        const searchFilters = {};

        if (req.query.search_field && req.query.search_input) {
            const searchField = req.query.search_field;
            const searchInput = req.query.search_input;
            searchFilters[searchField] = { contains: searchInput };
        }


        const restaurants = await prisma.restaurant.findMany({
            skip: skip,
            take: limit,
            where: {
                ...searchFilters,
                deleted_at: null,
            },
            orderBy: {
                id: "desc"
            }
        });

        const totalRestaurants = await prisma.restaurant.count({ where: { deleted_at: null } });
        const totalPages = Math.ceil(totalRestaurants / limit);

        return h.response({
            success: true, message: "Restaurant list fetched successfully",
            data: restaurants,
            meta: {
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
            }
        }).code(200);
    } catch (error) {
        console.log(error)
        return h.response({ message: "Error while fetching restaurant list", error: error }).code(500);
    }
}

// inactive restaurant
const fetchInActiveRestaurants = async (req, h) => {
    try {
        const admin = req.rootAdmin;
        if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(admin.role.role)) {
            return h.response({ message: "You are not allowed to access this information!" }).code(401);
        }

        const page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 5;
        if (page < 0) {
            page = 1;
        }
        if (limit <= 0 || limit >= 5) {
            limit = 5;
        }
        const skip = (page - 1) * limit;

        const searchFilters = {};

        if (req.query.search_field && req.query.search_input) {
            const searchField = req.query.search_field;
            const searchInput = req.query.search_input;
            searchFilters[searchField] = { contains: searchInput };
        }

        const inactiveRestaurants = await prisma.restaurant.findMany({
            skip: skip,
            take: limit,
            where: {
                ...searchFilters,
                deleted_at: null,
                is_active: false,
            }
        });

        const totalRestaurants = await prisma.restaurant.count({
            where: {
                deleted_at: null,
                is_active: false,
            }
        });
        const totalPages = Math.ceil(totalRestaurants / limit);

        return h.response({
            message: "Inactive restaurants fetched successfully.",
            data: inactiveRestaurants,
            meta: {
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
            }

        }).code(200)
    } catch (error) {
        console.log(error);
        return h.response({ message: "Error while fetching inactive restaurant list", error }).code(500);
    }
}

// counter api
const restaurantCounter = async (req, h) => {
    try {
        const admin = req.rootAdmin;
        if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(admin.role.role)) {
            return h.response({ message: "You are not allowed to access this information!" }).code(401);
        }
        const [active, inActive, unVerified,] = await Promise.all([
            prisma.restaurant.count({
                where: {
                    deleted_at: null,
                    is_active: true,
                }
            }),


            prisma.restaurant.count({
                where: {
                    deleted_at: null,
                    is_active: false,
                }
            }),

            prisma.restaurant.count({
                where: {
                    deleted_at: null,
                    restaurant_verification: "Pending",
                }
            }),


        ]);

        return h.response({
            success: true, message: "All data counted successfully.",
            data: {
                active_restaurants: active,
                inActive_restaurants: inActive,
                unVerified_restaurants: unVerified
            }
        });
    } catch (error) {
        console.log(error);
        return h.response({ message: "Error while counting restaurant's data", error }).code(500);
    }
}

// restaurants status update 
const updateRestaurantsStatus = async (req, h) => {
    try {
        const admin = req.rootAdmin;
        if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(admin.role.role)) {
            return h.response({ message: "You are not allowed to access this information!" }).code(401);
        }


    } catch (error) {
        console.log(error);
        return h.response({ message: "Error while updating restaurant status", error }).code(500);
    }
}

//  forget password (sent otp)
const sentOtpForForgetpassword = async (req, h) => {
    try {
        const { email } = req.payload;
        const OTP = Math.floor(100000 + Math.random() * 900000).toString();

        const adminExists = await prisma.admin.findFirst({
            where: {
                email: email,
                deleted_at: null,
            }
        });
        if (!adminExists) {
            return h.response({ message: `Admin not found with ${email} mail id` }).code(404);
        }

        const verificationExists = await prisma.verification.findFirst({
            where: {
                email: email,
            }
        });

        if (verificationExists) {
            const updateOTP = await prisma.verification.update({
                where: {
                    id: verificationExists.id,
                },
                data: {
                    otp: OTP,
                    isVerified: false,
                    otp_expired: false,
                }
            });

            setTimeout(async () => {
                await prisma.verification.update({
                    where: {
                        id: updateOTP.id,
                    },
                    data: {
                        otp_expired: true,
                    }
                });
                console.log(`OTP for ${email} has expired.`);
            }, 120000);  // => 2min

            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: "Sending Eamil For Otp VERIFICATION",
                text: `Use this OTP for verification :- ${OTP}`
            };

            tarnsporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("error", error);
                    h.response({ message: "Email not sent" }).code(400);
                } else {
                    console.log("Email sent", info.response);
                    h.response.json({ message: "Email sent Successfully" });
                }
            });

            return h.response({ message: "OTP created successfully.This otp is valid up to 2 minute", data: updateOTP }).code(201);
        } else {
            const createOTP = await prisma.verification.create({
                data: {
                    email: email,
                    otp: OTP,
                    isVerified: false,
                    otp_expired: false,
                }
            });

            setTimeout(async () => {
                await prisma.verification.update({
                    where: {
                        id: createOTP.id,
                    },
                    data: {
                        otp_expired: true,
                    }
                });
                console.log(`OTP for ${email} has expired.`);
            }, 120000);  // => 2min

            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: "Sending Eamil For Otp VERIFICATION",
                text: `Use this OTP for verification :- ${OTP}`
            };

            tarnsporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("error", error);
                    h.response({ message: "Email not sent" }).code(400);
                } else {
                    console.log("Email sent", info.response);
                    h.response.json({ message: "Email sent Successfully" });
                }
            });

            return h.response({ message: "OTP created successfully.This otp is valid up to 2 minute", data: createOTP }).code(201);
        }


    } catch (error) {
        console.log(error);
        return h.response({ message: "Error while sending OTP for forgot password", error }).code(500);
    }
}

//  forget password (verify otp)
const verifyOTP = async (req, h) => {
    try {
        const { email, otp } = req.payload;
        const existingEmail = await prisma.verification.findFirst({
            where: {
                email,
            }
        });

        if (!existingEmail) {
            return h.response({ message: `Otp has not generated for ${email}.` }).code(400).takeover();
        }

        if (existingEmail.otp !== otp) {
            return h.response({ message: "You have entered a wrong OTP" }).code(400).takeover();
        }

        if (existingEmail.otp_expired === true) {
            return h.response({ message: "Otp has expired. Please generate new OTP." }).code(400).takeover();
        }

        const verified = await prisma.verification.update({
            where: {
                id: existingEmail.id,
            },
            data: {
                isVerified: true,
            }
        });

        setTimeout(async () => {
            await prisma.verification.update({
                where: {
                    id: verified.id,
                },
                data: {
                    otp_expired: true,
                    isVerified: false,
                }
            });
            console.log(`OTP for ${email} has expired.`);
        }, 120000);  // => 2min

        return h.response({ message: "OTP verified successfully", data: verified }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Error while verifying OTP", error }).code(500);
    }
}

// change password after verification
const resetPasswordAfterVerification = async (req, h) => {
    try {
        const { email, newPassword } = req.payload;
        const existingEmail = await prisma.verification.findFirst({
            where: {
                email,
            }
        });

        if (!existingEmail) {
            return h.response({ message: `Otp has not generated for ${email}.` }).code(400).takeover();
        }
        if (existingEmail.otp_expired === true) {
            return h.response({ message: "Otp has expired. Please generate new OTP." }).code(400).takeover();
        }
        if (existingEmail.isVerified === false) {
            return h.response({ message: "Otp has not been verified. Please verify the OTP." }).code(400).takeover();
        }
        if (existingEmail.otp_expired === true) {
            return h.response({ message: "OTP has expired. Please generate a new OTP." }).code(400).takeover();
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedAdmin = await prisma.admin.update({
            where: {
                email: email,
            },
            data: {
                password: hashedPassword,
            }
        });
        return h.response({ message: "Password reset successfully", data: updatedAdmin }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Error while changing password", error }).code(500);
    }
}
module.exports = {
    adminLogin,
    fetchAllRestaurant,
    fetchInActiveRestaurants,
    restaurantCounter,
    sentOtpForForgetpassword,
    verifyOTP,
    resetPasswordAfterVerification,

}