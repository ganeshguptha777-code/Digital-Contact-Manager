/**
 * Prevents CSV Formula Injection (DDE injection) in CSV cell values.
 * If a value starts with characters that could trigger formulas in Excel/Sheets
 * (=, +, -, @, \t, \r), safely prepend a single quote.
 */
function sanitizeCsvValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  let str = String(value);

  // Check if starts with potentially dangerous formula prefixes
  const dangerousPrefixes = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerousPrefixes.some(prefix => str.startsWith(prefix))) {
    str = `'${str}`;
  }

  // Escape double quotes by doubling them
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

module.exports = {
  sanitizeCsvValue
};
