const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

router.get("/login", function (req, res, next) {
  if (req.query.username === process.env.LOGIN_USERNAME && req.query.password === process.env.LOGIN_PASSWORD) {
    
    // Generate TOKEN_SECRET: require('crypto').randomBytes(64).toString('hex');
    function generateAccessToken(username) {
      return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: process.env.EXPTIME });
    }

    const token = 'Bearer ' + generateAccessToken({ username: req.query.username });
    const responseJson = { token: token, username: req.query.username};
    return res.status(200).json(responseJson);
  }

  res.statusMessage = "Wrong username or password";
  return res.sendStatus(400);

})

module.exports = router;
