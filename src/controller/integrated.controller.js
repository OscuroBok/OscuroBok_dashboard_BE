const prisma = require("../config/DbConfig");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;
const { ROLES } = require("../utills/constant");

// user and vendor login
const userVendorLogin = async (req, h) => {
	try {
		const { email, password } = req.payload;

		const user = await prisma.user.findFirst({
			where: {
				email: email,
				deleted_at: null,
			},
			include: {
				role: {
					select: {
						id: true,
						role: true,
					},
				},
			},
		});

		if (!user) {
			return h
				.response({
					success: false,
					message:
						"Profile not found. Re-check your credentials and try again.",
				})
				.code(404);
		}

		if (user.role.role === ROLES.USER) {
			const isPasswordValid = await bcrypt.compare(
				password,
				user.password
			);

			if (!isPasswordValid) {
				return h
					.response({
						success: false,
						message:
							"Invalid password. Please check your password and try again.",
					})
					.code(400);
			}

			const token = jwt.sign(
				{ email: user.email, role: ROLES.USER },
				SECRET,
				{
					expiresIn: "1d",
				}
			);

			return h
				.response({
					success: true,
					message: "Logged in successfully.",
					token: token,
					role: ROLES.USER,
				})
				.code(200);
		}

		if (user.role.role === ROLES.RESTAURANT_OWNER) {
			const restaurant = await prisma.restaurant.findFirst({
				where: { user_id: user.id, deleted_at: null },
			});
			if (!restaurant.is_active) {
				return h
					.response({
						success: false,
						message:
							"Restaurant profile is not active or has been deleted. Please contact the administrator for support.",
					})
					.code(403);
			}

			const isPasswordValid = await bcrypt.compare(
				password,
				restaurant.password
			);

			if (!isPasswordValid) {
				return h
					.response({
						success: false,
						message:
							"Invalid password. Please check your password and try again.",
					})
					.code(400);
			}

			const token = jwt.sign(
				{ email: restaurant.email, role: ROLES.RESTAURANT_OWNER },
				SECRET,
				{
					expiresIn: "1d",
				}
			);

			return h
				.response({
					success: true,
					message: "Logged in successfully.",
					token: token,
					role: ROLES.RESTAURANT_OWNER,
				})
				.code(200);
		}
	} catch (error) {
		console.error(error);
		return h
			.response({
				success: false,
				message: "Error while logging in.",
				error: error.message,
			})
			.code(500);
	}
};

module.exports = { userVendorLogin };
