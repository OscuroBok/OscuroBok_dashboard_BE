/*
This file contains functions to seed the database with role, user, restaurant
and admin data. The userSeeder function seeds user profiles, the adminSeeder
function seeds the super admin profile and seedRestaurantProfile seeds the
restaurant profile. The seedAll function runs all seeders one after the other.
Each function logs its progress.
*/

const userSeeder = require("./user.seeder");
const restaurantSeeder = require("./restaurant.seeder");
const { adminSeeder } = require("./admin.seeder");

const seedUserProfile = async () => {
	console.log("Seeding user profile...");
	await userSeeder();
};

const seedAdminProfile = async () => {
	console.log("Seeding admin profile...");
	await adminSeeder();
};

const seedRestaurantProfile = async () => {
	console.log("Seeding restaurant profile...");
	await restaurantSeeder();
};

const seedAll = async () => {
	await seedUserProfile();
	await seedAdminProfile();
	await seedRestaurantProfile();
	console.log("All seeders executed successfully.");
};

module.exports = {
	seedUserProfile,
	seedAdminProfile,
	seedRestaurantProfile,
	seedAll,
};
