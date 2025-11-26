import React, { memo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import * as MUI from '@mui/material';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <MUI.Box
        sx={{
          bgcolor: 'white',
          border: '2px solid black',
          boxShadow: '4px 4px 0px black',
          p: 1.5,
          minWidth: 120
        }}
      >
        <MUI.Typography variant="subtitle2" fontWeight="900" textTransform="uppercase">
          {`${data.subject} : ${data.A} / 3`}
        </MUI.Typography>
      </MUI.Box>
    );
  }
  return null;
};

const PlaystyleRadarChart = memo(({ playstyleInfo }) => {
  if (!playstyleInfo) return null;

  // Transform playstyleInfo object to array for Recharts
  const data = [
    { subject: 'Damage', A: playstyleInfo.damage || 0, fullMark: 3 },
    { subject: 'Toughness', A: playstyleInfo.durability || 0, fullMark: 3 },
    { subject: 'CC', A: playstyleInfo.crowdControl || 0, fullMark: 3 },
    { subject: 'Mobility', A: playstyleInfo.mobility || 0, fullMark: 3 },
    { subject: 'Utility', A: playstyleInfo.utility || 0, fullMark: 3 },
  ];

  return (
    <MUI.Box sx={{ width: '100%', height: '100%', minHeight: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e0e0e0" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#000', fontSize: 12, fontWeight: 'bold' }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 3]} tick={false} axisLine={false} />
          <Radar
            name="Playstyle"
            dataKey="A"
            stroke="#000"
            strokeWidth={2}
            fill="#FFEB3B"
            fillOpacity={0.6}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </MUI.Box>
  );
});

PlaystyleRadarChart.displayName = 'PlaystyleRadarChart';

export default PlaystyleRadarChart;

