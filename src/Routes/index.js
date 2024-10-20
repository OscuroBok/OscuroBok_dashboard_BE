<<<<<<< HEAD
const admin = require("./admin");
const user = require("./user.route");
const restaurant = require("./restaurant.route");
const integrated = require("./integrated.route");
=======
/* This module sets up the main routes for version v1 of the API. 
   It imports the routes for users, restaurants and login features 
   and adds them to the server. The module exports the name and version 
   of these routes. 
*/

const user = require("./v1/user.route");
const restaurant = require("./v1/restaurant.route");
const admin = require("./v1/admin.route");
const integrated = require("./v1/integrated.route");
>>>>>>> ac7d63706f79cf92b18f19238cacfaebcf151dda

module.exports = {
	name: "base-route-v1",
	version: "1.0.0",
	register: (server, options) => {
		server.route(user);
		server.route(restaurant);
		server.route(admin);
		server.route(integrated);
	},
};
