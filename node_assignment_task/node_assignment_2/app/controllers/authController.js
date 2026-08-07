const User = require('../models/User');
const Role = require('../models/Role');

class AuthController {
    loginPage(req, res) {
        res.render('auth/login', { title: 'Login' });
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const users = await User.aggregate([
                { $match: { email: email.toLowerCase() } },
                {
                    $lookup: {
                        from: 'roles',
                        localField: 'roleId',
                        foreignField: '_id',
                        as: 'role'
                    }
                },
                { $unwind: '$role' }
            ]);

            if (users.length === 0) {
                req.flash('error_msg', 'Invalid credentials');
                return res.redirect('/auth/login');
            }

            const user = users[0];

            const bcrypt = require('bcrypt');
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                req.flash('error_msg', 'Invalid credentials');
                return res.redirect('/auth/login');
            }

            if (user.status === 'deactive') {
                req.flash('error_msg', 'Your account is deactivated. Contact admin.');
                return res.redirect('/auth/login');
            }

            req.session.user = {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role.name
            };

            req.flash('success_msg', 'You are now logged in');
            res.redirect('/dashboard');

        } catch (error) {
            console.error(error);
            req.flash('error_msg', 'Something went wrong during login');
            res.redirect('/auth/login');
        }
    }

    logout(req, res) {
        req.session.destroy((err) => {
            if (err) console.error(err);
            res.redirect('/auth/login');
        });
    }
}

module.exports = new AuthController();
