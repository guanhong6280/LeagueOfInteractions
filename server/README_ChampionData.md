# Champion Data API - Dynamic Versioning System

## Overview

This API provides access to League of Legends game data (champions, items, summoner spells) with automatic version management. The system automatically fetches the latest version from Riot's API and caches data for optimal performance.

## Features

- ✅ **Dynamic Versioning**: Automatically uses the latest game version
- ✅ **Smart Caching**: 1-hour cache for both version and data
- ✅ **Fallback System**: Graceful degradation when Riot API is unavailable
- ✅ **Multiple Languages**: Support for all Riot-supported languages
- ✅ **Error Handling**: Comprehensive error responses
- ✅ **Health Monitoring**: Built-in health check endpoint

## Base URL

All endpoints are available at: `http://localhost:5174/api/championData`

## Endpoints

### 1. Get All Champion Data

```http
GET /api/championData/champion_names
```

**Query Parameters:**
- `language` (optional): Language code (default: `en_US`)

**Example:**
```bash
curl http://localhost:5174/api/championData/champion_names?language=en_US
```

**Response:**
```json
{
  "type": "champion",
  "format": "standAloneComplex",
  "version": "25.13.1",
  "data": {
    "Aatrox": {
      "version": "25.13.1",
      "id": "Aatrox",
      "key": "266",
      "name": "Aatrox",
      "title": "the Darkin Blade",
      "blurb": "Once honored defenders of Shurima...",
      "info": { "attack": 8, "defense": 4, "magic": 3, "difficulty": 4 },
      "image": { "full": "Aatrox.png", "sprite": "champion0.png", "group": "champion", "x": 0, "y": 0, "w": 48, "h": 48 },
      "tags": ["Fighter", "Tank"],
      "partype": "Blood Well",
      "stats": { ... }
    }
  }
}
```

### 2. Get Simplified Champion List

```http
GET /api/championData/champion_names/list
```

**Query Parameters:**
- `language` (optional): Language code (default: `en_US`)

**Example:**
```bash
curl http://localhost:5174/api/championData/champion_names/list
```

**Response:**
```json
{
  "type": "champion",
  "version": "25.13.1",
  "champions": [
    {
      "id": "Aatrox",
      "key": "266",
      "name": "Aatrox",
      "title": "the Darkin Blade",
      "image": { "full": "Aatrox.png", "sprite": "champion0.png", "group": "champion", "x": 0, "y": 0, "w": 48, "h": 48 },
      "tags": ["Fighter", "Tank"]
    }
  ]
}
```

### 3. Get Specific Champion

```http
GET /api/championData/champion/:championId
```

**Path Parameters:**
- `championId`: Champion ID (e.g., "Aatrox", "Ahri")

**Query Parameters:**
- `language` (optional): Language code (default: `en_US`)

**Example:**
```bash
curl http://localhost:5174/api/championData/champion/Aatrox
```

### 4. Get All Items

```http
GET /api/championData/items
```

**Query Parameters:**
- `language` (optional): Language code (default: `en_US`)

**Example:**
```bash
curl http://localhost:5174/api/championData/items
```

### 5. Get Summoner Spells

```http
GET /api/championData/summoner-spells
```

**Query Parameters:**
- `language` (optional): Language code (default: `en_US`)

**Example:**
```bash
curl http://localhost:5174/api/championData/summoner-spells
```

### 6. Get Version Information

```http
GET /api/championData/version
```

**Example:**
```bash
curl http://localhost:5174/api/championData/version
```

**Response:**
```json
{
  "currentVersion": "25.13.1",
  "lastCheck": 1640995200000,
  "fallbackVersion": "14.18.1",
  "cacheSize": 3
}
```

### 7. Health Check

```http
GET /api/championData/health
```

