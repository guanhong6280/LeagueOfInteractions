import axios from 'axios';

const API_BASE_URL = "http://localhost:5174/api";

export const fetchChampionDetails = async (championName) => {
  try {
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/14.19.1/data/en_US/champion/${championName}.json`);
    const data = await response.json();
    return data.data[championName];
  } catch (error) {
    console.error('Error fetching champion details:', error);
    return null;
  }
};

export const fetchVideoData = async (params) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/videos`, { params, withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error fetching video data:", error);
    return null;
  }
};