import React from 'react';
import { fetchChampionNames } from '../api/championApi';

const ChampionContext = React.createContext();

export const useChampion = () => React.useContext(ChampionContext);

const ChampionProvider = ({ children }) => {
  const [championNames, setChampionNames] = React.useState([]);

  React.useEffect(() => {
    const getChampionNames = async () => {
      try {
        const reponse = await fetchChampionNames();
        const names = Object.keys(reponse.data);
        if (Array.isArray(names)) {
          setChampionNames(names);
        } else {
            console.error('Fetched champion names is not an array:', names);
        }
      } catch (error) {
        console.error('Failed to fetch champion names:', error);
      }
    };

    getChampionNames();
  }, []);

  return (
    <ChampionContext.Provider value={{ championNames }}>
      {children}
    </ChampionContext.Provider>
  );
};

export default ChampionProvider;
