const jwt = require("jsonwebtoken");

const AdminAuthCheck = (req, res, next) => {
  if (req.cookies && req.cookies.admintoken) {
    jwt.verify(
      req.cookies.admintoken,
      process.env.JWT_SECRET_KEY || "secret",
      (err, data) => {
        req.admin = data;

        req.flash("user found", req.admin);

        return next();
      },
    );
  } else {
    return next();
  }
};

module.exports = AdminAuthCheck;
