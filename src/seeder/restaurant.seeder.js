/* 
The restaurantSeeder function creates a new restaurant profile in the database. 
It checks if the RESTAURANT_OWNER role exists and verifies if the restaurant is 
already registered with the given profile details. If the restaurant doesn't 
exist, it generates a unique restaurant_code and within a transaction, creates 
both a user and a corresponding restaurant profile in the database. Any errors 
during the process are logged and the function ends by disconnecting the Prisma 
client.
*/

const prisma = require("../config/DbConfig");
const { ROLES } = require("../utills/constant");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const restaurantSeeder = async (req, h) => {
	try {
		const owner_name = "Restaurant Owner";
		const restaurant_name = "The Grid";
		const email = "restaurant@gmail.com";
		const contact_no = "1234567890";
		const password = "password";
		const address = {
			street_address: "123 Park Street",
			city: "Kolkata",
			state: "West Bengal",
			country: "India",
			pin_code: "700016",
			landmark: "Near Victoria Memorial",
		};
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
		const restaurant_code = `RST${uuidv4().substring(0, 5)}`;
		await prisma.$transaction(async (prisma) => {
			const user = await prisma.user.create({
				data: {
					name: restaurant_name,
					email,
					contact_no,
					location: address,
					password: hashedPassword,
					role_id: roleExists.id,
					usercode: restaurant_code,
				},
			});
			await prisma.restaurant.create({
				data: {
					restaurant_name,
					restaurant_code,
					owner_name,
					contact_no,
					email,
					password: hashedPassword,
					address,
					geo_location,
					user_id: user.id,
				},
			});
		});
		console.log("Restaurant Profile added in database.");
	} catch (error) {
		console.error("Error while seeding restaurant profile: ", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
};

module.exports = restaurantSeeder;
