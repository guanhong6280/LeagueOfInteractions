import React from 'react';
import * as MUI from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useChampionStats } from '../contextProvider/ChampionStatsProvider';
import { BaseSkinRatingCards } from '../common/skin_rating';

const SkinRating = () => {
    const { stats, isLoading: statsLoading, refreshAllStats } = useChampionStats();

    // Get champion names from stats
    const championNames = Object.keys(stats || {});

    // Loading state
    if (statsLoading) {
        return (
            <MUI.Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="400px"
            >
                <MUI.CircularProgress size={60} />
            </MUI.Box>
        );
    }

    // Empty state
    if (!championNames || championNames.length === 0) {
        return (
            <MUI.Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="400px"
            >
                <MUI.Typography variant="h6" color="text.secondary">
                    No champions available at the moment.
                </MUI.Typography>
            </MUI.Box>
        );
    }

    return (
        <MUI.Box
            component="main"
            minHeight="100vh"
            py={4}
            px={{ xs: 2, sm: 3, md: 4 }}
        >
            {/* Header Section */}
            <MUI.Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                mb={4}
            >
                <MUI.Box
                    display="flex"
                    alignItems="center"
                    gap={2}
                    mb={2}
                    position="relative"
                >
                    <MUI.Typography
                        component="h1"
                        variant="h3"
                        fontWeight="bold"
                        textAlign="center"
                        fontSize={{
                            xs: '1.75rem',
                            sm: '2.125rem',
                            md: '2.5rem'
                        }}
                    >
                        Rate Your Favorite Skins!
                    </MUI.Typography>
                    <MUI.IconButton
                        onClick={() => refreshAllStats(championNames)}
                        disabled={statsLoading}
                        size="large"
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                            },
                            '&:disabled': {
                                bgcolor: 'action.disabled',
                            }
                        }}
                    >
                        {statsLoading ? (
                            <MUI.CircularProgress size={24} color="inherit" />
                        ) : (
                            <RefreshIcon />
                        )}
                    </MUI.IconButton>
                </MUI.Box>
                <MUI.Typography
                    variant="body1"
                    color="text.secondary"
                    textAlign="center"
                    maxWidth="600px"
                >
                    Discover and rate the best League of Legends skins. Share your thoughts on splash art and in-game models.
                </MUI.Typography>
            </MUI.Box>

            {/* Champion Grid */}
            <MUI.Box
                maxWidth="1200px"
                mx="auto"
                px={2}
            >
                <MUI.Box
                    display="grid"
                    gridTemplateColumns={{
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                        lg: 'repeat(4, 1fr)',
                    }}
                    gap={3}
                    width="100%"
                >
                    {championNames.map((champion, index) => (
                        <MUI.Box
                            key={`${champion}-${index}`}
                            display="flex"
                            justifyContent="center"
                            width="100%"
                        >
                            <BaseSkinRatingCards
                                championName={champion}
                                stats={stats[champion]}
                            />
                        </MUI.Box>
                    ))}
                </MUI.Box>
            </MUI.Box>

            {/* Footer Info */}
            <MUI.Box
                display="flex"
                justifyContent="center"
                mt={6}
                px={2}
            >
                <MUI.Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                >
                    {championNames.length} champions available for rating
                </MUI.Typography>
            </MUI.Box>
        </MUI.Box>
    );
};

export default SkinRating;
