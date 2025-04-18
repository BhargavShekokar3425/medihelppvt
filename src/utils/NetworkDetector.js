// Utility for detecting and handling network issues

class NetworkDetector {
  constructor() {
    this._isOnline = navigator.onLine;
    this._listeners = [];
    
    // Set up listeners for online/offline events
    window.addEventListener('online', () => this._updateStatus(true));
    window.addEventListener('offline', () => this._updateStatus(false));
  }
  
  // Update online status
  _updateStatus(isOnline) {
    this._isOnline = isOnline;
    
    // Notify listeners
    this._listeners.forEach(listener => {
      listener(isOnline);
    });
    
    // Log status change
    console.log(`Network status changed: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
  }
  
  // Add listener for status changes
  addListener(callback) {
    // Add listener only if it's not already present
    if (!this._listeners.includes(callback)) {
      this._listeners.push(callback);
      
      // Immediately call with current status
      callback(this._isOnline);
    }
    
    // Return function to remove listener
    return () => {
      this._listeners = this._listeners.filter(l => l !== callback);
    };
  }
  
  // Check if online
  isOnline() {
    return this._isOnline;
  }
  
  // Perform an action with network retry
  async withRetry(action, options = {}) {
    const { maxRetries = 3, retryDelay = 2000 } = options;
    
    let retries = 0;
    
    while (true) {
      try {
        return await action();
      } catch (error) {
        // Check if it's a network error
        const isNetworkError = 
          error.code === 'auth/network-request-failed' || 
          error.message?.toLowerCase().includes('network') || 
          !this._isOnline;
        
        if (!isNetworkError || retries >= maxRetries) {
          throw error;
        }
        
        // Increment retry counter
        retries++;
        
        // Log retry attempt
        console.log(`Network error, retrying... (${retries}/${maxRetries})`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        // If still offline, wait for online status
        if (!this._isOnline) {
          console.log('Waiting for network connection...');
          await new Promise(resolve => {
            const removeListener = this.addListener(isOnline => {
              if (isOnline) {
                removeListener();
                resolve();
              }
            });
          });
        }
      }
    }
  }
}

// Create a singleton instance
const networkDetector = new NetworkDetector();

export default networkDetector;
