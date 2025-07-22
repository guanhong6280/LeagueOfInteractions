// Shared rarity color constants for consistent theming across the application

// Base rarity colors matching the skin carousel system
export const RARITY_COLORS = {
  'kMythic': '#9C27B0',     // Purple for Mythic
  'kLegendary': '#FF0000',  // Red for Legendary  
  'kEpic': '#2196F3',       // Blue for Epic
  'kRare': '#4CAF50',       // Green for Rare
  'kNoRarity': '#757575',   // Grey for Legacy/No Rarity
  'kUltimate': '#FFA500',   // Orange for Ultimate (rare tier)
  
  // Special tiers with gradient effects
  'kExalted': '#FFD700',    // Gold base (uses gradient in practice)
  'kTranscendent': '#FF69B4', // Pink base (uses rainbow gradient in practice)
};

// Display names for rarities
export const RARITY_NAMES = {
  'kMythic': 'Mythic',
  'kLegendary': 'Legendary', 
  'kEpic': 'Epic',
  'kRare': 'Rare',
  'kNoRarity': 'Legacy',
  'kUltimate': 'Ultimate',
  'kExalted': 'Exalted',
  'kTranscendent': 'Transcendent',
  
  // Fallbacks for different naming conventions
  'Mythic': 'Mythic',
  'Legendary': 'Legendary',
  'Epic': 'Epic', 
  'Rare': 'Rare',
  'Legacy': 'Legacy',
  'NoRarity': 'Legacy',
};

/**
 * Get the color for a specific rarity
 * @param {string} rarity - The rarity key (e.g., 'kMythic', 'kLegendary')
 * @returns {string} - The hex color code
 */
export const getRarityColor = (rarity) => {
  return RARITY_COLORS[rarity] || RARITY_COLORS.kNoRarity;
};

/**
 * Get the display name for a specific rarity
 * @param {string} rarity - The rarity key (e.g., 'kMythic', 'kLegendary')
 * @returns {string} - The formatted display name
 */
export const formatRarityName = (rarity) => {
  if (!rarity || rarity === 'kNoRarity') return 'Legacy';
  return RARITY_NAMES[rarity] || rarity.replace('k', '');
};

/**
 * Get special gradient styles for premium tiers
 * @param {string} rarity - The rarity key
 * @param {boolean} isActive - Whether this is the active/selected state
 * @returns {object} - CSS-in-JS style object for gradients
 */
export const getRarityGradientStyles = (rarity, isActive = false) => {
  const baseStyles = {};
  
  if (rarity === 'kExalted') {
    return {
      ...baseStyles,
      background: 'linear-gradient(45deg, #FFD700, #FFA500, #FFD700)',
      backgroundSize: '200% 200%',
      animation: 'shimmer 3s ease-in-out infinite',
      boxShadow: isActive 
        ? '0 0 0 2px rgba(0,0,0,0.3), 0 0 15px rgba(255, 215, 0, 0.5)' 
        : '0 0 10px rgba(255, 215, 0, 0.3)',
      '&:hover': {
        boxShadow: '0 2px 8px rgba(0,0,0,0.2), 0 0 20px rgba(255, 215, 0, 0.6)',
      },
      '@keyframes shimmer': {
        '0%': { backgroundPosition: '200% 200%' },
        '50%': { backgroundPosition: '0% 0%' },
        '100%': { backgroundPosition: '200% 200%' },
      },
    };
  }
  
  if (rarity === 'kTranscendent') {
    return {
      ...baseStyles,
      background: 'conic-gradient(from 0deg, #FF69B4, #00BFFF, #32CD32, #FFD700, #FF69B4)',
      boxShadow: isActive 
        ? '0 0 0 2px rgba(0,0,0,0.3), 0 0 20px rgba(255, 255, 255, 0.6)' 
        : '0 0 12px rgba(255, 255, 255, 0.4)',
      '&:hover': {
        boxShadow: '0 2px 8px rgba(0,0,0,0.2), 0 0 25px rgba(255, 255, 255, 0.7)',
      },
    };
  }
  
  return baseStyles;
};

/**
 * Get chip styles for rarity display (used in carousel and charts)
 * @param {string} rarity - The rarity key
 * @returns {object} - CSS-in-JS style object for MUI Chip
 */
export const getRarityChipStyles = (rarity) => {
  const isSpecialTier = rarity === 'kExalted' || rarity === 'kTranscendent';
  
  const baseStyles = {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.75rem',
    '& .MuiChip-label': {
      textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
    },
  };

  if (isSpecialTier) {
    return {
      ...baseStyles,
      bgcolor: 'transparent',
      ...getRarityGradientStyles(rarity),
    };
  }

  return {
    ...baseStyles,
    bgcolor: getRarityColor(rarity),
  };
};

/**
 * Get all rarities sorted by tier (highest to lowest)
 * @returns {Array} - Array of rarity objects with color and name
 */
export const getSortedRarities = () => {
  return [
    { key: 'kTranscendent', name: formatRarityName('kTranscendent'), color: getRarityColor('kTranscendent') },
    { key: 'kExalted', name: formatRarityName('kExalted'), color: getRarityColor('kExalted') },
    { key: 'kMythic', name: formatRarityName('kMythic'), color: getRarityColor('kMythic') },
    { key: 'kLegendary', name: formatRarityName('kLegendary'), color: getRarityColor('kLegendary') },
    { key: 'kUltimate', name: formatRarityName('kUltimate'), color: getRarityColor('kUltimate') },
    { key: 'kEpic', name: formatRarityName('kEpic'), color: getRarityColor('kEpic') },
    { key: 'kRare', name: formatRarityName('kRare'), color: getRarityColor('kRare') },
    { key: 'kNoRarity', name: formatRarityName('kNoRarity'), color: getRarityColor('kNoRarity') },
  ];
}; 