import React from 'react'
import * as MUI from "@mui/material";

import { useChampion } from '../contextProvider/ChampionProvider';
import ChampionSelectCard from '../common/ChampionSelectCard'
import { AbilityMap } from './AddInteractions';
import axios from 'axios';

const ViewInteractions = () => {

  const { championNames } = useChampion();

  const [firstChampion, setFirstChampion] = React.useState(null);
  const [secondChampion, setSecondChampion] = React.useState(null);
  const [firstChampionAbilities, setFirstChampionAbilities] = React.useState([]);
  const [secondChampionAbilities, setSecondChampionAbilities] = React.useState([]);
  const [selectedFirstChampionAbility, setSelectedFirstChampionAbility] = React.useState("");
  const [selectedSecondChampionAbility, setSelectedSecondChampionAbility] = React.useState("");
  const [videoData, setVideoData] = React.useState(null);


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

  // Call this function when both champions and abilities are selected
  React.useEffect(() => {
    if (firstChampion && selectedFirstChampionAbility && secondChampion && selectedSecondChampionAbility) {
      setVideoData(null);
      fetchVideoData();
    }
  }, [firstChampion, selectedFirstChampionAbility, secondChampion, selectedSecondChampionAbility]);

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

  const selectFirstChampionAbility = (abilityName) => {
    setSelectedFirstChampionAbility(abilityName);
  };

  const selectSecondChampionAbility = (abilityName) => {
    setSelectedSecondChampionAbility(abilityName);
  };

  const fetchVideoData = async () => {
    try {
      const ability1Index = firstChampionAbilities.findIndex((ability) => ability.name === selectedFirstChampionAbility);
      const ability2Index = secondChampionAbilities.findIndex((ability) => ability.name === selectedSecondChampionAbility);

      const params = {
        champion1: firstChampion?.id,
        ability1: AbilityMap[ability1Index],
        champion2: secondChampion?.id,
        ability2: AbilityMap[ability2Index]
      }

      const response = await axios.get("http://localhost:5174/api/videos", { params: params, withCredentials: true });
      setVideoData(response.data);
    } catch (error) {
      console.log("error fetching video data", error);
    }
  };

  return (
    <MUI.Box
      minHeight="700px"
      height="95vh"
      paddingTop="65px"
      sx={{
        backgroundImage: `url(https://cmsassets.rgpub.io/sanity/images/dsfx7636/universe/f81004a39c5502d766169beb4a342c46b0030d36-1920x946.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <MUI.Box
        display="flex"
        minHeight="500px"
        height="70vh"
        gap="25px"
        justifyContent="center"
      >
        <ChampionSelectCard
          order="First"
          champion={firstChampion}
          abilities={firstChampionAbilities}
          selectedAbility={selectedFirstChampionAbility}
          championNames={championNames}
          handleChampionSelect={handleFirstChampionSelect}
          handleAbilitySelect={selectFirstChampionAbility}
        ></ChampionSelectCard>
        <MUI.Card
          sx={{
            width: '60vw',
            height: "100%",
            borderRadius: '5px',
            boxShadow: 10,
            border: '3px solid',
            borderColor: '#785A28'
          }}>
          {videoData ? (
            <MUI.Box height="100%" padding="20px">
              <MUI.CardContent>
                <MUI.Typography variant="h6">{videoData.title}</MUI.Typography>
                <MUI.Typography variant="body2" color="text.secondary">
                  {videoData.description}
                </MUI.Typography>
              </MUI.CardContent>
              <MUI.CardMedia
                component="iframe"
                height="100%"
                src={`https://www.youtube.com/embed/${new URL(videoData.videoURL).searchParams.get('v')}`} // Use the embed format
                title={videoData.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </MUI.Box>
          ) : (
            <MUI.Box width="100%" height="100%" display="flex" alignItems="center" justifyContent="center">
              <MUI.Typography variant="body1" color="text.secondary">
                Select abilities to view the interaction video
              </MUI.Typography>
            </MUI.Box>
          )}
        </MUI.Card>
        <ChampionSelectCard
          order="Second"
          champion={secondChampion}
          abilities={secondChampionAbilities}
          selectedAbility={selectedSecondChampionAbility}
          championNames={championNames}
          handleChampionSelect={handleSecondChampionSelect}
          handleAbilitySelect={selectSecondChampionAbility}
        ></ChampionSelectCard>
      </MUI.Box >
    </MUI.Box>
  )
}

export default ViewInteractions