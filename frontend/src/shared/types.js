/**
 * @typedef {Object} Item
 * @property {string} id - Primary id (also QR payload)
 * @property {string} name - Equipment name (e.g., "Prusa MK3S")
 * @property {'Printer'|'Tool'|'Material'|'Electronics'|'Safety'|'Other'} category - Item category
 * @property {'available'|'checked_out'|'broken'} status - Current status
 * @property {string} locationPath - Location path (e.g., "Senior Lab › North Bench")
 * @property {string} [thumbnailUrl] - Optional placeholder image URL
 * @property {[number, number, number]} [hotspot] - Optional 3D focus point coordinates
 */

/**
 * @typedef {Object} Issue
 * @property {string} itemId - ID of the item the issue is about
 * @property {'Clogged'|'Jammed'|'Broken'|'Other'} type - Type of issue
 * @property {string} notes - Additional notes about the issue
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the API call was successful
 * @property {any} [data] - Response data
 * @property {string} [error] - Error message if unsuccessful
 */

export const ITEM_CATEGORIES = [
  'Printer',
  'Tool',
  'Material',
  'Electronics',
  'Safety',
  'Other'
];

export const ITEM_STATUSES = [
  'available',
  'checked_out',
  'broken'
];

export const ISSUE_TYPES = [
  'Clogged',
  'Jammed',
  'Broken',
  'Other'
];