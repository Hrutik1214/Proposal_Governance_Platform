/**
 * Input Validation Utilities
 * Consistent "is required" validation responses across all fields
 */

// Validation Patterns
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const AADHAAR_REGEX = /^[2-9]\d{11}$/;
export const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const CIN_REGEX = /^[LUu][0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6}$/;
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,50}$/;
export const CONTACT_REGEX = /^\+?[0-9\s-]{10,15}$/;
export const PATENT_REGEX = /^[a-zA-Z0-9-]{5,30}$/;

/**
 * Validates Patent / Application ID
 */
export const validatePatentId = (patentId) => {
  if (!patentId || !patentId.trim()) {
    return { isValid: false, message: 'Patent / Application ID is required.' };
  }
  const clean = patentId.trim();
  if (clean.length < 5 || clean.length > 30) {
    return { isValid: false, message: 'A valid Patent ID is required (5 to 30 characters).' };
  }
  if (!PATENT_REGEX.test(clean)) {
    return { isValid: false, message: 'A valid Patent ID is required (e.g. US10123456 or 202521044863).' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validates a date string and ensures it is not in the future
 */
export const validatePastOrPresentDate = (dateStr, fieldName = 'Date') => {
  if (!dateStr || !dateStr.trim()) {
    return { isValid: false, message: `${fieldName} is required.` };
  }
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: `A valid ${fieldName} is required.` };
  }
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (dateObj > today) {
    return { isValid: false, message: `${fieldName} cannot be in the future.` };
  }
  return { isValid: true, message: '' };
};

/**
 * Validates a date string and ensures it is today or in the future
 */
export const validateFutureDate = (dateStr, fieldName = 'Target Date') => {
  if (!dateStr || !dateStr.trim()) {
    return { isValid: false, message: `${fieldName} is required.` };
  }
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: `A valid ${fieldName} is required.` };
  }
  const yesterday = new Date();
  yesterday.setHours(0, 0, 0, 0);
  if (dateObj < yesterday) {
    return { isValid: false, message: `${fieldName} cannot be in the past.` };
  }
  return { isValid: true, message: '' };
};

/**
 * Validates that end date is strictly after start date
 */
export const validateDateRange = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) {
    return { isValid: false, message: 'Start and end dates are required.' };
  }
  const startObj = new Date(startDateStr);
  const endObj = new Date(endDateStr);
  if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
    return { isValid: false, message: 'Valid start and end dates are required.' };
  }
  if (endObj <= startObj) {
    return { isValid: false, message: 'End date must be after start date.' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validates Credit / Debit card details for payment modal (10-30 char name, 16 digit card, unexpired MM/YY)
 */
export const validateCardDetails = (cardName, cardNumber, cardExpiry, cardCvv) => {
  // 1. Cardholder Name (10 to 30 chars)
  const trimmedName = (cardName || '').trim();
  if (!trimmedName) {
    return { isValid: false, message: 'Cardholder Name is required.' };
  }
  if (trimmedName.length < 10 || trimmedName.length > 30) {
    return { isValid: false, message: 'Cardholder Name must be between 10 and 30 characters.' };
  }
  if (!/^[a-zA-Z\s.]+$/.test(trimmedName)) {
    return { isValid: false, message: 'Cardholder Name must contain letters and spaces only.' };
  }

  // 2. Card Number (16 digits)
  const digitsOnly = (cardNumber || '').replace(/\s+/g, '');
  if (!digitsOnly || digitsOnly.length !== 16 || !/^\d{16}$/.test(digitsOnly)) {
    return { isValid: false, message: 'Card Number must be a valid 16-digit number.' };
  }

  // 3. Expiry Date (MM/YY) and unexpired check
  if (!cardExpiry || !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardExpiry)) {
    return { isValid: false, message: 'Expiry Date must be in MM/YY format (e.g. 12/28).' };
  }

  const [monthStr, yearStr] = cardExpiry.split('/');
  const expMonth = parseInt(monthStr, 10);
  const expYear = 2000 + parseInt(yearStr, 10);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed (Jan = 1, Dec = 12)

  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return { isValid: false, message: 'Card has expired. Please use an unexpired card date.' };
  }

  if (expYear > currentYear + 25) {
    return { isValid: false, message: 'Expiry year cannot exceed 25 years in the future.' };
  }

  // 4. CVV (3-4 digits)
  if (!cardCvv || !/^\d{3,4}$/.test(cardCvv)) {
    return { isValid: false, message: 'CVV / CVC must be 3 or 4 digits.' };
  }

  return { isValid: true, message: '' };
};

/**
 * Validates Contact Number
 */
