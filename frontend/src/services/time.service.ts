/**
 * Time Math Service
 * 
 * Provides utilities for calculating the "Logical Date" based on a 04:00 AM cutoff.
 * If the current local time is before 04:00 AM, it is considered part of the previous day.
 */

import { ref, watch } from 'vue';

// Global reactive offset to support DEV time travel
const DEV_TIME_KEY = 'iota_dev_time_offset';
const OLD_DEV_TIME_KEY = 'kaizen_dev_time_offset';
const storedOffset = localStorage.getItem(DEV_TIME_KEY) || localStorage.getItem(OLD_DEV_TIME_KEY);

export const devOffsetDays = ref(storedOffset ? parseInt(storedOffset) : 0);

watch(devOffsetDays, (newVal) => {
  localStorage.setItem(DEV_TIME_KEY, String(newVal));
});

export function getNow(): Date {
  const msOffset = devOffsetDays.value * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + msOffset);
}

export function getLogicalDate(date: Date = getNow()): string {
  const logicalDate = new Date(date.getTime());
  // Subtract 4 hours from the provided date
  logicalDate.setHours(logicalDate.getHours() - 4);

  // Return in YYYY-MM-DD format based on local time
  const year = logicalDate.getFullYear();
  const month = String(logicalDate.getMonth() + 1).padStart(2, '0');
  const day = String(logicalDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getCurrentTimestamp(): string {
  return getNow().toISOString();
}