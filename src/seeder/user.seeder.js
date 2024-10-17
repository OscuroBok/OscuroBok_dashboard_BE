/*
The userSeeder function creates a new user profile in the database. It
checks if the USER role exists and verifies if the user is already
registered with the given profile details. If the user doesn't exist, it
generates a unique user_code and creates a user profile in the database.
Any errors during the process are logged and the function ends by
disconnecting the Prisma client.
*/

const prisma = require("../config/DbConfig");
const { ROLES } = require("../utills/constant");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const userSeeder = async (req, h) => {
	try {
		const name = "The User";
		const email = "user@gmail.com";
		const contact_no = "9876543210";
		const location = {
			street_address: "123 Park Street",
			city: "Kolkata",
			state: "West Bengal",
			country: "India",
			pin_code: "700016",
			landmark: "Near Victoria Memorial",
		};
		const password = "password";
		const gender = "MALE";
		const hashedPassword = await bcrypt.hash(password, 10);
		const roleExists = await prisma.role.findFirst({
			where: {
				role: ROLES.USER,
				deleted_at: null,
			},
		});
		if (!roleExists) {
			throw new Error("This user role does not exist.");
		}
		const user = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});
		if (user) {
			if (!user.is_active) {
				return console.log(
					"User profile is not active or has been deleted. Please contact the administrator for assistance."
				);
			}
			return console.log("User profile already exists.");
		}
		const user_code = `US${uuidv4().substring(0, 5)}`;
		await prisma.user.create({
			data: {
				name,
				email,
				contact_no,
				password: hashedPassword,
				role_id: roleExists.id,
				usercode: user_code,
				location,
				gender,
			},
		});
		console.log("User Profile added in database.");
	} catch (error) {
		console.error("Error while seeding user profile: ", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
};

module.exports = userSeeder;
