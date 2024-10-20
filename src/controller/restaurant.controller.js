const prisma = require("../config/DbConfig");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { ROLES } = require("../utills/constant");

// restaurant-admin-registration
const restaurantAdminRegistration = async (req, h) => {
	try {
		const { name, email, contact_no, password, role_id } = req.payload;

		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [{ email: email }, { contact_no: contact_no }],
			},
		});

		if (existingUser) {
			if (!existingUser.is_active) {
				return h
					.response({
						success: false,
						message:
							"Restaurant profile is not active or has been deleted. Please contact the administrator for assistance.",
					})
					.code(403);
			}
			return h
				.response({
					success: false,
					message: "This user already exists. Please login.",
				})
				.code(400);
		}

		const roleExists = await prisma.role.findFirst({
			where: {
				id: role_id,
				deleted_at: null,
			},
		});
		if (!roleExists) {
			return h
				.response({ success: false, message: "Role not found." })
				.code(404);
		}

		const uuidCode = uuidv4().substring(0, 5);
		let usercode;

		switch (roleExists.role) {
			case ROLES.RESTAURANT_OWNER:
				usercode = `OW${uuidCode}`;
				break;
			case ROLES.USER:
				usercode = `US${uuidCode}`;
				break;
			default:
				return h
					.response({ success: false, message: "Invalid role." })
					.code(400);
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		await prisma.$transaction(async (prisma) => {
			const user = await prisma.user.create({
				data: {
					name,
					email,
					contact_no,
					password: hashedPassword,
					role_id: roleExists.id,
					usercode,
				},
			});

			if (roleExists.role === ROLES.RESTAURANT_OWNER) {
				const restaurant_code = `RST${uuidv4().substring(0, 6)}`;
				await prisma.restaurant.create({
					data: {
						restaurant_name: name,
						restaurant_code,
						contact_no,
						email,
						password: hashedPassword,
						user_id: user.id,
					},
				});
			}
		});

		return h
			.response({
				success: true,
				message: "Restaurant profile created successfully.",
			})
			.code(201);
	} catch (error) {
		console.error(error);
		return h
			.response({
				success: false,
				message: "Something went wrong.",
				error,
			})
			.code(500);
	}
};

// restaurant-admin-profile
const restaurantProfile = async (req, h) => {
	try {
		const userId = req.userId;

		const user = await prisma.user.findFirst({
			where: {
				id: Number(userId),
				deleted_at: null,
			},
		});

		const restaurant = await prisma.restaurant.findFirst({
			where: { user_id: user.id, deleted_at: null },
			select: {
				id: true,
				restaurant_name: true,
				restaurant_code: true,
				owner_name: true,
				contact_no: true,
				whatsapp_no: true,
				email: true,
				address: true,
				geo_location: true,
				date_of_estd: true,
				biography: true,
				restaurant_capacity: true,
				night_life: true,
				services: true,
				open_time: true,
				close_time: true,
				types_of_cuisines: true,
				operational_days: true,
				insta_link: true,
				fb_link: true,
				x_link: true,
				logo: true,
				cover_img: true,
				rating: 0,
				average_price: true,
				restaurant_verification: true,
				is_active: true,
				aadhar_no: true,
				passport_no: true,
				reg_cert_no: true,
				fssai_no: true,
				gstin_no: true,
				aadhar_file: true,
				passport_file: true,
				reg_cert_file: true,
				fssai_file: true,
				gstin_file: true,
				bank_name: true,
				bank_ac_name: true,
				bank_ac_no: true,
				bank_branch: true,
				bank_ifsc: true,
				bank_micr: true,
				total_sales: true,
				order_count: true,
				followers: true,
			},
		});

		if (!restaurant) {
			return h
				.response({
					success: false,
					message: "Unable to fetch restaurant's profile.",
				})
				.code(404);
		}

		if (!restaurant.is_active) {
			return h
				.response({
					success: false,
					message:
						"Restaurant profile is not active or has been deleted. Please contact the administrator for support.",
				})
				.code(403);
		}

		return h
			.response({
				success: true,
				message: "Restaurant profile fetched successfully",
				data: restaurant,
			})
			.code(200);
	} catch (error) {
		console.error(error);
		return h
			.response({
				success: false,
				message: "Something went wrong",
				error,
			})
			.code(500);
	}
};

