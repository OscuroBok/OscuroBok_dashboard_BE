const prisma = require("../config/DbConfig");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { ROLES } = require("../utills/constant");

// restaurant-admin-registration
const restaurantAdminRegistration = async (req, h) => {
	try {
		const { name, email, contact_no, password, role_id } = req.payload;
		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [{ email: email }, { contact_no: contact_no }],
				deleted_at: null,
			},
		});

		if (existingUser) {
			return h
				.response({
					success: false,
					message: "This user already exists. Please login.",
				})
				.code(400);
		}

		const roleExists = await prisma.role.findFirst({
			where: {
				id: role_id,
				deleted_at: null,
			},
		});
		if (!roleExists) {
			return h
				.response({ success: false, message: "Role not found." })
				.code(404);
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
			default:
				return h
					.response({ success: false, message: "Invalid role." })
					.code(400);
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: {
				name,
				email,
				contact_no,
				password: hashedPassword,
				role_id: roleExists.id,
				usercode,
			},
		});

		if (roleExists.role === ROLES.RESTAURANT_OWNER) {
			const restaurant_code = `RST${uuidv4().substring(0, 6)}`;
			await prisma.restaurant.create({
				data: {
					restaurant_code,
					owner_name: name,
					contact_no,
					email,
					password: hashedPassword,
					user_id: user.id,
				},
			});
		}

		return h
			.response({
				success: true,
				message:
					roleExists.role === ROLES.RESTAURANT_OWNER
						? "Restaurant profile created successfully."
						: "User created successfully.",
				data: user,
			})
			.code(201);
	} catch (error) {
		console.error(error);
		return h
			.response({
				success: false,
				message: "Something went wrong.",
				error,
			})
			.code(500);
	}
};

// restaurant-admin-login
const restaurantLogin = async (req, h) => {
	try {
		const { email, password } = req.payload;

		const user = await prisma.user.findFirst({
			where: {
				email: email,
				deleted_at: null,
			},
		});

		const restaurant = await prisma.restaurant.findFirst({
			where: { user_id: user.id, deleted_at: null },
		});

		if (!restaurant) {
			return h
				.response({
					success: false,
					message: "Unable to fetch restaurant's profile.",
				})
				.code(404);
		}

		if (!restaurant.is_active) {
			return h
				.response({
					success: false,
					message:
						"Restaurant profile is not active. Please contact the administrator for support.",
				})
				.code(403);
		}

		const encryptedPassword = await bcrypt.compare(
			password,
			restaurant.password
		);

		if (!encryptedPassword) {
			return h
				.response({ success: false, message: "Invalid password" })
				.code(400);
		}

		const token = jwt.sign({ email: restaurant.email }, SECRET, {
			expiresIn: "1d",
		});

		return h
			.response({
				success: true,
				message: "Restaurant profile logged in successfully",
				token: token,
				data: restaurant,
			})
			.code(200);
	} catch (error) {
		console.log(error);
		return h
			.response({ success: false, message: "Error while login.", error })
			.code(500);
	}
};

