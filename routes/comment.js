'use strict'

const express = require('express');
const CommentController = require('../controllers/comment');

const router = express.Router();
const md_auth = require('../middlewares/authenticated');


router.post('/comment/topic/:topicId', md_auth.authenticated, CommentController.add);
router.put('/comment/:commentId', md_auth.authenticated, CommentController.update);
router.delete('/comment/:topicId/:commentId', md_auth.authenticated, CommentController.delete);

module.exports = router;