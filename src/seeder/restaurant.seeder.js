const prisma = require("../config/DbConfig");
const { ROLES } = require("../utills/constant");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const restaurantSeeder = async (req, h) => {
	try {
		const name = "Restaurant Owner";
		const restaurant_name = "The Grid";
		const email = "restaurant@gmail.com";
		const contact_no = "1234567890";
		const password = "password";
		const geo_location = { lat: "22.5421095", lng: "88.3831058" };
		const hashedPassword = await bcrypt.hash(password, 10);
		const roleExists = await prisma.role.findFirst({
			where: {
				role: ROLES.RESTAURANT_OWNER,
				deleted_at: null,
			},
		});
		if (!roleExists) {
			throw new Error("This user role does not exist.");
		}
		const restaurant = await prisma.restaurant.findFirst({
			where: {
				email: email,
			},
		});
		if (restaurant) {
			if (!restaurant.is_active) {
				return console.log(
					"Restaurant profile is not active or has been deleted. Please contact the administrator for assistance."
				);
			}
			return console.log("Restaurant profile already exists.");
		}
		const restaurant_code = `RST${uuidv4().substring(0, 6)}`;
		await prisma.$transaction(async (prisma) => {
			const user = await prisma.user.create({
				data: {
					name,
					email,
					contact_no,
					password: hashedPassword,
					role_id: roleExists.id,
					usercode: restaurant_code,
				},
			});
			await prisma.restaurant.create({
				data: {
					restaurant_name,
					restaurant_code,
					owner_name: name,
					contact_no,
					email: email,
					password: hashedPassword,
					user_id: user.id,
				},
			});
		});
		console.log("Restaurant Profile seeded successfully.");
	} catch (error) {
		console.error("Error while seeding restaurant profile: ", error);
	}
};

restaurantSeeder()
	.catch((e) => {
		console.log(e);
		process.exit(1);
	})
	.finally(() => {
		prisma.$disconnect();
	});

module.exports = {
	restaurantSeeder,
};
