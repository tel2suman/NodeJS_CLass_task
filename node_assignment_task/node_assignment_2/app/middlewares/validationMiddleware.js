const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push(err.msg));

    req.flash('error_msg', extractedErrors[0]);
    return res.redirect('back');
};

module.exports = validate;
