-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `contact_no` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `profile_image` VARCHAR(191) NULL,
    `usercode` VARCHAR(191) NOT NULL,
    `role_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restaurants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `restaurant_name` VARCHAR(191) NULL,
    `restaurant_code` VARCHAR(191) NOT NULL,
    `owner_name` VARCHAR(191) NOT NULL,
    `contact_no` VARCHAR(191) NOT NULL,
    `whatsapp_no` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `geo_loc_lat` DOUBLE NULL,
    `geo_loc_lng` DOUBLE NULL,
    `date_of_estd` VARCHAR(191) NULL,
    `biography` VARCHAR(191) NULL,
    `restaurant_capacity` INTEGER NULL,
    `restaurant_type` VARCHAR(191) NULL,
    `services` VARCHAR(191) NULL,
    `open_time` DATETIME(3) NULL,
    `close_time` DATETIME(3) NULL,
    `types_of_cuisines` VARCHAR(191) NULL,
    `operational_days` VARCHAR(191) NULL,
    `insta_link` VARCHAR(191) NULL,
    `fb_link` VARCHAR(191) NULL,
    `x_link` VARCHAR(191) NULL,
    `menu` VARCHAR(191) NULL,
    `logo` VARCHAR(191) NULL,
    `cover_img` VARCHAR(191) NULL,
    `rating` DOUBLE NOT NULL DEFAULT 0.0,
    `average_price` INTEGER NULL,
    `restaurant_verification` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `restaurant_verification_remarks` VARCHAR(191) NOT NULL DEFAULT 'Verification is pending.',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `aadhar_no` VARCHAR(191) NULL,
    `passport_no` VARCHAR(191) NULL,
    `reg_cert_no` VARCHAR(191) NULL,
    `fssai_no` VARCHAR(191) NULL,
    `gstin_no` VARCHAR(191) NULL,
    `aadhar_file` VARCHAR(191) NULL,
    `passport_file` VARCHAR(191) NULL,
    `reg_cert_file` VARCHAR(191) NULL,
    `fssai_file` VARCHAR(191) NULL,
    `gstin_file` VARCHAR(191) NULL,
    `bank_name` VARCHAR(191) NULL,
    `bank_ac_name` VARCHAR(191) NULL,
    `bank_ac_no` VARCHAR(191) NULL,
    `bank_branch` VARCHAR(191) NULL,
    `bank_ifsc` VARCHAR(191) NULL,
    `bank_micr` VARCHAR(191) NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `restaurants_contact_no_key`(`contact_no`),
    UNIQUE INDEX `restaurants_email_key`(`email`),
    UNIQUE INDEX `restaurants_aadhar_no_key`(`aadhar_no`),
    UNIQUE INDEX `restaurants_passport_no_key`(`passport_no`),
    UNIQUE INDEX `restaurants_reg_cert_no_key`(`reg_cert_no`),
    UNIQUE INDEX `restaurants_fssai_no_key`(`fssai_no`),
    UNIQUE INDEX `restaurants_gstin_no_key`(`gstin_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restaurants` ADD CONSTRAINT `restaurants_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
