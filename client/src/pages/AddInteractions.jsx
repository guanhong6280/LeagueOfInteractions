import React, { useState, useMemo, useEffect } from 'react';
import * as MUI from '@mui/material';
import { useLocation } from 'react-router-dom';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CloseIcon from '@mui/icons-material/Close';
import theme from '../theme/theme';

// Hooks
import { useServerStatus } from '../hooks/useServerStatus';
import { useChampionNames } from '../hooks/useChampionNames';
import { useChampionDetails } from '../hooks/useChampionDetails';
import { useVideoUpload } from '../hooks/useVideoUpload';
import { toastMessages, useToast } from '../toast/useToast';

// Components
import ChampionUploadSelectCard, { AbilityMap } from '../common/championUploadSelectCard.jsx';

const AddInteractions = () => {
  const location = useLocation();
  const { info } = useToast(); 
  
  // --- 1. Data Hooks ---
  const { data: championNames = [] } = useChampionNames();
  
  // --- 2. Local State ---
  const [firstChampName, setFirstChampName] = useState('');
  const [secondChampName, setSecondChampName] = useState('');
  const [selectedFirstAbility, setSelectedFirstAbility] = useState('');
  const [selectedSecondAbility, setSelectedSecondAbility] = useState('');

  // Upload Inputs
  const [videoLink, setVideoLink] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // --- 3. Custom Upload Hook ---
  // The hook handles the API call and the Success/Error toasts internally.
  const { 
    mutate: startUpload, 
    isPending: isUploading, 
    uploadProgress, 
    uploadedVideoId,
    resetUpload,
  } = useVideoUpload();

  // --- 4. Status Polling Hook ---
  // Polls the server for the video status once an ID exists.
  // When status becomes 'ready' or 'failed', it waits 5s and then calls resetUpload.
  const { data: statusData } = useServerStatus(uploadedVideoId, resetUpload, 2000, !isUploading);

  // --- 5. Champion Data Queries ---
  const { data: firstChampion, isLoading: loadingFirst } = useChampionDetails(firstChampName);
  const { data: secondChampion, isLoading: loadingSecond } = useChampionDetails(secondChampName);

  // --- 6. Derived Logic (Memoization) ---
  const formatAbilities = (champData) => {
    if (!champData) return [];
    return [
      { name: champData.passive.name, description: champData.passive.description, image: champData.passive.image.full },
      ...champData.spells.map((spell) => ({ name: spell.name, description: spell.description, image: spell.image.full })),
    ];
  };

  const firstChampionAbilities = useMemo(() => formatAbilities(firstChampion), [firstChampion]);
  const secondChampionAbilities = useMemo(() => formatAbilities(secondChampion), [secondChampion]);

  // --- 7. Prefill Logic (from Navigation) ---
  useEffect(() => {
    if (location.state?.preselected) {
      const { champion1, champion2, ability1, ability2 } = location.state.preselected;
      if (champion1) setFirstChampName(champion1);
      if (champion2) setSecondChampName(champion2);
      if (ability1) setSelectedFirstAbility(ability1);
      if (ability2) setSelectedSecondAbility(ability2);
    }
  }, [location.state]);

  // --- 8. Handlers ---
  const handleFileSelect = (e) => setSelectedFile(e.target.files?.[0] || null);

  const handleUploadClick = () => {
    // A. Validation
    // We check for missing inputs and show an "Info" toast if something is wrong.
    if (!selectedFirstAbility || !selectedSecondAbility) {
      info(toastMessages.addInteraction.info);
      return;
    }

    const ability1Index = firstChampionAbilities.findIndex(a => a.name === selectedFirstAbility);
    const ability2Index = secondChampionAbilities.findIndex(a => a.name === selectedSecondAbility);
    
    if (ability1Index === -1 || ability2Index === -1) {
      info('Please select valid abilities for both champions.');
      return;
    }

    const hasFile = Boolean(selectedFile);
    const hasLink = Boolean(videoLink && videoLink.trim());

    if (!hasFile && !hasLink) {
      info('Please provide a video link or select a file to upload.');
      return;
    }

    // B. Prepare Metadata
    const metadata = {
      champion1: firstChampion?.id,
      ability1: AbilityMap[ability1Index],
      champion2: secondChampion?.id,
      ability2: AbilityMap[ability2Index],
    };

    // C. Execute Mutation
    // No callbacks needed here because the hook handles success/error logic.
    startUpload({ file: selectedFile, videoLink, metadata });
  };

  // --- 9. UI Helpers ---
  const hasFile = Boolean(selectedFile);
  const isUploadDisabled = !selectedFirstAbility || !selectedSecondAbility || isUploading || (!hasFile && !videoLink);

  // Determine current status for the UI feedback box
  const isProcessing = statusData?.status === 'processing' || statusData?.status === 'waiting' || statusData?.status === 'pending';
  const isReady = statusData?.status === 'ready';
  const isFailed = statusData?.status === 'failed' || statusData?.status === 'errored';

  return (
    <MUI.Container maxWidth="lg" sx={{ paddingY: '50px' }}>
      <MUI.Box mb={6} textAlign="center">
        <MUI.Typography
          variant="h2"
          component="h1"
          fontWeight="900"
          sx={{ textTransform: 'uppercase', color: 'black', textShadow: '4px 4px 0px #ccc' }}
        >
          New Interaction
        </MUI.Typography>
      </MUI.Box>

      {/* --- Battle Arena (Champion Selection) --- */}
      <MUI.Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        alignItems="stretch"
        gap={4}
        mb={6}
        position="relative"
      >
        <ChampionUploadSelectCard
          label="Red Side"
          themeColor="red"
          champion={firstChampion}
          isLoading={loadingFirst}
          championNames={championNames}
          selectedName={firstChampName}
          abilities={firstChampionAbilities}
          selectedAbility={selectedFirstAbility}
          onChampionSelect={(e) => { setFirstChampName(e.target.value); setSelectedFirstAbility(''); }}
          onAbilitySelect={(e) => setSelectedFirstAbility(e.target.value)}
        />

        {/* VS Badge */}
        <MUI.Box
          sx={{
            position: { md: 'absolute' },
            left: { md: '50%' },
            top: { md: '50%' },
            transform: { md: 'translate(-50%, -50%)' },
            zIndex: 10,
            backgroundColor: "#51ca46",
            color: "white",
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white',
            boxShadow: '0px 0px 0px 3px black',
            alignSelf: 'center'
          }}
        >
          <MUI.Typography variant="h4" fontWeight="900" fontStyle="italic">VS</MUI.Typography>
        </MUI.Box>

        <ChampionUploadSelectCard
          label="Blue Side"
          themeColor="blue"
          champion={secondChampion}
          isLoading={loadingSecond}
          championNames={championNames}
          selectedName={secondChampName}
          abilities={secondChampionAbilities}
          selectedAbility={selectedSecondAbility}
          onChampionSelect={(e) => { setSecondChampName(e.target.value); setSelectedSecondAbility(''); }}
          onAbilitySelect={(e) => setSelectedSecondAbility(e.target.value)}
        />
      </MUI.Box>

      {/* --- Evidence Footer (Upload Section) --- */}
      <MUI.Paper
        elevation={0}
        sx={{
          border: '4px solid black',
          padding: '30px',
          backgroundColor: theme.palette.background.neutralSide,
          boxShadow: '4px 4px 0px 0px black',
        }}
      >
      <MUI.Typography
        variant="h5"
        fontWeight="900"
        textTransform="uppercase"
        sx={{
          width: 'fit-content',
          backgroundColor: "#51ca46",
          color: 'white',
          padding: '5px 20px',
          border: `3px solid black`,
          boxShadow: `2px 2px 0px 0px black`,
          marginBottom: '20px'
        }}
      >
        Video Upload
      </MUI.Typography>

        <MUI.Stack spacing={3}>
          <MUI.Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
            {/* File Button */}
            {hasFile ? (
              <MUI.Box
                flex={1}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ border: '3px solid black', padding: '10px 20px', backgroundColor: '#80ffb3', fontWeight: 'bold' }}
              >
                <MUI.Typography fontWeight="bold" noWrap sx={{ maxWidth: '200px' }}>{selectedFile.name}</MUI.Typography>
                <MUI.IconButton onClick={() => setSelectedFile(null)} size="small" sx={{ color: 'black' }}><CloseIcon /></MUI.IconButton>
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
                  bgcolor:"white",
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  '&:hover': { backgroundColor: 'black', color: 'white', border: '3px solid black' }
                }}
              >
                Select Video File
                <input type="file" accept="video/*" hidden onChange={handleFileSelect} />
              </MUI.Button>
            )}

            {/* Link Input */}
            <MUI.TextField
              label="OR PASTE VIDEO LINK (NOT YET SUPPORTED)"
              variant="outlined"
              fullWidth
              value={videoLink || ''}
              onChange={(e) => setVideoLink(e.target.value)}
              disabled="true"
              sx={{
                flex: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '0px',
                  backgroundColor: 'white',
                  '& fieldset': { border: '3px solid black' },
                  // '&:hover fieldset': { border: '3px solid black' },
                  '&.Mui-focused fieldset': { border: '3px solid black', boxShadow: '4px 4px 0px 0px black' },
                },
                '& .MuiInputLabel-root': { fontWeight: 'bold', color: 'gray', textTransform: 'uppercase' },
                '& .MuiInputLabel-root.Mui-focused': { color: 'black !important' }
              }}
            />
          </MUI.Box>

          {/* --- Status / Progress Box --- */}
          {/* This box appears if we are Uploading, Processing, Ready, or Failed */}
          {(isUploading || isProcessing || isReady || isFailed) && (
            <MUI.Box 
              sx={{ 
                border: '2px solid black', 
                padding: '15px', 
                // Change background color based on status for better feedback
                backgroundColor: isReady ? '#e6ffe6' : isFailed ? '#ffe6e6' : 'white' 
              }}
            >
              {isUploading ? (
                <MUI.Stack direction="row" alignItems="center" spacing={2}>
                  <MUI.CircularProgress variant="determinate" value={uploadProgress} size={24} sx={{ color: 'black' }} />
                  <MUI.Typography fontWeight="bold">UPLOADING: {uploadProgress}%</MUI.Typography>
                </MUI.Stack>
              ) : (
                <MUI.Typography fontWeight="bold">
                  {isProcessing && 'Processing video... (This may take a moment)'}
                  {isReady && 'Interaction is submitted successfully!, Once the video is approved, it will be available to view in the Interactions page.'}
                  {isFailed && 'Processing failed. Please try again.'}
                </MUI.Typography>
              )}
            </MUI.Box>
          )}

          {/* Confirm Button */}
          <MUI.Button
            variant="contained"
            onClick={handleUploadClick}
            disabled={isUploadDisabled}
            fullWidth
            sx={{
              height: '60px',
              backgroundColor: "#80ffb3",
              color: 'black',
              fontSize: '1.2rem',
              fontWeight: '900',
              textTransform: 'uppercase',
              borderRadius: '0px',
              border: '2px solid black',
              boxShadow: '2px 2px 0px 0px black',
              transition: 'all 0.1s',
              '&:hover': { backgroundColor: theme.palette.button.neutralSide_hover, transform: 'translate(-2px, -2px)', boxShadow: '4px 4px 0px 0px black' },
              '&:active': { transform: 'translate(2px, 2px)', boxShadow: '2px 2px 0px 0px black' },
              '&.Mui-disabled': { backgroundColor: '#ccc', color: '#666', border: '2px solid black', boxShadow: 'none' }
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