import React, { useState, useMemo } from 'react';
import * as MUI from '@mui/material';
import { Refresh as RefreshIcon, Search as SearchIcon, FilterList as FilterListIcon, ArrowUpward as ArrowUpwardIcon } from '@mui/icons-material';
import { useChampionStats } from '../hooks/useChampionStats';
import ChampionPreviewCard from '../common/rating_system/components/cards/ChampionPreviewCard';
import CircularProgress from '@mui/material/CircularProgress';
import { useVersion } from '../contextProvider/VersionProvider';

// --- Reusable Neo-Brutalist Components ---

const NeoCard = ({ children, sx = {}, ...props }) => (
    <MUI.Box
        sx={{
            border: '3px solid #000',
            boxShadow: '8px 8px 0px #000',
            bgcolor: 'white',
            p: 3,
            ...sx
        }}
        {...props}
    >
        {children}
    </MUI.Box>
);

const NeoButton = ({ children, onClick, color = '#FF9A8B', disabled, sx = {}, ...props }) => (
    <MUI.Button
        onClick={onClick}
        disabled={disabled}
        {...props}
        sx={{
            color: 'black',
            bgcolor: color,
            border: '2px solid #000',
            borderRadius: 0,
            fontWeight: 900,
            textTransform: 'uppercase',
            boxShadow: '4px 4px 0px #000',
            transition: 'all 0.1s ease',
            '&:hover': {
                bgcolor: color,
                filter: 'brightness(1.1)',
                transform: 'translate(-2px, -2px)',
                boxShadow: '6px 6px 0px #000',
            },
            '&:active': {
                transform: 'translate(2px, 2px)',
                boxShadow: '0px 0px 0px #000',
            },
            '&:disabled': {
                bgcolor: '#e0e0e0',
                color: '#9e9e9e',
                boxShadow: 'none',
                border: '2px solid #9e9e9e',
                pointerEvents: 'none',
            },
            ...sx
        }}
    >
        {children}
    </MUI.Button>
);

const FilterChip = React.memo(({ label, active, onClick, color = 'white' }) => (
    <MUI.Box
        onClick={onClick}
        sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            py: 1,
            border: '2px solid black',
            bgcolor: active ? color : 'white',
            color: 'black',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            boxShadow: active ? '2px 2px 0px black' : 'none',
            transition: 'all 0.1s',
            '&:hover': {
                transform: 'translate(-1px, -1px)',
                boxShadow: '3px 3px 0px black',
                bgcolor: active ? color : '#f0f0f0',
            },
        }}
    >
        {label}
    </MUI.Box>
));

// --- Sub-Components for Performance ---

const VersionTag = React.memo(({ count }) => (
    <MUI.Typography
        variant="body1"
        sx={{
            fontFamily: 'monospace',
            fontWeight: 'bold',
            mb: 3,
            bgcolor: 'white',
            display: 'inline-block',
            px: 2,
            py: 0.5,
            border: '2px solid black'
        }}
    >
        VERSION: v{count}
    </MUI.Typography>
));

const ChampionGrid = React.memo(({ championNames, stats, loading, onReset }) => {
    if (loading) {
        return (
            <MUI.Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <MUI.CircularProgress size={60} sx={{ color: 'black' }} />
            </MUI.Box>
        );
    }

    if (!championNames || championNames.length === 0) {
        return (
            <MUI.Box display="flex" justifyContent="center" minHeight="400px">
                <NeoCard sx={{ bgcolor: '#FF9A8B' }}>
                    <MUI.Typography variant="h5" fontWeight="bold">
                        NO CHAMPIONS FOUND.
                    </MUI.Typography>
                    <MUI.Typography fontFamily="monospace">
                        SYSTEM RETURNED 0 RESULTS FOR QUERY.
                    </MUI.Typography>
                    <MUI.Button onClick={onReset}>
                        RESET FILTERS
                    </MUI.Button>
                </NeoCard>
            </MUI.Box>
        );
    }

    return (
        <MUI.Box
            maxWidth="1200px"
            mx="auto"
            px={2}
        >
            <MUI.Box
                display="grid"
                gridTemplateColumns={{
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)',
                    xl: 'repeat(5, 1fr)'
                }}
                gap={3}
                width="100%"
            >
                {championNames.map((championName) => (
                    <MUI.Box
                        key={stats[championName].id}
                        display="flex"
                        justifyContent="center"
                        width="100%"
                    >
                        <ChampionPreviewCard
                            championName={championName}
                            stats={stats[championName]}
                        />
                    </MUI.Box>
                ))}
            </MUI.Box>
        </MUI.Box>
    );
});

// --- Main Component ---

