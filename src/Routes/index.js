const user = require("./UserRoute");
const restaurant = require("./RestaurantRoute");
const admin = require("./admin");


module.exports = {
	name: "base-route",
	version: "1.0.0",
	register: (server, options) => {
		server.route(user);
		server.route(restaurant);
		server.route(admin);
	},
};
