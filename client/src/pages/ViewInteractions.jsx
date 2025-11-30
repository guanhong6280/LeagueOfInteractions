import React from 'react';
import * as MUI from '@mui/material';

import { useChampion } from '../contextProvider/ChampionProvider';
import ChampionSelectCard from '../common/ChampionSelectCard';
import { AbilityMap } from './AddInteractions';
import { fetchChampionDetails, fetchVideoData } from '../api/championApi';
import VideoPlayer from '../common/ViewInteractionPage/VideoDisplay';

const ViewInteractions = () => {
  const { championNames } = useChampion();

  const [firstChampion, setFirstChampion] = React.useState(null);
  const [secondChampion, setSecondChampion] = React.useState(null);
  const [firstChampionAbilities, setFirstChampionAbilities] = React.useState([]);
  const [secondChampionAbilities, setSecondChampionAbilities] = React.useState([]);
  const [selectedFirstChampionAbility, setSelectedFirstChampionAbility] = React.useState('');
  const [selectedSecondChampionAbility, setSelectedSecondChampionAbility] = React.useState('');
  const [videoData, setVideoData] = React.useState(null);

  // Use a ref to track if restoration is in progress
  const isRestoring = React.useRef(true);

  const filteredChampionNamesForFirstCard = championNames.filter(
    (name) => name !== secondChampion?.id,
  );
  const filteredChampionNamesForSecondCard = championNames.filter(
    (name) => name !== firstChampion?.id,
  );

  const saveToSession = (k, v) => {
    if (v) sessionStorage.setItem(k, v);
  };

  const getFromSession = (k) => sessionStorage.getItem(k);
  const removeFromSession = (k) => sessionStorage.removeItem(k);

  const restoreSelections = async () => {
    isRestoring.current = true;
    try {
      const savedFirstChampion = getFromSession('firstChampion');
      const savedSecondChampion = getFromSession('secondChampion');
      const savedFirstAbility = getFromSession('selectedFirstChampionAbility');
      const savedSecondAbility = getFromSession('selectedSecondChampionAbility');

      if (savedFirstChampion) {
        // Direct state update instead of going through handleChampionSelect to avoid side effects
        const championData = await fetchChampionDetails(savedFirstChampion);
        if (championData) {
          setFirstChampion(championData);
          setFirstChampionAbilities([
            {
              name: championData.passive.name,
              description: championData.passive.description,
              image: championData.passive.image.full,
            },
            ...championData.spells.map((spell) => ({
              name: spell.name,
              description: spell.description,
              image: spell.image.full,
            })),
          ]);
        }
      }

      if (savedSecondChampion) {
        const championData = await fetchChampionDetails(savedSecondChampion);
        if (championData) {
          setSecondChampion(championData);
          setSecondChampionAbilities([
            {
              name: championData.passive.name,
              description: championData.passive.description,
              image: championData.passive.image.full,
            },
            ...championData.spells.map((spell) => ({
              name: spell.name,
              description: spell.description,
              image: spell.image.full,
            })),
          ]);
        }
      }

      if (savedFirstAbility) setSelectedFirstChampionAbility(savedFirstAbility);
      if (savedSecondAbility) setSelectedSecondChampionAbility(savedSecondAbility);
    } catch (e) {
      console.error("Failed to restore selections", e);
    } finally {
      // Small timeout to allow state updates to settle before enabling saveToSession
      setTimeout(() => {
        isRestoring.current = false;
      }, 100);
    }
  };

  React.useEffect(() => {
    // Only save to session if we are NOT currently restoring
    if (isRestoring.current) return;

    if (firstChampion) saveToSession('firstChampion', firstChampion.id);
    else removeFromSession('firstChampion');

    if (secondChampion) saveToSession('secondChampion', secondChampion.id);
    else removeFromSession('secondChampion');

    if (selectedFirstChampionAbility) saveToSession('selectedFirstChampionAbility', selectedFirstChampionAbility);
    else removeFromSession('selectedFirstChampionAbility');

    if (selectedSecondChampionAbility) saveToSession('selectedSecondChampionAbility', selectedSecondChampionAbility);
    else removeFromSession('selectedSecondChampionAbility');
  }, [firstChampion, secondChampion, selectedFirstChampionAbility, selectedSecondChampionAbility]);

  React.useEffect(() => {
    restoreSelections();
  }, []);

  // Call this function when both champions and abilities are selected
  React.useEffect(() => {
    if (firstChampion && selectedFirstChampionAbility && secondChampion && selectedSecondChampionAbility) {
      fetchAndSetVideoData();
    } else {
      setVideoData(null); // Clear video if selection is incomplete
    }
  }, [firstChampion, selectedFirstChampionAbility, secondChampion, selectedSecondChampionAbility]);

  const handleChampionSelect = async (championName, setChampion, setChampionAbilities) => {
    if (!championName) {
      setChampion(null);
      setChampionAbilities([]);
      return;
    }

    const championData = await fetchChampionDetails(championName);
    if (championData) {
      setChampion(championData);
      setChampionAbilities([
        {
          name: championData.passive.name,
          description: championData.passive.description,
          image: championData.passive.image.full,
        },
        ...championData.spells.map((spell) => ({
          name: spell.name,
          description: spell.description,
          image: spell.image.full,
        })),
      ]);
    }
  };

  const handleFirstChampionSelect = async (event) => {
    const val = event.target.value;
    handleChampionSelect(val, setFirstChampion, setFirstChampionAbilities);
    if (!val) setSelectedFirstChampionAbility(''); // Clear ability if champion cleared
    else setSelectedFirstChampionAbility(''); // Reset ability if changing champion
  };

  const handleSecondChampionSelect = async (event) => {
    const val = event.target.value;
    handleChampionSelect(val, setSecondChampion, setSecondChampionAbilities);
    if (!val) setSelectedSecondChampionAbility(''); // Clear ability if champion cleared
    else setSelectedSecondChampionAbility(''); // Reset ability if changing champion
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
      paddingX="20px"
      height="70vh"
      gap="25px"
      justifyContent="center"
      alignItems="center"
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
  );
};

export default ViewInteractions;
