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
        const restaurants = await prisma.restaurant.findMany({
            where: {
                deleted_at: null,
            }
        });
        return h.response({ success: true, message: "Restaurant list fetched successfully", data: restaurants }).code(200);
    } catch (error) {
        console.log(error)
        return h.response({ message: "Error while fetching restaurant list", error: error }).code(500);
    }
}

module.exports = {
    adminLogin,
    fetchAllRestaurant,
}