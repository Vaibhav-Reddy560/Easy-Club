import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { editFormLink, description } = await req.json();

    const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

    if (!APPS_SCRIPT_URL) {
      // Sandbox mode fallback
      return NextResponse.json({
        success: true,
        isSandbox: true,
        message: "Updated in Sandbox mode"
      });
    }

    // Extract form ID from editFormLink
    // Example: https://docs.google.com/forms/d/1X-xxxxxx/edit
    let formId = "";
    const match = editFormLink?.match(/\/d\/([a-zA-Z0-9-_]+)\//);
    if (match && match[1]) {
      formId = match[1];
    }

    if (!formId) {
      throw new Error("Could not extract Google Form ID from link");
    }

    console.log("[Google Automation Update] Extracted Form ID:", formId);
    console.log("[Google Automation Update] Description length:", description?.length);

    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.set("action", "update");
    url.searchParams.set("formId", formId);
    url.searchParams.set("description", description);

    console.log("[Google Automation Update] Fetching URL...");

    const response = await fetch(url.toString(), {
      method: "GET",
      redirect: "follow",
    });

    const responseText = await response.text();
    console.log("[Google Automation Update] Response:", responseText);
    if (!response.ok) {
      throw new Error(`Apps Script returned status ${response.status}`);
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error("Apps Script returned invalid JSON");
    }

    if (result.status === "success") {
      return NextResponse.json({
        success: true,
        message: result.message
      });
    } else {
      throw new Error(result.message || "Apps Script returned an error");
    }

  } catch (error: any) {
    console.error("[Google Automation Update] Error:", error);
    return NextResponse.json(
      { error: error.message || "Update failed" },
      { status: 500 }
    );
  }
}
