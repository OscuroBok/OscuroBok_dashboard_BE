const prisma = require("../config/DbConfig");
const { ROLES } = require("../utills/constant");

const roleSeeder = async (req, h) => {
	try {
		const allRoles = Object.values(ROLES);

		const existingRoles = await prisma.role.findMany({
			select: { role: true },
		});

		const existingRoleNames = existingRoles.map((role) => role.role);
		// console.log("existingRoleNames : ", existingRoleNames);

		// Filter out roles that are not already present in the database
		const newRoles = allRoles.filter(
			(role) => !existingRoleNames.includes(role)
		);

		// Add new roles to the database
		if (newRoles.length > 0) {
			await prisma.role.createMany({
				data: newRoles.map((role) => ({ role })),
			});
			console.log("New roles added:", newRoles);
		} else {
			console.log("No new roles to add.");
		}
	} catch (error) {
		console.error("Error while seeding restaurant profile: ", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
};

roleSeeder();

module.exports = roleSeeder;
