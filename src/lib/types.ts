import { z } from 'zod';

export const experienceSchema = z.object({
  role: z.string().min(1, 'Role is required.'),
  company: z.string().min(1, 'Company is required.'),
  years: z.string().min(1, 'Years of experience is required.'),
  skills: z.array(z.string()),
});

export const educationSchema = z.object({
  degree: z.string().min(1, 'Degree is required.'),
  field: z.string().min(1, 'Field of study is required.'),
  year: z.string().min(4, 'Year must be a valid year.'),
  institution: z.string().optional(),
  description: z.string().optional(),
});

export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name cannot be empty.'),
  proficiency: z.string().min(1, 'Skill proficiency cannot be empty'),
});

export const userProfileSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  summary: z.string().optional(),
  education: z.array(educationSchema),
  experience: z.array(experienceSchema),
  skills: z.array(skillSchema),
  interests: z.array(z.string()),
  preferences: z.object({
    location: z.string(),
    remote: z.boolean(),
    industries: z.array(z.string()),
  }),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
