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
    endTime?: string;
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
    prizePool?: string;
    isLaunched?: boolean;
    status?: EventStatus;
    postponedTo?: string;
    postEventData?: PostEventData;
    report?: EventReport;
    workspaceData?: {
        content?: { long: string, short: string };
        letters?: Record<string, string>;
        sheet?: any[];
        design?: Record<string, any>;
        social?: unknown;
        outreach?: string;
    };
    [key: string]: unknown;
}

export interface ClubEvent {
    id: string;
    name: string;
    config: EventConfig;
    attendees?: {
        email: string;
        markedAt: string;
        source: 'QR' | 'Manual';
    }[];
}

export type SponsorStage = 'Prospecting' | 'Contacted' | 'Negotiating' | 'Closed';
export type SponsorTier = 'Title' | 'Platinum' | 'Gold' | 'Silver' | 'In-Kind' | 'Custom';

export interface SponsorDeliverable {
    id: string;
    text: string;
    completed: boolean;
}

export interface Sponsor {
    id: string;
    company: string;
    category: string;
    tier?: SponsorTier;
    value: number; // in INR
    amountPaid?: number; // in INR
    stage: SponsorStage;
    addedAt: string;
    notes?: string;
    pocName?: string;
    pocEmail?: string;
    pocPhone?: string;
    deliverables?: SponsorDeliverable[];
    eventId?: string;
}

export interface JCApplication {
    id: string;
    memberId: string;
    memberName: string;
    memberEmail: string;
    skills: string;
    experience: string;
    reason: string;
    ideas: string;
    appliedAt: string;
    votes: string[]; // List of SC member IDs who voted
}

export interface JCSelectionConfig {
    maxJC: number;
    isRecruitmentOpen: boolean;
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

export type SkillLevel = 'Beginner' | 'Proficient' | 'Expert';

export interface Skill {
    name: string;
    level: SkillLevel;
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
    skills?: (string | Skill)[]; // Support both legacy string array and new Skill object array
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
    razorpayKeyId?: string;
    razorpayKeySecret?: string;
    testDetails?: {
        questions: Question[];
        passPercentage: number;
        timeLimitMinutes?: number;
    };
}

export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: string;
}

export type CollabRequestStatus = 'pending' | 'accepted' | 'declined';

export interface CollabRequest {
    id: string;
    fromClubId: string;
    fromClubName: string;
    toClubId: string;
    toClubName: string;
    status: CollabRequestStatus;
    sentAt: string;
    message?: string;
    interestedInIdeas?: string[];
}

export interface Collaboration {
    id: string;
    partnerClubId: string;
    partnerClubName: string;
    sharedEvents: string[]; // event IDs
    activityLog: ActivityLogEvent[];
    messages: Message[];
    startedAt: string;
}

export interface CollabPreferences {
    isVisible: boolean;
    categories: string[];
    interestedIdeas: string[];
}

export interface MeetingMinutes {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    attendees: string[]; // Member IDs
    eventId: string;
    keyTopics: string;
    progressNotes: string;
    rating: number; // 1-5
    createdBy: string; // Member Name
    createdById: string;
    createdAt: string;
}

export interface AssignedTask {
    id: string;
    title: string;
    description: string;
    assigneeId: string; // JC ID
    assigneeName: string;
    assignerId: string; // SC ID
    assignerName: string;
    eventId: string;
    domain: 'Design' | 'Content' | 'Social' | 'Management';
    deadline: string;
    status: 'Assigned' | 'In Progress' | 'Review Required' | 'Completed';
    progressValue: number; // 0-100
    externalLink?: string; // Google Docs, Figma etc.
    scFeedback?: string;
    createdAt: string;
}

export interface Club {
    id: string;
    ownerId?: string;
    ownerName?: string;
    ownerEmail?: string;
    founderId?: string;
    founderName?: string;
    founderEmail?: string;
    name: string;
    description?: string;
    lastUpdated?: string;
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
    collabPreferences?: CollabPreferences;
    collabRequests?: CollabRequest[];
    activeCollabs?: Collaboration[];
    meetingMinutes?: MeetingMinutes[]; // Added
    assignedTasks?: AssignedTask[]; // Added
    jcApplications?: JCApplication[]; // Added
    jcSelectionConfig?: JCSelectionConfig; // Added
    ayrshareApiKey?: string;
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
