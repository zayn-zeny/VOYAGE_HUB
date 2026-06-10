const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

// Register
router.post(
  '/register',
  authLimiter,
  validate([
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ]),
  authController.register
);

// Login
router.post(
  '/login',
  authLimiter,
  validate([
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  authController.login
);

// Logout
router.post('/logout', authController.logout);

// Refresh token
router.post('/refresh', authController.refresh);

// Get current user
router.get('/me', auth, authController.getMe);

// Update profile
router.put(
  '/profile',
  auth,
  validate([
    body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('bio').optional().isLength({ max: 300 }).withMessage('Bio cannot exceed 300 characters'),
  ]),
  authController.updateProfile
);

// Change password
router.post(
  '/change-password',
  auth,
  validate([
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ]),
  authController.changePassword
);

module.exports = router;