export const validateContactNumber = (contactNumber) => {
  if (!contactNumber || !contactNumber.trim()) {
    return { isValid: false, message: 'Contact Number is required.' };
  }
  if (!CONTACT_REGEX.test(contactNumber.trim())) {
    return { isValid: false, message: 'A valid Contact Number is required (e.g. +91 98123 45678).' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validates PAN Card Number
 */
export const validatePan = (pan) => {
  if (!pan || !pan.trim()) {
    return { isValid: false, message: 'PAN Card Number is required.' };
  }
  const cleanPan = pan.trim().toUpperCase();
  if (!PAN_REGEX.test(cleanPan)) {
    return { isValid: false, message: 'A valid 10-character PAN Card Number is required (e.g. ABCDE1234F).' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validates Aadhaar Card Number
 */
export const validateAadhaar = (aadhaar) => {
  if (!aadhaar || !aadhaar.trim()) {
    return { isValid: false, message: 'Aadhaar Card Number is required.' };
  }

  const clean = aadhaar.trim().replace(/[\s-]/g, '');

  if (clean.length !== 12 || !/^\d+$/.test(clean)) {
    return { isValid: false, message: 'A valid 12-digit Aadhaar Card Number is required.' };
  }

  if (clean.startsWith('0') || clean.startsWith('1')) {
    return { isValid: false, message: 'A valid Aadhaar Card Number is required (cannot start with 0 or 1).' };
  }

  if (/^(\d)\1{11}$/.test(clean)) {
    return { isValid: false, message: 'A valid Aadhaar Card Number is required.' };
  }

  if (!AADHAAR_REGEX.test(clean)) {
    return { isValid: false, message: 'A valid 12-digit Aadhaar Card Number is required.' };
  }

  return { isValid: true, message: '' };
};

/**
 * Validates Password Strength
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required.' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password is required to be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password is required to contain at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password is required to contain at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password is required to contain at least one number (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: 'Password is required to contain at least one special character (!@#$%^&*).' };
  }

  return { isValid: true, message: '' };
};

/**
 * Helper to check password complexity criteria for UI feedback
 */
export const getPasswordComplexityDetails = (password = '') => {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
};

/**
 * Validates Email Address
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, message: 'Email Address is required.' };
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return { isValid: false, message: 'A valid Email Address is required (e.g. name@domain.com).' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validates Username
 */
export const validateUsername = (username) => {
  if (!username || !username.trim()) {
    return { isValid: false, message: 'Username is required.' };
  }
  if (username.length < 3 || username.length > 50) {
    return { isValid: false, message: 'Username is required to be between 3 and 50 characters.' };
  }
  if (!USERNAME_REGEX.test(username.trim())) {
    return { isValid: false, message: 'A valid Username is required (letters, numbers, underscores, hyphens).' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validates Full Name
 */
export const validateFullName = (fullName) => {
  if (!fullName || !fullName.trim()) {
    return { isValid: false, message: 'Full Name is required.' };
  }
  if (fullName.trim().length < 2) {
    return { isValid: false, message: 'Full Name is required to be at least 2 characters.' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validates GST Number
 */
export const validateGst = (gst) => {
  if (!gst || !gst.trim()) {
    return { isValid: false, message: 'GSTIN Number is required.' };
  }
  const clean = gst.trim().toUpperCase();
  if (!GST_REGEX.test(clean)) {
    return { isValid: false, message: 'A valid 15-character GSTIN Number is required (e.g. 22AAAAA0000A1Z5).' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validates CIN Number
 */
export const validateCin = (cin) => {
  if (!cin || !cin.trim()) {
    return { isValid: false, message: 'CIN Number is required.' };
  }
  const clean = cin.trim().toUpperCase();
  if (!CIN_REGEX.test(clean)) {
    return { isValid: false, message: 'A valid 21-character CIN Number is required (e.g. L12345MH2020PLC12345).' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validates Web URLs
 */
export const validateUrl = (url, fieldName = 'URL') => {
  if (!url || !url.trim()) return { isValid: true, message: '' };
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { isValid: false, message: `A valid ${fieldName} is required starting with http:// or https://` };
    }
    return { isValid: true, message: '' };
  } catch {
    return { isValid: false, message: `A valid ${fieldName} is required (e.g. https://...).` };
  }
};

// CommonJS compatibility for require() support
try {
  if (typeof module !== 'undefined' && module && module.exports) {
    module.exports = {
      PAN_REGEX,
      EMAIL_REGEX,
      AADHAAR_REGEX,
      GST_REGEX,
      CIN_REGEX,
      USERNAME_REGEX,
      CONTACT_REGEX,
      PATENT_REGEX,
      validateContactNumber,
      validatePan,
      validateAadhaar,
      validatePassword,
      getPasswordComplexityDetails,
      validateEmail,
      validateUsername,
      validateFullName,
      validateGst,
      validateCin,
      validateUrl,
      validatePatentId,
      validatePastOrPresentDate,
      validateFutureDate,
      validateDateRange,
      validateCardDetails
    };
  }
} catch {
  // Ignored in pure ESM environments
}
