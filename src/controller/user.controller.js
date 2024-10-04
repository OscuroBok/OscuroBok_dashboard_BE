const prisma = require("../config/DbConfig");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { ROLES } = require("../utills/constant");

const createUser = async (req, h) => {
	try {
		const { name, email, contact_no, password, role_id } = req.payload;

		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [{ email: email }, { contact_no: contact_no }],
			},
		});

		if (existingUser) {
			if (!existingUser.is_active) {
				return h
					.response({
						success: false,
						message:
							"User profile is not active or has been deleted. Please contact the administrator for assistance.",
					})
					.code(403);
			}
			return h
				.response({
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
			return h.response({ message: "Role not found." }).code(404);
		}

		const uuidCode = uuidv4().substring(0, 5);
		let usercode;

		if (roleExists.role === ROLES.USER) {
			usercode = `US${uuidCode}`;
		} else if (roleExists.role === ROLES.SUPER_ADMIN) {
			usercode = `SA${uuidCode}`;
		} else if (roleExists.role === ROLES.ADMIN) {
			usercode = `AD${uuidCode}`;
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		await prisma.user.create({
			data: {
				name,
				email,
				contact_no,
				password: hashedPassword,
				role_id: roleExists.id,
				usercode,
			},
		});

		return h
			.response({
				success: true,
				message: "User created successfully.",
			})
			.code(201);
	} catch (error) {
		console.log(error);
		return h.response({ message: "Something went wrong", error }).code(500);
	}
};

// profile display
const showUserProfile = async (req, h) => {
	try {
		const userId = req.userId;

		if (!userId) {
			return h.response({ message: "Unauthorized user" }).code(401);
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
				gender: true,
				profile_image: true,
				usercode: true,
				is_active: true,
				profile_remarks: true,
				role: {
					select: {
						id: true,
						role: true,
					},
				},
				created_at: true,
				updated_at: true,
			},
		});

		if (!user.is_active) {
			return h
				.response({
					success: false,
					message:
						"User profile is not active or has been deleted. Please contact the administrator for assistance.",
				})
				.code(403);
		}

		return h
			.response({
				message: "User's profile fetched successfully",
				data: user,
			})
			.code(200);
	} catch (error) {
		console.log(error);
		return h.response({ message: "Something went wrong", error }).code(500);
	}
};

// edit user profile
const editMyProfile = async (req, h) => {
	try {
		const user = req.rootUser;
		const {
			name,
			contact_no,
			street_address,
			city,
			state,
			country,
			pin_code,
			landmark,
			gender,
			profile_image,
		} = req.payload;

		// Fetch existing user data
		const existingUser = await prisma.user.findUnique({
			where: {
				id: user.id,
				is_active: true,
				deleted_at: null,
			},
		});

		const checkSame = [];
		if (name && name === existingUser.name) checkSame.push("Name");
		if (contact_no && contact_no === existingUser.contact_no)
			checkSame.push("Contact number");
		const getMatchingLocationFields = (loc1, loc2) => {
			if (!loc1 || !loc2) return;
			if (loc1.street_address === loc2.street_address)
				checkSame.push("Street Address");
			if (loc1.city === loc2.city) checkSame.push("City");
			if (loc1.state === loc2.state) checkSame.push("State");
			if (loc1.country === loc2.country) checkSame.push("Country");
			if (loc1.pin_code === loc2.pin_code) checkSame.push("Pin Code");
			if (loc1.landmark === loc2.landmark) checkSame.push("Landmark");
		};
		getMatchingLocationFields(location, existingUser.location);
		if (gender && gender === existingUser.gender) checkSame.push("Gender");

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

		let uniqueFilename;
		if (
			profile_image &&
			profile_image.hapi &&
			profile_image.hapi.filename
		) {
			const uploadDir = path.join(__dirname, "..", "uploads");

			// Delete existing profile image if it exists
			if (existingUser && existingUser.profile_image) {
				const existingImagePath = path.join(
					uploadDir,
					existingUser.profile_image
				);
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
		await prisma.user.update({
			where: {
				id: user.id,
				deleted_at: null,
			},
			data: {
				name: name ?? existingUser.name,
				contact_no: contact_no ?? existingUser.contact_no,
				location: {
					street_address:
						street_address ?? existingUser.location?.street_address,
					city: city ?? existingUser.location?.city,
					state: state ?? existingUser.location?.state,
					country: country ?? existingUser.location?.country,
					pin_code: pin_code ?? existingUser.location?.pin_code,
					landmark: landmark ?? existingUser.location?.landmark,
				},
				gender: gender ?? existingUser.gender,
				profile_image: uniqueFilename || existingUser.profile_image,
				profile_remarks: "Profile information updated by the user.",
			},
		});

		return h
			.response({
				success: true,
				message: "Profile updated successfully.",
			})
			.code(200);
	} catch (error) {
		console.log(error);
		return h
			.response({ message: "Error while editing user's profile" })
			.code(500);
	}
};

// change password with existing password
const changeUserPassword = async (req, h) => {
	try {
		const user = req.rootUser;
		const { password, new_password } = req.payload;

		const existingUser = await prisma.user.findUnique({
			where: {
				id: user.id,
				deleted_at: null,
			},
		});

		const isMatch = await bcrypt.compare(password, existingUser.password);
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

		await prisma.user.update({
			where: {
				id: user.id,
				is_active: true,
				deleted_at: null,
			},
			data: {
				password: hashedPassword,
				profile_remarks: "Profile password updated by the user.",
			},
		});

		return h
			.response({
				success: true,
				message: "Password updated successfully.",
			})
			.code(200);
	} catch (error) {
		console.error(
			"An error occurred while changing the user's password.",
			error
		);
		return h
			.response({ message: "Error while updating user's password." })
			.code(500);
	}
};

// profile deletion by user
const profileDeletionByUser = async (req, h) => {
	try {
		const user = req.rootUser;
		const { reason } = req.payload;

		await prisma.user.update({
			where: {
				id: user.id,
				is_active: true,
				deleted_at: null,
			},
			data: {
				is_active: false,
				profile_remarks: "Profile deleted by user.",
				user_deletion_reason: reason,
				deleted_at: new Date(),
			},
		});

		return h
			.response({
				success: true,
				message: "User profile deleted successfully.",
			})
			.code(200);
	} catch (error) {
		console.error(
			"An error occurred while deleting the user's account.",
			error
		);
		return h
			.response({ message: "Error while deleting user's account." })
			.code(500);
	}
};

// profile deletion by admin
const profileDeletionByAdmin = async (req, h) => {
	try {
		const { userId, reason } = req.payload;

		await prisma.user.update({
			where: {
				id: userId,
				is_active: true,
				deleted_at: null,
			},
			data: {
				is_active: false,
				profile_remarks: "Account deleted by Admin.",
				admin_deletion_reason: reason,
				deleted_at: new Date(),
			},
		});

		return h
			.response({
				success: true,
				message: "User profile deleted successfully.",
			})
			.code(200);
	} catch (error) {
		console.error(
			"An error occurred while deleting the user's account.",
			error
		);
		return h
			.response({ message: "Error while deleting user's account." })
			.code(500);
	}
};

// forget password api
module.exports = {
	createUser,
	showUserProfile,
	editMyProfile,
	changeUserPassword,
	profileDeletionByUser,
	profileDeletionByAdmin,
};