// edit-restaurant-profile
const restaurantProfileUpdate = async (req, h) => {
	try {
		const restaurant = req.rootUser;
		const {
			restaurant_name,
			owner_name,
			contact_no,
			street_address,
			city,
			state,
			country,
			pin_code,
			landmark,
			whatsapp_no,
			geo_loc_lat,
			geo_loc_lng,
			date_of_estd,
			biography,
			restaurant_capacity,
			night_life,
			services,
			open_time,
			close_time,
			types_of_cuisines,
			operational_days,
			insta_link,
			fb_link,
			x_link,
			menu,
			logo,
			cover_img,
			rating,
			average_price,
			restaurant_verification,
			restaurant_verification_remarks,
			is_active,
			aadhar_no,
			passport_no,
			reg_cert_no,
			fssai_no,
			gstin_no,
			aadhar_file,
			passport_file,
			reg_cert_file,
			fssai_file,
			gstin_file,
			bank_name,
			bank_ac_name,
			bank_ac_no,
			bank_branch,
			bank_ifsc,
			bank_micr,
		} = req.payload;

		if ((geo_loc_lat && !geo_loc_lng) || (!geo_loc_lat && geo_loc_lng)) {
			return h
				.response({
					success: false,
					message:
						"Both latitude and longitude must be provided together.",
				})
				.code(400);
		}

		const docNumber = {
			aadhar_no,
			passport_no,
			reg_cert_no,
			fssai_no,
			gstin_no,
		};

		const checkDocNumber = async (field, value) => {
			if (value) {
				const numberExists = await prisma.restaurant.findFirst({
					where: {
						[field]: value,
						id: {
							not: restaurant.id,
						},
						deleted_at: null,
					},
				});
				if (numberExists) {
					return h
						.response({
							success: false,
							message: `The ${field.replace(
								"_",
								" "
							)} you entered is already associated with another account. Please verify and try again.`,
						})
						.code(400);
				}
			}
		};

		const existingRestaurant = await prisma.restaurant.findFirst({
			where: {
				id: restaurant.id,
				is_active: true,
				deleted_at: null,
			},
		});

		const checkFields = async (newValue, existingValue, displayName) => {
			if (newValue && existingValue && newValue === existingValue) {
				return displayName;
			}
			return null;
		};

		const checks = await Promise.all([
			checkFields(
				restaurant_name,
				existingRestaurant.restaurant_name,
				"Restaurant name"
			),
			checkFields(
				owner_name,
				existingRestaurant.owner_name,
				"Owner name"
			),
			checkFields(
				contact_no,
				existingRestaurant.contact_no,
				"Contact number"
			),
			checkFields(
				street_address,
				existingRestaurant.address?.street_address,
				"Street Address"
			),
			checkFields(city, existingRestaurant.address?.city, "City"),
			checkFields(state, existingRestaurant.address?.state, "State"),
			checkFields(
				country,
				existingRestaurant.address?.country,
				"Country"
			),
			checkFields(
				pin_code,
				existingRestaurant.address?.pin_code,
				"Pin Code"
			),
			checkFields(
				landmark,
				existingRestaurant.address?.landmark,
				"Landmark"
			),
			checkFields(
				whatsapp_no,
				existingRestaurant.whatsapp_no,
				"WhatsApp number"
			),
			checkFields(
				geo_loc_lat,
				existingRestaurant.geo_location?.lat,
				"Geo-location latitude"
			),
			checkFields(
				geo_loc_lng,
				existingRestaurant.geo_location?.lng,
				"Geo-location longitude"
			),
			checkFields(
				date_of_estd,
				existingRestaurant.date_of_estd,
				"Date of establishment"
			),
			checkFields(biography, existingRestaurant.biography, "Biography"),
			checkFields(
				restaurant_capacity,
				existingRestaurant.restaurant_capacity,
				"Restaurant capacity"
			),
			checkFields(
				night_life,
				existingRestaurant.night_life,
				"Restaurant capacity"
			),
			checkFields(services, existingRestaurant.services, "Services"),
			checkFields(
				open_time,
				existingRestaurant.open_time,
				"Opening time"
			),
			checkFields(
				close_time,
				existingRestaurant.close_time,
				"Closing time"
			),
			checkFields(
				types_of_cuisines,
				existingRestaurant.types_of_cuisines,
				"Types of cuisines"
			),
			checkFields(
				operational_days,
				existingRestaurant.operational_days,
				"Operational days"
			),
			checkFields(
				insta_link,
				existingRestaurant.insta_link,
				"Instagram link"
			),
			checkFields(fb_link, existingRestaurant.fb_link, "Facebook link"),
			checkFields(x_link, existingRestaurant.x_link, "X (Twitter) link"),
			checkFields(menu, existingRestaurant.menu, "Menu"),
			checkFields(rating, existingRestaurant.rating, "Rating"),
			checkFields(
				average_price,
				existingRestaurant.average_price,
				"Average price"
			),
			checkFields(
				restaurant_verification,
				existingRestaurant.restaurant_verification,
				"Restaurant verification status"
			),
			checkFields(
				restaurant_verification_remarks,
				existingRestaurant.restaurant_verification_remarks,
				"Restaurant verification remarks"
			),
			checkFields(
				is_active,
				existingRestaurant.is_active,
				"Active status"
			),
			checkFields(
				aadhar_no,
				existingRestaurant.aadhar_no,
				"Aadhar number"
			),
			checkFields(
				passport_no,
				existingRestaurant.passport_no,
				"Passport number"
			),
			checkFields(
				reg_cert_no,
				existingRestaurant.reg_cert_no,
				"Registration certificate number"
			),
			checkFields(fssai_no, existingRestaurant.fssai_no, "FSSAI number"),
			checkFields(gstin_no, existingRestaurant.gstin_no, "GSTIN number"),
			checkFields(bank_name, existingRestaurant.bank_name, "Bank name"),
			checkFields(
				bank_ac_name,
				existingRestaurant.bank_ac_name,
				"Bank account name"
			),
			checkFields(
				bank_ac_no,
				existingRestaurant.bank_ac_no,
				"Bank account number"
			),
			checkFields(
				bank_branch,
				existingRestaurant.bank_branch,
				"Bank branch"
			),
			checkFields(
				bank_ifsc,
				existingRestaurant.bank_ifsc,
				"Bank IFSC code"
			),
			checkFields(
				bank_micr,
				existingRestaurant.bank_micr,
				"Bank MICR code"
			),
		]);

		const checkSame = checks.filter((result) => result !== null);

		if (checkSame.length > 0) {
			return h
				.response({
					success: false,
					message: `${checkSame.join(
						", "
					)} match the current details in our database. Please modify these fields or leave them blank if no changes are necessary.`,
				})
				.code(400);
		}

		for (const [field, value] of Object.entries(docNumber)) {
			const response = await checkDocNumber(field, value);
			if (response) return response;
		}

		const uploadFile = async (
			file,
			existingFilename,
			uploadDir,
			fieldName
		) => {
			if (!file || !file.hapi || !file.hapi.filename) {
				return existingFilename;
			}

			if (existingFilename) {
				const existingImagePath = path.join(
					uploadDir,
					existingFilename
				);
				if (fs.existsSync(existingImagePath)) {
					fs.unlinkSync(existingImagePath);
				}
			}

			const uniqueFilename = `${Date.now()}_${fieldName}_${
				file.hapi.filename
			}`;
			const uploadPath = path.join(uploadDir, uniqueFilename);

			if (!fs.existsSync(uploadDir)) {
				fs.mkdirSync(uploadDir, { recursive: true });
			}

			const fileStream = fs.createWriteStream(uploadPath);
			file.pipe(fileStream);

			return uniqueFilename;
		};

		const uploadDir = path.join(__dirname, "..", "uploads");

		const [
			logoFilename,
			cover_imgFilename,
			aadharFilename,
			passportFilename,
			regCertFilename,
			fssaiFilename,
			gstinFilename,
		] = await Promise.all([
			uploadFile(logo, existingRestaurant.logo, uploadDir, "logo"),
			uploadFile(
				cover_img,
				existingRestaurant.cover_img,
				uploadDir,
				"cover_img"
			),
			uploadFile(
				aadhar_file,
				existingRestaurant.aadhar_file,
				uploadDir,
				"aadhar_file"
			),
			uploadFile(
				passport_file,
				existingRestaurant.passport_file,
				uploadDir,
				"passport_file"
			),
			uploadFile(
				reg_cert_file,
				existingRestaurant.reg_cert_file,
				uploadDir,
				"reg_cert_file"
			),
			uploadFile(
				fssai_file,
				existingRestaurant.fssai_file,
				uploadDir,
				"fssai_file"
			),
			uploadFile(
				gstin_file,
				existingRestaurant.gstin_file,
				uploadDir,
				"gstin_file"
			),
		]);

		await prisma.$transaction(async (prisma) => {
			await prisma.user.update({
				where: {
					email: restaurant.email,
					deleted_at: null,
				},
				data: {
					name: restaurant_name ?? existingRestaurant.restaurant_name,
					contact_no: contact_no ?? existingRestaurant.contact_no,
					location: {
						street_address:
							street_address ??
							existingRestaurant.address?.street_address,
						city: city ?? existingRestaurant.address?.city,
						state: state ?? existingRestaurant.address?.state,
						country: country ?? existingRestaurant.address?.country,
						pin_code:
							pin_code ?? existingRestaurant.address?.pin_code,
						landmark:
							landmark ?? existingRestaurant.address?.landmark,
					},
					profile_image: logoFilename || existingRestaurant.logo,
					profile_remarks:
						"Profile information updated by the restaurant.",
				},
			});
			await prisma.restaurant.update({
				where: {
					id: restaurant.id,
					deleted_at: null,
				},
				data: {
					restaurant_name:
						restaurant_name ?? existingRestaurant.restaurant_name,
					owner_name: owner_name ?? existingRestaurant.owner_name,
					contact_no: contact_no ?? existingRestaurant.contact_no,
					address: {
						street_address:
							street_address ??
							existingRestaurant.address?.street_address,
						city: city ?? existingRestaurant.address?.city,
						state: state ?? existingRestaurant.address?.state,
						country: country ?? existingRestaurant.address?.country,
						pin_code:
							pin_code ?? existingRestaurant.address?.pin_code,
						landmark:
							landmark ?? existingRestaurant.address?.landmark,
					},
					whatsapp_no: whatsapp_no ?? existingRestaurant.whatsapp_no,
					geo_location: {
						lat:
							geo_loc_lat ?? existingRestaurant.geo_location?.lat,
						lng:
							geo_loc_lng ?? existingRestaurant.geo_location?.lng,
					},
					date_of_estd:
						date_of_estd ?? existingRestaurant.date_of_estd,
					biography: biography ?? existingRestaurant.biography,
					restaurant_capacity:
						restaurant_capacity ??
						existingRestaurant.restaurant_capacity,
					night_life: night_life ?? existingRestaurant.night_life,
					services: services ?? existingRestaurant.services,
					open_time: open_time ?? existingRestaurant.open_time,
					close_time: close_time ?? existingRestaurant.close_time,
					types_of_cuisines:
						types_of_cuisines ??
						existingRestaurant.types_of_cuisines,
					operational_days:
						operational_days ?? existingRestaurant.operational_days,
					insta_link: insta_link ?? existingRestaurant.insta_link,
					fb_link: fb_link ?? existingRestaurant.fb_link,
					x_link: x_link ?? existingRestaurant.x_link,
					menu: menu ?? existingRestaurant.menu,
					logo: logoFilename ?? existingRestaurant.logo,
					cover_img:
						cover_imgFilename ?? existingRestaurant.cover_img,
					rating: rating ?? existingRestaurant.rating,
					average_price:
						average_price ?? existingRestaurant.average_price,
					restaurant_verification:
						restaurant_verification ??
						existingRestaurant.restaurant_verification,
					restaurant_verification_remarks:
						restaurant_verification_remarks ??
						existingRestaurant.restaurant_verification_remarks,
					is_active: is_active ?? existingRestaurant.is_active,
					aadhar_no: aadhar_no ?? existingRestaurant.aadhar_no,
					passport_no: passport_no ?? existingRestaurant.passport_no,
					reg_cert_no: reg_cert_no ?? existingRestaurant.reg_cert_no,
					fssai_no: fssai_no ?? existingRestaurant.fssai_no,
					gstin_no: gstin_no ?? existingRestaurant.gstin_no,
					aadhar_file:
						aadharFilename ?? existingRestaurant.aadhar_file,
					passport_file:
						passportFilename ?? existingRestaurant.passport_file,
					reg_cert_file:
						regCertFilename ?? existingRestaurant.reg_cert_file,
					fssai_file: fssaiFilename ?? existingRestaurant.fssai_file,
					gstin_file: gstinFilename ?? existingRestaurant.gstin_file,
					bank_name: bank_name ?? existingRestaurant.bank_name,
					bank_ac_name:
						bank_ac_name ?? existingRestaurant.bank_ac_name,
					bank_ac_no: bank_ac_no ?? existingRestaurant.bank_ac_no,
					bank_branch: bank_branch ?? existingRestaurant.bank_branch,
					bank_ifsc: bank_ifsc ?? existingRestaurant.bank_ifsc,
					bank_micr: bank_micr ?? existingRestaurant.bank_micr,
				},
			});
		});

		return h
			.response({
				success: true,
				message: "Restaurant Profile updated successfully.",
			})
			.code(200);
	} catch (error) {
		console.log(error);
		return h
			.response({
				success: false,
				message: "Error while updating restaurant's profile",
			})
			.code(500);
	}
};

