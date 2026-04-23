export interface Question {
  id: string;
  type: 'mcq' | 'multi' | 'short';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  marks: number;
}

export interface TestDetails {
  timeLimitMinutes: number;
  passPercentage: number;
  questions: Question[];
}

export interface MembershipConfig {
  mode: 'invite-only' | 'open' | 'test-based';
  testDetails?: TestDetails;
}

export interface ClubMember {
  id: string;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  basis?: string;
  testDetails?: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  description: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  role: 'Admin' | 'Junior Core';
  members?: ClubMember[];
  memberEmails?: string[];
  events?: Event[];
  membershipConfig?: MembershipConfig;
}

export interface TestAttempt {
  id: string;
  userId: string;
  name: string;
  answers: Record<string, string | string[]>;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  timestamp: string;
}
