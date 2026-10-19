const { sanitizeCsvValue } = require('../utils/sanitize');
const Contact = require('../models/Contact');

/**
 * Generates sample CSV template string
 */
function generateCsvTemplate() {
  const headers = [
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

  const sampleRows = [
    [
      'Sarah',
      'Connor',
      'sarah.connor@example.com',
      '+1-555-0199',
      'Cyberdyne Systems',
      'Security Director',
      'Los Angeles, CA',
      'Work',
      'Key point of contact for security audit',
      'true'
    ],
    [
      'Alex',
      'Morgan',
      'alex.m@example.org',
      '+1-555-0142',
      'TechNova Inc',
      'Frontend Architect',
      'Austin, TX',
      'Personal',
      'Met at React Summit',
      'false'
    ]
  ];

  const lines = [
    headers.join(','),
    ...sampleRows.map(row => row.map(sanitizeCsvValue).join(','))
  ];

  return lines.join('\r\n');
}

/**
 * Exports an array of contact documents to sanitized CSV format
 */
function exportContactsToCsv(contacts) {
  const headers = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'company',
    'jobTitle',
    'address',
    'category',
    'notes',
    'isFavorite',
    'createdAt',
    'updatedAt'
  ];

  const rows = contacts.map(contact => [
    sanitizeCsvValue(contact.firstName || ''),
    sanitizeCsvValue(contact.lastName || ''),
    sanitizeCsvValue(contact.email || ''),
    sanitizeCsvValue(contact.phone || ''),
    sanitizeCsvValue(contact.company || ''),
    sanitizeCsvValue(contact.jobTitle || ''),
    sanitizeCsvValue(contact.address || ''),
    sanitizeCsvValue(contact.category || 'General'),
    sanitizeCsvValue(contact.notes || ''),
    sanitizeCsvValue(contact.isFavorite ? 'true' : 'false'),
    sanitizeCsvValue(contact.createdAt ? contact.createdAt.toISOString() : ''),
    sanitizeCsvValue(contact.updatedAt ? contact.updatedAt.toISOString() : '')
  ]);

  const lines = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ];

  return lines.join('\r\n');
}

/**
 * Robust CSV Line Parser supporting quoted fields, escaped quotes, commas inside quotes
 */
function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip the escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

/**
 * Parses raw CSV string into array of object records
 */
function parseCsvText(csvText) {
  if (!csvText || typeof csvText !== 'string') {
    return [];
  }

  // Split lines (handling \r\n, \r, or \n)
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return [];
  }

  const rawHeaders = parseCsvLine(lines[0]);
  // Normalize header names: lowercase, strip quotes and whitespace
  const headers = rawHeaders.map(h => h.replace(/['"]+/g, '').trim());

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const rowValues = parseCsvLine(lines[i]);
    const rowObj = { _rowNumber: i + 1 };
    
    headers.forEach((header, index) => {
      let val = rowValues[index] !== undefined ? rowValues[index] : '';
      // Strip leading and trailing quotes if left
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      rowObj[header] = val;
    });

    records.push(rowObj);
  }

  return records;
}

/**
 * Validates a single CSV contact row
 */
function validateRow(row) {
  const errors = [];

  // Required: firstName (check case variations)
  const firstName = row.firstName || row.firstname || row['First Name'] || row.first_name;
  if (!firstName || !firstName.trim()) {
    errors.push('First name is required');
  }

  // Email format validation if email is present
  const email = (row.email || row.Email || '').trim();
  if (email) {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(email)) {
      errors.push(`Invalid email format: "${email}"`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Imports records for a specific user with duplicate detection and error tracking
 */
async function processCsvImport(userId, records, options = {}) {
  const { duplicateStrategy = 'skip' } = options; // 'skip', 'update', or 'allow'

  const summary = {
    totalRows: records.length,
    imported: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    details: []
  };

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;

  for (const record of records) {
    const rowNumber = record._rowNumber;
    const firstName = (record.firstName || record.firstname || record['First Name'] || record.first_name || '').trim();
    const lastName = (record.lastName || record.lastname || record['Last Name'] || record.last_name || '').trim();
    const email = (record.email || record.Email || '').trim().toLowerCase();
    const phone = (record.phone || record.Phone || record['Phone Number'] || record.phone_number || '').trim();
    const company = (record.company || record.Company || '').trim();
    const jobTitle = (record.jobTitle || record.jobtitle || record['Job Title'] || record.job_title || '').trim();
    const address = (record.address || record.Address || '').trim();
    const category = (record.category || record.Category || 'General').trim();
    const notes = (record.notes || record.Notes || '').trim();
    const isFavoriteStr = (record.isFavorite || record.isfavorite || record.favorite || '').trim().toLowerCase();
    const isFavorite = isFavoriteStr === 'true' || isFavoriteStr === '1' || isFavoriteStr === 'yes';

    // Validation
    const errors = [];
    if (!firstName) {
      errors.push('Missing first name');
    }
    if (email && !emailRegex.test(email)) {
      errors.push(`Invalid email format: ${email}`);
    }

    if (errors.length > 0) {
      summary.failed++;
      summary.details.push({
        row: rowNumber,
        status: 'FAILED',
        name: `${firstName} ${lastName}`.trim() || 'N/A',
        email: email || 'N/A',
        reason: errors.join(', ')
      });
      continue;
    }

    try {
      // Check for duplicate in user's contacts (by email or phone if provided)
      let existingContact = null;
      if (email) {
        existingContact = await Contact.findOne({ user: userId, email });
      }
      if (!existingContact && phone) {
        existingContact = await Contact.findOne({ user: userId, phone });
      }

      if (existingContact) {
        if (duplicateStrategy === 'skip') {
          summary.skipped++;
          summary.details.push({
            row: rowNumber,
            status: 'SKIPPED',
            name: `${firstName} ${lastName}`.trim(),
            email: email || phone,
            reason: 'Duplicate contact exists (matched email or phone)'
          });
          continue;
        } else if (duplicateStrategy === 'update') {
          existingContact.firstName = firstName;
          if (lastName) existingContact.lastName = lastName;
          if (phone) existingContact.phone = phone;
          if (company) existingContact.company = company;
          if (jobTitle) existingContact.jobTitle = jobTitle;
          if (address) existingContact.address = address;
          if (category) existingContact.category = category;
          if (notes) existingContact.notes = notes;
          existingContact.isFavorite = isFavorite;

          await existingContact.save();
          summary.updated++;
          summary.details.push({
            row: rowNumber,
            status: 'UPDATED',
            name: `${firstName} ${lastName}`.trim(),
            email: email || phone,
            reason: 'Existing contact updated'
          });
          continue;
        }
      }

      // Create new contact
      await Contact.create({
        user: userId,
        firstName,
        lastName,
        email,
        phone,
        company,
        jobTitle,
        address,
        category: category || 'General',
        notes,
        isFavorite
      });

      summary.imported++;
      summary.details.push({
        row: rowNumber,
        status: 'SUCCESS',
        name: `${firstName} ${lastName}`.trim(),
        email: email || phone,
        reason: 'Contact successfully imported'
      });
    } catch (err) {
      summary.failed++;
      summary.details.push({
        row: rowNumber,
        status: 'FAILED',
        name: `${firstName} ${lastName}`.trim(),
        email: email || phone,
        reason: err.message
      });
    }
  }

  return summary;
}

module.exports = {
  generateCsvTemplate,
  exportContactsToCsv,
  parseCsvText,
  validateRow,
  processCsvImport
};
