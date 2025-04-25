/**
 * Utility functions to handle different API response formats
 */

/**
 * Extract token and user from different response structures
 * @param {Object} response - API response object
 * @returns {Object} - { token, user } or null if not found
 */
export const extractAuthData = (response) => {
  // Case 1: Direct properties { token, user }
  if (response?.token && response?.user) {
    return {
      token: response.token,
      user: response.user
    };
  }
  
  // Case 2: Nested in data property { data: { token, user } }
  if (response?.data?.token && response?.data?.user) {
    return {
      token: response.data.token,
      user: response.data.user
    };
  }
  
  // Case 3: Success response format { success: true, data: { token, user } }
  if (response?.success && response?.data?.token && response?.data?.user) {
    return {
      token: response.data.token,
      user: response.data.user
    };
  }
  
  return null;
};

/**
 * Store authentication data in localStorage
 * @param {Object} authData - { token, user }
 * @returns {Boolean} - Success status
 */
export const storeAuthData = (authData) => {
  if (!authData?.token || !authData?.user) {
    return false;
  }
  
  try {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    return true;
  } catch (error) {
    console.error('Error storing auth data:', error);
    return false;
  }
};

/**
 * Extract meaningful data from API responses with different structures
 * @param {Object} response - API response object
 * @returns {Object} - Extracted data
 */
export const extractResponseData = (response) => {
  // Case 1: { data: {...} }
  if (response?.data && typeof response.data === 'object') {
    return response.data;
  }
  
  // Case 2: { success: true, data: {...} }
  if (response?.success && response?.data) {
    return response.data;
  }
  
  // Case 3: Direct data
  return response;
};

export default {
  extractAuthData,
  storeAuthData,
  extractResponseData
};
