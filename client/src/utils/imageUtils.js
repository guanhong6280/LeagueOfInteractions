/**
 * Utility functions for constructing League of Legends image URLs
 */

/**
 * Construct a Data Dragon image URL with proper versioning
 * @param {string} version - League version (e.g., '14.19.1')
 * @param {string} type - Image type ('passive', 'spell', 'champion', 'item', etc.)
 * @param {string} imageName - Image filename
 * @returns {string} Complete Data Dragon URL
 */
export const constructImageUrl = (version, type, imageName) => {
  if (!version || !type || !imageName) {
    console.warn('Missing required parameters for image URL:', { version, type, imageName });
    return null;
  }

  // Clean up image name (remove any path separators)
  const cleanImageName = imageName.replace(/^.*[\\\/]/, '');
  
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/${type}/${cleanImageName}`;
};

/**
 * Construct champion loading screen URL
 * @param {string} championId - Champion ID (e.g., 'Ahri')
 * @param {number} skinId - Skin ID (default: 0 for base skin)
 * @returns {string} Champion loading screen URL
 */
export const constructChampionLoadingUrl = (championId, skinId = 0) => {
  if (!championId) {
    console.warn('Missing champion ID for loading screen URL');
    return null;
  }

  return `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championId}_${skinId}.jpg`;
};

/**
 * Construct champion square asset URL
 * @param {string} championId - Champion ID (e.g., 'Ahri')
 * @param {string} version - League version
 * @returns {string} Champion square asset URL
 */
export const constructChampionSquareUrl = (championId, version) => {
  if (!championId || !version) {
    console.warn('Missing required parameters for champion square URL:', { championId, version });
    return null;
  }

  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championId}.png`;
};

/**
 * Get image URL with fallback handling
 * @param {string} version - League version
 * @param {string} type - Image type
 * @param {string} imageName - Image filename
 * @param {string} fallbackVersion - Fallback version if primary fails
 * @returns {string} Image URL with fallback
 */
export const getImageUrlWithFallback = (version, type, imageName, fallbackVersion = '14.19.1') => {
  const primaryUrl = constructImageUrl(version, type, imageName);
  
  if (!primaryUrl) {
    return constructImageUrl(fallbackVersion, type, imageName);
  }
  
  return primaryUrl;
};

/**
 * Preload an image to check if it exists
 * @param {string} url - Image URL to check
 * @returns {Promise<boolean>} True if image loads successfully
 */
export const preloadImage = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}; 