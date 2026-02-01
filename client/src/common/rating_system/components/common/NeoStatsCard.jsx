import React from 'react';
import * as MUI from '@mui/material';
import { NeoCard, StatBar, NeoSectionTitle } from '../design/NeoComponents';
import theme from '../../../../theme/theme';

const NeoStatsCard = ({
  title = "PLAYER RATINGS",
  sections = [],
  color = "#ffffff"
}) => {
  return (
    <NeoCard bgcolor={color} sx={{ width: '100%' }}>
      <NeoSectionTitle bgcolor={theme.palette.button.redSide}>
        {title}
      </NeoSectionTitle>

      {sections.map((section, index) => (
        <React.Fragment key={index}>
          {section.title && (
            <MUI.Box mb={section.items?.length ? 3 : 0}>
              <MUI.Typography fontWeight="900" variant="body2" textTransform="uppercase" mb={1} color={section.titleColor || 'text.primary'}>
                {section.title}
              </MUI.Typography>
            </MUI.Box>
          )}

          {section.items?.map((item, itemIndex) => (
            <StatBar
              key={itemIndex}
              icon={item.icon}
              label={item.label}
              value={item.value}
              color={item.color}
            />
          ))}

          {index < sections.length - 1 && (
            <MUI.Divider sx={{ borderBottomWidth: 3, borderColor: 'black', my: 3 }} />
          )}
        </React.Fragment>
      ))}
    </NeoCard>
  );
};

export default NeoStatsCard;

