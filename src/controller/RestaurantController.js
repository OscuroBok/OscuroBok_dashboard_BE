const prisma = require("../config/DbConfig");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { ROLES } = require("../utills/constant");

const restaurantAdminRegistration = async (req, h) => {
	try {
		const { name, email, contact_no, location, password, role_id } =
			req.payload;
		const existingUser = await prisma.user.findFirst({
			where: {
				email: email,
				deleted_at: null,
			},
		});

		if (existingUser) {
			return h
				.response({
					message: "This user already exists. Please login.",
				})
				.code(400);
		}

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
				deleted_at: null,
			},
		});
		if (!roleExists) {
			return h.response({ message: "Role not found." }).code(404);
		}

		const uuidCode = uuidv4().substring(0, 5);
		let usercode;

		switch (roleExists.role) {
			case ROLES.RESTAURANT_OWNER:
				usercode = `OW${uuidCode}`;
				break;
			case ROLES.USER:
				usercode = `US${uuidCode}`;
				break;
			case ROLES.SUPER_ADMIN:
				usercode = `SA${uuidCode}`;
				break;
			case ROLES.ADMIN:
				usercode = `AD${uuidCode}`;
				break;
			default:
				return h.response({ message: "Invalid role." }).code(400);
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: {
				name,
				email,
				contact_no,
				location,
				password: hashedPassword,
				role_id: roleExists.id,
				profile_image: uniqueFilename,
				usercode,
			},
		});

		if (roleExists.role === ROLES.RESTAURANT_OWNER) {
			try {
				const restaurant_code = `RST${uuidv4().substring(0, 5)}`;
				const restaurant = await prisma.restaurant.create({
					data: {
						restaurant_code,
						owner_name: name,
						contact_no,
						email,
						password: hashedPassword,
						address: location,
						user_id: user.id,
					},
				});
				return h
					.response({
						success: true,
						message: "Restaurant profile created successfully.",
						data: restaurant,
					})
					.code(201);
			} catch (error) {
				console.error(error);
				return h
					.response({
						success: false,
						message: "Error creating restaurant profile.",
						error,
					})
					.code(500);
			}
		}

		return h
			.response({
				success: true,
				message: "User created successfully.",
				data: user,
			})
			.code(201);
	} catch (error) {
		console.log(error);
		return h
			.response({ message: "Something went wrong.", error })
			.code(500);
	}
};

// restaurant-admin-login
const restaurantLogin = async (req, h) => {
	try {
		const { email, password } = req.payload;

		const restaurant = await prisma.restaurant.findFirst({
			where: {
				email: email,
				deleted_at: null,
			},
		});

		if (!restaurant) {
			return h.response({ message: "Restaurant profile not found" }).code(404);
		}

		const encryptedPassword = await bcrypt.compare(
			password,
			restaurant.password
		);

		if (!encryptedPassword) {
			return h.response({ message: "Invalid password" }).code(400);
		}

		const token = jwt.sign({ email: restaurant.email }, SECRET, {
			expiresIn: "1d",
		});

		return h
			.response({
				message: "Restaurant profile logged in successfully",
				token: token,
				data: restaurant,
			})
			.code(200);
	} catch (error) {
		console.log(error);
		return h.response({ message: "Error while login.", error }).code(500);
	}
};

// restaurant-admin-profile
const restaurantProfile = async (req, h) => {
	try {
		const userId = req.userId;
		if (!userId) {
			return h.response({ message: "Unauthorized profile" }).code(404);
		}

		const restaurant = await prisma.restaurant.findFirst({
			where: {
				user_id: Number(userId),
			},
		});

		return h
			.response({
				message: "Restaurant profile fetched successfully",
				data: restaurant,
			})
			.code(200);
	} catch (error) {
		console.log(error);
		return h.response({ message: "Something went wrong", error }).code(500);
	}
};

