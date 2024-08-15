const prisma = require("../config/DbConfig")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { ROLES } = require("../utills/constant");

const createUser = async (req, h) => {
    try {
        const { name, email, contact_no, location, password, role_id } = req.payload;

        const existingUser = await prisma.user.findFirst({
            where: {
                email: email,
                deleted_at: null,
            },
        });

        if (existingUser) {
            return h.response({ message: "This user already exists. Please login." }).code(400);
        }

        // file upload
        const { profile_image: file } = req.payload;
        const uploadDir = path.join(__dirname, "..", "uploads");
        const uniqueFilename = `${Date.now()}_${file.hapi.filename}`;
        const uploadPath = path.join(uploadDir, uniqueFilename);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const fileStream = fs.createWriteStream(uploadPath);
        file.pipe(fileStream);

        const roleExists = await prisma.role.findFirst({
            where: {
                id: role_id,
                deleted_at: null
            }
        });
        if (!roleExists) {
            return h.response({ message: "Role not found." }).code(404);
        }

        const uuidCode = uuidv4().substring(0, 5);
        let usercode;

        if (roleExists.role === ROLES.RESTAURANT_OWNER) {
            usercode = `OW${uuidCode}`
        } else if (roleExists.role === ROLES.USER) {
            usercode = `US${uuidCode}`
        } else if (roleExists.role === ROLES.SUPER_ADMIN) {
            usercode = `SA${uuidCode}`
        } else if (roleExists.role === ROLES.ADMIN) {
            usercode = `AD${uuidCode}`
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name, email, contact_no, location, password: hashedPassword, role_id: roleExists.id,
                profile_image: uniqueFilename, usercode,
            },
        });

        return h.response({ success: true, message: "User created successfully.", data: user }).code(201);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Something went wrong", error }).code(500);
    }
};

// User login with email
const userLogin = async (req, h) => {
    try {
        const { email, password } = req.payload;

        const user = await prisma.user.findFirst({
            where: {
                email: email,
                deleted_at: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                contact_no: true,
                location: true,
                password: true,
                profile_image: true,
                usercode: true,
                role: {
                    select: {
                        id: true,
                        role: true,
                    }
                },
                created_at: true,
            }
        });
        if (!user) {
            return h.response({ message: "User not found" }).code(404);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return h.response({ message: "Invalid password" }).code(400);
        }
        const token = jwt.sign({ email: user.email }, SECRET, {
            expiresIn: "1d"
        });

        return h.response({ message: "Login sucessfully", token: token, data: user }).code(200);

    } catch (error) {
        console.log(error);
        return h.response({ message: "Error while login", error }).code(500);
    }
};

// profile_image
const me = async (req, h) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return h.response({ message: "Unauthorized user" }).code(404);
        }

        const user = await prisma.user.findFirst({
            where: {
                id: Number(userId),
            },
            select: {
                id: true,
                name: true,
                email: true,
                contact_no: true,
                location: true,
                password: true,
                profile_image: true,
                usercode: true,
                role: {
                    select: {
                        id: true,
                        role: true,
                    }
                },
                created_at: true,
                updated_at: true,
            }
        });

        return h.response({ message: "User profile_image fetched successfully", data: user }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Something went wrong", error }).code(500);
    }
}

// edit user profile
const editMyProfile = async (req, h) => {
    try {
        const user = req.rootUser;
        const { name, contact_no, location, profile_image } = req.payload;

        // Fetch existing user data
        const existingUser = await prisma.user.findUnique({
            where: {
                id: user.id,
                deleted_at: null,
            },
        });

        let uniqueFilename;
        if (profile_image && profile_image.hapi && profile_image.hapi.filename) {
            const uploadDir = path.join(__dirname, "..", "uploads");

            // Delete existing profile image if it exists
            if (existingUser && existingUser.profile_image) {
                const existingImagePath = path.join(uploadDir, existingUser.profile_image);
                if (fs.existsSync(existingImagePath)) {
                    fs.unlinkSync(existingImagePath);
                }
            }

            uniqueFilename = `${Date.now()}_${profile_image.hapi.filename}`;
            const uploadPath = path.join(uploadDir, uniqueFilename);

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const fileStream = fs.createWriteStream(uploadPath);
            profile_image.pipe(fileStream);
        }

        const updatedData = await prisma.user.update({
            where: {
                id: user.id,
                deleted_at: null,
            },
            data: {
                name,
                contact_no,
                location,
                profile_image: uniqueFilename || existingUser.profile_image
            }
        });

        return h.response({ success: true, message: "Profile updated successfully.", data: updatedData }).code(200);

    } catch (error) {
        console.log(error);
        return h.response({ message: "Error while editing user's profile" }).code(500);
    }
}


module.exports = {
    createUser,
    userLogin,
    me,
    editMyProfile,

}