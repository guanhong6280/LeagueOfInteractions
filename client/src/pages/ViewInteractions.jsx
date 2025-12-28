import React, { useMemo, useEffect } from 'react';
import * as MUI from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import ChampionSelectCard from '../common/ViewInteractionPage/ChampionSelectCard.jsx';
import VideoPlayer from '../common/ViewInteractionPage/VideoDisplay';
import { AbilityMap } from '../common/championUploadSelectCard.jsx'; // Ensure this path is correct
import { fetchVideoData } from '../api/championApi';
import { useChampionDetails } from '../hooks/useChampionDetails';
import { useChampionNames } from '../hooks/useChampionNames';

const ViewInteractions = () => {
  const { data: championNames = [] } = useChampionNames();
  const [searchParams, setSearchParams] = useSearchParams();

  // ==================== 1. STATE MANAGEMENT (URL DRIVEN) ====================

  // Read state directly from URL
  const champ1Name = searchParams.get('c1') || '';
  const ability1 = searchParams.get('a1') || '';
  const champ2Name = searchParams.get('c2') || '';
  const ability2 = searchParams.get('a2') || '';

  // ==================== 2. HYBRID PERSISTENCE (URL + SESSION) ====================

  // MOUNT: If URL is empty, try to restore from Session
  useEffect(() => {
    if (!searchParams.toString()) {
      const savedParams = sessionStorage.getItem('interactionParams');
      if (savedParams) {
        setSearchParams(new URLSearchParams(savedParams), { replace: true });
      }
    }
  }, []); // Run once

  // UPDATE: Sync URL changes to Session (Handle Cancel/Clear)
  useEffect(() => {
    const currentParams = searchParams.toString();
    if (currentParams) {
      sessionStorage.setItem('interactionParams', currentParams);
    } else {
      sessionStorage.removeItem('interactionParams'); // Wipe session on clear
    }
  }, [searchParams]);

  // ==================== 3. DATA FETCHING (REACT QUERY) ====================

  // Fetch Champion Details (Parallel & Cached)
  const { data: firstChampion, isLoading: loadingFirst } = useChampionDetails(champ1Name);
  const { data: secondChampion, isLoading: loadingSecond } = useChampionDetails(champ2Name);

  // Helper to format abilities for the cards
  const formatAbilities = (championData) => {
    if (!championData) return [];
    return [
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
    ];
  };

  const firstChampionAbilities = useMemo(() => formatAbilities(firstChampion), [firstChampion]);
  const secondChampionAbilities = useMemo(() => formatAbilities(secondChampion), [secondChampion]);

  // Fetch Video Data (Only when all selections are ready)
  const ability1Index = firstChampionAbilities.findIndex((a) => a.name === ability1);
  const ability2Index = secondChampionAbilities.findIndex((a) => a.name === ability2);
  
  const isSelectionComplete = 
    firstChampion && ability1 && ability1Index !== -1 && 
    secondChampion && ability2 && ability2Index !== -1;

  const { data: videoData, isLoading: loadingVideo } = useQuery({
    queryKey: ['interaction-video', firstChampion?.id, ability1, secondChampion?.id, ability2],
    queryFn: () => fetchVideoData({
      champion1: firstChampion.id,
      ability1: AbilityMap[ability1Index], // Maps index 0->P, 1->Q, etc.
      champion2: secondChampion.id,
      ability2: AbilityMap[ability2Index],
    }),
    enabled: !!isSelectionComplete,
    staleTime: 1000 * 60 * 10, // Cache video for 10 mins
    retry: false,
  });

  // ==================== 4. HANDLERS ====================

  // Helper to cleanly update params without losing other state
  const updateParam = (updates) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) newParams.set(key, value);
        else newParams.delete(key);
      });
      return newParams;
    }, { replace: true });
  };

  const handleFirstChampionSelect = (e) => {
    updateParam({ c1: e.target.value, a1: '' }); // Clear ability on champ change
  };

  const handleSecondChampionSelect = (e) => {
    updateParam({ c2: e.target.value, a2: '' });
  };

  // Filter lists to prevent selecting same champ on both sides
  const filteredFirstList = championNames.filter(name => name !== champ2Name);
  const filteredSecondList = championNames.filter(name => name !== champ1Name);

  return (
    <MUI.Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      minHeight="500px"
      paddingTop="50px"
      paddingBottom="50px"
      gap={4}
    >

      <MUI.Box
        display="flex"
        justifyContent="center"
        alignItems="center" // Align to top so cards don't stretch weirdly
        gap="25px"
        width="100%"
        paddingX="20px"
        boxSizing="border-box"
      >
        {/* Left Card */}
        <ChampionSelectCard
          order="First"
          champion={firstChampion || null}
          abilities={firstChampionAbilities}
          selectedAbility={ability1}
          championNames={filteredFirstList}
          handleChampionSelect={handleFirstChampionSelect}
          handleAbilitySelect={(name) => updateParam({ a1: name })}
          isLoading={loadingFirst}
        />

        {/* Center Video Player */}
        <VideoPlayer 
          videoData={videoData} 
          isLoading={loadingVideo} 
          selectionsComplete={isSelectionComplete}
          currentSelections={{
            champion1: firstChampion,
            champion2: secondChampion,
            ability1: ability1,
            ability2: ability2
          }}
        />

        {/* Right Card */}
        <ChampionSelectCard
          order="Second"
          champion={secondChampion || null}
          abilities={secondChampionAbilities}
          selectedAbility={ability2}
          championNames={filteredSecondList}
          handleChampionSelect={handleSecondChampionSelect}
          handleAbilitySelect={(name) => updateParam({ a2: name })}
          isLoading={loadingSecond}
        />
      </MUI.Box>
    </MUI.Box>
  );
};

export default ViewInteractions;