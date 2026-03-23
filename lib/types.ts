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
    workspaceData?: {
        content?: { long: string, short: string };
        design?: unknown;
        social?: unknown;
    };
    [key: string]: unknown;
}

export interface ClubEvent {
    id: string;
    name: string;
    config: EventConfig;
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
    joinDate: string;
    basis: RecruitmentBasis;
    testDetails?: string;
}

export interface Club {
    id: string;
    name: string;
    events: ClubEvent[];
    members?: ClubMember[];
    invites?: TeamInvite[];
    activityLog?: ActivityLogEvent[];
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
