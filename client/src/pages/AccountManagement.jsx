import React from 'react';
import * as MUI from '@mui/material';
import axios from 'axios';

import AccountSettingBox from '../common/setting/AccountSettingBox';
import SettingTextField from '../common/setting/SettingTextField';
import SelectField from '../common/setting/SelectField';
import { useAuth } from '../AuthProvider';
import { sexOptions, rankOptions, yearJoinedOptions } from '../common/setting/settingConstants';

const AccountManagement = () => {
  const [username, setUsername] = React.useState('');
  const { user } = useAuth();
  const [rank, setRank] = React.useState('');
  const [age, setAge] = React.useState('');
  const [sex, setSex] = React.useState('');
  const [yearJoined, setYearJoined] = React.useState('');

  const [initialData, setInitialData] = React.useState(null);


  React.useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setAge(user.age || '');
      setRank(user.rank || '');
      setSex(user.sex || '');
      setYearJoined(user.timeJoinedTheGame || '');
      setInitialData({
        username: user.username || '',
        age: user.age || '',
        rank: user.rank || '',
        sex: user.sex || '',
        yearJoined: user.timeJoinedTheGame || '',
      });
    }
  }, [user]);

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };
  const handleSexChange = (event) => {
    setSex(event.target.value);
  };

  const handleRankChange = (event) => {
    setRank(event.target.value);
  };

  const handleAgeChange = (event) => {
    setAge(event.target.value);
  };

  const handleYearJoinedChange = (event) => {
    setYearJoined(event.target.value);
  };

  const isFormChanged = () => {
    if (!initialData) return false; // prevent button flickering during loading
    return (
      username !== initialData.username ||
      age !== initialData.age ||
      rank !== initialData.rank ||
      sex !== initialData.sex ||
      yearJoined !== initialData.yearJoined
    );
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        username,
        age,
        rank,
        sex,
        timeJoinedTheGame: yearJoined, // assuming yearJoined is your input
      };

      const { data } = await axios.put('http://localhost:5174/api/users/updateUserInformation', updatedData, {
        withCredentials: true,
      });

      console.log('Update success:', data);
      alert('Profile updated successfully!');
      // Optional: refresh user data here if needed
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  return (
    <MUI.Box
      height="100%"
      width="100%"
      position="relative"
      bgcolor="black"
      paddingY="100px"
    >
      <MUI.Stack
        height="500px"
        width="500px"
        position="fixed"
        top="100px"
        left="60px"
        bgcolor="transparent"
        sx={{
          color: 'white',
        }}
      >
        <MUI.Typography fontSize="28px">
          <span>Account</span>
          <br />
          <span>Management</span>
        </MUI.Typography>
      </MUI.Stack>
      <MUI.Stack marginLeft="30vw" spacing="20px">
        <AccountSettingBox
          title="Personal Information"
          description="This information will be private and will not be shared"
        >
          <SettingTextField
            label="username"
            value={username}
            onChange={handleUsernameChange}
            required={true}
            id="username-input"
            type="text"
          />
          <MUI.Box display="flex" gap="20px">
            <SettingTextField
              label="Age"
              value={age}
              onChange={handleAgeChange}
              required={true}
              id="age-input"
              type="number"
            />
            <SelectField
              label="Rank"
              value={rank}
              onChange={handleRankChange}
              options={rankOptions}
            />
          </MUI.Box>
          <MUI.Box display="flex" gap="20px">
            <SelectField
              label="Sex"
              value={sex}
              onChange={handleSexChange}
              options={sexOptions}
            />
            <SelectField
              label="Year Joined"
              value={yearJoined}
              onChange={handleYearJoinedChange}
              options={yearJoinedOptions}
            />
          </MUI.Box>
          <MUI.Button
            variant="contained"
            color="error"
            onClick={handleSave}
            disabled={!isFormChanged()}
            sx={{
              cursor: 'pointer',
            }}
          >
            Save Changes
          </MUI.Button>
        </AccountSettingBox>
        <AccountSettingBox
          title="Riot Accounts"
          description="Connect your Riot accounts"
        />
        <AccountSettingBox
          title="Login Management"
          description="You can Log Out from here"
        />
        {[...Array(3)].map((_, index) => (
          <AccountSettingBox key={index} />
        ))}
      </MUI.Stack>
    </MUI.Box>
  );
};

export default AccountManagement;