**Example:**
```bash
curl http://localhost:5174/api/championData/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "Champion Data API",
  "version": "25.13.1",
  "cache": {
    "size": 3,
    "lastVersionCheck": "2025-01-01T12:00:00.000Z"
  },
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

### 8. Clear Cache (Development)

```http
POST /api/championData/cache/clear
```

**Example:**
```bash
curl -X POST http://localhost:5174/api/championData/cache/clear
```

**Response:**
```json
{
  "message": "Cache cleared successfully",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

## Supported Languages

- `en_US` (English - United States)
- `en_GB` (English - United Kingdom)
- `es_ES` (Spanish - Spain)
- `es_MX` (Spanish - Mexico)
- `fr_FR` (French - France)
- `de_DE` (German - Germany)
- `it_IT` (Italian - Italy)
- `pt_BR` (Portuguese - Brazil)
- `ru_RU` (Russian - Russia)
- `ja_JP` (Japanese - Japan)
- `ko_KR` (Korean - South Korea)
- `zh_CN` (Chinese - China)
- `zh_TW` (Chinese - Taiwan)
- `tr_TR` (Turkish - Turkey)
- `pl_PL` (Polish - Poland)
- `cs_CZ` (Czech - Czech Republic)
- `hu_HU` (Hungarian - Hungary)
- `ro_RO` (Romanian - Romania)
- `th_TH` (Thai - Thailand)
- `vi_VN` (Vietnamese - Vietnam)
- `el_GR` (Greek - Greece)

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Failed to fetch champion data",
  "message": "Network timeout after 10000ms"
}
```

## Frontend Integration

### React Hook Example

```javascript
// hooks/useChampionData.js
import { useState, useEffect } from 'react';

export const useChampionData = () => {
  const [champions, setChampions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const response = await fetch('/api/championData/champion_names/list');
        if (!response.ok) throw new Error('Failed to fetch champions');
        const data = await response.json();
        setChampions(data.champions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChampions();
  }, []);

  return { champions, loading, error };
};
```

### Usage in Component

```javascript
import { useChampionData } from './hooks/useChampionData';

const ChampionSelector = () => {
  const { champions, loading, error } = useChampionData();

  if (loading) return <div>Loading champions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {champions?.map(champion => (
        <div key={champion.id}>
          <h3>{champion.name}</h3>
          <p>{champion.title}</p>
        </div>
      ))}
    </div>
  );
};
```

## System Architecture

### Version Manager (`utils/versionManager.js`)

- **Singleton Pattern**: One instance manages all version/cache operations
- **Automatic Updates**: Checks for new versions every hour
- **Graceful Fallback**: Uses cached version if API is unavailable
- **Memory Cache**: Uses Map for fast in-memory caching
- **Timeout Protection**: 5s timeout for version, 10s for data

### Cache Strategy

- **Version Cache**: 1 hour TTL
- **Data Cache**: 1 hour TTL per language/data type
- **Memory Storage**: Fast Map-based storage
- **Automatic Cleanup**: Old entries are overwritten

### Error Handling

- **Network Timeouts**: Configurable timeouts for all requests
- **Fallback Versions**: Graceful degradation to known working versions
- **Comprehensive Logging**: All errors and state changes are logged
- **User-Friendly Messages**: Clear error responses for frontend

## Performance Considerations

- **Caching**: Dramatically reduces API calls to Riot
- **Singleton**: Prevents multiple version managers
- **Timeout Protection**: Prevents hanging requests
- **Memory Efficient**: Uses Map instead of heavyweight storage
- **Batch Operations**: Single version check serves multiple requests

## Development Tips

1. **Clear Cache**: Use `POST /api/championData/cache/clear` during development
2. **Monitor Health**: Check `/api/championData/health` for system status
3. **Version Info**: Use `/api/championData/version` to see current version
4. **Language Testing**: Test with different language parameters
5. **Error Simulation**: Temporarily modify fallback version to test error handling

## Migration from Old System

### Before (Hardcoded Version)
```javascript
// ❌ Old way
const response = await axios.get('https://ddragon.leagueoflegends.com/cdn/14.18.1/data/en_US/champion.json');
```

### After (Dynamic Versioning)
```javascript
// ✅ New way - automatically uses latest version
const response = await fetch('/api/championData/champion_names');
```

The new system is backward compatible - your existing frontend code will continue to work with the same `/api/championData/champion_names` endpoint, but now it automatically uses the latest version! 