import React from 'react';
import * as MUI from '@mui/material';
import axios from 'axios';
import { UpChunk } from '@mux/upchunk';
import { initMuxUpload } from '../api/championApi';
import { useVideoEvents } from '../hooks/useVideoEvents';
import { useChampion } from '../contextProvider/ChampionProvider';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CloseIcon from '@mui/icons-material/Close';
import { useLocation } from 'react-router-dom';

export const AbilityMap = {
  0: 'P',
  1: 'Q',
  2: 'W',
  3: 'E',
  4: 'R',
};

const ChampionBattleZone = ({
  champion,
  championNames,
  abilities,
  selectedAbility,
  onChampionSelect,
  onAbilitySelect,
  themeColor,
  label,
}) => {
  const isRed = themeColor === 'red';
  const mainColor = isRed ? '#ff4d4d' : '#4d79ff'; // Neo-brutalist red/blue
  const borderColor = '#000';

  return (
    <MUI.Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      flex={1}
      gap="20px"
      sx={{
        border: `4px solid ${borderColor}`,
        backgroundColor: isRed ? '#fff5f5' : '#f0f4ff',
        padding: '30px',
        boxShadow: `12px 12px 0px 0px ${borderColor}`,
        position: 'relative',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translate(-2px, -2px)',
          boxShadow: `16px 16px 0px 0px ${borderColor}`,
        }
      }}
    >
      {/* Label Badge */}
      <MUI.Typography
        variant="h5"
        fontWeight="900"
        textTransform="uppercase"
        sx={{
          backgroundColor: mainColor,
          color: 'white',
          padding: '5px 20px',
          border: `3px solid ${borderColor}`,
          boxShadow: `4px 4px 0px 0px ${borderColor}`,
          marginBottom: '10px'
        }}
      >
        {label}
      </MUI.Typography>

      {/* Champion Select */}
      <MUI.FormControl sx={{ width: '100%', maxWidth: '300px' }}>
        <MUI.Select
          value={champion?.id || ''}
          onChange={onChampionSelect}
          displayEmpty
          sx={{
            borderRadius: '0px',
            border: `3px solid ${borderColor}`,
            fontWeight: 'bold',
            backgroundColor: 'white',
            '& .MuiSelect-select': {
              padding: '10px 15px',
            },
            '& fieldset': { border: 'none' },
            boxShadow: `4px 4px 0px 0px ${borderColor}`,
          }}
          renderValue={(selected) => {
            if (!selected) {
              return <MUI.Typography color="text.secondary" fontWeight="bold">SELECT CHAMPION</MUI.Typography>;
            }
            return selected;
          }}
        >
          {championNames.map((name, index) => (
            <MUI.MenuItem key={index} value={name}>
              {name}
            </MUI.MenuItem>
          ))}
        </MUI.Select>
      </MUI.FormControl>

      {/* Avatar Display */}
      <MUI.Box
        sx={{
          width: '200px',
          height: '200px',
          backgroundColor: '#e0e0e0',
          border: `4px solid ${borderColor}`,
          backgroundImage: champion ? `url(https://ddragon.leagueoflegends.com/cdn/14.19.1/img/champion/${champion.id}.png)` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: `8px 8px 0px 0px ${borderColor}`,
          marginBottom: '10px'
        }}
      />

      {/* Ability Grid */}
      <MUI.Stack direction="row" spacing={2}>
        {abilities.map((ability, index) => {
           const imageUrl = index === 0 ?
              `url(https://ddragon.leagueoflegends.com/cdn/14.13.1/img/passive/${ability.image})` :
              `url(https://ddragon.leagueoflegends.com/cdn/14.13.1/img/spell/${ability.image})`;
          
           const isSelected = ability.name === selectedAbility;

           return (
            <MUI.Tooltip key={index} title={`${AbilityMap[index]}: ${ability.name}`} arrow>
              <MUI.Box
                onClick={() => onAbilitySelect({ target: { value: ability.name } })}
                sx={{
                  width: '50px',
                  height: '50px',
                  border: `3px solid ${borderColor}`,
                  backgroundColor: '#ccc',
                  backgroundImage: champion ? imageUrl : 'none',
                  backgroundSize: 'cover',
                  cursor: 'pointer',
                  opacity: isSelected ? 1 : 0.5,
                  transform: isSelected ? 'scale(1.1) translate(-2px, -2px)' : 'none',
                  boxShadow: isSelected ? `4px 4px 0px 0px ${mainColor}` : `2px 2px 0px 0px ${borderColor}`,
                  transition: 'all 0.1s ease',
                  '&:hover': {
                    opacity: 1,
                    transform: 'translate(-2px, -2px)',
                    boxShadow: `4px 4px 0px 0px ${mainColor}`,
                  }
                }}
              />
            </MUI.Tooltip>
           );
        })}
        {/* Placeholders if no abilities loaded yet */}
        {!champion && Array(5).fill(0).map((_, i) => (
           <MUI.Box
             key={i}
             sx={{
               width: '50px',
               height: '50px',
               border: `3px solid ${borderColor}`,
               backgroundColor: 'rgba(0,0,0,0.05)',
             }}
           />
        ))}
      </MUI.Stack>
    </MUI.Box>
  );
};

