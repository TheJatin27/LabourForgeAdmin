import * as XLSX from "xlsx";

export const parseWageTable = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];

        // 1️⃣ Read raw rows as an array of arrays
        const raw = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
        });

        // Clean out completely empty trailing or prefix rows if any
        const cleanedRaw = raw.filter(row => row.some(cell => cell !== ""));

        if (cleanedRaw.length < 2) {
          throw new Error("The uploaded document does not contain enough data rows.");
        }

        // 2️⃣ The first non-empty row contains our exact column headers
        // We preserve them EXACTLY as they are written in the spreadsheet (e.g., "Total per Month (₹)")
        const originalHeaders = cleanedRaw[0].map(h => String(h).trim()).filter(h => h !== "");

        if (originalHeaders.length === 0) {
          throw new Error("Could not extract valid column headings from the first row.");
        }

        // 3️⃣ Parse data rows dynamically based on the discovered headers
        const rows = [];

        for (let i = 1; i < cleanedRaw.length; i++) {
          const rowData = cleanedRaw[i];
          
          // Skip if the row has no content in the first primary column category
          if (!rowData[0] && rowData[0] !== 0) continue; 

          const rowObject = {};
          
          // Dynamically map cells to their respective header keys
          originalHeaders.forEach((header, colIndex) => {
            const cellValue = rowData[colIndex];
            
            // Clean up numbers disguised as strings (e.g., remove commas from "11,257.12")
            if (typeof cellValue === "string" && !isNaN(cellValue.replace(/,/g, "")) && cellValue.trim() !== "") {
              rowObject[header] = Number(cellValue.replace(/,/g, ""));
            } else {
              rowObject[header] = cellValue;
            }
          });

          rows.push(rowObject);
        }

        // 4️⃣ Resolve with both the dynamic header order and the records array
        resolve({
          headers: originalHeaders,
          rows: rows
        });

      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};