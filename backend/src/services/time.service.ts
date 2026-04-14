/**
 * Time Math Service (Backend)
 * 
 * Consistent with frontend/src/services/time.service.ts
 */

export function getLogicalDate(date: Date = new Date()): string {
  const logicalDate = new Date(date.getTime());
  // Subtract 4 hours from the provided date
  logicalDate.setHours(logicalDate.getHours() - 4);

  // Return in YYYY-MM-DD format
  const year = logicalDate.getFullYear();
  const month = String(logicalDate.getMonth() + 1).padStart(2, '0');
  const day = String(logicalDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
