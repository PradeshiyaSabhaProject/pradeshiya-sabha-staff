export interface ValidationResult<T> {
  valid: boolean
  value: T
  error: string
}

export type BookingActionResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: Record<string, string> }

export const FLEET_WARD_NAMES = [
  'Homagama Town (Ward 01)',
  'Pitipana (Ward 02)',
  'Godagama (Ward 03)',
  'Meegoda (Ward 04)',
  'Panagoda (Ward 05)',
  'Mattegoda (Ward 06)',
  'Diyagama (Ward 07)',
  'Kahathuduwa (Ward 08)',
  'Kiriwattuduwa (Ward 09)',
] as const

export const APPROVED_DISPOSAL_PLANTS = [
  'Kerawalapitiya Septage Treatment Plant',
  'Homagama Regional Sludge Lagoon',
  'Kolonnawa Septage Processing Centre',
] as const

/** Validates and normalizes a Sri Lankan NIC. */
export function validateNic(input: string, now = new Date()): ValidationResult<string> {
  const value = input.trim().toUpperCase()
  const invalid = 'Enter a valid NIC: 9 digits followed by V or X, or 12 digits.'
  const oldFormat = /^(\d{2})(\d{3})\d{4}([VX])$/.exec(value)
  const newFormat = /^(\d{4})(\d{3})\d{5}$/.exec(value)
  if (!oldFormat && !newFormat) return { valid: false, value, error: invalid }

  const yearText = oldFormat?.[1] ?? newFormat?.[1] ?? ''
  const day = Number(oldFormat?.[2] ?? newFormat?.[2])
  const year = oldFormat
    ? (Number(yearText) <= now.getFullYear() % 100 ? 2000 : 1900) + Number(yearText)
    : Number(yearText)
  const validDay = (day >= 1 && day <= 366) || (day >= 501 && day <= 866)
  if (!validDay || year > now.getFullYear()) return { valid: false, value, error: invalid }
  return { valid: true, value, error: '' }
}

/** Validates and normalizes a Sri Lankan mobile number to its 07XXXXXXXX form. */
export function validateMobile(input: string): ValidationResult<string> {
  const trimmed = input.trim()
  const allowedFormat =
    /^07\d{8}$/.test(trimmed) ||
    /^07\d \d{3} \d{4}$/.test(trimmed) ||
    /^07\d-\d{7}$/.test(trimmed) ||
    /^\+947\d{8}$/.test(trimmed) ||
    /^947\d{8}$/.test(trimmed)
  if (!allowedFormat) {
    return { valid: false, value: trimmed.replace(/[\s-]/g, ''), error: 'Enter a valid mobile number, e.g. 077 123 4567.' }
  }
  const digits = trimmed.replace(/[\s-]/g, '')
  let value = digits
  if (/^\+947\d{8}$/.test(digits)) value = `0${digits.slice(3)}`
  else if (/^947\d{8}$/.test(digits)) value = `0${digits.slice(2)}`
  if (!/^07\d{8}$/.test(value)) {
    return { valid: false, value, error: 'Enter a valid mobile number, e.g. 077 123 4567.' }
  }
  return { valid: true, value, error: '' }
}

