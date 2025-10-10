import { z } from 'zod';

const phoneRegex = new RegExp(
  /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
);

export const experienceSchema = z.object({
  role: z.string().min(1, 'Role is required.'),
  company: z.string().min(1, 'Company is required.'),
  years: z.string().min(1, 'Duration is required.'),
  description: z.string().optional(),
});

export const educationSchema = z.object({
  degree: z.string().min(1, 'Degree is required.'),
  field: z.string().min(1, 'Field of study is required.'),
  year: z.string().min(4, 'Year must be a valid year.'),
  institution: z.string().optional(),
});

export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name cannot be empty.'),
});

export const userProfileSchema = z.object({
  name: z.string().min(2, 'Full name is required.').optional().or(z.literal('')),
  phone: z.string().regex(phoneRegex, 'Must be a valid 10-digit phone number.').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be 500 characters or less.').optional().or(z.literal('')),
  linkedin: z.string().url('Invalid LinkedIn profile URL.').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub profile URL.').optional().or(z.literal('')),
  
  education: z.array(educationSchema).optional().default([]),
  experience: z.array(experienceSchema).optional().default([]),
  skills: z.array(skillSchema).optional().default([]),
  
  careerGoals: z.string().optional().or(z.literal('')),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
