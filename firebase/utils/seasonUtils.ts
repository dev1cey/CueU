import { Timestamp } from 'firebase/firestore';
import { Season } from '../types';

/**
 * Calculate the total number of weeks in a season based on start and end dates
 * Assumes weeks start on Monday and end on Sunday
 */
export const calculateTotalWeeks = (startDate: Timestamp, endDate: Timestamp): number => {
  const start = startDate.toDate();
  const end = endDate.toDate();
  
  // Set both dates to start of day
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  // Calculate the difference in milliseconds
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Calculate weeks (round up to include partial weeks)
  const weeks = Math.ceil(diffDays / 7);
  
  return Math.max(1, weeks); // At least 1 week
};

/**
 * Calculate the current week number (1-based) based on start date and current date
 * Returns 0 if before season starts, or totalWeeks + 1 if after season ends
 */
export const calculateCurrentWeek = (
  startDate: Timestamp,
  endDate: Timestamp,
  currentDate: Date = new Date()
): number => {
  const start = startDate.toDate();
  const end = endDate.toDate();
  
  // Set all dates to start of day
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);
  
  // If before season starts
  if (currentDate < start) {
    return 0;
  }
  
  // If after season ends
  if (currentDate > end) {
    return calculateTotalWeeks(startDate, endDate) + 1;
  }
  
  // Calculate the difference in milliseconds
  const diffTime = currentDate.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Calculate current week (1-based)
  const week = Math.floor(diffDays / 7) + 1;
  
  return Math.max(1, week);
};

/**
 * Get calculated week information for a season
 */
export const getSeasonWeekInfo = (season: Season | null): { currentWeek: number; totalWeeks: number } => {
  if (!season) {
    return { currentWeek: 0, totalWeeks: 0 };
  }
  
  const totalWeeks = calculateTotalWeeks(season.startDate, season.endDate);
  const currentWeek = calculateCurrentWeek(season.startDate, season.endDate);
  
  return { currentWeek, totalWeeks };
};

