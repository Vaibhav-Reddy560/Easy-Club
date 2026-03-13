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

export interface Club {
    id: string;
    name: string;
    events: ClubEvent[];
}

export interface UserMetadata {
    avatar_url?: string;
    full_name?: string;
}

export interface User {
    id: string;
    user_metadata?: UserMetadata;
}
