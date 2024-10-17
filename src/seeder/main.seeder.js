/* This file has functions to seed the database with role and restaurant data. 
   The adminSeeder function seeds super admin profile and seedRestaurantProfile seeds restaurant 
   profile. The seedAll function runs both seeders one after the other. Each 
   function shows progress with logs. 
*/

const restaurantSeeder = require("./restaurant.seeder");
const { adminSeeder } = require("./admin.seeder");

const seedAdminProfile = async () => {
	console.log("Seeding admin profile...");
	await adminSeeder();
};

const seedRestaurantProfile = async () => {
	console.log("Seeding restaurant profile...");
	await restaurantSeeder();
};

const seedAll = async () => {
	await seedAdminProfile();
	await seedRestaurantProfile();
	console.log("All seeders executed successfully.");
};

module.exports = { seedAdminProfile, seedRestaurantProfile, seedAll };
