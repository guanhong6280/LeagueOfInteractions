/**
 * Champion name mapping for Data Dragon CDN compatibility
 * Maps display names to Data Dragon CDN names
 */
const championNameMapping = {
  // Special cases that don't follow normal rules
  "Wukong": "MonkeyKing",
  "Vel'Koz": "Velkoz",
  "Renata Glasc": "Renata",
  "Kai'Sa": "Kaisa",
  "Rek'Sai": "RekSai",
  "Kha'Zix": "Khazix",
  "Nunu & Willump": "Nunu",
  "LeBlanc": "Leblanc",
  "Cho'Gath": "Chogath",
  "Bel'Veth": "Belveth",
  "Dr. Mundo": "DrMundo",
  "Jarvan IV": "JarvanIV",
  "Lee Sin": "LeeSin",
  "Master Yi": "MasterYi",
  "Miss Fortune": "MissFortune",
  "Tahm Kench": "TahmKench",
  "Twisted Fate": "TwistedFate",
  "Xin Zhao": "XinZhao",
  "K'Sante": "KSante",
  "Aurelion Sol": "AurelionSol",
};

/**
 * Clean champion name for Data Dragon CDN compatibility
 * Handles special cases and removes special characters
 * @param {string} championName - The original champion name
 * @returns {string} - Cleaned champion name for CDN
 */
export const cleanChampionNameForCDN = (championName) => {
  if (!championName) return '';
  
  // Check if there's a special mapping first
  if (championNameMapping[championName]) {
    return championNameMapping[championName];
  }
  
  // Otherwise, remove special characters but keep letters and numbers
  return championName.replace(/[^a-zA-Z0-9]/g, '');
};

/**
 * Get Data Dragon loading screen URL for a champion
 * @param {string} championName - The champion name
 * @returns {string} - Data Dragon CDN URL
 */
export const getChampionLoadingUrl = (championName) => {
  const cleanedName = cleanChampionNameForCDN(championName);
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${cleanedName}_0.jpg`;
}; 

/**
 * Get champion square asset URL with latest version
 * @param {string} championName - The champion name
 * @param {string} version - League version (optional, will use fallback if not provided)
 * @returns {string} - Data Dragon CDN URL
 */
export const getChampionSquareAssetUrl = (championName, version = '14.19.1') => {
  const cleanedName = cleanChampionNameForCDN(championName);
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${cleanedName}.png`;
}; 
  
