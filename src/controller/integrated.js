import { userRestaurantLoginService, userRestaurantTokenGenerationService } from '../services/integrated.services.js';
import { ROLES } from "../utills/constant";

// user and vendor login
const userVendorLogin = async (req, h) => {
	try {
		const { email, password } = req.payload;

		const user = await userRestaurantLoginService(email);

		if (!user) {
			return h
				.response({
					success: false,
					message:
						"Profile not found. Re-check your credentials and try again.",
				})
				.code(404);
		}

		if (user.role.role === ROLES.USER) {
			const result = await userRestaurantTokenGenerationService(user, password, ROLES.USER)
			return h.response(result).code(result.success ? 200 : 400);
		}

		if (user.role.role === ROLES.RESTAURANT_OWNER) {

			const restaurantActiveChecker = await restaurantActiveCheck(email)
            
            if(!restaurantActiveChecker.success){
                return h.response(restaurantActiveChecker).code(403);
            }
            
            const result2 = await userRestaurantTokenGenerationService(restaurant, password, ROLES.RESTAURANT_OWNER)
            return h.response(result2).code(result2.success ? 200 : 400);
        }	

	} catch (error) {
		console.error(error);
		return h
			.response({
				success: false,
				message: "Error while logging in.",
				error: error.message,
			})
			.code(500);
	}
};

const userVendorForgetPassword = {

};

export default { userVendorLogin };
