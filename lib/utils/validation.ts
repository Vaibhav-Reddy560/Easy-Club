export interface ValidationResult<T> {
  data: T | null;
  error: string | null;
}

// A simple schema validator to replace zod so we don't need new dependencies
export const GenerateImageSchema = {
  validate: (body: any) => {
    const data: any = { dimensions: "1080x1350", creativityLevel: 5 };
    if (typeof body.vibe === 'string') data.vibe = body.vibe;
    if (typeof body.creativityLevel === 'number') data.creativityLevel = Math.max(1, Math.min(10, body.creativityLevel));
    if (typeof body.dimensions === 'string') data.dimensions = body.dimensions;
    return { data, error: null };
  }
};

export const GeneratePromoSchema = {
  validate: (body: any) => {
    if (!body?.event?.name || !body?.club?.name) {
      return { data: null, error: "Missing required fields (event.name, club.name)" };
    }
    const data = { ...body };
    if (typeof body.includeEmojis === 'undefined') data.includeEmojis = false;
    return { data, error: null };
  }
};

export const GenerateDocumentSchema = {
  validate: (body: any) => {
    if (body.type !== "letter" && body.type !== "sheet") {
      return { data: null, error: "Invalid type format" };
    }
    if (!body?.event?.name || !body?.club?.name) {
      return { data: null, error: "Missing required fields (event.name, club.name)" };
    }
    return { data: body, error: null };
  }
};

export const TrendingIdeasSchema = {
  validate: (body: any) => {
    if (!body?.category || typeof body.category !== 'string') {
      return { data: null, error: "Category is required" };
    }
    return { data: body, error: null };
  }
};

export const ExploreClubsSchema = {
  validate: (body: any) => {
    if (!body?.type || !body?.category || !body?.location) {
      return { data: null, error: "Missing required fields (type, category, location)" };
    }
    return { data: body, error: null };
  }
};

export const ExploreEventsSchema = {
  validate: (body: any) => {
    if (!body?.type || !body?.location) {
      return { data: null, error: "Missing required fields (type, location)" };
    }
    return { data: body, error: null };
  }
};

export const FindResourceSchema = {
  validate: (body: any) => {
    if (!body?.domain || !body?.location) {
      return { data: null, error: "Missing required fields (domain, location)" };
    }
    return { data: body, error: null };
  }
};

export const SuggestVibeSchema = {
  validate: (body: any) => {
    const data: any = { creativityLevel: 5, ...body };
    if (typeof body.creativityLevel === 'number') {
      data.creativityLevel = Math.max(1, Math.min(10, body.creativityLevel));
    }
    return { data, error: null };
  }
};

// Generic Request Validator
export async function validateRequest<T = any>(req: Request, schema: any): Promise<ValidationResult<T>> {
  try {
    const body = await req.json();
    return schema.validate(body);
  } catch (err) {
    return { data: null, error: "Invalid JSON body" };
  }
}
