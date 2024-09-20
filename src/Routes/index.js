const user = require("./user.route");
const restaurant = require("./restaurant.route");

module.exports = {
	name: "base-route",
	version: "1.0.0",
	register: (server, options) => {
		server.route(user);
		server.route(restaurant);
	},
};
