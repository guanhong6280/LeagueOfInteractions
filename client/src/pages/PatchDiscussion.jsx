import React, { useState, useMemo } from 'react';
import * as MUI from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { NeoCard, NeoButton, NeoSelect, FilterChip } from '../common/rating_system/components/design/NeoComponents';
import DiscussionCard from '../common/patch_discussion/DiscussionCard';
import CreatePostDialog from '../common/patch_discussion/CreatePostDialog';
import { useVersion } from '../contextProvider/VersionProvider';
import { useChampionNames } from '../hooks/useChampionNames';
import usePostData from "../hooks/usePostData";
import useCurrentUser from '../hooks/useCurrentUser';
import theme from '../theme/theme';

const GAME_MODES = [
  'Ranked Solo/Duo',
  'Ranked Flex',
  'Swift Play',
  'Draft Pick',
  'ARAM',
  'ARAM Mayhem',
  'Arena',
  'Ultimate Spellbook',
  'URF',
];

const SORT_OPTIONS = [
  { value: 'new', label: 'LATEST' },
  { value: 'hot', label: 'MOST LIKED' },
  { value: 'discussed', label: 'MOST DISCUSSED' },
];

const PatchDiscussion = () => {
  const navigate = useNavigate();
  const { data: championNames = [] } = useChampionNames();
  const { user } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedChampion, setSelectedChampion] = useState('');
  const [sortBy, setSortBy] = useState('new');
  const [showFilters, setShowFilters] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { version } = useVersion();

  // Build filters object for the hook
  const filters = useMemo(() => ({
    patchVersion: version,
    champion: selectedChampion || undefined,
    gameMode: selectedMode || undefined,
    sortBy: sortBy,
  }), [version, selectedChampion, selectedMode, sortBy]);

  // Use the post data hook
  const {
    posts,
    isLoading,
    isSubmitting,
    submitPost,
    togglePostLike,
  } = usePostData(filters);

  // Filter posts by search query on the client side
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const query = searchQuery.toLowerCase();
    return posts.filter(post =>
      post.title?.toLowerCase().includes(query) ||
      post.body?.toLowerCase().includes(query) ||
      post.selectedChampion?.toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePostClick = (postId) => {
    navigate(`/patch-discussion/${postId}`);
  };

  const handleCreatePost = () => {
    setCreateDialogOpen(true);
  };

  const handleSubmitPost = async (formData) => {
    console.log('formData', formData);
    const result = await submitPost({
      ...formData,
      patchVersion: version,
    });

    if (result.success) {
      setCreateDialogOpen(false);
      // Optionally navigate to the new post
      if (result.data?.id) {
        navigate(`/patch-discussion/${result.data.id}`);
      }
    }
  };

  return (
    <MUI.Box
      component="main"
      minHeight="100vh"
      py={6}
      px={{ xs: 2, sm: 3, md: 4 }}
      bgcolor="#f0f0f0"
    >
      {/* Header Section */}
      <MUI.Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        mb={6}
      >
        <NeoCard
          sx={{
            maxWidth: '900px',
            width: '100%',
            textAlign: 'center',
            bgcolor: '#FFEB3B',
            position: 'relative',
            overflow: 'visible',
          }}
        >
          {/* Decorative Bolts */}
          {[0, 1, 2, 3].map((i) => (
            <MUI.Box
              key={i}
              sx={{
                position: 'absolute',
                width: 12,
                height: 12,
                bgcolor: 'black',
                top: i < 2 ? 8 : 'auto',
                bottom: i >= 2 ? 8 : 'auto',
                left: i % 2 === 0 ? 8 : 'auto',
                right: i % 2 !== 0 ? 8 : 'auto',
              }}
            />
          ))}
          <MUI.Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={1}
            marginBottom="10px"
          >
            <MUI.Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 900,
                textTransform: 'uppercase',
                fontSize: { xs: '2rem', md: '3.5rem' },
                letterSpacing: '-0.02em',
                textShadow: '3px 3px 0px white',
              }}
            >
              DISCUSSION
            </MUI.Typography>

            <MUI.Typography
              variant="body1"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 'bold',
                bgcolor: 'white',
                display: 'inline-block',
                px: 2,
                py: 0.5,
                border: '2px solid black',
              }}
            >
              PATCH: {version}
            </MUI.Typography>
          </MUI.Box>

          {/* Main Controls */}
          <MUI.Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            mb={2}
          >
            <MUI.Box sx={{ position: 'relative', width: { xs: '100%', sm: '400px' } }}>
              <MUI.TextField
                fullWidth
                placeholder="SEARCH DISCUSSIONS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  sx: {
                    borderRadius: 0,
                    bgcolor: 'white',
                    border: '2px solid black',
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    '& fieldset': { border: 'none' },
                    height: '45px',
                    paddingRight: '40px',
                  },
                }}
              />
              <SearchIcon sx={{ position: 'absolute', right: 10, top: 10, color: 'black' }} />
            </MUI.Box>

            <NeoButton
              size="small"
              onClick={() => setShowFilters(!showFilters)}
              color={theme.palette.button.redSide_hover}
              sx={{ height: '45px', minWidth: '120px', fontSize: '0.875rem' }}
            >
              <FilterListIcon sx={{ mr: 1 }} /> FILTERS
            </NeoButton>

            <MUI.Tooltip title={!user ? 'Please sign in to create a post' : ''}>
              <span>
                <NeoButton
                  size="small"
                  onClick={handleCreatePost}
                  disabled={!user}
                  color={theme.palette.button.blueSide_hover}
                  sx={{ height: '45px', minWidth: '140px', fontSize: '0.875rem' }}
                >
                  <AddIcon sx={{ mr: 1 }} /> NEW POST
                </NeoButton>
              </span>
            </MUI.Tooltip>
          </MUI.Stack>

          {/* Filter Panel */}
          {showFilters && (
            <MUI.Box
              mt={3}
              p={2}
              border="2px solid black"
              bgcolor="white"
              textAlign="left"
            >
              <MUI.Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                CHAMPION:
              </MUI.Typography>
              <MUI.FormControl fullWidth sx={{ mb: 2 }}>
                <MUI.Select
                  value={selectedChampion}
                  onChange={(e) => setSelectedChampion(e.target.value)}
                  startAdornment={<SortIcon sx={{ mr: 1, color: 'black' }} />}
                  displayEmpty
                  sx={{
                    borderRadius: 0,
                    border: '2px solid black',
                    fontWeight: 'bold',
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '&:hover': { backgroundColor: '#fff' },
                    boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.2)',
                    textTransform: 'uppercase',
                    height: '45px',
                    fontSize: '0.9rem',
                  }}
                  renderValue={(selected) => {
                    if (!selected) {
                      return (
                        <MUI.Typography sx={{ color: 'gray', fontWeight: 'bold', fontSize: '0.9rem' }}>
                          ALL CHAMPIONS
                        </MUI.Typography>
                      );
                    }
                    return selected;
                  }}
                >
                  <MUI.MenuItem value="" sx={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                    <em>All Champions</em>
                  </MUI.MenuItem>
                  {championNames.map((name) => (
                    <MUI.MenuItem key={name} value={name} sx={{ fontWeight: 'bold' }}>
                      {name}
                    </MUI.MenuItem>
                  ))}
                </MUI.Select>
              </MUI.FormControl>

              <MUI.Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                GAME MODE: (Select one)
              </MUI.Typography>
              <MUI.Box display="flex" flexWrap="wrap" gap={1}>
                {GAME_MODES.map((mode) => (
                  <FilterChip
                    key={mode}
                    label={mode}
                    active={selectedMode === mode}
                    onClick={() => setSelectedMode(prev => prev === mode ? '' : mode)}
                    color="#A5D6A7"
                  />
                ))}
              </MUI.Box>
            </MUI.Box>
          )}
        </NeoCard>
      </MUI.Box>

      {/* Posts List */}
      <MUI.Box maxWidth="1200px" mx="auto">
        {isLoading ? (
          <MUI.Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <MUI.CircularProgress size={60} sx={{ color: 'black' }} />
          </MUI.Box>
        ) : filteredPosts.length > 0 ? (
          <MUI.Box display="flex" flexDirection="column" gap={3}>
            <MUI.Box display="flex" justifyContent="flex-start">
              <NeoSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={SORT_OPTIONS}
                width="240px" // Explicit width
                startAdornment={<SortIcon sx={{ color: 'black' }} />}
              />
            </MUI.Box>
            {filteredPosts.map((post) => (  
              <DiscussionCard
                key={post.id}
                post={post}
                onClick={() => handlePostClick(post.id)}
              />
            ))}
          </MUI.Box>
        ) : (
          <MUI.Box display="flex" justifyContent="center" mt={4}>
            <NeoCard sx={{ bgcolor: '#E0E0E0', textAlign: 'center' }}>
              <MUI.Typography
                variant="body1"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {searchQuery ? 'NO POSTS MATCH YOUR SEARCH' : 'NO POSTS YET'}
              </MUI.Typography>
              <MUI.Typography variant="caption" fontFamily="monospace">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to start a discussion!'
                }
              </MUI.Typography>
            </NeoCard>
          </MUI.Box>
        )}
      </MUI.Box>

      {/* Footer Stats */}
      <MUI.Box display="flex" justifyContent="center" mt={8} mb={4}>
        <MUI.Typography
          variant="caption"
          fontWeight="bold"
          fontFamily="monospace"
          sx={{ bgcolor: 'black', color: 'white', px: 2, py: 1 }}
        >
          TOTAL_POSTS: {filteredPosts.length}// END
        </MUI.Typography>
      </MUI.Box>

      {/* Scroll to Top Button */}
      <MUI.Box
        position="sticky"
        bottom="24px"
        display="flex"
        justifyContent="flex-end"
        pr={{ xs: 2, sm: 3, md: 4 }}
        zIndex={1300}
      >
        <NeoButton
          onClick={scrollToTop}
          color="#ffffff"
          sx={{
            border: '3px solid #000',
            boxShadow: '6px 6px 0px #000',
          }}
        >
          <ArrowUpwardIcon sx={{ mr: 1 }} />
          TOP
        </NeoButton>
      </MUI.Box>

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleSubmitPost}
      />
    </MUI.Box>
  );
};

export default PatchDiscussion;
