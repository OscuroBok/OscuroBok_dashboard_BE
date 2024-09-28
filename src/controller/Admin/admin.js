const prisma = require("../../config/DbConfig");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { ROLES } = require("../../utills/constant");

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
            h.response({ message: "Admin not found" }).code(404);
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

module.exports = {
    adminLogin,
    fetchAllRestaurant,
    fetchInActiveRestaurants,
    restaurantCounter,

}