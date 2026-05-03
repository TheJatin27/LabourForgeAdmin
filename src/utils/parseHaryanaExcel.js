import * as XLSX from "xlsx";

/**
 * Parses Haryana-style minimum wage Excel
 * Extracts ONLY the "Current Applicable" table
 */
export const parseHaryanaExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        let startIndex = -1;
        let wages = [];
        let notification = "";
        let effectiveFrom = "";

        // Scan rows
        rows.forEach((row, i) => {
          const joined = row.join(" ");

          if (joined.includes("Notification:")) {
            notification = joined.replace("Notification:", "").trim();
          }

          if (joined.includes("Effective From")) {
            effectiveFrom = joined.replace("Effective From:", "").trim();
          }

          if (
            row[0] === "Class of Employment" &&
            row.includes("Total per Day (₹)")
          ) {
            startIndex = i + 1;
          }
        });

        if (startIndex === -1) {
          throw new Error("Wage table not found");
        }

        // Read table rows until blank
        for (let i = startIndex; i < rows.length; i++) {
          const r = rows[i];

          if (!r[0] || r[0].toString().trim() === "") break;

          if (r[0].includes("Same as above")) continue;

          wages.push({
            class: r[0],
            basicPerMonth: Number(r[2]),
            vdaPerMonth: Number(r[3]),
            totalPerMonth: Number(r[4]),
            totalPerDay: Number(r[5]),
          });
        }

        resolve({
          state: "Haryana",
          notification,
          effectiveFrom,
          wages,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