// change password with existing password
const changeRestaurantPassword = async (req, h) => {
	try {
		const restaurant = req.rootUser;
		const { password, new_password } = req.payload;

		const existingRestaurant = await prisma.restaurant.findFirst({
			where: {
				id: restaurant.id,
				is_active: true,
				deleted_at: null,
			},
		});

		const isMatch = await bcrypt.compare(
			password,
			existingRestaurant.password
		);
		if (!isMatch) {
			return h
				.response({ message: "Invalid current password." })
				.code(400);
		}

		if (password === new_password) {
			return h
				.response({
					message:
						"New password cannot be the same as the current one.",
				})
				.code(400);
		}

		const hashedPassword = await bcrypt.hash(new_password, 10);

		const updatedPassword = await prisma.restaurant.update({
			where: {
				id: restaurant.id,
				deleted_at: null,
			},
			data: {
				password: hashedPassword,
			},
		});

		return h
			.response({
				success: true,
				message: "Password updated successfully.",
				data: updatedPassword,
			})
			.code(200);
	} catch (error) {
		console.error(
			"An error occurred while changing the password for restaurant.",
			error
		);
		return h
			.response({
				message: "Error while updating restaurant's password.",
			})
			.code(500);
	}
};

// profile deletion by restaurant
const restaurantProfileDeletionByUser = async (req, h) => {
	try {
		const restaurant = req.rootUser;
		const { reason } = req.payload;

		const updatedDetails = await prisma.restaurant.update({
			where: {
				id: restaurant.id,
				is_active: true,
				deleted_at: null,
			},
			data: {
				is_active: false,
				profile_remarks: "Account deleted by restaurant.",
				restaurant_deletion_reason: reason,
				deleted_at: new Date(),
			},
		});

		return h
			.response({
				success: true,
				message: "Restaurant profile deleted successfully.",
				data: updatedDetails,
			})
			.code(200);
	} catch (error) {
		console.error(
			"An error occurred while deleting the restaurant's account.",
			error
		);
		return h
			.response({ message: "Error while deleting restaurant's account." })
			.code(500);
	}
};

