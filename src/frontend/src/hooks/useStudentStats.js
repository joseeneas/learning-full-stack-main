// useStudentStats.js
// Custom hook to derive student statistics (counts and percentages) memoized.
import { useMemo } from 'react';

// Normalize backend/CSV gender values to canonical display labels
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

export default function useStudentStats(students) {
  return useMemo(() => {
    const total = students.length;
    const genderCounts = students.reduce((acc, s) => {
      const g = normalizeGender(s.gender);
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {});
    const genderPercentages = Object.fromEntries(
      Object.entries(genderCounts).map(([g, c]) => [g, total ? +(c * 100 / total).toFixed(1) : 0])
    );
    const domainCounts = students.reduce((acc, s) => {
      if (s.email && s.email.includes('@')) {
        const domain = s.email.split('@')[1].toLowerCase();
        acc[domain] = (acc[domain] || 0) + 1;
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