const RatingLanding = () => {
    const { stats, isLoading: statsLoading, refreshAllStats } = useChampionStats();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedDamage, setSelectedDamage] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Constants
    const ROLES = ['fighter', 'tank', 'mage', 'assassin', 'support', 'marksman'];
    const DAMAGE_TYPES = ['kPhysical', 'kMagic', 'kMixed'];

    const formatDamageType = (type) => {
        if (type === 'kPhysical') return 'PHYSICAL';
        if (type === 'kMagic') return 'MAGIC';
        if (type === 'kMixed') return 'MIXED';
        return type;
    };

    const { version } = useVersion();

    // Filter Logic
    const filteredChampionNames = useMemo(() => {
        if (!stats) return [];
        let names = Object.keys(stats);

        if (searchQuery) {
            names = names.filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        if (selectedRole) {
            names = names.filter(name => stats[name]?.roles?.includes(selectedRole));
        }

        if (selectedDamage) {
            names = names.filter(name => {
                const champ = stats[name];
                return champ?.damageType === selectedDamage || champ?.tacticalInfo?.damageType === selectedDamage;
            });
        }

        return names;
    }, [stats, searchQuery, selectedRole, selectedDamage]);

    const handleReset = () => {
        setSearchQuery('');
        setSelectedRole(null);
        setSelectedDamage(null);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <MUI.Box
            component="main"
            minHeight="100vh"
            py={6}
            px={{ xs: 2, sm: 3, md: 4 }}
            bgcolor="#f0f0f0"
        >
            {/* Header Section */}
            <MUI.Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                mb={8}
            >
                <NeoCard sx={{
                    maxWidth: '900px',
                    width: '100%',
                    textAlign: 'center',
                    bgcolor: '#FFEB3B',
                    position: 'relative',
                    overflow: 'visible'
                }}>
                    {/* Decorative Bolts */}
                    {[0, 1, 2, 3].map((i) => (
                        <MUI.Box
                            key={i}
                            sx={{
                                position: 'absolute',
                                width: 12,
                                height: 12,
                                bgcolor: 'black',
                                top: i < 2 ? 8 : 'auto',
                                bottom: i >= 2 ? 8 : 'auto',
                                left: i % 2 === 0 ? 8 : 'auto',
                                right: i % 2 !== 0 ? 8 : 'auto',
                            }}
                        />
                    ))}

                    <MUI.Typography
                        variant="h2"
                        component="h1"
                        sx={{
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            fontSize: { xs: '2rem', md: '3.5rem' },
                            letterSpacing: '-0.02em',
                            mb: 1,
                            textShadow: '3px 3px 0px white'
                        }}
                    >
                        Champion Rating
                    </MUI.Typography>

                    <VersionTag count={version} />

                    {/* Main Controls */}
                    <MUI.Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        spacing={2} 
                        justifyContent="center"
                        alignItems="center"
                        mb={2}
                    >
                        <MUI.Box sx={{ position: 'relative', width: { xs: '100%', sm: '400px' } }}>
                            <MUI.TextField 
                                fullWidth
                                placeholder="SEARCH CHAMPION..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    sx: {
                                        borderRadius: 0,
                                        bgcolor: 'white',
                                        border: '2px solid black',
                                        fontWeight: 'bold',
                                        fontFamily: 'monospace',
                                        '& fieldset': { border: 'none' },
                                        height: '45px',
                                        paddingRight: '40px'
                                    }
                                }}
                            />
                            <SearchIcon sx={{ position: 'absolute', right: 10, top: 10, color: 'black' }} />
                        </MUI.Box>

                        <NeoButton
                            onClick={() => setShowFilters(!showFilters)}
                            color="#B2FF59"
                            sx={{ height: '45px', minWidth: '120px' }}
                        >
                            <FilterListIcon sx={{ mr: 1 }}/> FILTERS
                        </NeoButton>

                        <NeoButton
                            onClick={() => refreshAllStats(Object.keys(stats || {}))}
                            disabled={statsLoading}
                            color="#00E5FF"
                            sx={{ height: '45px', minWidth: '120px' }}
                        >
                            {!statsLoading && 'REFRESH'}
                            {statsLoading ? <CircularProgress size={20} sx={{ color: 'black' }} /> : <RefreshIcon sx={{ ml: 1 }} /> }
                        </NeoButton>
                    </MUI.Stack>

                    {/* Filter Panel */}
                    {showFilters && (
                        <MUI.Box
                            mt={3}
                            p={2}
                            border="2px solid black"
                            bgcolor="white"
                            textAlign="left"
                        >
                            <MUI.Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                SELECT CLASS:
                            </MUI.Typography>
                            <MUI.Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                                {ROLES.map(role => (
                                    <FilterChip 
                                        key={role} 
                                        label={role} 
                                        active={selectedRole === role} 
                                        onClick={() => setSelectedRole(prev => prev === role ? null : role)}
                                        color="#FF9A8B"
                                    />
                                ))}
                            </MUI.Box>

                            <MUI.Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                DAMAGE TYPE:
                            </MUI.Typography>
                            <MUI.Box display="flex" flexWrap="wrap" gap={1}>
                                {DAMAGE_TYPES.map(dtype => (
                                    <FilterChip 
                                        key={dtype} 
                                        label={formatDamageType(dtype)} 
                                        active={selectedDamage === dtype} 
                                        onClick={() => setSelectedDamage(prev => prev === dtype ? null : dtype)}
                                        color="#80D8FF"
                                    />
                                ))}
                            </MUI.Box>
                        </MUI.Box>
                    )}
                </NeoCard>
            </MUI.Box>

            <ChampionGrid 
                championNames={filteredChampionNames} 
                stats={stats} 
                loading={statsLoading} 
                onReset={handleReset}
            />

            <MUI.Box display="flex" justifyContent="center" mt={8} mb={4}>
                <MUI.Typography
                    variant="caption"
                    fontWeight="bold"
                    fontFamily="monospace"
                    sx={{ bgcolor: 'black', color: 'white', px: 2, py: 1 }}
                >
                    TOTAL_ENTRIES: {filteredChampionNames.length} // END_OF_FILE
                </MUI.Typography>
            </MUI.Box>

            <MUI.Box
                position="sticky"
                bottom="24px"
                display="flex"
                justifyContent="flex-end"
                pr={{ xs: 2, sm: 3, md: 4 }}
                zIndex={1300}
            >
                <NeoButton
                    onClick={scrollToTop}
                    color="#ffffff"
                    sx={{
                        border: '3px solid #000',
                        boxShadow: '6px 6px 0px #000',
                    }}
                >
                    <ArrowUpwardIcon sx={{ mr: 1 }} />
                    TOP
                </NeoButton>
            </MUI.Box>
        </MUI.Box>
    );
};

export default RatingLanding;