// restaurant-admin-profile
const restaurantProfile = async (req, h) => {
	try {
		const userId = req.userId;

		const user = await prisma.user.findFirst({
			where: {
				id: Number(userId),
				deleted_at: null,
			},
		});

		const restaurant = await prisma.restaurant.findFirst({
			where: { user_id: user.id, deleted_at: null },
		});

		if (!restaurant) {
			return h
				.response({
					success: false,
					message: "Unable to fetch restaurant's profile.",
				})
				.code(404);
		}

		if (!restaurant.is_active) {
			return h
				.response({
					success: false,
					message:
						"Restaurant profile is not active. Please contact the administrator for support.",
				})
				.code(403);
		}

		return h
			.response({
				success: true,
				message: "Restaurant profile fetched successfully",
				data: restaurant,
			})
			.code(200);
	} catch (error) {
		console.error(error);
		return h
			.response({
				success: false,
				message: "Something went wrong",
				error,
			})
			.code(500);
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
			geo_loc_lat,
			geo_loc_lng,
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

		if ((geo_loc_lat && !geo_loc_lng) || (!geo_loc_lat && geo_loc_lng)) {
			return h
				.response({
					success: false,
					message:
						"Both latitude and longitude must be provided together.",
				})
				.code(400);
		}

		const docNumber = {
			aadhar_no,
			passport_no,
			reg_cert_no,
			fssai_no,
			gstin_no,
		};

		const checkDocNumber = async (field, value) => {
			if (value) {
				const numberExists = await prisma.restaurant.findFirst({
					where: {
						[field]: value,
						id: {
							not: restaurant.id,
						},
						deleted_at: null,
					},
				});
				if (numberExists) {
					return h
						.response({
							success: false,
							message: `The ${field.replace(
								"_",
								" "
							)} you entered is already associated with another account. Please verify and try again.`,
						})
						.code(400);
				}
			}
		};

		const existingRestaurant = await prisma.restaurant.findFirst({
			where: {
				id: restaurant.id,
				is_active: true,
				deleted_at: null,
			},
		});

		const checkFields = async (newValue, existingValue, displayName) => {
			if (newValue && newValue === existingValue) {
				return displayName;
			}
			return null;
		};

		const checks = await Promise.all([
			checkFields(
				restaurant_name,
				existingRestaurant.restaurant_name,
				"Restaurant name"
			),
			checkFields(
				owner_name,
				existingRestaurant.owner_name,
				"Owner name"
			),
			checkFields(
				contact_no,
				existingRestaurant.contact_no,
				"Contact number"
			),
			checkFields(address, existingRestaurant.address, "Address"),
			checkFields(
				whatsapp_no,
				existingRestaurant.whatsapp_no,
				"WhatsApp number"
			),
			checkFields(
				geo_loc_lat,
				existingRestaurant.geo_loc_lat,
				"Geo-location latitude"
			),
			checkFields(
				geo_loc_lng,
				existingRestaurant.geo_loc_lng,
				"Geo-location longitude"
			),
			checkFields(
				date_of_estd,
				existingRestaurant.date_of_estd,
				"Date of establishment"
			),
			checkFields(biography, existingRestaurant.biography, "Biography"),
			checkFields(
				restaurant_capacity,
				existingRestaurant.restaurant_capacity,
				"Restaurant capacity"
			),
			checkFields(
				restaurant_type,
				existingRestaurant.restaurant_type,
				"Restaurant type"
			),
			checkFields(services, existingRestaurant.services, "Services"),
			checkFields(
				open_time,
				existingRestaurant.open_time,
				"Opening time"
			),
			checkFields(
				close_time,
				existingRestaurant.close_time,
				"Closing time"
			),
			checkFields(
				types_of_cuisines,
				existingRestaurant.types_of_cuisines,
				"Types of cuisines"
			),
			checkFields(
				operational_days,
				existingRestaurant.operational_days,
				"Operational days"
			),
			checkFields(
				insta_link,
				existingRestaurant.insta_link,
				"Instagram link"
			),
			checkFields(fb_link, existingRestaurant.fb_link, "Facebook link"),
			checkFields(x_link, existingRestaurant.x_link, "X (Twitter) link"),
			checkFields(menu, existingRestaurant.menu, "Menu"),
			checkFields(rating, existingRestaurant.rating, "Rating"),
			checkFields(
				average_price,
				existingRestaurant.average_price,
				"Average price"
			),
			checkFields(
				restaurant_verification,
				existingRestaurant.restaurant_verification,
				"Restaurant verification status"
			),
			checkFields(
				restaurant_verification_remarks,
				existingRestaurant.restaurant_verification_remarks,
				"Restaurant verification remarks"
			),
			checkFields(
				is_active,
				existingRestaurant.is_active,
				"Active status"
			),
			checkFields(
				aadhar_no,
				existingRestaurant.aadhar_no,
				"Aadhar number"
			),
			checkFields(
				passport_no,
				existingRestaurant.passport_no,
				"Passport number"
			),
			checkFields(
				reg_cert_no,
				existingRestaurant.reg_cert_no,
				"Registration certificate number"
			),
			checkFields(fssai_no, existingRestaurant.fssai_no, "FSSAI number"),
			checkFields(gstin_no, existingRestaurant.gstin_no, "GSTIN number"),
			checkFields(bank_name, existingRestaurant.bank_name, "Bank name"),
			checkFields(
				bank_ac_name,
				existingRestaurant.bank_ac_name,
				"Bank account name"
			),
			checkFields(
				bank_ac_no,
				existingRestaurant.bank_ac_no,
				"Bank account number"
			),
			checkFields(
				bank_branch,
				existingRestaurant.bank_branch,
				"Bank branch"
			),
			checkFields(
				bank_ifsc,
				existingRestaurant.bank_ifsc,
				"Bank IFSC code"
			),
			checkFields(
				bank_micr,
				existingRestaurant.bank_micr,
				"Bank MICR code"
			),
		]);

		const checkSame = checks.filter((result) => result !== null);

		if (checkSame.length > 0) {
			return h
				.response({
					success: false,
					message: `${checkSame.join(
						", "
					)} match the current details in our database. Please modify these fields or leave them blank if no changes are necessary.`,
				})
				.code(400);
		}

		for (const [field, value] of Object.entries(docNumber)) {
			const response = await checkDocNumber(field, value);
			if (response) return response;
		}

		const uploadFile = async (
			file,
			existingFilename,
			uploadDir,
			fieldName
		) => {
			if (!file || !file.hapi || !file.hapi.filename) {
				return existingFilename;
			}

			if (existingFilename) {
				const existingImagePath = path.join(
					uploadDir,
					existingFilename
				);
				if (fs.existsSync(existingImagePath)) {
					fs.unlinkSync(existingImagePath);
				}
			}

			const uniqueFilename = `${Date.now()}_${fieldName}_${
				file.hapi.filename
			}`;
			const uploadPath = path.join(uploadDir, uniqueFilename);

			if (!fs.existsSync(uploadDir)) {
				fs.mkdirSync(uploadDir, { recursive: true });
			}

			const fileStream = fs.createWriteStream(uploadPath);
			file.pipe(fileStream);

			return uniqueFilename;
		};

		const uploadDir = path.join(__dirname, "..", "uploads");

		const [
			logoFilename,
			cover_imgFilename,
			aadharFilename,
			passportFilename,
			regCertFilename,
			fssaiFilename,
			gstinFilename,
		] = await Promise.all([
			uploadFile(logo, existingRestaurant.logo, uploadDir, "logo"),
			uploadFile(
				cover_img,
				existingRestaurant.cover_img,
				uploadDir,
				"cover_img"
			),
			uploadFile(
				aadhar_file,
				existingRestaurant.aadhar_file,
				uploadDir,
				"aadhar_file"
			),
			uploadFile(
				passport_file,
				existingRestaurant.passport_file,
				uploadDir,
				"passport_file"
			),
			uploadFile(
				reg_cert_file,
				existingRestaurant.reg_cert_file,
				uploadDir,
				"reg_cert_file"
			),
			uploadFile(
				fssai_file,
				existingRestaurant.fssai_file,
				uploadDir,
				"fssai_file"
			),
			uploadFile(
				gstin_file,
				existingRestaurant.gstin_file,
				uploadDir,
				"gstin_file"
			),
		]);

		const updatedData = await prisma.restaurant.update({
			where: {
				id: restaurant.id,
				deleted_at: null,
			},
			data: {
				restaurant_name:
					restaurant_name ?? existingRestaurant.restaurant_name,
				owner_name: owner_name ?? existingRestaurant.owner_name,
				contact_no: contact_no ?? existingRestaurant.contact_no,
				address: address ?? existingRestaurant.address,
				whatsapp_no: whatsapp_no ?? existingRestaurant.whatsapp_no,
				geo_loc_lat: geo_loc_lat ?? existingRestaurant.geo_loc_lat,
				geo_loc_lng: geo_loc_lng ?? existingRestaurant.geo_loc_lng,
				date_of_estd: date_of_estd ?? existingRestaurant.date_of_estd,
				biography: biography ?? existingRestaurant.biography,
				restaurant_capacity:
					restaurant_capacity ??
					existingRestaurant.restaurant_capacity,
				restaurant_type:
					restaurant_type ?? existingRestaurant.restaurant_type,
				services: services ?? existingRestaurant.services,
				open_time: open_time ?? existingRestaurant.open_time,
				close_time: close_time ?? existingRestaurant.close_time,
				types_of_cuisines:
					types_of_cuisines ?? existingRestaurant.types_of_cuisines,
				operational_days:
					operational_days ?? existingRestaurant.operational_days,
				insta_link: insta_link ?? existingRestaurant.insta_link,
				fb_link: fb_link ?? existingRestaurant.fb_link,
				x_link: x_link ?? existingRestaurant.x_link,
				menu: menu ?? existingRestaurant.menu,
				logo: logoFilename ?? existingRestaurant.logo,
				cover_img: cover_imgFilename ?? existingRestaurant.cover_img,
				rating: rating ?? existingRestaurant.rating,
				average_price:
					average_price ?? existingRestaurant.average_price,
				restaurant_verification:
					restaurant_verification ??
					existingRestaurant.restaurant_verification,
				restaurant_verification_remarks:
					restaurant_verification_remarks ??
					existingRestaurant.restaurant_verification_remarks,
				is_active: is_active ?? existingRestaurant.is_active,
				aadhar_no: aadhar_no ?? existingRestaurant.aadhar_no,
				passport_no: passport_no ?? existingRestaurant.passport_no,
				reg_cert_no: reg_cert_no ?? existingRestaurant.reg_cert_no,
				fssai_no: fssai_no ?? existingRestaurant.fssai_no,
				gstin_no: gstin_no ?? existingRestaurant.gstin_no,
				aadhar_file: aadharFilename ?? existingRestaurant.aadhar_file,
				passport_file:
					passportFilename ?? existingRestaurant.passport_file,
				reg_cert_file:
					regCertFilename ?? existingRestaurant.reg_cert_file,
				fssai_file: fssaiFilename ?? existingRestaurant.fssai_file,
				gstin_file: gstinFilename ?? existingRestaurant.gstin_file,
				bank_name: bank_name ?? existingRestaurant.bank_name,
				bank_ac_name: bank_ac_name ?? existingRestaurant.bank_ac_name,
				bank_ac_no: bank_ac_no ?? existingRestaurant.bank_ac_no,
				bank_branch: bank_branch ?? existingRestaurant.bank_branch,
				bank_ifsc: bank_ifsc ?? existingRestaurant.bank_ifsc,
				bank_micr: bank_micr ?? existingRestaurant.bank_micr,
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
			.response({
				success: false,
				message: "Error while updating restaurant's profile",
			})
			.code(500);
	}
};

// change password with existing password
const changeRestaurantPassword = async (req, h) => {
	try {
		const restaurant = req.rootUser;
		if (!restaurant) {
			return h
				.response({
					message: "Unauthorized user. Please log in again.",
				})
				.code(401);
		}

		const { password, new_password } = req.payload;

		const existingRestaurant = await prisma.restaurant.findFirst({
			where: {
				id: restaurant.id,
				is_active: true,
				deleted_at: null,
			},
		});

		if (!existingRestaurant) {
			return h.response({ message: "User not found." }).code(404);
		}

		const isMatch = await bcrypt.compare(
			password,
			existingRestaurant.password
		);
		if (!isMatch) {
			return h
				.response({ message: "Invalid current password." })
				.code(400);
		}

		if (password === new_password) {
			return h
				.response({
					message:
						"New password cannot be the same as the current one.",
				})
				.code(400);
		}

		const hashedPassword = await bcrypt.hash(new_password, 10);

		const updatedPassword = await prisma.restaurant.update({
			where: {
				id: restaurant.id,
				deleted_at: null,
			},
			data: {
				password: hashedPassword,
			},
		});

		return h
			.response({
				success: true,
				message: "Password updated successfully.",
				data: updatedPassword,
			})
			.code(200);
	} catch (error) {
		console.error("Error in changeUserPassword:", error);
		return h
			.response({ message: "Error while updating user's password." })
			.code(500);
	}
};

module.exports = {
	restaurantAdminRegistration,
	restaurantLogin,
	restaurantProfile,
	restaurantProfileUpdate,
	changeRestaurantPassword,
};
