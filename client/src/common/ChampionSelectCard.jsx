import React from 'react'
import * as MUI from "@mui/material";

const ChampionSelectCard = () => {
  const [championNames, setChampionNames] = React.useState([]);
  const [selectedChampion, setSelectedChampion] = React.useState('');
  const [spells, setSpells] = React.useState([]);
  const [passive, setPassive] = React.useState("");

  // Fetch champion names using async/await
  //I wonder where i should place this fetch function
  React.useEffect(() => {
    const fetchChampionNames = async () => {
      try {
        const response = await fetch('https://ddragon.leagueoflegends.com/cdn/14.18.1/data/en_US/champion.json');
        const data = await response.json();
        const names = Object.keys(data.data);
        setChampionNames(names);
      } catch (error) {
        console.error('Error fetching champion names:', error);
      }
    };

    fetchChampionNames();
  }, []);

  // Fetch selected champion details using async/await
  const fetchChampionDetails = async (championName) => {
    const url = `https://ddragon.leagueoflegends.com/cdn/14.19.1/data/en_US/champion/${championName}.json`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const championData = data.data[championName]
      //Extract abilities
      const championSpells = championData.spells;
      setSpells(championSpells);

      // Extract the passive name
      const championPassive = championData.passive;
      setPassive(championPassive);
    } catch (error) {
      console.error('Error fetching champion details:', error);
    }
  };

  // Handle change in selected champion
  const handleChange = (event) => {
    const selectedChampionName = event.target.value;
    setSelectedChampion(selectedChampionName);
    fetchChampionDetails(selectedChampionName); // Fetch champion details
  };

  return (
    <MUI.Stack
      border="solid 2px"
      borderRadius="5px"
      spacing="5px"
      paddingX="20px"
      paddingY="50px"
      sx={{
        position: 'relative',
        padding: 4,
        height: "60vh",
        aspectRatio: 2 / 5,
        zIndex: 1, // Ensure content is above the background
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: selectedChampion
            ? `url(https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${selectedChampion}_0.jpg)`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3, // Adjust opacity here
          zIndex: -1, // Ensure the background is behind the content
        },
      }}
    >
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
      <MUI.Stack
        alignItems="center"
      >
        <MUI.Box
          width="64px"
          height="64px"
          sx={{
            backgroundImage: selectedChampion && passive?.image?.full
              ? `url(https://ddragon.leagueoflegends.com/cdn/14.13.1/img/passive/${passive.image.full})`
              : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          P
        </MUI.Box>
        <MUI.Typography>{passive.name}</MUI.Typography>
      </MUI.Stack>
      <MUI.Stack
        alignItems="center"
      >
        <MUI.Box
          width="64px"
          height="64px"
          sx={{
            backgroundImage: selectedChampion && spells[0]?.image?.full
              ? `url(https://ddragon.leagueoflegends.com/cdn/14.13.1/img/spell/${spells[0].image.full})`
              : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          Q
        </MUI.Box>
        <MUI.Typography>{spells[0]?.name}</MUI.Typography>
      </MUI.Stack>
      <MUI.Stack
        alignItems="center"
      >
        <MUI.Box
          width="64px"
          height="64px"
          sx={{
            backgroundImage: selectedChampion && spells[1]?.image?.full
              ? `url(https://ddragon.leagueoflegends.com/cdn/14.13.1/img/spell/${spells[1].image.full})`
              : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          W
        </MUI.Box>
        <MUI.Typography>{spells[1]?.name}</MUI.Typography>
      </MUI.Stack>
      <MUI.Stack
        alignItems="center"
      >
        <MUI.Box
          width="64px"
          height="64px"
          sx={{
            backgroundImage: selectedChampion && spells[2]?.image?.full
              ? `url(https://ddragon.leagueoflegends.com/cdn/14.13.1/img/spell/${spells[2].image.full})`
              : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          E
        </MUI.Box>
        <MUI.Typography>{spells[2]?.name}</MUI.Typography>
      </MUI.Stack>
      <MUI.Stack
        alignItems="center"
      >
        <MUI.Box
          width="64px"
          height="64px"
          sx={{
            backgroundImage: selectedChampion && spells[3]?.image?.full
              ? `url(https://ddragon.leagueoflegends.com/cdn/14.13.1/img/spell/${spells[3].image.full})`
              : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          R
        </MUI.Box>
        <MUI.Typography>{spells[3]?.name}</MUI.Typography>
      </MUI.Stack>
    </MUI.Stack>
  )
}

export default ChampionSelectCard