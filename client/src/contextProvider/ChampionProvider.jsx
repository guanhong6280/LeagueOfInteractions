import React from 'react';
import { useChampionData } from '../hooks/useChampionData';

const ChampionContext = React.createContext();

export const useChampion = () => React.useContext(ChampionContext);

const ChampionProvider = ({ children }) => {
  const championData = useChampionData();

  return (
    <ChampionContext.Provider value={championData}>
      {children}
    </ChampionContext.Provider>
  );
};

export default ChampionProvider;