// profile deletion by admin
const restaurantProfileDeletionByAdmin = async (req, h) => {
	try {
		const { restaurantId, reason } = req.payload;

		const updatedDetails = await prisma.restaurant.update({
			where: {
				id: restaurantId,
				is_active: true,
				deleted_at: null,
			},
			data: {
				is_active: false,
				profile_remarks: "Account deleted by Admin.",
				admin_deletion_reason: reason,
				deleted_at: new Date(),
			},
		});

		return h
			.response({
				success: true,
				message: "Restaurant profile deleted successfully.",
				data: updatedDetails,
			})
			.code(200);
	} catch (error) {
		console.error(
			"An error occurred while deleting the restaurant's account.",
			error
		);
		return h
			.response({ message: "Error while deleting restaurant's account." })
			.code(500);
	}
};

// restaurant's post uploadation
const restaurantPostUploadation = async (req, h) => {
	try {
		const restaurant = req.rootUser;
		const { post_image, title, description } = req.payload;

		let uniqueFilename;
		if (post_image && post_image.hapi && post_image.hapi.filename) {
			const uploadDir = path.join(__dirname, "..", "uploads");

			uniqueFilename = `${Date.now()}_${post_image.hapi.filename}`;
			const uploadPath = path.join(uploadDir, uniqueFilename);

			if (!fs.existsSync(uploadDir)) {
				fs.mkdirSync(uploadDir, { recursive: true });
			}

			const fileStream = fs.createWriteStream(uploadPath);
			post_image.pipe(fileStream);
		}

		//  prisma transaction
		await prisma.$transaction(async (prisma) => {
			const post = await prisma.post.create({
				data: {
					title,
					description,
					restaurant_id: restaurant.id,
				},
				select: {
					id: true,
					title: true,
					description: true,
				},
			});

			const file = await prisma.file.create({
				data: {
					file_type: "post",
					file_name: uniqueFilename,
					post_id: post.id,
					restaurant_id: restaurant.id,
				},
				select: {
					file_name: true,
				},
			});
		});

		return h
			.response({
				success: true,
				message: "Restaurant post created successfully.",
			})
			.code(200);
	} catch (error) {
		console.error(
			"An error occurred while uploading the restaurant's post.",
			error
		);
		return h
			.response({ message: "Error while uploading restaurant's post." })
			.code(500);
	}
};

