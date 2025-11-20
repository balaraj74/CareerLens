'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  BookOpen,
  Award,
  Briefcase,
  TrendingUp,
  DollarSign,
  Clock,
  Star,
  ExternalLink,
  Plus,
} from 'lucide-react';

interface NodeMetadata {
  durationYears?: number;
  salaryRange?: { min: number; max: number };
  difficulty?: string;
  demand?: string;
}

interface Certification {
  title: string;
  platform: string;
  url?: string;
}

interface NodeActions {
  exams?: string[];
  courses?: string[];
  certifications?: Certification[];
}

interface CareerNode {
  id: string;
  label: string;
  type: string;
  score?: number;
  summary?: string;
  metadata?: NodeMetadata;
  actions?: NodeActions;
  sources?: string[];
}

interface NodeDetailPanelProps {
  node: CareerNode | null;
  onClose: () => void;
  onAddToRoadmap?: (nodeId: string) => void;
}

const formatSalary = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${(amount / 1000).toFixed(0)}K`;
};

export default function NodeDetailPanel({
  node,
  onClose,
  onAddToRoadmap,
}: NodeDetailPanelProps) {
  if (!node) return null;

  const difficultyColor = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-red-400',
  }[node.metadata?.difficulty || 'medium'];

  const demandColor = {
    low: 'text-gray-400',
    medium: 'text-blue-400',
    high: 'text-green-400',
  }[node.metadata?.demand || 'medium'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed right-0 top-0 h-full w-[400px] bg-gradient-to-br from-gray-900 via-purple-900/30 to-blue-900/30 backdrop-blur-xl border-l border-gray-700 shadow-2xl overflow-y-auto z-50"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{node.label}</h2>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {node.type}
              </span>
              {node.score && (
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-semibold">{node.score}/100</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary */}
          {node.summary && (
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Overview
              </h3>
              <p className="text-white text-sm leading-relaxed">{node.summary}</p>
            </div>
          )}

          {/* Metadata */}
          {node.metadata && (
            <div className="grid grid-cols-2 gap-4">
              {node.metadata.durationYears && (
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <Clock className="w-5 h-5 text-blue-400 mb-2" />
                  <div className="text-xl font-bold text-white">
                    {node.metadata.durationYears}
                    <span className="text-sm text-gray-400 ml-1">years</span>
                  </div>
                  <div className="text-xs text-gray-400">Duration</div>
                </div>
              )}

              {node.metadata.salaryRange && (
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <DollarSign className="w-5 h-5 text-green-400 mb-2" />
                  <div className="text-sm font-bold text-white">
                    {formatSalary(node.metadata.salaryRange.min)} -{' '}
                    {formatSalary(node.metadata.salaryRange.max)}
                  </div>
                  <div className="text-xs text-gray-400">Salary Range</div>
                </div>
              )}

              {node.metadata.difficulty && (
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <TrendingUp className="w-5 h-5 text-yellow-400 mb-2" />
                  <div className={`text-sm font-bold capitalize ${difficultyColor}`}>
                    {node.metadata.difficulty}
                  </div>
                  <div className="text-xs text-gray-400">Difficulty</div>
                </div>
              )}

              {node.metadata.demand && (
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <Briefcase className="w-5 h-5 text-purple-400 mb-2" />
                  <div className={`text-sm font-bold capitalize ${demandColor}`}>
                    {node.metadata.demand}
                  </div>
                  <div className="text-xs text-gray-400">Market Demand</div>
                </div>
              )}
            </div>
          )}

          {/* Exams */}
          {node.actions?.exams && node.actions.exams.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Recommended Exams
              </h3>
              <div className="flex flex-wrap gap-2">
                {node.actions.exams.map((exam, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-medium border border-red-500/30"
                  >
                    {exam}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Courses */}
          {node.actions?.courses && node.actions.courses.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Recommended Courses
              </h3>
              <div className="space-y-2">
                {node.actions.courses.map((course, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 rounded-lg bg-blue-500/10 text-blue-300 text-sm border border-blue-500/20"
                  >
                    {course}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {node.actions?.certifications && node.actions.certifications.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Certifications
              </h3>
              <div className="space-y-3">
                {node.actions.certifications.map((cert, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white mb-1">
                        {cert.title}
                      </div>
                      <div className="text-xs text-gray-400">{cert.platform}</div>
                    </div>
                    {cert.url && (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-purple-500/20 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-purple-400" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {node.sources && node.sources.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Sources</h3>
              <div className="flex flex-wrap gap-2">
                {node.sources.map((source, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded text-xs text-gray-400 bg-gray-700/50"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t border-gray-700">
            <button
              onClick={() => onAddToRoadmap && onAddToRoadmap(node.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold transition-all shadow-lg hover:shadow-purple-500/50"
            >
              <Plus className="w-5 h-5" />
              Add to My Roadmap
            </button>
            <button className="w-full px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold transition-colors border border-gray-700">
              Schedule Mock Test
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
