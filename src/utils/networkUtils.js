/**
 * Network utilities for diagnosing connectivity issues
 */

// Test server connectivity with detailed diagnostics
export const checkServerConnectivity = async (url, timeout = 5000) => {
  const results = {
    online: navigator.onLine,
    available: false,
    latency: null,
    error: null,
    timestamp: new Date().toISOString(),
    details: {}
  };
  
  try {
    const startTime = performance.now();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store' // Prevent caching
    });
    
    clearTimeout(timeoutId);
    
    // Calculate latency
    results.latency = Math.round(performance.now() - startTime);
    
    // Set availability based on response
    results.available = response.ok;
    
    // Add response details
    results.details = {
      status: response.status,
      statusText: response.statusText
    };
    
    // Try to get response body if it's valid
    if (response.ok) {
      try {
        results.details.data = await response.json();
      } catch (e) {
        results.details.bodyError = 'Unable to parse response body';
      }
    }
  } catch (error) {
    results.error = error.message || 'Unknown error';
    
    // Add specific error information
    if (error.name === 'AbortError') {
      results.details.errorType = 'Timeout';
    } else {
      results.details.errorType = error.name;
      results.details.errorStack = error.stack;
    }
  }
  
  return results;
};

// Check if we can reach common internet sites
export const checkInternetConnectivity = async () => {
  const sites = [
    { name: 'Google', url: 'https://www.google.com/generate_204' },
    { name: 'Cloudflare', url: 'https://1.1.1.1/cdn-cgi/trace' }
  ];
  
  const results = [];
  
  for (const site of sites) {
    try {
      const startTime = performance.now();
      const response = await fetch(site.url, { 
        mode: 'no-cors',
        cache: 'no-store'
      });
      const latency = Math.round(performance.now() - startTime);
      
      results.push({
        name: site.name,
        reachable: true,
        latency
      });
    } catch (error) {
      results.push({
        name: site.name,
        reachable: false,
        error: error.message
      });
    }
  }
  
  return {
    internetAvailable: results.some(site => site.reachable),
    sites: results,
    timestamp: new Date().toISOString()
  };
};

export default {
  checkServerConnectivity,
  checkInternetConnectivity
};