// show restaurant posts
const restaurantPosts = async (req, h) => {
	try {
		const restaurant = req.rootUser;
		const posts = await prisma.post.findMany({
			where: {
				restaurant_id: restaurant.id,
			},
			select: {
				id: true,
				title: true,
				description: true,
				File: {
					where: {
						file_type: "post",
					},
					select: {
						file_name: true,
					},
				},
			},
		});

		if (posts.length === 0) {
			return h
				.response({
					success: true,
					message: "Restaurant has no posts to display.",
					data: [],
				})
				.code(200);
		}

		return h
			.response({
				success: true,
				message: "Restaurant's post(s) fetched successfully.",
				data: posts,
			})
			.code(200);
	} catch (error) {
		console.error(error);
		return h
			.response({
				success: false,
				message: "Error fetching restaurant's post(s).",
				error,
			})
			.code(500);
	}
};

// restaurant post updation
const restaurantPostUpdation = async (req, h) => {
	try {
		const restaurant = req.rootUser;
		const { post_id, post_image, title, description } = req.payload;

		const existingPost = await prisma.post.findFirst({
			where: {
				id: post_id,
				restaurant_id: restaurant.id,
				deleted_at: null,
			},
			include: {
				File: true,
			},
		});

		let uniqueFilename;
		if (post_image && post_image.hapi && post_image.hapi.filename) {
			uniqueFilename = `${Date.now()}_${post_image.hapi.filename}`;
		}

		await prisma.$transaction(async (prisma) => {
			await prisma.post.update({
				where: {
					id: post_id,
				},
				data: {
					title,
					description,
				},
			});

			if (existingPost.File && existingPost.File.length > 0) {
				await prisma.file.deleteMany({
					where: {
						post_id: post_id,
						file_type: "post",
					},
				});

				const uploadDir = path.join(__dirname, "..", "uploads");
				const existingImagePath = path.join(
					uploadDir,
					existingPost.File[0].file_name
				);

				if (fs.existsSync(existingImagePath)) {
					fs.unlinkSync(existingImagePath);
				}
			}

			if (uniqueFilename) {
				const uploadDir = path.join(__dirname, "..", "uploads");
				const uploadPath = path.join(uploadDir, uniqueFilename);
				if (!fs.existsSync(uploadDir)) {
					fs.mkdirSync(uploadDir, { recursive: true });
				}

				const fileStream = fs.createWriteStream(uploadPath);
				post_image.pipe(fileStream);

				await prisma.file.create({
					data: {
						file_type: "post",
						file_name: uniqueFilename,
						post_id: post_id,
						restaurant_id: restaurant.id,
					},
				});
			}
		});

		return h
			.response({
				success: true,
				message: "Restaurant post updated successfully.",
			})
			.code(200);
	} catch (error) {
		console.error(
			"An error occurred while updating the restaurant's post:",
			error
		);
		return h
			.response({
				success: false,
				message: "Error while updating restaurant's post.",
				error: error.message,
			})
			.code(500);
	}
};

