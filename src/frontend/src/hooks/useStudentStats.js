// useStudentStats.js
// Custom hook to derive student statistics (counts and percentages) memoized.
import { useMemo } from 'react';

/**
 * Normalizes a gender value to a standardized format.
 * 
 * @param {string|null|undefined} value - The gender value to normalize (e.g., 'M', 'F', 'Male', 'Female', 'Other')
 * @returns {string} Returns 'Male', 'Female', 'Other', or 'Unknown' based on the input value.
 *                   Returns 'Unknown' for null, undefined, empty strings, or unrecognized values.
 * 
 * @example
 * normalizeGender('M'); // returns 'Male'
 * normalizeGender('FEMALE'); // returns 'Female'
 * normalizeGender('non-binary'); // returns 'Other'
 * normalizeGender(null); // returns 'Unknown'
 */
function normalizeGender(value) {
  if (value == null) return 'Unknown';
  const s = String(value).trim();
  if (s.length === 0) return 'Unknown';
  const u = s.toUpperCase();
  if (u === 'M' || u === 'MALE') return 'Male';
  if (u === 'F' || u === 'FEMALE') return 'Female';
  if (u === 'O' || u === 'OTHER' || u === 'NON-BINARY' || u === 'NONBINARY' || u === 'NB') return 'Other';
  return 'Unknown';
}

/**
 * Custom React hook that computes statistical information about a collection of students.
 * 
 * @param {Array<Object>} students - Array of student objects containing gender and email properties
 * @returns {Object} An object containing:
 *   - total {number} - Total number of students
 *   - genderCounts {Object} - Object mapping normalized gender strings to their counts
 *   - genderPercentages {Object} - Object mapping normalized gender strings to their percentage (1 decimal place)
 *   - domains {Array<Object>} - Sorted array (descending by count) of email domain statistics, each containing:
 *     - domain {string} - The email domain (lowercase)
 *     - count {number} - Number of students with this domain
 *     - percentage {number} - Percentage of students with this domain (1 decimal place)
 * 
 * @example
 * const students = [
 *   { gender: 'male', email: 'john@example.com' },
 *   { gender: 'female', email: 'jane@example.com' }
 * ];
 * const stats = useStudentStats(students);
 * stats = {
 *    total: 2,
 *    genderCounts: { Male: 1, Female: 1 },
 *    genderPercentages: { Male: 50.0, Female: 50.0 },
 *    domains: [
 *      { domain: 'example.com', count: 2, percentage: 100.0 }
 *    ]
 *  }
 */
export default function useStudentStats(students) {
  return useMemo(() => {
    const total        = students.length;
    const genderCounts = students.reduce((acc, s) => {
      const g = normalizeGender(s.gender);
      acc[g]  = (acc[g] || 0) + 1;
      return acc;
    }, {});
    const genderPercentages = Object.fromEntries(
      Object.entries(genderCounts).map(([g, c]) => [g, total ? +(c * 100 / total).toFixed(1) : 0])
    );
    const domainCounts = students.reduce((acc, s) => {
      if (s.email && s.email.includes('@')) {
        const domain = s.email.split('@')[1].toLowerCase();
        acc[domain]  = (acc[domain] || 0) + 1;
      }
      return acc;
    }, {});
    const domains = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([domain, count]) => ({
        domain,
        count,
        percentage: total ? +(count * 100 / total).toFixed(1) : 0
      }));
    return { total, genderCounts, genderPercentages, domains };
  }, [students]);
}
