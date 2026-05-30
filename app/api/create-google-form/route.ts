import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { eventName, description, teamSize, tracks, isCollegeEvent } = await req.json();

    const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

    if (APPS_SCRIPT_URL) {
      console.log(`[Google Automation] Requesting Google Form creation for "${eventName}" via Google Apps Script (GET method)`);

      const url = new URL(APPS_SCRIPT_URL);
      url.searchParams.set("action", "create");
      url.searchParams.set("eventName", eventName || "Easy Club Event Registration");
      url.searchParams.set("description", description || "Register for our upcoming club event!");
      if (teamSize) url.searchParams.set("teamSize", teamSize);
      if (tracks) url.searchParams.set("tracks", tracks);
      if (isCollegeEvent !== undefined) url.searchParams.set("isCollegeEvent", String(isCollegeEvent));

      const response = await fetch(url.toString(), {
        method: "GET",
        redirect: "follow",
      });

      const responseText = await response.text();
      console.log(`[Google Automation] Response status: ${response.status}`);
      console.log(`[Google Automation] Response body: ${responseText.substring(0, 500)}`);

      if (!response.ok) {
        throw new Error(`Apps Script returned status ${response.status}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error("Apps Script returned invalid JSON: " + responseText.substring(0, 200));
      }

      if (result.status === "success") {
        let formLink = result.formUrl;
        if (formLink && formLink.includes("/edit")) {
            formLink = formLink.replace("/edit", "/viewform");
        }
        
        return NextResponse.json({
          registrationFormLink: formLink,
          editFormLink: result.formEditUrl,
          responseSheetLink: result.sheetUrl,
          isSandbox: false,
        });
      } else {
        throw new Error(result.message || "Apps Script returned an error");
      }
    }

    // Sandbox fallback
    console.log(`[Google Automation] Sandbox mode active for "${eventName}"`);
    const pseudoHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    return NextResponse.json({
      registrationFormLink: `https://docs.google.com/forms/d/e/1FAIpQLSf${pseudoHash.substring(0, 16)}/viewform`,
      editFormLink: `https://docs.google.com/forms/d/1${pseudoHash.substring(10, 26)}/edit`,
      responseSheetLink: `https://docs.google.com/spreadsheets/d/1${pseudoHash.substring(5, 21)}/edit#gid=0`,
      isSandbox: true,
    });

  } catch (error: any) {
    console.error("[Google Automation] Error:", error);
    return NextResponse.json(
      { error: error.message || "Automation failed" },
      { status: 500 }
    );
  }
}