const restaurantPostDeletion = async (req, h) => {
	try {
		const restaurant = req.rootUser;
		const { post_id } = req.payload;

		const existingPost = await prisma.post.findFirst({
			where: {
				id: post_id,
				restaurant_id: restaurant.id,
				deleted_at: null,
			},
			include: {
				File: true,
			},
		});

		await prisma.$transaction(async (prisma) => {
			await prisma.post.delete({
				where: {
					id: post_id,
				},
			});

			if (existingPost.File && existingPost.File.length > 0) {
				await prisma.file.deleteMany({
					where: {
						post_id: post_id,
					},
				});

				const uploadDir = path.join(__dirname, "..", "uploads");
				existingPost.File.forEach((file) => {
					const filePath = path.join(uploadDir, file.file_name);
					if (fs.existsSync(filePath)) {
						fs.unlinkSync(filePath);
					}
				});
			}
		});

		return h
			.response({
				success: true,
				message:
					"Restaurant's post and associated files deleted successfully.",
			})
			.code(200);
	} catch (error) {
		console.error(
			"An error occurred while deleting the restaurant's post:",
			error
		);
		return h
			.response({
				success: false,
				message: "Error while deleting restaurant's post.",
				error: error.message,
			})
			.code(500);
	}
};

// Restaurant's menu upload
const restaurantMenuUploadation = async (req, h) => {
	try {
		const restaurant = req.rootUser;
		const { menu_images } = req.payload;

		const uploadDir = path.join(__dirname, "..", "uploads");

		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}

		const filePromises = menu_images.map(async (menu_image) => {
			if (menu_image && menu_image.hapi && menu_image.hapi.filename) {
				const uniqueFilename = `${Date.now()}_${
					menu_image.hapi.filename
				}`;
				const uploadPath = path.join(uploadDir, uniqueFilename);

				const fileStream = fs.createWriteStream(uploadPath);
				menu_image.pipe(fileStream);

				await new Promise((resolve, reject) => {
					fileStream.on("finish", resolve);
					fileStream.on("error", reject);
				});

				return prisma.file.create({
					data: {
						file_type: "menu",
						file_name: uniqueFilename,
						restaurant_id: restaurant.id,
					},
				});
			}
		});
		await Promise.all(filePromises);

		return h
			.response({
				success: true,
				message: "Restaurant's menu image(s) uploaded successfully.",
			})
			.code(200);
	} catch (error) {
		console.error(
			"An error occurred while uploading the restaurant's menu image(s).",
			error
		);
		return h
			.response({
				message: "Error while uploading restaurant's menu image(s).",
			})
			.code(500);
	}
};

