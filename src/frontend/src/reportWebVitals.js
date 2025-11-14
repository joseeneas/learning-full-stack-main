/**
 * Reports web vitals metrics using the web-vitals library.
 * Dynamically imports and measures Core Web Vitals including:
 * - CLS (Cumulative Layout Shift)
 * - FID (First Input Delay)
 * - FCP (First Contentful Paint)
 * - LCP (Largest Contentful Paint)
 * - TTFB (Time to First Byte)
 * 
 * @param {Function} onPerfEntry - Callback function to handle performance entries.
 *                                 Will be called for each web vital metric measured.
 * @returns {void}
 * 
 * @example
 * reportWebVitals(console.log);
 * 
 * @example
 * reportWebVitals((metric) => {
 *   analytics.send(metric);
 * });
 */
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
