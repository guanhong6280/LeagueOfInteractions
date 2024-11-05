import React from 'react'
import * as MUI from "@mui/material";

import { useChampion } from '../contextProvider/ChampionProvider';
import ChampionSelectCard from '../common/ChampionSelectCard'

const ViewInteractions = () => {

  const { championNames } = useChampion();

  const [firstChampion, setFirstChampion] = React.useState(null);
  const [secondChampion, setSecondChampion] = React.useState(null);
  const [firstChampionAbilities, setFirstChampionAbilities] = React.useState([]);
  const [secondChampionAbilities, setSecondChampionAbilities] = React.useState([]);
  const [selectedFirstChampionAbility, setSelectedFirstChampionAbility] = React.useState("");
  const [selectedSecondChampionAbility, setSelectedSecondChampionAbility] = React.useState("");


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

  const selectFirstChampionAbility = (abilityName) => {
    setSelectedFirstChampionAbility(abilityName);
  };

  const selectSecondChampionAbility = (abilityName) => {
    setSelectedSecondChampionAbility(abilityName);
  };

  return (
    <div>
      <MUI.Box
        display="flex"
        gap="10px"
        marginTop="50px"
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
        <MUI.Box
          width="60vw"
          border="solid 2px"
          borderRadius="5px"
        ></MUI.Box>
        <ChampionSelectCard
          order="Second"
          champion={secondChampion}
          abilities={secondChampionAbilities}
          selectedAbility={selectedSecondChampionAbility}
          championNames={championNames}
          handleChampionSelect={handleSecondChampionSelect}
          handleAbilitySelect={selectSecondChampionAbility}
        ></ChampionSelectCard>
      </MUI.Box>
    </div>
  )
}

export default ViewInteractions