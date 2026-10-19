const Category = require('../models/Category');
const Contact = require('../models/Contact');

// @desc    Get all categories for the authenticated user with contact counts
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort({ name: 1 });

    // Aggregate contact count per category for current user
    const counts = await Contact.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach(item => {
      if (item._id) countMap[item._id] = item.count;
    });

    const categoriesWithCount = categories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      color: cat.color,
      createdAt: cat.createdAt,
      contactCount: countMap[cat.name] || 0
    }));

    res.json({
      success: true,
      categories: categoriesWithCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res, next) => {
  try {
    const { name, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const trimmedName = name.trim();

    // Check if category name already exists for this user
    const existingCategory = await Category.findOne({
      user: req.user._id,
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists'
      });
    }

    const category = await Category.create({
      name: trimmedName,
      color: color || '#4f46e5',
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: {
        _id: category._id,
        name: category.name,
        color: category.color,
        createdAt: category.createdAt,
        contactCount: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or unauthorized'
      });
    }

    const oldName = category.name;
    const newName = name ? name.trim() : oldName;

    if (newName !== oldName) {
      const duplicate = await Category.findOne({
        user: req.user._id,
        _id: { $ne: category._id },
        name: { $regex: new RegExp(`^${newName}$`, 'i') }
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Another category with this name already exists'
        });
      }

      // Update contacts using this old category name
      await Contact.updateMany(
        { user: req.user._id, category: oldName },
        { $set: { category: newName } }
      );
      category.name = newName;
    }

    if (color) {
      category.color = color;
    }

    await category.save();

    // Get count
    const contactCount = await Contact.countDocuments({
      user: req.user._id,
      category: category.name
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      category: {
        _id: category._id,
        name: category.name,
        color: category.color,
        createdAt: category.createdAt,
        contactCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or unauthorized'
      });
    }

    const categoryName = category.name;

    // Delete category
    await Category.deleteOne({ _id: category._id });

    // Reassign existing contacts in this category to 'General'
    await Contact.updateMany(
      { user: req.user._id, category: categoryName },
      { $set: { category: 'General' } }
    );

    res.json({
      success: true,
      message: `Category "${categoryName}" deleted. Associated contacts reassigned to "General".`,
      id: req.params.id
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
