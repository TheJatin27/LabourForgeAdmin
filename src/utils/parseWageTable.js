import * as XLSX from "xlsx";

// normalize header text
const normalize = (str = "") =>
  str
    .toLowerCase()
    .replace(/₹/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z]/g, "")
    .trim();

export const parseWageTable = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];

        // 1️⃣ read raw rows
        const raw = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
        });

        // 2️⃣ find header row
        let headerIndex = -1;
        for (let i = 0; i < raw.length; i++) {
          const rowText = raw[i].join(" ").toLowerCase();
          if (
            rowText.includes("class of employment") &&
            rowText.includes("total per day")
          ) {
            headerIndex = i;
            break;
          }
        }

        if (headerIndex === -1) {
          throw new Error("Wage table header not found");
        }

        // 3️⃣ extract headers
        const headers = raw[headerIndex].map(normalize);

        // find column indexes
        const colIndex = {
          class: headers.findIndex(h => h.includes("classofemployment")),
          basic: headers.findIndex(h => h.includes("basicpermonth")),
          vda: headers.findIndex(h => h.includes("vdapermonth")),
          totalMonth: headers.findIndex(h => h.includes("totalpermonth")),
          totalDay: headers.findIndex(h => h.includes("totalperday")),
        };

        // validate columns
        Object.entries(colIndex).forEach(([k, v]) => {
          if (v === -1) {
            throw new Error(`Column not found: ${k}`);
          }
        });

        // 4️⃣ parse rows
        const wages = [];

        for (let i = headerIndex + 1; i < raw.length; i++) {
          const row = raw[i];
          if (!row[colIndex.class]) break;

          wages.push({
            class: row[colIndex.class],
            basicPerMonth: Number(row[colIndex.basic]),
            vdaPerMonth: Number(row[colIndex.vda]),
            totalPerMonth: Number(row[colIndex.totalMonth]),
            totalPerDay: Number(row[colIndex.totalDay]),
          });
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
