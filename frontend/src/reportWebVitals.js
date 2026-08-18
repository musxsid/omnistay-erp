const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then((webVitals) => {
      if (webVitals.onCLS) {
        webVitals.onCLS(onPerfEntry);
        webVitals.onFCP(onPerfEntry);
        webVitals.onLCP(onPerfEntry);
        webVitals.onTTFB(onPerfEntry);
      }
    }).catch(() => {});
  }
};

export default reportWebVitals;
