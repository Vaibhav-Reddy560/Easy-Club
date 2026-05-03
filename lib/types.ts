export type EventStatus = 'upcoming' | 'completed' | 'cancelled' | 'postponed';

export interface PostEventData {
    totalRegistrations: number;
    totalAttendees: number;
    clubMemberAttendees: number;
    nonClubMemberAttendees: number;
    participantEngagement: string;
    benefitsGained: string;
    conductSummary: string;
}

export interface EventReport {
    content: string;
    generatedAt: string;
    lastEditedAt?: string;
}

export interface EventConfig {
    theme?: string;
    type?: string;
    subType?: string;
    description?: string;
    date?: string;
    time?: string;
    venue?: string;
    city?: string;
    regLink?: string;
    poc1Name?: string;
    poc1Phone?: string;
    poc2Name?: string;
    poc2Phone?: string;
    tracks?: string;
    teamSize?: string;
    isCollegeEvent?: boolean;
    collaborators?: string;
    occasion?: string;
    resourceLink?: string;
    brochureLink?: string;
    feeClub?: string;
    feeNonClub?: string;
    isLaunched?: boolean;
    status?: EventStatus;
    postponedTo?: string;
    postEventData?: PostEventData;
    report?: EventReport;
    workspaceData?: {
        content?: { long: string, short: string };
        design?: unknown;
        social?: unknown;
        outreach?: string;
    };
    [key: string]: unknown;
}

export interface ClubEvent {
    id: string;
    name: string;
    config: EventConfig;
}

export type SponsorStage = 'Prospecting' | 'Contacted' | 'Negotiating' | 'Closed';

export interface Sponsor {
    id: string;
    company: string;
    category: string;
    value: number; // in INR
    stage: SponsorStage;
    addedAt: string;
    notes?: string;
}

export type MemberRole = 'Admin' | 'Senior Core' | 'Junior Core' | 'General Member';
export type RecruitmentBasis = 'Fee Paid' | 'Test Passed';

export interface TeamInvite {
    id: string;
    email: string;
    role: MemberRole;
    status: 'pending' | 'accepted' | 'declined';
    sentAt: string;
}

export interface ActivityLogEvent {
    id: string;
    userId: string;
    userName: string;
    action: string;
    domain: 'Design' | 'Content' | 'Social' | 'Management';
    timestamp: string;
    details?: string;
}

export interface ClubMember {
    id: string;
    name: string;
    email: string;
    role: MemberRole;
    customPosition?: string;
    joinDate: string;
    basis: RecruitmentBasis;
    testDetails?: string;
}

export interface Question {
    id: string;
    text: string;
    type: 'mcq' | 'multi' | 'short';
    options: string[];
    correctAnswer: string | string[]; // string for mcq/short, string[] for multi
    marks: number;
}

export interface TestAttempt {
    id: string;
    userId: string; // or email
    name: string;
    answers: Record<string, string | string[]>; // questionId -> answer
    score: number;
    total: number;
    percentage: number;
    passed: boolean;
    timestamp: string;
}

export interface MembershipConfig {
    mode: 'fee-based' | 'test-based';
    feeAmount?: number;
    testDetails?: {
        questions: Question[];
        passPercentage: number;
        timeLimitMinutes?: number;
    };
}

export interface Club {
    id: string;
    ownerId?: string;
    ownerName?: string;
    ownerEmail?: string;
    name: string;
    events: ClubEvent[];
    members?: ClubMember[];
    membershipConfig?: MembershipConfig;
    invites?: TeamInvite[];
    activityLog?: ActivityLogEvent[];
    sponsors?: Sponsor[];
    socialConnections?: {
        [platform: string]: {
            lastConnected: string;
            isConnected: boolean;
            platformName: string;
        };
    };
}

export interface UserMetadata {
    avatar_url?: string;
    full_name?: string;
}

export interface User {
    id: string;
    user_metadata?: UserMetadata;
}

export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

export interface GenerationState {
  status: GenerationStatus;
  progress: number;
  error: string | null;
  result: unknown;
}

export interface ScrapedClub {
    name: string;
    description: string;
    location: string;
    college: string;
    website: string;
    social?: {
        twitter?: string;
        instagram?: string;
        linkedin?: string;
        facebook?: string;
        youtube?: string;
    };
    imageUrl: string;
}
