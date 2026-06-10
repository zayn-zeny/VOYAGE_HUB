const User = require('../models/User');
const Trip = require('../models/Trip');
const logger = require('../middleware/logger');

// GET /api/users/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    logger.error('Get profile error:', err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'bio', 'avatar', 'preferences'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    logger.error('Update profile error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// DELETE /api/users/account
exports.deleteAccount = async (req, res) => {
  try {
    // Delete all user trips
    await Trip.deleteMany({ userId: req.userId });

    // Delete user
    await User.findByIdAndDelete(req.userId);

    res.clearCookie('refreshToken');
    logger.info(`Account deleted: ${req.userId}`);

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    logger.error('Delete account error:', err);
    res.status(500).json({ message: 'Failed to delete account' });
  }
};
