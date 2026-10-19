const {
  generateCsvTemplate,
  exportContactsToCsv,
  parseCsvText,
  processCsvImport
} = require('../services/csvService');
const Contact = require('../models/Contact');

// @desc    Download sample CSV template
// @route   GET /api/csv/template
// @access  Public (or Private)
const getTemplate = (req, res) => {
  const csvContent = generateCsvTemplate();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="contact_manager_template.csv"');
  return res.status(200).send(csvContent);
};

// @desc    Export current user's contacts to CSV
// @route   GET /api/csv/export
// @access  Private
const exportContacts = async (req, res, next) => {
  try {
    const { category, isFavorite, search } = req.query;
    const query = { user: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }
    if (isFavorite !== undefined && isFavorite !== '') {
      query.isFavorite = isFavorite === 'true' || isFavorite === true;
    }
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { company: searchRegex }
      ];
    }

    const contacts = await Contact.find(query).sort({ firstName: 1, lastName: 1 });
    const csvContent = exportContactsToCsv(contacts);

    const timestamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="contacts_${timestamp}.csv"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// @desc    Import contacts from uploaded CSV file
// @route   POST /api/csv/import
// @access  Private
const importContacts = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CSV file was uploaded. Please upload a .csv file.'
      });
    }

    const csvString = req.file.buffer.toString('utf-8');
    const records = parseCsvText(csvString);

    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'The uploaded CSV file is empty or missing headers.'
      });
    }

    const duplicateStrategy = req.body.duplicateStrategy || 'skip'; // 'skip' or 'update'

    const summary = await processCsvImport(req.user._id, records, { duplicateStrategy });

    return res.status(200).json({
      success: true,
      message: `Import finished: ${summary.imported} imported, ${summary.updated} updated, ${summary.skipped} skipped, ${summary.failed} failed.`,
      summary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTemplate,
  exportContacts,
  importContacts
};
