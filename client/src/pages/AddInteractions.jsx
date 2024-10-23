import React from 'react'
import * as MUI from "@mui/material";

const AddInteractions = () => {
  return (
    <MUI.Stack>
      <MUI.FormControl>
        <MUI.InputLabel id="champion-select-label">Select a Champion</MUI.InputLabel>
        <MUI.Select
          labelId="champion-select-label"
          value={selectedChampion}
          label="Select a Champion"
          onChange={handleChange}
        >
          {championNames.map((name, index) => (
            <MUI.MenuItem key={index} value={name}>
              {name}
            </MUI.MenuItem>
          ))}
        </MUI.Select>
      </MUI.FormControl>
      <MUI.FormControl>
        <MUI.InputLabel id="champion-select-label">Select a Champion</MUI.InputLabel>
        <MUI.Select
          labelId="champion-select-label"
          value={selectedChampion}
          label="Select a Champion"
          onChange={handleChange}
        >
          {championNames.map((name, index) => (
            <MUI.MenuItem key={index} value={name}>
              {name}
            </MUI.MenuItem>
          ))}
        </MUI.Select>
      </MUI.FormControl>
    </MUI.Stack>
  )
}

export default AddInteractions