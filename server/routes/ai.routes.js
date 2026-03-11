const express = require('express');
const router = express.Router();
const AIController = require('../controllers/ai.controller');

router.post('/chat', AIController.chat);
router.get('/recommandations', AIController.recommandations);

module.exports = router;
