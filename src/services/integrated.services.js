const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET;

const userRestaurantLoginService = async(email) => {
    return await prisma.user.findFirst({
        where: {
            email: email,
            deleted_at: null,
        },
        include: {
            role: {
                select: {
                    id: true,
                    role: true
                },
            },
        },
    });
};
const restaurantActiveCheck = async(email) => {
    const restaurant = await prisma.restaurant.findFirst({
        where: { email: email, deleted_at: null },
    });
    if (!restaurant) {
        return {
          success: false,
          message: "Restaurant not found. Please check the email and try again.",
        };
      }
    if(!restaurant.is_active) {
        return {
            success: false,
            message: "Restaurant profile is not active or has been deleted. Please contact the administrator for support.",
		}
    }
    return { success: true };
};
const userRestaurantTokenGenerationService = async (entity, password, role) => {
    const isPasswordValid = await bcrypt.compare(
        password, 
        entity.password
    );

    if (!isPasswordValid) {
        return {
            success: false,
            message: "Invalid password. Please check your password and try again."
        };
    }

    const token = jwt.sign({ 
        email: entity.email, 
        role
    },
    SECRET,
    { 
        expiresIn: "1d"
    }
    );

    return {
        success: true,
        message: "Logged in successfully.",
        token: token,
        role: role
    };
};

export default {
    userRestaurantLoginService,
    userRestaurantTokenGenerationService
};