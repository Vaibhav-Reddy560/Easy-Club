export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const sheetUrl = searchParams.get('url');

        if (!sheetUrl) {
            return NextResponse.json({ error: "Missing Google Sheet URL" }, { status: 400 });
        }

        // Extract the Sheet ID from the URL
        const match = sheetUrl.match(/\/d\/(.*?)\//);
        if (!match || !match[1]) {
            return NextResponse.json({ error: "Invalid Google Sheet URL" }, { status: 400 });
        }
        
        const sheetId = match[1];
        
        // Fetch the CSV export of the public Google Sheet (no API key required!)
        const response = await fetch(
            `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`
        );
        
        if (!response.ok) {
            throw new Error("Failed to fetch sheet data. Make sure the Google Sheet is public ('Anyone with the link' can view).");
        }
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
            // If it returns HTML instead of CSV, it means Google redirected us to a Login Page because the sheet is Private.
            return NextResponse.json({ 
                error: "This Google Sheet is Private. Please click 'Share' in Google Sheets and change General Access to 'Anyone with the link'." 
            }, { status: 403 });
        }
        
        const csvText = await response.text();
        
        // Parse CSV into an array of arrays
        const rawRows = parse(csvText, {
            skip_empty_lines: true
        }) as string[][];
        
        // Filter out completely empty rows or rows with only whitespace
        const rows = rawRows.filter(row => 
            row.some(cell => cell && String(cell).trim().length > 0)
        );
        
        if (rows.length === 0) {
            return NextResponse.json({ count: 0, emails: [] });
        }
        
        const headers: string[] = rows[0];
        const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));
        
        let emails: string[] = [];
        if (emailIndex !== -1) {
            emails = rows.slice(1).map(row => row[emailIndex]?.trim()?.toLowerCase()).filter(Boolean);
        } else {
            // Fallback: If no explicit email header, look for strings with '@' in any column
            emails = rows.slice(1).map((row: any[]) => {
                const emailStr = row.find((cell: string) => cell.includes('@'));
                return emailStr ? emailStr.trim().toLowerCase() : null;
            }).filter((e): e is string => Boolean(e));
        }
        
        // Count strictly based on valid emails to completely ignore any junk rows/formulas Google Forms might leave
        const count = emails.length;

        return NextResponse.json({ 
            count,
            emails,
            sheetId,
            status: 'success'
        });
        
    } catch (error: any) {
        console.error("Sheet Fetch Error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
