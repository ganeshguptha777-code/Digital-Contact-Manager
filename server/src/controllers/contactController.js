const Contact = require('../models/Contact');

// @desc    Get contacts with search, filter, sort, pagination
// @route   GET /api/contacts
// @access  Private
const getContacts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      isFavorite,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    // Strict ownership filter
    const query = { user: req.user._id };

    // Search filter across multiple fields
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { company: searchRegex },
        { jobTitle: searchRegex }
      ];
    }

    // Category filter
    if (category && category !== 'All' && category !== '') {
      query.category = category;
    }

    // Favorite filter
    if (isFavorite !== undefined && isFavorite !== '') {
      query.isFavorite = isFavorite === 'true' || isFavorite === true;
    }

    // Sorting
    const sort = {};
    const order = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'name') {
      sort.firstName = order;
      sort.lastName = order;
    } else {
      sort[sortBy] = order;
    }

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [contacts, totalContacts] = await Promise.all([
      Contact.find(query).sort(sort).skip(skip).limit(limitNum),
      Contact.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalContacts / limitNum) || 1;

    res.json({
      success: true,
      contacts,
      pagination: {
        total: totalContacts,
        page: pageNum,
        limit: limitNum,
        pages: totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single contact by ID
// @route   GET /api/contacts/:id
// @access  Private
const getContactById = async (req, res, next) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found or you are not authorized to view it'
      });
    }

    res.json({
      success: true,
      contact
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new contact
// @route   POST /api/contacts
// @access  Private
const createContact = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      address,
      category,
      notes,
      isFavorite
    } = req.body;

    const contact = await Contact.create({
      user: req.user._id,
      firstName: firstName?.trim(),
      lastName: lastName?.trim() || '',
      email: email?.trim().toLowerCase() || '',
      phone: phone?.trim() || '',
      company: company?.trim() || '',
      jobTitle: jobTitle?.trim() || '',
      address: address?.trim() || '',
      category: category?.trim() || 'General',
      notes: notes?.trim() || '',
      isFavorite: Boolean(isFavorite)
    });

    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      contact
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a contact
// @route   PUT /api/contacts/:id
// @access  Private
const updateContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found or you are not authorized to edit it'
      });
    }

    const fields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'company',
      'jobTitle',
      'address',
      'category',
      'notes',
      'isFavorite'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'email') {
          contact.email = req.body.email ? req.body.email.trim().toLowerCase() : '';
        } else if (field === 'isFavorite') {
          contact.isFavorite = Boolean(req.body.isFavorite);
        } else if (typeof req.body[field] === 'string') {
          contact[field] = req.body[field].trim();
        } else {
          contact[field] = req.body[field];
        }
      }
    });

    const updatedContact = await contact.save();

    res.json({
      success: true,
      message: 'Contact updated successfully',
      contact: updatedContact
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a contact
// @route   DELETE /api/contacts/:id
// @access  Private
const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found or you are not authorized to delete it'
      });
    }

    res.json({
      success: true,
      message: 'Contact deleted successfully',
      id: req.params.id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle contact favorite status
// @route   PATCH /api/contacts/:id/favorite
// @access  Private
const toggleFavorite = async (req, res, next) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found or you are not authorized to modify it'
      });
    }

    contact.isFavorite = !contact.isFavorite;
    await contact.save();

    res.json({
      success: true,
      message: contact.isFavorite ? 'Added to favorites' : 'Removed from favorites',
      contact
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  toggleFavorite
};
