import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, vibe, colors } = await req.json();

    // Since Hugging Face credits are depleted, we'll return a 'local' signal.
    // The DesignWorkspace will catch this and use its high-end CSS typography engine.
    return NextResponse.json({ 
      useLocalTypography: true,
      text,
      vibe,
      colors
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


