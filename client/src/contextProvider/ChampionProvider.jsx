import React, { Children } from 'react';
import axios from 'axios';

const ChampionContext = React.createContext();

export const useChampion = () => React.useContext(ChampionContext);

const ChampionProvider = ({children}) => {

  const [championNames, setChampionNames] = React.useState([]);

  React.useEffect(() => {
    const fetchChampionNames = async () => {
      // try {
      //   const data = await axios.get("http://localhost:5174/api/championData/champion_names", {withCredentials: true});
      //   const names = Object.keys(data.data.data);
      //   setChampionNames(names);
      //   console.log(names);
      // } catch (error) {
      //   console.error('Error fetching champion names:', error);
      // }
    };

    fetchChampionNames();
  }, []);

  return (
    <ChampionContext.Provider value={{championNames}}>
      {children}
    </ChampionContext.Provider>
  )
}

export default ChampionProvider;