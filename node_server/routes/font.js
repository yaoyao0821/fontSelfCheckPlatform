const express = require('express');
const content_controller = require('../controllers/controller');

const router = express.Router();
const authenticateToken = require('../jwt');

router.get("/prod/content/stream/:isbn/*", authenticateToken, function (req, res, next) {
    content_controller.stream(true, req, res, next)
})

router.get("/qa/content/stream/:isbn/*", authenticateToken, function (req, res, next) {
    content_controller.stream(false, req, res, next)
})

module.exports = router;
