export const COMMUNITY_DRAGON_BASE_URL =
  'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default';

export const getSkinImageUrl = (skin) => {
  const splashPath = typeof skin === 'string' ? skin : skin?.splashPath;
  if (!splashPath) return null;

  const cleanedPath = splashPath.replace('/lol-game-data/assets/', '').toLowerCase();
  return `${COMMUNITY_DRAGON_BASE_URL}/${cleanedPath}`;
};

export const communityDragonUrl = (splashPath) => getSkinImageUrl(splashPath);

