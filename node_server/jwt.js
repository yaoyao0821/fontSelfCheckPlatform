const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = function(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) {
    res.statusMessage = 'EmptyToken';
    return res.sendStatus(401)
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      res.statusMessage = err.name;
      return res.sendStatus(403)
    }

    req.user = user;
    next()
  })
}

module.exports = authenticateToken;