// restaurant's menu display
const restaurantMenuDisplay = async (req, h) => {
	try {
		const restaurant = req.rootUser;

		const menuImages = await prisma.file.findMany({
			where: {
				restaurant_id: restaurant.id,
				file_type: "menu",
			},
			select: {
				id: true,
				file_name: true,
			},
		});

		if (!menuImages || menuImages.length === 0) {
			return h
				.response({
					success: false,
					message: "No menu images found for this restaurant.",
				})
				.code(404);
		}

		return h
			.response({
				success: true,
				data: menuImages,
			})
			.code(200);
	} catch (error) {
		console.error(
			"An error occurred while fetching the restaurant's menu.",
			error
		);
		return h
			.response({
				message: "Error while fetching restaurant's menu.",
			})
			.code(500);
	}
};

// restaurant's menu updation
const restaurantMenuUpdation = async (req, h) => {
	try {
		const { menu_id, menu_image } = req.payload;
		const restaurant = req.rootUser;

		const menu = await prisma.file.findFirst({
			where: {
				id: menu_id,
				restaurant_id: restaurant.id,
				file_type: "menu",
			},
		});

		const uploadDir = path.join(__dirname, "..", "uploads");
		const oldFilePath = path.join(uploadDir, menu.file_name);

		if (fs.existsSync(oldFilePath)) {
			fs.unlinkSync(oldFilePath);
		}

		const uniqueFilename = `${Date.now()}_${menu_image.hapi.filename}`;
		const uploadPath = path.join(uploadDir, uniqueFilename);
		const fileStream = fs.createWriteStream(uploadPath);
		menu_image.pipe(fileStream);

		await prisma.file.update({
			where: {
				id: menu_id,
			},
			data: {
				file_name: uniqueFilename,
			},
		});

		return h
			.response({
				success: true,
				message: "Menu image updated successfully.",
			})
			.code(200);
	} catch (error) {
		console.error(
			"An error occurred while updating the restaurant's menu image.",
			error
		);
		return h
			.response({
				message: "Error while updating restaurant's menu image.",
			})
			.code(500);
	}
};

// restaurant's menu deletion
const restaurantMenuDeletion = async (req, h) => {
	try {
		const restaurant = req.rootUser;
		const { image_ids } = req.payload;

		const deleteImages = await prisma.file.findMany({
			where: {
				id: {
					in: image_ids,
				},
				restaurant_id: restaurant.id,
				file_type: "menu",
			},
		});

		if (!deleteImages || deleteImages.length === 0) {
			return h
				.response({
					success: false,
					message: "No menu images found for deletion.",
				})
				.code(404);
		}

		for (const image of deleteImages) {
			const filePath = path.join(
				__dirname,
				"..",
				"uploads",
				image.file_name
			);
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		}

		await prisma.file.deleteMany({
			where: {
				id: {
					in: image_ids,
				},
			},
		});

		return h
			.response({
				success: true,
				message: "Menu image(s) deleted successfully.",
			})
			.code(200);
	} catch (error) {
		console.error(
			"An error occurred while deleting the restaurant's menu image(s).",
			error
		);
		return h
			.response({
				message: "Error while deleting restaurant's menu image(s).",
			})
			.code(500);
	}
};

