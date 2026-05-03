import * as XLSX from "xlsx";

export const parseGenericWageExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];

        // 1️⃣ Read raw rows first
        const rawRows = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
        });

        // 2️⃣ Find header row index
        let headerRowIndex = -1;

        for (let i = 0; i < rawRows.length; i++) {
          const rowText = rawRows[i]
            .join(" ")
            .toLowerCase();

          if (
            rowText.includes("class of employment") &&
            rowText.includes("basic") &&
            rowText.includes("total per day")
          ) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          throw new Error("Wage table header not found");
        }

        // 3️⃣ Re-parse sheet starting from header row
        const rows = XLSX.utils.sheet_to_json(sheet, {
          range: headerRowIndex,
          defval: "",
        });

        // 4️⃣ Map rows using column names
        const wages = rows
          .filter(r => r["Class of Employment"])
          .map(r => ({
            class: r["Class of Employment"],
            basicPerMonth: Number(r["Basic per Month (₹)"]),
            vdaPerMonth: Number(r["VDA per Month (₹)"]),
            totalPerMonth: Number(r["Total per Month (₹)"]),
            totalPerDay: Number(r["Total per Day (₹)"]),
          }));

        if (wages.length === 0) {
          throw new Error("No wage rows parsed");
        }

        resolve(wages);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
