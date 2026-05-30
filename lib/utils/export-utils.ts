import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import * as ExcelJS from "exceljs";

/**
 * Generates a professional DOCX document from markdown-like text.
 */
export async function exportToDocx(title: string, content: string): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          ...content.split('\n').map(line => {
            return new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  size: 24, // 12pt
                }),
              ],
              spacing: { after: 200 },
            });
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Generates an Excel spreadsheet from a JSON array.
 */
export async function exportToExcel(filename: string, data: Record<string, unknown>[]): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data Sheet");

  if (data.length > 0) {
    // Define columns based on the first object's keys
    const columns = Object.keys(data[0]).map(key => ({
      header: key.charAt(0).toUpperCase() + key.slice(1),
      key: key,
      width: 20,
    }));
    worksheet.columns = columns;

    // Add rows
    worksheet.addRows(data);

    // Style the header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF59E0B' }, // Gold color
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
