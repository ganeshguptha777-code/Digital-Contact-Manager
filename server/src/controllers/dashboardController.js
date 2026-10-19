const Contact = require('../models/Contact');
const Category = require('../models/Category');

// @desc    Get dashboard statistics for the authenticated user
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Run parallel queries for efficiency
    const [
      totalContacts,
      totalFavorites,
      categoryCounts,
      recentContacts,
      userCategories
    ] = await Promise.all([
      Contact.countDocuments({ user: userId }),
      Contact.countDocuments({ user: userId, isFavorite: true }),
      Contact.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Contact.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('firstName lastName email phone company jobTitle category isFavorite createdAt'),
      Category.find({ user: userId }).select('name color')
    ]);

    // Build color map for categories
    const categoryColorMap = {};
    userCategories.forEach(cat => {
      categoryColorMap[cat.name] = cat.color;
    });

    const categoryBreakdown = categoryCounts.map(item => ({
      category: item._id || 'Uncategorized',
      count: item.count,
      color: categoryColorMap[item._id] || '#6366f1'
    }));

    res.json({
      success: true,
      stats: {
        totalContacts,
        totalFavorites,
        totalCategories: userCategories.length,
        categoryBreakdown,
        recentContacts
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
