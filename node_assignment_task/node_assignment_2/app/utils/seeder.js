const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');
const connectDB = require('../config/db');
require('dotenv').config();

const seed = async () => {
    try {
        await connectDB();

        const roles = ['Super Admin', 'User'];
        for (const roleName of roles) {
            const exists = await Role.findOne({ name: roleName });
            if (!exists) {
                await Role.create({ name: roleName });
                console.log(`Role ${roleName} created`);
            }
        }

        const adminRole = await Role.findOne({ name: 'Super Admin' });
        const adminExists = await User.findOne({ email: 'admin@example.com' });

        if (!adminExists) {
            await User.create({
                name: 'Super Admin',
                email: 'admin@example.com',
                password: 'adminpassword',
                roleId: adminRole._id,
                status: 'active'
            });
            console.log('Super Admin created (admin@example.com / adminpassword)');
        }

        console.log('Seeding completed');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seed();
