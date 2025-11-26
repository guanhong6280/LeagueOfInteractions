import React, { memo } from 'react';
import * as MUI from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const RADIAN = Math.PI / 180;

// Star-themed colors for ratings (5 stars = gold, 1 star = red)
const RATING_COLORS = {
  '5 Stars': '#FFD700', // Gold
  '4 Stars': '#90EE90', // Light Green
  '3 Stars': '#87CEEB', // Sky Blue
  '2 Stars': '#FFA500', // Orange
  '1 Star': '#FF6B6B',  // Light Red
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

  // Only show label if percentage is significant (>5%)
  if ((percent ?? 0) < 0.05) return null;

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize="12"
      fontWeight="bold"
      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
    >
      {`${((percent ?? 0) * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <MUI.Paper
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <MUI.Typography variant="body2" fontWeight="bold" color="primary">
          {data.payload.name}
        </MUI.Typography>
        <MUI.Typography variant="body2" color="text.secondary">
          {data.value} ratings ({((data.payload.percent || 0) * 100).toFixed(1)}%)
        </MUI.Typography>
      </MUI.Paper>
    );
  }
  return null;
};

const RatingDistributionChart = memo(({ stats, isLoading = false }) => {
  // Transform stats data into chart format
  const chartData = React.useMemo(() => {
    if (!stats?.ratingDistribution) {
      return [];
    }

    // Transform real stats data
    const distribution = stats.ratingDistribution;
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
      return [];
    }
    
    return [
      { name: '5 Stars', value: distribution[5] || 0, rating: 5 },
      { name: '4 Stars', value: distribution[4] || 0, rating: 4 },
      { name: '3 Stars', value: distribution[3] || 0, rating: 3 },
      { name: '2 Stars', value: distribution[2] || 0, rating: 2 },
      { name: '1 Star', value: distribution[1] || 0, rating: 1 },
    ].map(item => ({
      ...item,
      percent: item.value / total
    })).filter(item => item.value > 0); // Only show ratings that exist
  }, [stats]);

  const hasNoRatings = !stats?.ratingDistribution || chartData.length === 0;

  if (isLoading) {
    return (
      <MUI.Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MUI.CircularProgress size={40} />
      </MUI.Box>
    );
  }

  return (
    <MUI.Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Chart Header */}
      <MUI.Typography 
        variant="h6" 
        fontWeight="bold" 
        color="primary.main"
        sx={{ mb: 2, textAlign: 'center' }}
      >
        Rating Distribution
      </MUI.Typography>

      {/* Chart Container */}
      <MUI.Box sx={{ flex: 1, minHeight: 250 }}>
        {hasNoRatings ? (
          <MUI.Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              textAlign: 'center',
            }}
          >
            <StarIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <MUI.Typography variant="h6" color="text.secondary" gutterBottom>
              No ratings yet
            </MUI.Typography>
            <MUI.Typography variant="body2" color="text.secondary">
              Be the first to rate this champion's skins!
            </MUI.Typography>
          </MUI.Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry) => (
                  <Cell 
                    key={`cell-${entry.name}`} 
                    fill={RATING_COLORS[entry.name]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color, fontWeight: 'bold' }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </MUI.Box>
    </MUI.Box>
  );
});

RatingDistributionChart.displayName = 'RatingDistributionChart';

export default RatingDistributionChart; 