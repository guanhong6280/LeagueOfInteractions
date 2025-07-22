import React, { memo } from 'react';
import * as MUI from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getRarityColor, formatRarityName, RARITY_NAMES } from '../../constants/rarityColors';

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
          {label} Skins
        </MUI.Typography>
        <MUI.Typography variant="body2" color="text.secondary">
          {data.value} skins available
        </MUI.Typography>
      </MUI.Paper>
    );
  }
  return null;
};

const RarityDistributionChart = memo(({ stats, isLoading = false }) => {
  // Transform stats data into chart format
  const chartData = React.useMemo(() => {
    if (!stats?.rarityDistribution) {
      return [];
    }

    // Transform real stats data
    const distribution = stats.rarityDistribution;
    
    return Object.entries(distribution)
      .map(([rarity, count]) => ({
        name: formatRarityName(rarity),
        value: count,
        color: getRarityColor(rarity),
        originalRarity: rarity,
      }))
      .filter(item => item.value > 0) // Only show rarities that exist
      .sort((a, b) => b.value - a.value); // Sort by count (descending)
  }, [stats]);

  const hasNoData = !stats?.rarityDistribution || chartData.length === 0;

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

  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(item => item.value)) : 0;

  return (
    <MUI.Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Chart Header */}
      <MUI.Typography 
        variant="h6" 
        fontWeight="bold" 
        color="primary.main"
        sx={{ mb: 2, textAlign: 'center' }}
      >
        Rarity Distribution
      </MUI.Typography>

      {/* Chart Container */}
      <MUI.Box sx={{ flex: 1, minHeight: 250 }}>
        {hasNoData ? (
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
            <MUI.Box sx={{ fontSize: 64, color: 'grey.400', mb: 2 }}>💎</MUI.Box>
            <MUI.Typography variant="h6" color="text.secondary" gutterBottom>
              No skin data available
            </MUI.Typography>
            <MUI.Typography variant="body2" color="text.secondary">
              Skin rarity information will appear here once available.
            </MUI.Typography>
          </MUI.Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                domain={[0, Math.ceil(maxValue * 1.1)]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </MUI.Box>

      {/* Chart Summary and Legend - Only show when there's data */}
      {!hasNoData && (
        <>
          <MUI.Box sx={{ mt: 2, textAlign: 'center' }}>
            <MUI.Typography variant="body2" color="text.secondary">
              Total Skins: {chartData.reduce((sum, item) => sum + item.value, 0)}
            </MUI.Typography>
          </MUI.Box>

          <MUI.Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
            {chartData.map((item) => (
              <MUI.Chip
                key={item.name}
                label={`${item.name} (${item.value})`}
                size="small"
                sx={{
                  bgcolor: item.color,
                  color: 'white',
                  fontWeight: 'bold',
                  '& .MuiChip-label': {
                    textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                  },
                }}
              />
            ))}
          </MUI.Box>
        </>
      )}
    </MUI.Box>
  );
});

RarityDistributionChart.displayName = 'RarityDistributionChart';

export default RarityDistributionChart; 