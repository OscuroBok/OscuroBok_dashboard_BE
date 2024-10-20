/* This module sets up the main routes for version v1 of the API. 
   It imports the routes for users, restaurants and login features 
   and adds them to the server. The module exports the name and version 
   of these routes. 
*/

const user = require("./v1/user.route");
const restaurant = require("./v1/restaurant.route");
const admin = require("./v1/admin.route");
const integrated = require("./v1/integrated.route");

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
