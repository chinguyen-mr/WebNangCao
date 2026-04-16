const jwt = require('jsonwebtoken');
const MyConstants = require('./MyConstants');

const JwtUtil = {
  genToken(account) {
    const token = jwt.sign(
      {
        _id: account._id,
        username: account.username,
        // We don't really need password in the token payload usually
      },
      MyConstants.JWT_SECRET,
      {
        expiresIn: MyConstants.JWT_EXPIRES,
      }
    );

    return token;
  },

  checkToken(req, res, next) {
    const token =
      req.headers['x-access-token'] || req.headers['authorization'];

    if (token) {
      jwt.verify(token, MyConstants.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.json({
            success: false,
            message: 'Token is not valid',
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res.json({
        success: false,
        message: 'Auth token is not supplied',
      });
    }
  },
  verifyToken(token) {
    try {
      return jwt.verify(token, MyConstants.JWT_SECRET);
    } catch (err) {
      return null;
    }
  },
};

module.exports = JwtUtil;
