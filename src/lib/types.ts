import { z } from 'zod';

// Regex for validating a 10-digit phone number, allowing for optional formatting characters
const phoneRegex = new RegExp(
  /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
);
const linkedinRegex = new RegExp(/^https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/);
const githubRegex = new RegExp(/^https:\/\/github\.com\/[a-zA-Z0-9_-]+$/);


export const experienceSchema = z.object({
  role: z.string().min(1, 'Role is required.'),
  company: z.string().min(1, 'Company is required.'),
  years: z.string().min(1, 'Years of experience is required.'),
  skills: z.array(z.string()),
  description: z.string().optional(),
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
  name: z.string().min(2, 'Full name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().regex(phoneRegex, 'Must be a valid 10-digit phone number.').optional().or(z.literal('')),
  bio: z.string().max(200, 'Bio must be 200 characters or less.').optional(),
  linkedin: z.string().regex(linkedinRegex, 'Invalid LinkedIn profile URL.').optional().or(z.literal('')),
  github: z.string().regex(githubRegex, 'Invalid GitHub profile URL.').optional().or(z.literal('')),
  skills: z.array(z.object({ name: z.string() })).optional().default([]),
  updatedAt: z.string().optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
