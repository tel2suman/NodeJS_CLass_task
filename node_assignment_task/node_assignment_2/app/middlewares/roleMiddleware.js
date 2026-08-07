module.exports = {
    authorize: (roles = []) => {
        if (typeof roles === 'string') {
            roles = [roles];
        }

        return (req, res, next) => {
            if (!req.session.user || (roles.length && !roles.includes(req.session.user.role))) {
                req.flash('error_msg', 'Unauthorized access');
                return res.redirect('/dashboard');
            }
            next();
        };
    }
};
