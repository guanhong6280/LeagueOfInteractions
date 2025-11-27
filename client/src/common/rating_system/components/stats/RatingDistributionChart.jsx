import React, { memo } from 'react';
import * as MUI from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Star-themed colors for ratings
const RATING_COLORS = {
  '5 Stars': '#FFD700', // Gold
  '4 Stars': '#90EE90', // Light Green
  '3 Stars': '#87CEEB', // Sky Blue
  '2 Stars': '#FFA500', // Orange
  '1 Star': '#FF6B6B',  // Light Red
};

// Custom "Needle" or Center Label
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
      <path d={props.path} stroke="black" strokeWidth={3} fill={fill} />
      {/* Brutalist Label Line */}
      <circle cx={cx} cy={cy} r={innerRadius - 5} fill="black" />
      <circle cx={cx} cy={cy} r={innerRadius - 10} fill="white" />
      <text x={cx} y={cy} dy={5} textAnchor="middle" fill="black" fontWeight="900" fontSize={24}>
        ★
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload }) => {
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
          minWidth: 140
        }}
      >
        <MUI.Typography variant="subtitle2" fontWeight="900" textTransform="uppercase" sx={{ borderBottom: '1px solid white', mb: 1, pb: 0.5 }}>
          {data.name}
        </MUI.Typography>
        <MUI.Box display="flex" justifyContent="space-between" alignItems="center">
          <MUI.Typography variant="body2" fontWeight="bold">COUNT:</MUI.Typography>
          <MUI.Typography variant="body2" fontWeight="bold" sx={{ color: '#FFD700' }}>{data.value}</MUI.Typography>
        </MUI.Box>
        <MUI.Box display="flex" justifyContent="space-between" alignItems="center">
          <MUI.Typography variant="body2" fontWeight="bold">SHARE:</MUI.Typography>
          <MUI.Typography variant="body2" fontWeight="bold">{(data.payload.percent * 100).toFixed(0)}%</MUI.Typography>
        </MUI.Box>
      </MUI.Box>
    );
  }
  return null;
};

const RatingDistributionChart = memo(({ stats, isLoading = false }) => {
  const chartData = React.useMemo(() => {
    if (!stats?.ratingDistribution) return [];
    const distribution = stats.ratingDistribution;
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    if (total === 0) return [];
    
    return [
      { name: '5 Stars', value: distribution[5] || 0 },
      { name: '4 Stars', value: distribution[4] || 0 },
      { name: '3 Stars', value: distribution[3] || 0 },
      { name: '2 Stars', value: distribution[2] || 0 },
      { name: '1 Star', value: distribution[1] || 0 },
    ].map(item => ({
      ...item,
      percent: item.value / total
    })).filter(item => item.value > 0);
  }, [stats]);

  const hasNoRatings = !stats?.ratingDistribution || chartData.length === 0;

  if (isLoading) {
    return (
      <MUI.Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MUI.CircularProgress size={40} sx={{ color: 'black' }} thickness={5} />
      </MUI.Box>
    );
  }

  if (hasNoRatings) {
    return (
      <MUI.Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 2 }}>
        <StarIcon sx={{ fontSize: 48, color: 'black', opacity: 0.2, mb: 1 }} />
        <MUI.Typography variant="h6" fontWeight="900" textTransform="uppercase" color="text.secondary">NO DATA</MUI.Typography>
      </MUI.Box>
    );
  }

  return (
    <MUI.Box sx={{ width: '100%', height: '100%', minHeight: 250, display: 'flex', alignItems: 'center' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            stroke="black"
            strokeWidth={3}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={RATING_COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            iconType="square"
            iconSize={12}
            formatter={(value, entry) => (
              <span style={{ color: 'black', fontWeight: '900', textTransform: 'uppercase', fontSize: '12px', marginLeft: '5px' }}>
                {value.replace(' Stars', '').replace(' Star', '')} ★
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </MUI.Box>
  );
});

RatingDistributionChart.displayName = 'RatingDistributionChart';
export default RatingDistributionChart;
