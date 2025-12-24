import React from 'react';
import * as MUI from '@mui/material';
import { 
  Poll, 
  Comment, 
  History,
} from '@mui/icons-material';
import ActivityCard from './ActivityCard';
import useUserActivityTimeline from '../../hooks/useUserActivityTimeline';

const buildActivityType = (mainCategory, subFilter) => {
  if (mainCategory === 'ratings') {
    if (subFilter === 'champion') return 'championRatings';
    if (subFilter === 'skin') return 'skinRatings';
    return 'allRatings';
  }

  if (mainCategory === 'comments') {
    if (subFilter === 'champion') return 'championComments';
    if (subFilter === 'skin') return 'skinComments';
    return 'allComments';
  }

  return 'all';
};

const ActivityTimeline = ({ userId }) => {
  // UI state lives in the component (filters, selection)
  const [mainCategory, setMainCategory] = React.useState('all');
  const [subFilter, setSubFilter] = React.useState('all');

  const activityType = React.useMemo(
    () => buildActivityType(mainCategory, subFilter),
    [mainCategory, subFilter]
  );

  const {
    activities,
    error,
    loading,
    isFetching,
    refetch,
  } = useUserActivityTimeline({ userId, activityType, limit: 20 });

  // Main Categories
  const mainTabs = [
    { value: 'all', label: 'All Activities', icon: <History fontSize="small" /> },
    { value: 'ratings', label: 'Ratings', icon: <Poll fontSize="small" /> },
    { value: 'comments', label: 'Comments', icon: <Comment fontSize="small" /> },
  ];

  // Sub Filters (only shown if mainCategory !== 'all')
  const subFilters = [
    { value: 'all', label: 'All Types' },
    { value: 'champion', label: 'Champions' },
    { value: 'skin', label: 'Skins' },
  ];

  return (
    <MUI.Box
      sx={{
        width: '100%',
        marginBottom: '40px',
      }}
    >
      {/* Section Title */}
      <MUI.Typography
        sx={{
          fontSize: '36px',
          fontWeight: '900',
          color: 'black',
          textTransform: 'uppercase',
          letterSpacing: '-1px',
          marginBottom: '25px',
          textShadow: '3px 3px 0px rgba(255,255,255,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <MUI.Box component="span" sx={{ 
          display: 'inline-block', 
          width: '24px', 
          height: '24px', 
          bgcolor: 'black',
          mr: 1
        }} />
        Recent Activity
      </MUI.Typography>

      {/* Level 1: Main Categories (Segmented Bar) */}
      <MUI.Box
        sx={{
          display: 'flex',
          border: '3px solid black',
          boxShadow: '4px 4px 0px 0px #000000',
          marginBottom: '25px',
          bgcolor: 'white',
          flexWrap: 'wrap',
        }}
      >
        {mainTabs.map((tab, index) => (
          <MUI.Button
            key={tab.value}
            onClick={() => {
              setMainCategory(tab.value);
              setSubFilter('all');
            }}
            startIcon={tab.icon}
            sx={{
              flex: '1 1 auto',
              bgcolor: mainCategory === tab.value ? 'black' : 'transparent',
              color: mainCategory === tab.value ? 'white' : 'black',
              borderRadius: '0px',
              borderRight: index !== mainTabs.length - 1 ? '3px solid black' : 'none',
              fontWeight: '900',
              fontSize: '13px',
              padding: '12px 20px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.1s ease',
              '&:hover': {
                bgcolor: mainCategory === tab.value ? 'black' : '#f0f0f0',
              },
              '@media (max-width: 600px)': {
                 borderRight: 'none',
                 borderBottom: index !== mainTabs.length - 1 ? '3px solid black' : 'none',
                 width: '100%'
              }
            }}
          >
            {tab.label}
          </MUI.Button>
        ))}
      </MUI.Box>

      {/* Level 2: Sub Filters (Only visible if not "All Activities") */}
      {mainCategory !== 'all' && (
        <MUI.Box
          sx={{
            display: 'flex',
            gap: '10px',
            marginBottom: '25px',
            justifyContent: 'flex-start', // Or center?
            alignItems: 'center',
          }}
        >
          <MUI.Typography variant="body2" fontWeight="bold" sx={{ mr: 1, color: '#666' }}>
            FILTER BY:
          </MUI.Typography>
          {subFilters.map((filter) => (
            <MUI.Chip
              key={filter.value}
              label={filter.label}
              onClick={() => setSubFilter(filter.value)}
              sx={{
                bgcolor: subFilter === filter.value ? 'black' : 'white',
                color: subFilter === filter.value ? 'white' : 'black',
                fontWeight: 'bold',
                borderRadius: '0px',
                border: '2px solid black',
                cursor: 'pointer',
                boxShadow: subFilter === filter.value ? '2px 2px 0px 0px rgba(0,0,0,0.3)' : 'none',
                '&:hover': {
                  bgcolor: subFilter === filter.value ? 'black' : '#f0f0f0',
                },
              }}
            />
          ))}
        </MUI.Box>
      )}

      {/* Content */}
      <MUI.Box>
        {loading ? (
          <MUI.Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
            }}
          >
            <MUI.CircularProgress
              sx={{
                color: 'black',
              }}
            />
          </MUI.Box>
        ) : error ? (
          <MUI.Box
            sx={{
              padding: '40px',
              textAlign: 'center',
              bgcolor: 'white',
              border: '3px solid black',
              boxShadow: '4px 4px 0px 0px #000000',
            }}
          >
            <MUI.Typography color="error" fontWeight="bold">
              {error?.message || 'Failed to load activities'}
            </MUI.Typography>
            <MUI.Button
              onClick={() => refetch()}
              sx={{ mt: 2, border: '2px solid black', borderRadius: 0, color: 'black' }}
            >
              Retry
            </MUI.Button>
          </MUI.Box>
        ) : activities.length === 0 ? (
          <MUI.Box
            sx={{
              padding: '40px',
              textAlign: 'center',
              bgcolor: 'white',
              border: '3px solid black',
              boxShadow: '4px 4px 0px 0px #000000',
            }}
          >
            <MUI.Typography fontWeight="bold" color="#666">
              No activity found
            </MUI.Typography>
          </MUI.Box>
        ) : (
          <MUI.Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',       // 1 column on mobile
                sm: '1fr 1fr',   // 2 columns on tablet
                md: 'repeat(3, 1fr)' // 3 columns on desktop
              },
              gap: '15px',
              opacity: isFetching ? 0.65 : 1,
              transition: 'opacity 0.15s ease'
            }}
          >
            {activities.map((activity) => (
              <ActivityCard key={activity.data._id} activity={activity} />
            ))}
          </MUI.Box>
        )}
      </MUI.Box>
    </MUI.Box>
  );
};

export default ActivityTimeline;
