import React, { useEffect, useState, useRef } from 'react';
import * as MUI from '@mui/material';
import { ChevronLeft, ChevronRight, Fullscreen, FullscreenExit } from '@mui/icons-material';
import useSkinData from '../../hooks/useSkinData';
import { getSkinImageUrl } from '../../utils/getSkinImageUrl';
import { getRarityColor, formatRarityName, getRarityChipStyles, getRarityGradientStyles } from '../../constants/rarityColors';

const SkinCarousel = ({ championName, onSkinChange }) => {
  const {
    skins,
    currentSkin,
    currentIndex,
    isLoading,
    error,
    imageLoadingStates,
    preloadedImages,
    goToNext,
    goToPrevious,
    goToSlide,
  } = useSkinData(championName);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageRef = useRef(null);

  // Virtual scrolling state for dots
  const maxVisibleDots = 10; // Maximum dots to show at once
  const shouldUseVirtualScrolling = skins && skins.length > maxVisibleDots;
  const [dotsScrollPosition, setDotsScrollPosition] = useState(0);
  
  // Initialize scroll position when skins change
  useEffect(() => {
    if (shouldUseVirtualScrolling) {
      setDotsScrollPosition(0);
    }
  }, [shouldUseVirtualScrolling, championName]);

  // Notify parent when current skin changes
  useEffect(() => {
    if (currentSkin && onSkinChange) {
      onSkinChange(currentSkin);
    }
  }, [currentSkin, onSkinChange]);

  // Auto-scroll dots to keep current skin visible (only when currentIndex changes)
  useEffect(() => {
    if (shouldUseVirtualScrolling && currentIndex !== undefined) {
      setDotsScrollPosition(prevPosition => {
        // Calculate which page the current index should be on
        const targetPage = Math.floor(currentIndex / maxVisibleDots);
        // Always use strict page boundaries - no smart adjustments
        const finalPosition = targetPage * maxVisibleDots;
        
        // Always ensure we're on the correct page boundary
        if (prevPosition !== finalPosition) {
          return finalPosition;
        }
        
        return prevPosition;
      });
    }
  }, [currentIndex, shouldUseVirtualScrolling, skins?.length]);

  // Fullscreen functionality for image only
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await imageRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error('Error attempting to exit fullscreen:', err);
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Check if current image is loaded
  const isCurrentImageLoaded = () => {
    if (!currentSkin) return false;
    const imageUrl = getSkinImageUrl(currentSkin);
    return preloadedImages.has(imageUrl);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      goToPrevious();
    } else if (event.key === 'ArrowRight') {
      goToNext();
    } else if (event.key === 'f' || event.key === 'F') {
      toggleFullscreen();
    } else if (event.key === 'Escape' && isFullscreen) {
      toggleFullscreen();
    }
  };

  // Handle image error
  const handleImageError = (e, skin) => {
    const currentSrc = e.target.src;
    e.target.style.display = 'none';
  };

  // Helper functions are now imported from shared constants

  if (isLoading) {
    return (
      <MUI.Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <MUI.CircularProgress size={60} />
        <MUI.Typography variant="body1" sx={{ ml: 2 }}>
          Loading skins for {championName}...
        </MUI.Typography>
      </MUI.Box>
    );
  }

  if (error) {
    return (
      <MUI.Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        px={2}
      >
        <MUI.Alert severity="error" sx={{ maxWidth: 600, mb: 2 }}>
          <MUI.AlertTitle>Error Loading Skins</MUI.AlertTitle>
          {error}
        </MUI.Alert>
        <MUI.Typography variant="body2" color="text.secondary">
          Champion: {championName}
        </MUI.Typography>
      </MUI.Box>
    );
  }

  if (!skins || skins.length === 0) {
    return (
      <MUI.Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        px={2}
      >
        <MUI.Typography variant="h6" color="text.secondary" gutterBottom>
          No skins available for {championName}
        </MUI.Typography>
        <MUI.Typography variant="body2" color="text.secondary">
          This could be due to server issues or the champion not being found.
        </MUI.Typography>
      </MUI.Box>
    );
  }

  const imageUrl = getSkinImageUrl(currentSkin);

  return (
    <MUI.Box
      position="relative"
      width="100%"
      maxWidth="1200px"
      mx="auto"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      sx={{ outline: 'none' }}
    >
              {/* Main carousel container */}
      <MUI.Box
        position="relative"
        width="100%"
        sx={{
          aspectRatio: '16 / 9',
          borderRadius: 0,
          border: '3px solid #000',
          boxShadow: '8px 8px 0px #000',
          overflow: 'hidden',
          backgroundColor: 'black', // Dark background for letterboxing if needed
        }}
      >
        {/* Main image */}
        {imageUrl ? (
          <MUI.Box
            ref={imageRef}
            component="img"
            src={imageUrl}
            alt={currentSkin?.name || 'Skin'}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'opacity 0.3s ease',
              opacity: isCurrentImageLoaded() ? 1 : 0.5,
              cursor: 'pointer',
              '&:fullscreen': {
                objectFit: 'contain',
                backgroundColor: 'black',
              },
            }}
            onError={(e) => handleImageError(e, currentSkin)}
            onClick={toggleFullscreen}
          />
        ) : (
          <MUI.Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
            bgcolor="grey.200"
          >
            <MUI.Typography variant="h6" color="text.secondary">
              No Image Available
            </MUI.Typography>
          </MUI.Box>
        )}

        {/* Loading overlay */}
        {!isCurrentImageLoaded() && imageUrl && (
          <MUI.Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor="rgba(0, 0, 0, 0.1)"
          >
            <MUI.CircularProgress size={40} />
          </MUI.Box>
        )}

        {/* Skin name overlay */}
        <MUI.Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bgcolor="white"
          color="black"
          p={2}
          borderTop="3px solid #000"
        >
          <MUI.Box display="flex" alignItems="center" gap={2} mb={0.5}>
            <MUI.Typography variant="h5" fontWeight="900" textTransform="uppercase">
              {currentSkin?.name || 'Unknown Skin'}
            </MUI.Typography>
            {currentSkin?.rarity && (
              <MUI.Chip
                label={formatRarityName(currentSkin.rarity)}
                size="small"
                sx={{
                  ...getRarityChipStyles(currentSkin.rarity),
                  borderRadius: 0,
                  border: '2px solid #000',
                  fontWeight: 'bold',
                }}
              />
            )}
          </MUI.Box>
        </MUI.Box>

        {/* Navigation arrows - only show if more than 1 skin */}
        {skins.length > 1 && (
          <>
            <MUI.IconButton
              onClick={goToPrevious}
              sx={{
                position: 'absolute',
                left: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'white',
                color: 'black',
                border: '2px solid #000',
                borderRadius: 0,
                boxShadow: '4px 4px 0px #000',
                width: 48,
                height: 48,
                transition: 'all 0.1s',
                '&:hover': {
                  bgcolor: '#FFF9C4',
                  transform: 'translateY(-50%) translate(-2px, -2px)',
                  boxShadow: '6px 6px 0px #000',
                },
                '&:active': {
                  transform: 'translateY(-50%)',
                  boxShadow: 'none',
                }
              }}
            >
              <ChevronLeft />
            </MUI.IconButton>

            <MUI.IconButton
              onClick={goToNext}
              sx={{
                position: 'absolute',
                right: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'white',
                color: 'black',
                border: '2px solid #000',
                borderRadius: 0,
                boxShadow: '4px 4px 0px #000',
                width: 48,
                height: 48,
                transition: 'all 0.1s',
                '&:hover': {
                  bgcolor: '#FFF9C4',
                  transform: 'translateY(-50%) translate(-2px, -2px)',
                  boxShadow: '6px 6px 0px #000',
                },
                '&:active': {
                  transform: 'translateY(-50%)',
                  boxShadow: 'none',
                }
              }}
            >
              <ChevronRight />
            </MUI.IconButton>

            {/* Fullscreen toggle button */}
            <MUI.IconButton
              onClick={toggleFullscreen}
              sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                bgcolor: 'white',
                color: 'black',
                border: '2px solid #000',
                borderRadius: 0,
                boxShadow: '4px 4px 0px #000',
                transition: 'all 0.1s',
                '&:hover': {
                  bgcolor: '#FFF9C4',
                  transform: 'translate(-2px, -2px)',
                  boxShadow: '6px 6px 0px #000',
                },
                '&:active': {
                  transform: 'translate(0, 0)',
                  boxShadow: 'none',
                }
              }}
            >
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </MUI.IconButton>
          </>
        )}
      </MUI.Box>

      {/* Dots indicator - only show if more than 1 skin */}
      {skins.length > 1 && (
        <MUI.Box
          mt={2}
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={1}
        >

          {/* Dots container */}
          <MUI.Box
            display="flex"
            justifyContent="center"
            gap={2}
            flexWrap={shouldUseVirtualScrolling ? "nowrap" : "wrap"}
            overflow={shouldUseVirtualScrolling ? "visible" : "visible"}
            width={shouldUseVirtualScrolling ? `${maxVisibleDots * 32}px` : "auto"}
            mx="auto"
            px={shouldUseVirtualScrolling ? 1 : 0}
          >
            {(shouldUseVirtualScrolling 
              ? skins.slice(dotsScrollPosition, dotsScrollPosition + maxVisibleDots)
              : skins
            ).map((skin, displayIndex) => {
              const actualIndex = shouldUseVirtualScrolling ? dotsScrollPosition + displayIndex : displayIndex;
              return (
                <MUI.Tooltip
                  key={actualIndex}
                  title={skin.name || `Skin ${actualIndex + 1}`}
                  arrow
                  placement="top"
                >
                  <MUI.Box
                    onClick={() => goToSlide(actualIndex)}
                    sx={{
                      position: 'relative',
                      width: 24,
                      height: 24,
                      borderRadius: 0, // Squares instead of circles
                      bgcolor: skin.rarity ? getRarityColor(skin.rarity) : '#757575',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: '2px solid #000', // Always black border
                      boxShadow: actualIndex === currentIndex ? '4px 4px 0px #000' : '2px 2px 0px #000', // Hard shadow
                      transform: actualIndex === currentIndex ? 'translate(-2px, -2px)' : 'translate(0, 0)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      // Apply special gradient styles for premium tiers
                      ...getRarityGradientStyles(skin.rarity, actualIndex === currentIndex),
                      '&:hover': {
                         transform: 'translate(-2px, -2px)',
                         boxShadow: '4px 4px 0px #000',
                      },
                    }}
                  >
                    <MUI.Typography
                      variant="caption"
                      sx={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '10px',
                        textShadow: '0 1px 2px rgba(0,0,0,0.7)',
                      }}
                    >
                      {actualIndex + 1}
                    </MUI.Typography>
                  </MUI.Box>
                </MUI.Tooltip>
              );
            })}
          </MUI.Box>

          {/* Fast page navigation for virtual scrolling */}
          {shouldUseVirtualScrolling && (() => {
            const totalPages = Math.ceil(skins.length / maxVisibleDots);
            const currentPage = Math.floor(dotsScrollPosition / maxVisibleDots);
            const canGoLeft = currentPage > 0;
            const canGoRight = currentPage < totalPages - 1;
            
            const goToPreviousPage = () => {
              const newPage = Math.max(0, currentPage - 1);
              setDotsScrollPosition(newPage * maxVisibleDots);
            };
            
            const goToNextPage = () => {
              const newPage = Math.min(totalPages - 1, currentPage + 1);
              setDotsScrollPosition(newPage * maxVisibleDots);
            };
            
            return (
              <MUI.Box display="flex" alignItems="center" gap={2} mt={1}>
                <MUI.IconButton
                  size="small"
                  onClick={goToPreviousPage}
                  disabled={!canGoLeft}
                  sx={{ 
                    border: '2px solid #000',
                    borderRadius: 0,
                    bgcolor: canGoLeft ? 'white' : '#eee',
                    color: canGoLeft ? 'black' : 'text.disabled',
                    opacity: 1, // Reset opacity to handle disabled state manually or let MUI handle it with color
                    boxShadow: canGoLeft ? '4px 4px 0px #000' : 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: canGoLeft ? '#FFF9C4' : '#eee',
                      transform: canGoLeft ? 'translate(-2px, -2px)' : 'none',
                      boxShadow: canGoLeft ? '6px 6px 0px #000' : 'none',
                    },
                    '&:active': {
                       transform: 'translate(0,0)',
                       boxShadow: 'none'
                    }
                  }}
                >
                  <ChevronLeft fontSize="small" />
                </MUI.IconButton>
                
                <MUI.Typography variant="caption" fontWeight="bold" sx={{ minWidth: 60, textAlign: 'center' }}>
                  Page {currentPage + 1} / {totalPages}
                </MUI.Typography>
                
                <MUI.IconButton
                  size="small"
                  onClick={goToNextPage}
                  disabled={!canGoRight}
                  sx={{ 
                    border: '2px solid #000',
                    borderRadius: 0,
                    bgcolor: canGoRight ? 'white' : '#eee',
                    color: canGoRight ? 'black' : 'text.disabled',
                    opacity: 1,
                    boxShadow: canGoRight ? '4px 4px 0px #000' : 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: canGoRight ? '#FFF9C4' : '#eee',
                      transform: canGoRight ? 'translate(-2px, -2px)' : 'none',
                      boxShadow: canGoRight ? '6px 6px 0px #000' : 'none',
                    },
                    '&:active': {
                       transform: 'translate(0,0)',
                       boxShadow: 'none'
                    }
                  }}
                >
                  <ChevronRight fontSize="small" />
                </MUI.IconButton>
              </MUI.Box>
            );
          })()}
        </MUI.Box>
      )}
    </MUI.Box>
  );
};

export default SkinCarousel; 