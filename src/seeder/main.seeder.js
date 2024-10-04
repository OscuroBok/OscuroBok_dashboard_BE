/* This file has functions to seed the database with role and restaurant data. 
   The seedRoles function seeds roles and seedRestaurantProfile seeds restaurant 
   profiles. The seedAll function runs both seeders one after the other. Each 
   function shows progress with logs. */

const roleSeeder = require("./role-seeder");
const restaurantSeeder = require("./restaurant.seeder");

const seedRoles = async () => {
	console.log("Seeding roles...");
	await roleSeeder();
	console.log("Roles seeded successfully.");
};

const seedRestaurantProfile = async () => {
	console.log("Seeding restaurants...");
	await restaurantSeeder();
	console.log("Restaurants seeded successfully.");
};

const seedAll = async () => {
	await seedRoles();
	await seedRestaurantProfile();
	console.log("All seeders executed successfully.");
};

module.exports = { seedRoles, seedRestaurantProfile, seedAll };
