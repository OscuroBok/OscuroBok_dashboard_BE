<<<<<<< HEAD
const user = require("./UserRoute");
const restaurant = require("./RestaurantRoute");
const admin = require("./admin");

=======
const user = require("./user.route");
const restaurant = require("./restaurant.route");
const integrated = require("./integrated.route");
>>>>>>> 8517a4f29460ab8d33c0e774801ace9827067692

module.exports = {
	name: "base-route",
	version: "1.0.0",
	register: (server, options) => {
		server.route(user);
		server.route(restaurant);
<<<<<<< HEAD
		server.route(admin);
=======
		server.route(integrated);
>>>>>>> 8517a4f29460ab8d33c0e774801ace9827067692
	},
};