// display all reviews of the restaurant
const fetchRestaurantReviews = async (req, h) => {
	try {
		const userId = req.userId;

		const restaurant = await prisma.restaurant.findFirst({
			where: {
				id: Number(userId),
				is_active: true,
				deleted_at: null,
			},
		});

		if (
			!restaurant.restaurant_name ||
			!restaurant.geo_location ||
			!restaurant.geo_location.lat ||
			!restaurant.geo_location.lng
		) {
			return h
				.response({
					success: false,
					message: "Restaurant details are missing or incomplete.",
				})
				.code(400);
		}

		const restaurantName = restaurant.restaurant_name;
		const location = `${restaurant.geo_location.lat},${restaurant.geo_location.lng}`;
		const apiKey = process.env.GoogleMaps_API_KEY;
		const radius = 5000;
		const keywords = [
			"restaurant",
			"bar",
			"pub",
			"liquor",
			"wine",
			"cafe",
			"nightclub",
			"tavern",
			"dining",
			"brewery",
			"distillery",
			"liquor store",
			"wine shop",
			"cocktail bar",
			"beer garden",
			"bistro",
			"lounge",
			"steakhouse",
			"pizzeria",
			"gastropub",
			"food court",
			"canteen",
			"eatery",
			"brasserie",
			"grill",
			"taproom",
			"speakeasy",
			"food truck",
			"patio bar",
			"rooftop bar",
			"diner",
			"tapas bar",
			"izakaya",
			"sushi bar",
			"buffet",
			"carvery",
			"inn",
			"chophouse",
			"tea house",
			"tea room",
			"delicatessen",
			"food hall",
			"trattoria",
			"cafeteria",
			"wine bar",
			"dine-in",
			"catering",
			"brunch",
		];

		const getPlaceDetails = async (placeId, apiKey, sort) => {
			const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&reviews_sort=${sort}`;
			const response = await fetch(url);
			const data = await response.json();
			return data.status === "OK" ? data.result : {};
		};

		const findRestaurantByName = async (restaurantName, location) => {
			const keywordString = keywords.join("|");
			const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&keyword=${encodeURIComponent(
				keywordString
			)}&key=${apiKey}`;
			const response = await fetch(url);
			const data = await response.json();

			if (data.status === "OK" && data.results.length > 0) {
				const matchedPlace = data.results.find((place) =>
					place.name
						.toLowerCase()
						.includes(restaurantName.toLowerCase())
				);

				if (matchedPlace) {
					const placeDetailsMostRelevant = await getPlaceDetails(
						matchedPlace.place_id,
						apiKey,
						"most_relevant"
					);
					const placeDetailsNewest = await getPlaceDetails(
						matchedPlace.place_id,
						apiKey,
						"newest"
					);

					let output = {
						place: matchedPlace.name,
						address: matchedPlace.vicinity,
						overallRating: matchedPlace.rating,
						userRatingsTotal: matchedPlace.user_ratings_total,
						reviews: [],
					};

					const combinedReviews = {};

					(placeDetailsMostRelevant.reviews || []).forEach(
						(review) => {
							combinedReviews[review.author_name + review.text] =
								{
									reviewer: review.author_name,
									rating: review.rating,
									text: review.text,
								};
						}
					);

					(placeDetailsNewest.reviews || []).forEach((review) => {
						const key = review.author_name + review.text;
						if (!combinedReviews[key]) {
							combinedReviews[key] = {
								reviewer: review.author_name,
								rating: review.rating,
								text: review.text,
							};
						}
					});

					output.reviews = Object.values(combinedReviews);

					if (output.reviews.length === 0) {
						output.reviews.push({ text: "No reviews available." });
					}

					return { success: true, data: output };
				} else {
					return {
						success: false,
						message:
							"Unable to fetch reviews at the moment. Please try again later.",
					};
				}
			} else {
				return {
					success: false,
					message:
						"Unable to fetch reviews at the moment. Please try again later.",
				};
			}
		};

		const result = await findRestaurantByName(restaurantName, location);

		return h.response(result).code(result.success ? 200 : 404);
	} catch (error) {
		console.error(
			"An error occurred while fetching the restaurant's review:",
			error
		);
		return h
			.response({
				success: false,
				message: "Error while fetching the restaurant's review.",
			})
			.code(500);
	}
};

module.exports = {
	restaurantAdminRegistration,
	restaurantProfile,
	restaurantProfileUpdate,
	changeRestaurantPassword,
	restaurantProfileDeletionByUser,
	restaurantProfileDeletionByAdmin,
	restaurantPostUploadation,
	restaurantPosts,
	restaurantPostUpdation,
	restaurantPostDeletion,
	restaurantMenuUploadation,
	restaurantMenuDisplay,
	restaurantMenuUpdation,
	restaurantMenuDeletion,
	fetchRestaurantReviews,
};
