const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
      validate: {
        validator: function (v) {
          if (!v) return true; // Optional field
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(v);
        },
        message: props => `${props.value} is not a valid email address`
      }
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: [30, 'Phone number cannot exceed 30 characters']
    },
    company: {
      type: String,
      trim: true,
      default: '',
      maxlength: [80, 'Company cannot exceed 80 characters']
    },
    jobTitle: {
      type: String,
      trim: true,
      default: '',
      maxlength: [80, 'Job title cannot exceed 80 characters']
    },
    address: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Address cannot exceed 200 characters']
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
      maxlength: [40, 'Category cannot exceed 40 characters']
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Virtual for full name
contactSchema.virtual('fullName').get(function () {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Configure JSON output to include virtuals
contactSchema.set('toJSON', { virtuals: true });
contactSchema.set('toObject', { virtuals: true });

// Compound indexes for performant searching and filtering per user
contactSchema.index({ user: 1, firstName: 1, lastName: 1 });
contactSchema.index({ user: 1, email: 1 });
contactSchema.index({ user: 1, phone: 1 });
contactSchema.index({ user: 1, category: 1 });
contactSchema.index({ user: 1, isFavorite: 1 });
contactSchema.index({ user: 1, createdAt: -1 });

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;
