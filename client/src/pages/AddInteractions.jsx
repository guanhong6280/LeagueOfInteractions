import React from 'react'
import * as MUI from "@mui/material";
import { useChampion } from '../contextProvider/ChampionProvider';

const AddInteractions = () => {

  const { championNames } = useChampion();
  const [firstChampion, setFirstChampion] = React.useState(null);
  const [secondChampion, setSecondChampion] = React.useState(null);

  const handleFirstChampion = () => {
    console.log(championNames);
  }

  const handleSecondChampion = () => {

  }
  
  return (
    <MUI.Box display="flex">
      <MUI.Stack alignItems="center" spacing="10px" paddingX="20px" paddingY="50px">
        <MUI.FormControl sx={{ width: "200px" }}>
          <MUI.InputLabel id="champion-select-label">Select a Champion</MUI.InputLabel>
          <MUI.Select
            labelId="champion-select-label"
            // value={selectedChampion}
            label="Select a Champion"
          // onChange={handleChange}
          >
            {championNames.map((name, index) => (
              <MUI.MenuItem key={index} value={name}>
                {name}
              </MUI.MenuItem>
            ))}
          </MUI.Select>
        </MUI.FormControl>
        <MUI.FormControl sx={{ width: "200px" }}>
          <MUI.InputLabel id="champion-select-label">Select a Champion</MUI.InputLabel>
          <MUI.Select
            labelId="champion-select-label"
            // value={selectedChampion}
            label="Select a Champion"
          // onChange={handleChange}
          >
            {championNames.map((name, index) => (
              <MUI.MenuItem key={index} value={name}>
                {name}
              </MUI.MenuItem>
            ))}
          </MUI.Select>
        </MUI.FormControl>
      </MUI.Stack>
    </MUI.Box>

  )
}

export default AddInteractions