import React, { memo } from 'react';
import * as MUI from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { getRarityColor, formatRarityName } from '../../constants/rarityColors';

// --- CUSTOM SHAPES ---

// A "Brutalist Block" Bar
const BrutalistBar = (props) => {
  const { fill, x, y, width, height, payload } = props;
  
  // Don't render if height is negligible
  if (!height || height < 0) return null;

  // Ensure we get the color from the payload if strictly provided there
  // Recharts usually passes 'fill' from Cell, but sometimes payload is safer for custom data
  const barFill = payload?.color || fill;

  return (
    <g>
      {/* Shadow Block (offset) */}
      <rect 
        x={x + 4} 
        y={y + 4} 
        width={width} 
        height={height} 
        fill="black" 
        opacity={1}
      />
      {/* Main Block */}
      <rect 
        x={x} 
        y={y} 
        width={width} 
        height={height} 
        stroke="black" 
        strokeWidth={3} 
        fill={barFill}
      />
      {/* "Shine" Line for texture */}
      <line 
        x1={x + 3} 
        y1={y + 3} 
        x2={x + 3} 
        y2={y + height - 3} 
        stroke="white" 
        strokeWidth={2} 
        opacity={0.3} 
      />
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    
    return (
      <MUI.Box
        sx={{
          bgcolor: 'black',
          color: 'white',
          border: '2px solid white',
          boxShadow: '4px 4px 0px rgba(0,0,0,0.5)',
          p: 1.5,
          minWidth: 120
        }}
      >
        <MUI.Typography variant="subtitle2" fontWeight="900" textTransform="uppercase" sx={{ borderBottom: '1px solid white', mb: 1 }}>
          {label}
        </MUI.Typography>
        <MUI.Typography variant="h6" fontWeight="900" sx={{ color: data.payload.pureColor }}>
          {data.value}
        </MUI.Typography>
        <MUI.Typography variant="caption" sx={{ opacity: 0.8 }}>
          SKINS FOUND
        </MUI.Typography>
      </MUI.Box>
    );
  }
  return null;
};

const RarityDistributionChart = memo(({ stats, isLoading = false }) => {
  const chartData = React.useMemo(() => {
    if (!stats?.rarityDistribution) return [];
    const distribution = stats.rarityDistribution;
    
    return Object.entries(distribution)
      .map(([rarity, count]) => {
        const pureColor = getRarityColor(rarity);
        let fill = pureColor;

        // Use gradient URLs for special tiers
        if (rarity === 'kExalted') fill = 'url(#gradient-exalted)';
        if (rarity === 'kTranscendent') fill = 'url(#gradient-transcendent)';
        if (rarity === 'kMythic') fill = 'url(#gradient-mythic)';
        if (rarity === 'kLegendary') fill = 'url(#gradient-legendary)';

        return {
          name: formatRarityName(rarity),
          value: count,
          color: fill,       // For the bar fill (can be a gradient URL)
          pureColor: pureColor, // For text/tooltips (always a hex code)
          originalRarity: rarity,
        };
      })
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [stats]);

  const hasNoData = !stats?.rarityDistribution || chartData.length === 0;

  if (isLoading) {
    return (
      <MUI.Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MUI.CircularProgress size={40} sx={{ color: 'black' }} thickness={5} />
      </MUI.Box>
    );
  }

  if (hasNoData) {
    return (
      <MUI.Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 2 }}>
        <MUI.Typography variant="h2" sx={{ mb: 1 }}>💎</MUI.Typography>
        <MUI.Typography variant="h6" fontWeight="900" textTransform="uppercase" color="text.secondary">NO SKIN DATA</MUI.Typography>
      </MUI.Box>
    );
  }

  const maxValue = Math.max(...chartData.map(item => item.value));

  return (
    <MUI.Box sx={{ width: '100%', height: '100%', minHeight: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
          barCategoryGap="20%"
        >
          {/* SVG Definitions for Gradients */}
          <defs>
            {/* Exalted: Gold Gradient */}
            <linearGradient id="gradient-exalted" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#FFA500" />
              <stop offset="100%" stopColor="#FFD700" />
            </linearGradient>

            {/* Transcendent: Pink/Rainbow Gradient */}
            <linearGradient id="gradient-transcendent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF69B4" />
              <stop offset="50%" stopColor="#00BFFF" />
              <stop offset="100%" stopColor="#32CD32" />
            </linearGradient>

            {/* Mythic: Purple Gradient */}
            <linearGradient id="gradient-mythic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9C27B0" />
              <stop offset="100%" stopColor="#673AB7" />
            </linearGradient>

             {/* Legendary: Red Gradient */}
             <linearGradient id="gradient-legendary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF0000" />
              <stop offset="100%" stopColor="#B71C1C" />
            </linearGradient>
          </defs>

          {/* Brutalist Grid: Dashed black lines */}
          <CartesianGrid strokeDasharray="3 3" stroke="black" opacity={0.1} vertical={false} />
          
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10, fontWeight: '900', fill: 'black' }}
            tickLine={false}
            axisLine={{ stroke: 'black', strokeWidth: 3 }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 12, fontWeight: '900', fill: 'black' }}
            tickLine={false}
            axisLine={{ stroke: 'black', strokeWidth: 3 }}
            domain={[0, Math.ceil(maxValue * 1.2)]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar dataKey="value" shape={<BrutalistBar />} isAnimationActive={true} animationDuration={1000}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </MUI.Box>
  );
});

RarityDistributionChart.displayName = 'RarityDistributionChart';
export default RarityDistributionChart;
