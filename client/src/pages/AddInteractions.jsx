import React from 'react'
import * as MUI from "@mui/material";
import { useChampion } from '../contextProvider/ChampionProvider';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import AbilitySelectCard from '../common/AbilitySelectCard';
import FileUploadIcon from '@mui/icons-material/FileUpload';

export const AbilityMap = {
  0: "P",
  1: "Q",
  2: "W",
  3: "E",
  4: "R"
};

const AddInteractions = () => {

  const { championNames } = useChampion();

  const [firstChampion, setFirstChampion] = React.useState(null);
  const [secondChampion, setSecondChampion] = React.useState(null);
  const [firstChampionAbilities, setFirstChampionAbilities] = React.useState([]);
  const [secondChampionAbilities, setSecondChampionAbilities] = React.useState([]);
  const [selectedFirstChampionAbility, setSelectedFirstChampionAbility] = React.useState("");
  const [selectedSecondChampionAbility, setSelectedSecondChampionAbility] = React.useState("");
  const [videoLink, setVideoLink] = React.useState("");

  React.useEffect(() => {
    if (firstChampion) {
      const abilities = [
        {
          name: firstChampion.passive.name,
          description: firstChampion.passive.description,
          image: firstChampion.passive.image.full
        },
        ...firstChampion.spells.map(spell => ({
          name: spell.name,
          description: spell.description,
          image: spell.image.full,
        }))
      ];
      setFirstChampionAbilities(abilities);
    }
  }, [firstChampion]);

  React.useEffect(() => {
    if (secondChampion) {
      const abilities = [
        {
          name: secondChampion.passive.name,
          description: secondChampion.passive.description,
          image: secondChampion.passive.image.full
        },
        ...secondChampion.spells.map(spell => ({
          name: spell.name,
          description: spell.description,
          image: spell.image.full,
        }))
      ];
      setSecondChampionAbilities(abilities);
    }
  }, [secondChampion]);

  const fetchChampionDetails = async (championName) => {
    const url = `https://ddragon.leagueoflegends.com/cdn/14.19.1/data/en_US/champion/${championName}.json`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const championData = data.data[championName];

      console.log(championData);

      return championData;
    } catch (error) {
      console.error('Error fetching champion details:', error);
    }

  };

  const handleFirstChampionSelect = async (event) => {
    const selectedFirstChampion = event.target.value;
    const firstChampionInfo = await fetchChampionDetails(selectedFirstChampion);
    setFirstChampion(firstChampionInfo);
    setSelectedFirstChampionAbility("");
  };

  const handleSecondChampionSelect = async (event) => {
    const selectedSecondChampion = event.target.value;
    const secondChampionInfo = await fetchChampionDetails(selectedSecondChampion);
    setSecondChampion(secondChampionInfo);
    setSelectedSecondChampionAbility("");
  };

  const selectFirstChampionAbility = (event) => {
    setSelectedFirstChampionAbility(event.target.value);
  };

  const selectSecondChampionAbility = (event) => {
    setSelectedSecondChampionAbility(event.target.value);
  };

  const handleVideoLink = (event) => {
    setVideoLink(event.target.value);
  };

  return (
    <MUI.Stack spacing="20px" marginTop="50px" marginX="50px" border="1px solid black" borderRadius="10px" padding="25px">
      <AbilitySelectCard
        order="First"
        champion={firstChampion}
        abilities={firstChampionAbilities}
        selectedAbility={selectedFirstChampionAbility}
        championNames={championNames}
        handleChampionSelect={handleFirstChampionSelect}
        handleAbilitySelect={selectFirstChampionAbility}
      />
      <AbilitySelectCard
        order="Second"
        champion={secondChampion}
        abilities={secondChampionAbilities}
        selectedAbility={selectedSecondChampionAbility}
        championNames={championNames}
        handleChampionSelect={handleSecondChampionSelect}
        handleAbilitySelect={selectSecondChampionAbility}
      />
      <MUI.Box display="flex" alignItems="center" paddingX="20px">
        <MUI.Stack spacing="10px">
          <MUI.Typography variant="h5">Interaction Video Link</MUI.Typography>
          <MUI.Box display="flex" gap="10px">
            <MUI.TextField
              label="Video Link"
              type="text"
              value={videoLink || ""}
              onChange={handleVideoLink}
              variant="outlined"
            />
            <MUI.Button
              startIcon={<FileUploadIcon></FileUploadIcon>}
              variant="contained"
            >Upload</MUI.Button>
          </MUI.Box>
        </MUI.Stack>
      </MUI.Box>
    </MUI.Stack>

  )
}

export default AddInteractions