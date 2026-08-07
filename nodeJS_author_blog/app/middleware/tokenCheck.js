
const jwt = require("jsonwebtoken");

const Author = require("../models/author");


const authorAuthCheck = async (req, res, next) => {

  try {

    const accessToken = req.cookies.authorAccessToken;

    const refreshToken = req.cookies.authorRefreshToken;

    // No tokens
    if (!accessToken && !refreshToken) {

      return res.redirect("/login-view");
    }

    // 1️⃣ Try access token
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        return next();
      } catch (error) {
        // Don't return yet — fallback to refresh token
      }
    }

    // 2️⃣ Use refresh token
    if (!refreshToken) {
      return res.redirect("/login-view");
    }

    try {
      const decodedRefresh = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET,
      );

      const author = await Author.findById(decodedRefresh.id);

      if (!author || author.refreshToken !== refreshToken) {
        
        return res.redirect("/login-view");
      }

      // 🔁 Generate new access token
      const newAccessToken = jwt.sign(
        {
          userId: author._id,
          name: author.name,
          email: author.email,
          role: author.role,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "15m" },
      );

      res.cookie("authorAccessToken", newAccessToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      req.user = {
        userId: author._id,
        name: author.name,
        email: author.email,
        role: author.role,
      };

      return next();
    } catch (error) {
      return res.redirect("/login-view");
    }
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.redirect("/login-view");
  }
};

module.exports = authorAuthCheck;