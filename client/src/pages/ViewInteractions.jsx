import React from 'react'
import * as MUI from "@mui/material";

import { useChampion } from '../contextProvider/ChampionProvider';
import ChampionSelectCard from '../common/ChampionSelectCard';
import { AbilityMap } from './AddInteractions';
import { fetchChampionDetails, fetchVideoData } from "../championApi/viewInteractionsApi";
import VideoPlayer from '../common/ViewInteractionPage/VideoDisplay';

const ViewInteractions = () => {

  const { championNames } = useChampion();

  const [firstChampion, setFirstChampion] = React.useState(null);
  const [secondChampion, setSecondChampion] = React.useState(null);
  const [firstChampionAbilities, setFirstChampionAbilities] = React.useState([]);
  const [secondChampionAbilities, setSecondChampionAbilities] = React.useState([]);
  const [selectedFirstChampionAbility, setSelectedFirstChampionAbility] = React.useState("");
  const [selectedSecondChampionAbility, setSelectedSecondChampionAbility] = React.useState("");
  const [videoData, setVideoData] = React.useState(null);

  const filteredChampionNamesForFirstCard = championNames.filter(
    (name) => name !== secondChampion?.id
  );
  const filteredChampionNamesForSecondCard = championNames.filter(
    (name) => name !== firstChampion?.id
  );

  const saveToSession = (k, v) => {
    if (v) sessionStorage.setItem(k, v);
  };

  const getFromSession = (k) => sessionStorage.getItem(k);

  const restoreSelections = async () => {
    const savedFirstChampion = getFromSession("firstChampion");
    const savedSecondChampion = getFromSession("secondChampion");
    const savedFirstAbility = getFromSession("selectedFirstChampionAbility");
    const savedSecondAbility = getFromSession("selectedSecondChampionAbility");

    if (savedFirstChampion) {
      const championData = await fetchChampionDetails(savedFirstChampion);
      handleChampionSelect(savedFirstChampion, setFirstChampion, setFirstChampionAbilities);
    }

    if (savedSecondChampion) {
      const championData = await fetchChampionDetails(savedSecondChampion);
      handleChampionSelect(savedSecondChampion, setSecondChampion, setSecondChampionAbilities);
    }
    console.log(savedFirstAbility);
    if (savedFirstAbility) setSelectedFirstChampionAbility(savedFirstAbility);
    if (savedSecondAbility) setSelectedSecondChampionAbility(savedSecondAbility);
  };

  React.useEffect(() => {
    saveToSession("firstChampion", firstChampion?.id);
    saveToSession("secondChampion", secondChampion?.id);
    saveToSession("selectedFirstChampionAbility", selectedFirstChampionAbility);
    saveToSession("selectedSecondChampionAbility", selectedSecondChampionAbility);
  }, [firstChampion, secondChampion, selectedFirstChampionAbility, selectedSecondChampionAbility]);

  React.useEffect(() => {
    restoreSelections();
  }, []);

  // Call this function when both champions and abilities are selected
  React.useEffect(() => {
    if (firstChampion && selectedFirstChampionAbility && secondChampion && selectedSecondChampionAbility) {
      fetchAndSetVideoData();
    }
  }, [firstChampion, selectedFirstChampionAbility, secondChampion, selectedSecondChampionAbility]);

  const handleChampionSelect = async (championName, setChampion, setChampionAbilities) => {
    const championData = await fetchChampionDetails(championName);
    if (championData) {
      setChampion(championData);
      setChampionAbilities([
        {
          name: championData.passive.name,
          description: championData.passive.description,
          image: championData.passive.image.full,
        },
        ...championData.spells.map(spell => ({
          name: spell.name,
          description: spell.description,
          image: spell.image.full,
        })),
      ]);
    }
  };

  const handleFirstChampionSelect = async (event) => {
    handleChampionSelect(event.target.value, setFirstChampion, setFirstChampionAbilities);
  };

  const handleSecondChampionSelect = async (event) => {
    handleChampionSelect(event.target.value, setSecondChampion, setSecondChampionAbilities);
  };

  const selectFirstChampionAbility = (abilityName) => {
    setSelectedFirstChampionAbility(abilityName);
  };

  const selectSecondChampionAbility = (abilityName) => {
    setSelectedSecondChampionAbility(abilityName);
  };

  const fetchAndSetVideoData = async () => {
    setVideoData(null);

    const ability1Index = firstChampionAbilities.findIndex((ability) => ability.name === selectedFirstChampionAbility);
    const ability2Index = secondChampionAbilities.findIndex((ability) => ability.name === selectedSecondChampionAbility);

    if (ability1Index === -1 || ability2Index === -1) return;

    const params = {
      champion1: firstChampion?.id,
      ability1: AbilityMap[ability1Index],
      champion2: secondChampion?.id,
      ability2: AbilityMap[ability2Index],
    };

    const data = await fetchVideoData(params);
    setVideoData(data);
  };

  return (
    <MUI.Box
      display="flex"
      minHeight="500px"
      paddingTop="50px"
      height="70vh"
      gap="25px"
      justifyContent="center"
    >
      <ChampionSelectCard
        order="First"
        champion={firstChampion}
        abilities={firstChampionAbilities}
        selectedAbility={selectedFirstChampionAbility}
        championNames={filteredChampionNamesForFirstCard}
        handleChampionSelect={handleFirstChampionSelect}
        handleAbilitySelect={selectFirstChampionAbility}
      />
      <VideoPlayer videoData={videoData} />
      <ChampionSelectCard
        order="Second"
        champion={secondChampion}
        abilities={secondChampionAbilities}
        selectedAbility={selectedSecondChampionAbility}
        championNames={filteredChampionNamesForSecondCard}
        handleChampionSelect={handleSecondChampionSelect}
        handleAbilitySelect={selectSecondChampionAbility}
      />
    </MUI.Box >
  )
}

export default ViewInteractions;