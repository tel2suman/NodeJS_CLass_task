module.exports = {
    ensureAuthenticated: (req, res, next) => {
        if (req.session && req.session.user) {
            return next();
        }
        req.flash('error_msg', 'Please log in to view this resource');
        res.redirect('/auth/login');
    },
    forwardAuthenticated: (req, res, next) => {
        if (!req.session || !req.session.user) {
            return next();
        }
        res.redirect('/dashboard');
    }
};
