const express = require('express');
const router = express.Router();
const { getUsers, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.route('/')
  .get(protect, authorize('ADMIN'), getUsers);

router.route('/:id')
  .delete(protect, authorize('ADMIN'), deleteUser);

module.exports = router;
