import { UserProfile } from './types';

export const defaultProfileData: UserProfile = {
  name: '',
  email: '',
  phone: '',
  dob: undefined,
  gender: '',
  photoURL: '',
  linkedin: '',
  github: '',
  summary: '',
  careerGoals: '',
  education: [],
  experience: [],
  skills: [],
  interests: [],
  preferences: {
    location: '',
    remote: false,
    industries: [],
  },
};