// edit-restaurant-profile
const restaurantProfileUpdate = async (req, h) => {
	try {
		const restaurant = req.rootUser;
		const {
			restaurant_name,
			owner_name,
			contact_no,
			address,
			whatsapp_no,
			email,
			geo_location,
			date_of_estd,
			biography,
			restaurant_capacity,
			restaurant_type,
			services,
			open_time,
			close_time,
			types_of_cuisines,
			operational_days,
			insta_link,
			fb_link,
			x_link,
			menu,
			logo,
			cover_img,
			rating,
			average_price,
			restaurant_verification,
			restaurant_verification_remarks,
			is_active,
			aadhar_no,
			passport_no,
			reg_cert_no,
			fssai_no,
			gstin_no,
			aadhar_file,
			passport_file,
			reg_cert_file,
			fssai_file,
			gstin_file,
			bank_name,
			bank_ac_name,
			bank_ac_no,
			bank_branch,
			bank_ifsc,
			bank_micr,
		} = req.payload;
		const existingRestaurant = await prisma.restaurant.findUnique({
			where: {
				id: restaurant.id,
				deleted_at: null,
			},
		});
		let uniqueFilename;
		if (logo && logo.hapi && logo.hapi.filename) {
			const uploadDir = path.join(__dirname, "..", "uploads");
			if (existingRestaurant && existingRestaurant.logo) {
				const existingImagePath = path.join(
					uploadDir,
					existingRestaurant.logo
				);
				if (fs.existsSync(existingImagePath)) {
					fs.unlinkSync(existingImagePath);
				}
			}

			uniqueFilename = `${Date.now()}_${logo.hapi.filename}`;
			const uploadPath = path.join(uploadDir, uniqueFilename);

			if (!fs.existsSync(uploadDir)) {
				fs.mkdirSync(uploadDir, { recursive: true });
			}
			const fileStream = fs.createWriteStream(uploadPath);
			logo.pipe(fileStream);
		}

		const updatedData = await prisma.restaurant.update({
			where: {
				id: restaurant.id,
				deleted_at: null,
			},
			data: {
				restaurant_name: restaurant_name || existingRestaurant.restaurant_name,
				owner_name: owner_name || existingRestaurant.owner_name,
				contact_no: contact_no || existingRestaurant.contact_no,
				address: address || existingRestaurant.address,
				whatsapp_no: whatsapp_no || existingRestaurant.whatsapp_no,
				email: email || existingRestaurant.email,
				geo_location: geo_location || existingRestaurant.geo_location,
				date_of_estd: date_of_estd || existingRestaurant.date_of_estd,
				biography: biography || existingRestaurant.biography,
				restaurant_capacity:
					restaurant_capacity ||
					existingRestaurant.restaurant_capacity,
				restaurant_type:
					restaurant_type || existingRestaurant.restaurant_type,
				services: services || existingRestaurant.services,
				open_time: open_time || existingRestaurant.open_time,
				close_time: close_time || existingRestaurant.close_time,
				types_of_cuisines:
					types_of_cuisines || existingRestaurant.types_of_cuisines,
				operational_days:
					operational_days || existingRestaurant.operational_days,
				insta_link: insta_link || existingRestaurant.insta_link,
				fb_link: fb_link || existingRestaurant.fb_link,
				x_link: x_link || existingRestaurant.x_link,
				menu: menu || existingRestaurant.menu,
				logo: logo || existingRestaurant.logo,
				cover_img: cover_img || existingRestaurant.cover_img,
				rating: rating || existingRestaurant.rating,
				average_price:
					average_price || existingRestaurant.average_price,
				restaurant_verification:
					restaurant_verification ||
					existingRestaurant.restaurant_verification,
				restaurant_verification_remarks:
					restaurant_verification_remarks ||
					existingRestaurant.restaurant_verification_remarks,
				is_active:
					is_active !== undefined
						? is_active
						: existingRestaurant.is_active,
				aadhar_no: aadhar_no || existingRestaurant.aadhar_no,
				passport_no: passport_no || existingRestaurant.passport_no,
				reg_cert_no: reg_cert_no || existingRestaurant.reg_cert_no,
				fssai_no: fssai_no || existingRestaurant.fssai_no,
				gstin_no: gstin_no || existingRestaurant.gstin_no,
				aadhar_file: aadhar_file || existingRestaurant.aadhar_file,
				passport_file:
					passport_file || existingRestaurant.passport_file,
				reg_cert_file:
					reg_cert_file || existingRestaurant.reg_cert_file,
				fssai_file: fssai_file || existingRestaurant.fssai_file,
				gstin_file: gstin_file || existingRestaurant.gstin_file,
				bank_name: bank_name || existingRestaurant.bank_name,
				bank_ac_name: bank_ac_name || existingRestaurant.bank_ac_name,
				bank_ac_no: bank_ac_no || existingRestaurant.bank_ac_no,
				bank_branch: bank_branch || existingRestaurant.bank_branch,
				bank_ifsc: bank_ifsc || existingRestaurant.bank_ifsc,
				bank_micr: bank_micr || existingRestaurant.bank_micr,
			},
		});

		return h
			.response({
				success: true,
				message: "Restaurant Profile updated successfully.",
				data: updatedData,
			})
			.code(200);
	} catch (error) {
		console.log(error);
		return h
			.response({ message: "Error while editing restaurant's profile" })
			.code(500);
	}
};

module.exports = {
	restaurantAdminRegistration,
	restaurantLogin,
	restaurantProfile,
	restaurantProfileUpdate,
};
