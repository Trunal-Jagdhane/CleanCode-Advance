
import { Chat } from '@google/genai';

export type Theme = 'light' | 'dark';
export type AnalysisType = 'review' | 'optimize' | 'secure' | 'explain';

export interface ReviewDetail {
  line: number;
  severity: 'High' | 'Medium' | 'Low';
  issue: string;
  suggestion: string;
}

export interface ReviewAnalysis {
  summary: string;
  details: ReviewDetail[];
}

export interface OptimizeAnalysis {
  summary: string;
  optimizedCode: string;
}

export interface SecureAnalysis {
  summary: string;
  vulnerabilities: {
    line: number;
    type: string;
    description: string;
    recommendation: string;
  }[];
}

export interface ExplainAnalysis {
  summary: string;
  lineByLine: {
    line: string;
    explanation: string;
  }[];
}

export type AnalysisResult = ReviewAnalysis | OptimizeAnalysis | SecureAnalysis | ExplainAnalysis | null;

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatInstance {
    chat: Chat;
    history: ChatMessage[];
}

export const LANGUAGES = [
  'javascript',
  'python',
  'java',
  'csharp',
  'cpp',
  'php',
  'go',
  'rust',
  'typescript',
  'html',
  'css',
  'sql',
];

export type SupportedLanguage = typeof LANGUAGES[number];
