import { UserProfile } from './types';

export const defaultProfileData: UserProfile = {
  name: '',
  email: '',
  education: [],
  experience: [],
  skills: [],
  interests: [],
  preferences: {
    location: '',
    remote: false,
  },
};