const AddInteractions = () => {
  const { championNames } = useChampion();
  const location = useLocation();

  const [firstChampion, setFirstChampion] = React.useState(null);
  const [secondChampion, setSecondChampion] = React.useState(null);
  const [firstChampionAbilities, setFirstChampionAbilities] = React.useState([]);
  const [secondChampionAbilities, setSecondChampionAbilities] = React.useState([]);
  const [selectedFirstChampionAbility, setSelectedFirstChampionAbility] = React.useState('');
  const [selectedSecondChampionAbility, setSelectedSecondChampionAbility] = React.useState('');
  const [videoLink, setVideoLink] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [currentVideoId, setCurrentVideoId] = React.useState(null);
  const { snapshot: sseSnapshot } = useVideoEvents(currentVideoId);

  const hasFile = Boolean(selectedFile);
  const hasLink = Boolean(videoLink && videoLink.trim());
  const isUploadDisabled = !selectedFirstChampionAbility || !selectedSecondChampionAbility || isUploading || (!hasFile && !hasLink);

  React.useEffect(() => {
    if (firstChampion) {
      const abilities = [
        {
          name: firstChampion.passive.name,
          description: firstChampion.passive.description,
          image: firstChampion.passive.image.full,
        },
        ...firstChampion.spells.map((spell) => ({
          name: spell.name,
          description: spell.description,
          image: spell.image.full,
        })),
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
          image: secondChampion.passive.image.full,
        },
        ...secondChampion.spells.map((spell) => ({
          name: spell.name,
          description: spell.description,
          image: spell.image.full,
        })),
      ];
      setSecondChampionAbilities(abilities);
    }
  }, [secondChampion]);

  React.useEffect(() => {
    const prefillData = async () => {
      if (location.state?.preselected) {
        const { champion1, champion2, ability1, ability2 } = location.state.preselected;

        if (champion1) {
          const champ1Data = await fetchChampionDetails(champion1);
          setFirstChampion(champ1Data);
          setSelectedFirstChampionAbility(ability1 || '');
        }

        if (champion2) {
          const champ2Data = await fetchChampionDetails(champion2);
          setSecondChampion(champ2Data);
          setSelectedSecondChampionAbility(ability2 || '');
        }
      }
    };

    prefillData();
  }, [location.state]);

  const fetchChampionDetails = async (championName) => {
    const url = `https://ddragon.leagueoflegends.com/cdn/14.19.1/data/en_US/champion/${championName}.json`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.data[championName];
    } catch (error) {
      console.error('Error fetching champion details:', error);
    }
  };

  const handleFirstChampionSelect = async (event) => {
    const selectedFirstChampion = event.target.value;
    const firstChampionInfo = await fetchChampionDetails(selectedFirstChampion);
    setFirstChampion(firstChampionInfo);
    setSelectedFirstChampionAbility('');
  };

  const handleSecondChampionSelect = async (event) => {
    const selectedSecondChampion = event.target.value;
    const secondChampionInfo = await fetchChampionDetails(selectedSecondChampion);
    setSecondChampion(secondChampionInfo);
    setSelectedSecondChampionAbility('');
  };

  const selectFirstChampionAbility = (event) => {
    setSelectedFirstChampionAbility(event.target.value);
  };

  const selectSecondChampionAbility = (event) => {
    setSelectedSecondChampionAbility(event.target.value);
  };

  const handleVideoLink = (event) => {
    setVideoLink(event.target.value);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const uploadWithTus = (file, endpoint, onProgress) => {
    return new Promise((resolve, reject) => {
      const upload = UpChunk.createUpload({
        endpoint,
        file,
        chunkSize: 5120, // in KB
      });

      upload.on('progress', (evt) => {
        const percent = Math.floor(evt.detail);
        if (typeof onProgress === 'function') onProgress(percent, 100);
      });

      upload.on('success', () => resolve());
      upload.on('error', (err) => reject(err?.detail || err));
    });
  };

  const uploadVideo = async () => {
    try {
      if (!selectedFirstChampionAbility || !selectedSecondChampionAbility) {
        alert('Please select both champion abilities before uploading.');
        return;
      }
      const ability1Index = firstChampionAbilities.findIndex(
        (ability) => ability.name === selectedFirstChampionAbility,
      );
      const ability2Index = secondChampionAbilities.findIndex(
        (ability) => ability.name === selectedSecondChampionAbility,
      );

      if (ability1Index === -1 || ability2Index === -1) {
        alert('Please select valid abilities for both champions.');
        return;
      }

      const ability1Key = AbilityMap[ability1Index];
      const ability2Key = AbilityMap[ability2Index];

      if (selectedFile) {
        setIsUploading(true);
        setUploadProgress(0);

        const initPayload = {
          champion1: firstChampion?.id,
          ability1: ability1Key,
          champion2: secondChampion?.id,
          ability2: ability2Key,
          corsOrigin: window.location.origin,
        };

        const { uploadUrl, videoId } = await initMuxUpload(initPayload);
        setCurrentVideoId(videoId);

        await uploadWithTus(
          selectedFile,
          uploadUrl,
          (bytesSent, bytesTotal) => {
            const percentage = Math.floor((bytesSent / bytesTotal) * 100);
            setUploadProgress(percentage);
          },
        );

        alert('Upload complete! The video will appear after processing and approval.');
      } else {
        if (!hasLink) {
          alert('Please provide a video link or select a file to upload.');
          return;
        }
        const payload = {
          champion1: firstChampion?.id,
          ability1: ability1Key,
          champion2: secondChampion?.id,
          ability2: ability2Key,
          videoURL: videoLink,
        };

        const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5174'}/api/videos/upload`, payload, {
          withCredentials: true,
        });

        console.log('Video uploaded successfully:', response.data);
        alert('Video uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video');
    }
    finally {
      setIsUploading(false);
    }
  };

  return (
    <MUI.Container maxWidth="lg" sx={{ paddingY: '50px' }}>
      {/* Header */}
      <MUI.Box mb={6} textAlign="center">
        <MUI.Typography
          variant="h2"
          component="h1"
          fontWeight="900"
          sx={{
            textTransform: 'uppercase',
            color: 'black',
            textShadow: '4px 4px 0px #ccc'
          }}
        >
          New Interaction
        </MUI.Typography>
      </MUI.Box>

      {/* Battle Arena */}
      <MUI.Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        alignItems="stretch"
        gap={4}
        mb={6}
        position="relative"
      >
        <ChampionBattleZone
          label="Red Side"
          themeColor="red"
          champion={firstChampion}
          championNames={championNames}
          abilities={firstChampionAbilities}
          selectedAbility={selectedFirstChampionAbility}
          onChampionSelect={handleFirstChampionSelect}
          onAbilitySelect={selectFirstChampionAbility}
        />

        {/* VS Badge */}
        <MUI.Box
          sx={{
            position: { md: 'absolute' },
            left: { md: '50%' },
            top: { md: '50%' },
            transform: { md: 'translate(-50%, -50%)' },
            zIndex: 10,
            backgroundColor: 'black',
            color: 'white',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid white',
            boxShadow: '0px 0px 0px 4px black',
            alignSelf: 'center' // For mobile column layout
          }}
        >
          <MUI.Typography variant="h4" fontWeight="900" fontStyle="italic">VS</MUI.Typography>
        </MUI.Box>

        <ChampionBattleZone
          label="Blue Side"
          themeColor="blue"
          champion={secondChampion}
          championNames={championNames}
          abilities={secondChampionAbilities}
          selectedAbility={selectedSecondChampionAbility}
          onChampionSelect={handleSecondChampionSelect}
          onAbilitySelect={selectSecondChampionAbility}
        />
      </MUI.Box>

      {/* Evidence Footer */}
      <MUI.Paper
        elevation={0}
        sx={{
          border: '4px solid black',
          padding: '30px',
          backgroundColor: '#f8f9fa',
          boxShadow: '12px 12px 0px 0px black',
        }}
      >
        <MUI.Typography variant="h5" fontWeight="900" mb={3} textTransform="uppercase">
          Battle Evidence
        </MUI.Typography>

        <MUI.Stack spacing={3}>
          <MUI.Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
            {/* File Upload Button */}
             {hasFile ? (
               <MUI.Box
                 flex={1}
                 display="flex"
                 alignItems="center"
                 justifyContent="space-between"
                 sx={{
                   border: '3px solid black',
                   padding: '10px 20px',
                   backgroundColor: '#e6ffe6',
                   fontWeight: 'bold'
                 }}
               >
                  <MUI.Typography fontWeight="bold" noWrap sx={{ maxWidth: '200px' }}>
                    {selectedFile.name}
                  </MUI.Typography>
                  <MUI.IconButton onClick={() => setSelectedFile(null)} size="small" sx={{ color: 'black' }}>
                    <CloseIcon />
                  </MUI.IconButton>
               </MUI.Box>
             ) : (
                <MUI.Button
                  component="label"
                  variant="outlined"
                  startIcon={<FileUploadIcon />}
                  sx={{
                    flex: 1,
                    height: '56px',
                    border: '3px solid black',
                    borderRadius: '0px',
                    color: 'black',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    '&:hover': {
                      backgroundColor: 'black',
                      color: 'white',
                      border: '3px solid black',
                    }
                  }}
                >
                  Select Video File
                  <input type="file" accept="video/*" hidden onChange={handleFileSelect} />
                </MUI.Button>
             )}

            {/* Link Input */}
            <MUI.TextField
              label="OR PASTE VIDEO LINK"
              variant="outlined"
              fullWidth
              value={videoLink || ''}
              onChange={handleVideoLink}
              disabled={hasFile}
              color="black"
              sx={{
                flex: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '0px',
                  backgroundColor: 'white',
                  '& fieldset': { border: '3px solid black' },
                  '&:hover fieldset': { border: '3px solid black' },
                  '&.Mui-focused fieldset': { border: '3px solid black', boxShadow: '4px 4px 0px 0px black' },
                },
                '& .MuiInputLabel-root': {
                  fontWeight: 'bold',
                  color: 'black',
                  textTransform: 'uppercase',
                }
              }}
            />
          </MUI.Box>

          {/* Progress / Status */}
          {(isUploading || sseSnapshot) && (
             <MUI.Box sx={{ border: '2px solid black', padding: '15px', backgroundColor: 'white' }}>
               {isUploading ? (
                  <MUI.Stack direction="row" alignItems="center" spacing={2}>
                    <MUI.CircularProgress variant="determinate" value={uploadProgress} size={24} sx={{ color: 'black' }} />
                    <MUI.Typography fontWeight="bold">UPLOADING: {uploadProgress}%</MUI.Typography>
                  </MUI.Stack>
               ) : (
                 <MUI.Typography fontWeight="bold">
                    {sseSnapshot?.status === 'processing' && 'Processing on Mux...'}
                    {sseSnapshot?.status === 'ready' && 'Ready!'}
                    {sseSnapshot?.status === 'failed' && 'Processing failed. Please try another video.'}
                 </MUI.Typography>
               )}
             </MUI.Box>
          )}

          {/* Upload Action */}
          <MUI.Button
            variant="contained"
            onClick={uploadVideo}
            disabled={isUploadDisabled}
            fullWidth
            sx={{
              height: '60px',
              backgroundColor: 'black',
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: '900',
              textTransform: 'uppercase',
              borderRadius: '0px',
              border: '3px solid black',
              boxShadow: '6px 6px 0px 0px #888',
              transition: 'all 0.1s',
              '&:hover': {
                backgroundColor: '#333',
                transform: 'translate(-2px, -2px)',
                boxShadow: '8px 8px 0px 0px #888',
              },
              '&:active': {
                transform: 'translate(2px, 2px)',
                boxShadow: '2px 2px 0px 0px #888',
              },
              '&.Mui-disabled': {
                backgroundColor: '#ccc',
                color: '#666',
                border: '3px solid #999',
                boxShadow: 'none',
              }
            }}
          >
            CONFIRM UPLOAD
          </MUI.Button>
        </MUI.Stack>
      </MUI.Paper>
    </MUI.Container>
  );
};

export default AddInteractions;
