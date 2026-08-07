const User = require('../models/User');
const Role = require('../models/Role');
const crypto = require('crypto');
const sendEmail = require('../utils/emailService');

class UserController {
    async listUsers(req, res) {
        try {
            const users = await User.aggregate([
                {
                    $lookup: {
                        from: 'roles',
                        localField: 'roleId',
                        foreignField: '_id',
                        as: 'role'
                    }
                },
                { $unwind: '$role' },
                {
                    $project: {
                        password: 0,
                        __v: 0
                    }
                },
                { $sort: { createdAt: -1 } }
            ]);

            res.render('users/index', { 
                title: 'User Management',
                users: users
            });
        } catch (error) {
            console.error(error);
            req.flash('error_msg', 'Could not fetch users');
            res.redirect('/dashboard');
        }
    }

    async addUserPage(req, res) {
        const roles = await Role.find();
        res.render('users/add', { title: 'Add User', roles });
    }

    async addUser(req, res) {
        try {
            const { name, email, roleId } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                req.flash('error_msg', 'Email already registered');
                return res.redirect('/users/add');
            }

            const randomPassword = crypto.randomBytes(8).toString('hex');

            const newUser = new User({
                name,
                email,
                password: randomPassword,
                roleId
            });

            await newUser.save();

            const message = `
                <h1>Welcome to the Platform</h1>
                <p>Hello ${name},</p>
                <p>Your account has been created by the Admin.</p>
                <p><strong>Login Credentials:</strong></p>
                <p>Email: ${email}</p>
                <p>Password: ${randomPassword}</p>
                <p>Please login and change your password immediately.</p>
            `;

            await sendEmail({
                email: email,
                subject: 'Your Login Credentials',
                message: message
            });

            req.flash('success_msg', 'User created and credentials sent to email');
            res.redirect('/users');

        } catch (error) {
            console.error(error);
            req.flash('error_msg', 'Error creating user');
            res.redirect('/users/add');
        }
    }

    async toggleStatus(req, res) {
        try {
            const user = await User.findById(req.params.id);
            user.status = user.status === 'active' ? 'deactive' : 'active';
            await user.save();
            req.flash('success_msg', `User ${user.status} successfully`);
            res.redirect('/users');
        } catch (error) {
            req.flash('error_msg', 'Error updating status');
            res.redirect('/users');
        }
    }

    async deleteUser(req, res) {
        try {
            await User.findByIdAndDelete(req.params.id);
            req.flash('success_msg', 'User deleted successfully');
            res.redirect('/users');
        } catch (error) {
            req.flash('error_msg', 'Error deleting user');
            res.redirect('/users');
        }
    }
}

module.exports = new UserController();
