const express = require('express');
const { body } = require('express-validator');
const {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  toggleFavorite
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// All contact routes require authentication
router.use(protect);

router.get('/', getContacts);
router.get('/:id', getContactById);

router.post(
  '/',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('email')
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage('Please provide a valid email address'),
    validate
  ],
  createContact
);

router.put(
  '/:id',
  [
    body('firstName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('First name cannot be empty'),
    body('email')
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage('Please provide a valid email address'),
    validate
  ],
  updateContact
);

router.delete('/:id', deleteContact);
router.patch('/:id/favorite', toggleFavorite);

module.exports = router;
