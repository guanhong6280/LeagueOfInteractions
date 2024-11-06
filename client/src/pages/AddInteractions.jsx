import React from 'react'
import * as MUI from "@mui/material";
import axios from 'axios';
import { useChampion } from '../contextProvider/ChampionProvider';
import AbilitySelectCard from '../common/AbilitySelectCard';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddIcon from '@mui/icons-material/Add';

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

  // Find the selected ability in the abilities array
  const selectedFirstAbilityObject = firstChampionAbilities.find(
    (ability) => ability.name === selectedFirstChampionAbility
  );

  const selectedSecondAbilityObject = secondChampionAbilities.find(
    (ability) => ability.name === selectedSecondChampionAbility
  );
  // Construct the URL based on whether it's the passive or active ability
  const firstAbilityImgUrl = selectedFirstAbilityObject
    ? selectedFirstAbilityObject.name === firstChampionAbilities[0]?.name
      ? `url(https://ddragon.leagueoflegends.com/cdn/14.13.1/img/passive/${selectedFirstAbilityObject.image})`
      : `url(https://ddragon.leagueoflegends.com/cdn/14.13.1/img/spell/${selectedFirstAbilityObject.image})`
    : 'none';

  const secondAbilityImgUrl = selectedSecondAbilityObject
    ? selectedSecondAbilityObject.name === secondChampionAbilities[0]?.name
      ? `url(https://ddragon.leagueoflegends.com/cdn/14.13.1/img/passive/${selectedSecondAbilityObject.image})`
      : `url(https://ddragon.leagueoflegends.com/cdn/14.13.1/img/spell/${selectedSecondAbilityObject.image})`
    : 'none';


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
    const abilityName = event.target.value
    setSelectedFirstChampionAbility(abilityName);
  };

  const selectSecondChampionAbility = (event) => {
    const abilityName = event.target.value
    setSelectedSecondChampionAbility(abilityName);
  };

  const handleVideoLink = (event) => {
    setVideoLink(event.target.value);
  };

  const uploadVideo = async () => {
    try {
      const ability1Index = firstChampionAbilities.findIndex(
        (ability) => ability.name === selectedFirstChampionAbility
      );
      const ability2Index = secondChampionAbilities.findIndex(
        (ability) => ability.name === selectedSecondChampionAbility
      );
  
      const ability1Key = AbilityMap[ability1Index];
      const ability2Key = AbilityMap[ability2Index];
  
      const payload = {
        champion1: firstChampion?.id,
        ability1: ability1Key,
        champion2: secondChampion?.id,
        ability2: ability2Key,
        videoURL: videoLink,
      };
  
      // Send the POST request to your server endpoint
      const response = await axios.post('http://localhost:5174/api/videos/upload', payload, {
        withCredentials: true
      });
  
      console.log('Video uploaded successfully:', response.data);
      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video');
    }
  };
  

  return (
    <MUI.Stack
      spacing="50px"
      marginTop="50px"
      marginX="50px"
      border="1px solid black"
      borderRadius="10px"
      padding="50px">
      <AbilitySelectCard
        order="First"
        bgColor="rgba(255, 0, 0, 0.5)"
        champion={firstChampion}
        abilities={firstChampionAbilities}
        selectedAbility={selectedFirstChampionAbility}
        championNames={championNames}
        handleChampionSelect={handleFirstChampionSelect}
        handleAbilitySelect={selectFirstChampionAbility}
      />
      <AbilitySelectCard
        order="Second"
        bgColor="rgba(0, 0, 255, 0.6)"
        champion={secondChampion}
        abilities={secondChampionAbilities}
        selectedAbility={selectedSecondChampionAbility}
        championNames={championNames}
        handleChampionSelect={handleSecondChampionSelect}
        handleAbilitySelect={selectSecondChampionAbility}
      />
      <MUI.Box display="flex" alignItems="center" paddingX="20px" gap="20px">
        <MUI.Box
          width="64px"
          height="64px"
          border="2px solid rgba(255, 0, 0, 0.5)"
          borderRadius="10px"
          sx={{
            backgroundImage: firstAbilityImgUrl,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <AddIcon sx={{ fontSize: "80px" }} />
        <MUI.Box
          width="64px"
          height="64px"
          border="2px solid blue"
          borderRadius="10px"
          sx={{
            backgroundImage: secondAbilityImgUrl,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
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
            onClick={uploadVideo}
          >Upload</MUI.Button>
        </MUI.Box>
      </MUI.Box>
    </MUI.Stack>

  )
}

export default AddInteractions