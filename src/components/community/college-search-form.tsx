'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { StudentPreferences, ExamType, BranchType } from '@/lib/types/community';
import { Search, MapPin, Building2, DollarSign, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface Props {
  onSearch: (preferences: StudentPreferences) => void;
  loading?: boolean;
}

const examTypes: ExamType[] = ['JEE', 'KCET', 'COMEDK', 'NEET', 'CET', 'GATE', 'CAT'];
const branchTypes: BranchType[] = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical',
  'Mechanical',
  'Civil',
  'Biotechnology',
  'Chemical',
  'Aerospace',
  'Medicine',
  'Pharmacy',
  'Management',
  'Other'
];

const collegeTypes = ['Government', 'Private', 'Autonomous', 'Deemed'];
const locations = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Any'];

export default function CollegeSearchForm({ onSearch, loading }: Props) {
  const [preferences, setPreferences] = useState<Partial<StudentPreferences>>({
    exam_type: 'JEE',
    score: 0,
    branch_preferences: [],
    location_preferences: [],
    college_type_preferences: [],
    max_fees: 1000000
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!preferences.exam_type || !preferences.score || preferences.score <= 0) {
      return;
    }

    onSearch(preferences as StudentPreferences);
  };

  const toggleBranch = (branch: BranchType) => {
    const current = preferences.branch_preferences || [];
    const updated = current.includes(branch)
      ? current.filter(b => b !== branch)
      : [...current, branch];
    setPreferences({ ...preferences, branch_preferences: updated });
  };

  const toggleLocation = (location: string) => {
    const current = preferences.location_preferences || [];
    const updated = current.includes(location)
      ? current.filter((l: string) => l !== location)
      : [...current, location];
    setPreferences({ ...preferences, location_preferences: updated });
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exam Type and Score */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Exam Type *
              </Label>
              <Select
                value={preferences.exam_type}
                onValueChange={(value: ExamType) => 
                  setPreferences({ ...preferences, exam_type: value })
                }
              >
                <SelectTrigger className="bg-gray-50 dark:bg-gray-900">
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {examTypes.map(exam => (
                    <SelectItem key={exam} value={exam}>{exam}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Your Score/Rank *</Label>
              <Input
                type="number"
                min="0"
                placeholder="Enter your score or rank"
                value={preferences.score || ''}
                onChange={(e) => setPreferences({ 
                  ...preferences, 
                  score: parseInt(e.target.value) || 0 
                })}
                className="bg-gray-50 dark:bg-gray-900"
                required
              />
            </div>
          </div>

          {/* Branch Preferences */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              Preferred Branches *
            </Label>
            <div className="flex flex-wrap gap-2">
              {branchTypes.map(branch => (
                <Badge
                  key={branch}
                  variant={preferences.branch_preferences?.includes(branch) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    preferences.branch_preferences?.includes(branch)
                      ? 'bg-purple-500 hover:bg-purple-600'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => toggleBranch(branch)}
                >
                  {branch}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-500">Select at least one branch</p>
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-500" />
              Preferred Locations
            </Label>
            <div className="flex flex-wrap gap-2">
              {locations.map(location => (
                <Badge
                  key={location}
                  variant={preferences.location_preferences?.includes(location) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    preferences.location_preferences?.includes(location)
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => toggleLocation(location)}
                >
                  {location}
                </Badge>
              ))}
            </div>
          </div>

          {/* College Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">College Type (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {collegeTypes.map(type => (
                <Badge
                  key={type}
                  variant={preferences.college_type_preferences?.includes(type as any) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    preferences.college_type_preferences?.includes(type as any)
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    const current = preferences.college_type_preferences || [];
                    const updated = current.includes(type as any)
                      ? current.filter((t: any) => t !== type)
                      : [...current, type as any];
                    setPreferences({ ...preferences, college_type_preferences: updated });
                  }}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-500" />
              Maximum Annual Fees (₹)
            </Label>
            <Input
              type="number"
              min="0"
              placeholder="e.g., 500000"
              value={preferences.max_fees || ''}
              onChange={(e) => setPreferences({ 
                ...preferences, 
                max_fees: parseInt(e.target.value) || undefined
              })}
              className="bg-gray-50 dark:bg-gray-900"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !preferences.exam_type || !preferences.score || (preferences.branch_preferences?.length || 0) === 0}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-6 text-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Finding Colleges...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Find My Best Colleges
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