/** Trims and validates a Unicode personal name. */
export function validateFullName(input: string): ValidationResult<string> {
  const value = input.trim().replace(/ +/g, ' ')
  if (value.length < 3 || value.length > 60) {
    return { valid: false, value, error: 'Name must be between 3 and 60 characters.' }
  }
  if (!/^[\p{L}\p{M}\u200D .'-]+$/u.test(value) || !/\p{L}/u.test(value)) {
    return { valid: false, value, error: "Name can only contain letters, spaces and . ' -" }
  }
  return { valid: true, value, error: '' }
}

/** Trims and validates a street address. */
export function validateStreetAddress(input: string): ValidationResult<string> {
  const value = input.trim().replace(/ +/g, ' ')
  if (
    value.length < 5 ||
    value.length > 120 ||
    !/^[\p{L}\p{M}\u200D\d ,./()#-]+$/u.test(value) ||
    !/\p{L}/u.test(value)
  ) {
    return { valid: false, value, error: 'Enter an address of 5–120 characters containing at least one letter.' }
  }
  return { valid: true, value, error: '' }
}

/** Checks that a selected ward belongs to the supplied options. */
export function validateWard(input: string, options: readonly string[]): ValidationResult<string> {
  const value = input.trim()
  return options.includes(value)
    ? { valid: true, value, error: '' }
    : { valid: false, value, error: 'Choose a listed ward.' }
}

/** Validates a numeric value against an inclusive range and optional precision. */
export function validateNumber(
  input: string | number,
  min: number,
  max: number,
  integer = false
): ValidationResult<number> {
  const value = typeof input === 'number' ? input : Number(input)
  const precisionValid = !integer || Number.isInteger(value)
  if (input === '' || !Number.isFinite(value) || !precisionValid || value < min || value > max) {
    return { valid: false, value, error: `Enter a value between ${min} and ${max}.` }
  }
  return { valid: true, value, error: '' }
}

/** Validates a finite positive number when no upper bound is specified. */
export function validatePositiveNumber(input: string | number): ValidationResult<number> {
  const value = typeof input === 'number' ? input : Number(input)
  return input !== '' && Number.isFinite(value) && value > 0
    ? { valid: true, value, error: '' }
    : { valid: false, value, error: 'Enter a value greater than zero.' }
}

/** Validates a non-negative whole number without imposing an arbitrary maximum. */
export function validateNonNegativeInteger(input: string | number): ValidationResult<number> {
  const value = typeof input === 'number' ? input : Number(input)
  return input !== '' && Number.isSafeInteger(value) && value >= 0
    ? { valid: true, value, error: '' }
    : { valid: false, value, error: 'Enter a non-negative whole number.' }
}

/** Validates flowmeter readings and returns the computed delivered volume. */
export function validateFlowmeterReadings(
  startInput: string | number,
  endInput: string | number
): ValidationResult<{ start: number; end: number; litresDelivered: number }> {
  const start = validateNonNegativeInteger(startInput)
  const end = validateNonNegativeInteger(endInput)
  const value = { start: start.value, end: end.value, litresDelivered: end.value - start.value }
  if (!start.valid || !end.valid || value.litresDelivered <= 0) {
    return { valid: false, value, error: 'Flowmeter start must be non-negative and end must exceed start.' }
  }
  return { valid: true, value, error: '' }
}

/** Normalizes and validates a receipt or weighbridge reference. */
export function validateReferenceText(input: string): ValidationResult<string> {
  const value = input.trim().toUpperCase()
  return /^[A-Z0-9/-]{4,20}$/.test(value)
    ? { valid: true, value, error: '' }
    : { valid: false, value, error: 'Enter a reference using 4–20 letters, digits, hyphens or slashes.' }
}

/** Removes control characters, trims, and validates free text. */
export function validateFreeText(
  input: string,
  options: { required?: boolean; min?: number; max?: number } = {}
): ValidationResult<string> {
  const value = stripControlCharacters(input).trim()
  const min = options.min ?? (options.required ? 1 : 0)
  const max = options.max ?? 300
  if (value.length < min || value.length > max) {
    const error = options.required && min >= 10
      ? 'Enter a reason between 10 and 300 characters.'
      : `Text must be ${min === 0 ? 'no more than' : `between ${min} and`} ${max} characters.`
    return { valid: false, value, error }
  }
  return { valid: true, value, error: '' }
}

/** Removes ASCII and C1 control characters from user-entered text. */
function stripControlCharacters(input: string): string {
  return input.split('').filter((character) => {
    const code = character.charCodeAt(0)
    return code >= 32 && (code < 127 || code > 159)
  }).join('')
}

/** Removes disallowed typed characters from a NIC input and uppercases it. */
export function filterNicInput(input: string): string {
  return input.replace(/[^a-z\d]/gi, '').toUpperCase().slice(0, 12)
}

/** Keeps only mobile-number digits, separators, and an optional leading plus. */
export function filterMobileInput(input: string): string {
  const leadingPlus = input.startsWith('+') ? '+' : ''
  return `${leadingPlus}${input.replace(/[^\d -]/g, '').replace(/^\+/, '')}`.slice(0, 15)
}

/** Formats a normalized Sri Lankan mobile number for display. */
export function formatMobileNumber(input: string): string {
  const result = validateMobile(input)
  return result.valid ? `${result.value.slice(0, 3)}-${result.value.slice(3)}` : input
}

/** Keeps numeric input characters and at most one decimal point. */
export function filterNumericInput(input: string, decimals: boolean): string {
  const filtered = input.replace(/[^\d.]/g, '')
  if (!decimals) return filtered.replace(/\./g, '')
  const [whole, ...fraction] = filtered.split('.')
  return fraction.length ? `${whole}.${fraction.join('')}` : whole
}

/** Filters signed latitude/longitude input to digits and one decimal point. */
export function filterCoordinateInput(input: string): string {
  const sign = input.startsWith('-') ? '-' : ''
  const filtered = input.replace(/[^\d.]/g, '')
  const [whole, ...fraction] = filtered.split('.')
  return `${sign}${fraction.length ? `${whole}.${fraction.join('')}` : whole}`
}

/** Filters a personal name while preserving Unicode letters and Sinhala joiners. */
export function filterNameInput(input: string): string {
  return input.replace(/[^\p{L}\p{M}\u200D .'-]/gu, '')
}
