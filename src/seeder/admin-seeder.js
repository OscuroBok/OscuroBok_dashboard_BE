const prisma = require("../config/DbConfig");
const { ROLES } = require("../utills/constant");
const bcrypt = require('bcrypt');

const adminSeeder = async (req, h) => {
    try {
        const email = "ashis.econstra@gmail.com"
        const password = "password"
        const roleExists = await prisma.role.findFirst({
            where: {
                role: ROLES.SUPER_ADMIN,
                deleted_at: null,
            }
        });
        if (!roleExists) {
            throw new Error("This user role does not exist");
        }
        const admin = await prisma.admin.findFirst({
            where: {
                email: email,
                deleted_at: null,
            }
        });

        if (admin) {
            return console.log("Admin already exists");
        } else {
            const createdAdmin = await prisma.admin.create({
                data: {
                    name: "Super_Admin",
                    email: email,
                    password: await bcrypt.hash(password, 10),
                    contact_no: "7003957953",
                    role_id: roleExists.id,
                }
            });
            console.log("Admin seeded successfully")
        }



    } catch (error) {
        console.log(error)
    }
}


adminSeeder().catch(e => {
    console.log(e);
    process.exit(1);
}).finally(() => {
    prisma.$disconnect();
});

module.exports = {
    adminSeeder,
}