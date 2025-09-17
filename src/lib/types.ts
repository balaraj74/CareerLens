import { z } from 'zod';

export const experienceSchema = z.object({
  role: z.string().min(1, 'Role is required.'),
  years: z.string().min(1, 'Years of experience is required.'),
  skills: z.array(z.string()),
});

export const educationSchema = z.object({
  degree: z.string().min(1, 'Degree is required.'),
  field: z.string().min(1, 'Field of study is required.'),
  year: z.string().min(4, 'Year must be a valid year.'),
});

export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name cannot be empty.'),
  level: z.string().min(1, 'Skill level cannot be empty'),
});

export const userProfileSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  education: z.array(educationSchema),
  experience: z.array(experienceSchema),
  skills: z.array(skillSchema),
  interests: z.array(z.string()),
  preferences: z.object({
    location: z.string(),
    remote: z.boolean(),
  }),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
