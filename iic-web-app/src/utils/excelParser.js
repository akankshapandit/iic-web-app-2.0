import * as XLSX from "xlsx";

export const parseExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);

        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // ❗ IMPORTANT FIX: Use header:1 to get raw rows
        const rawData = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
        });

        console.log("Raw Sheet:", rawData);

        // 🎯 Find header row automatically
        let headerRowIndex = rawData.findIndex((row) =>
          row.some((cell) =>
            String(cell).toLowerCase().includes("activity")
          )
        );

        if (headerRowIndex === -1) headerRowIndex = 3; // fallback

        const headers = rawData[headerRowIndex];

        const jsonData = rawData.slice(headerRowIndex + 1).map((row) => {
          let obj = {};
          headers.forEach((header, i) => {
            obj[header || `col_${i}`] = row[i];
          });
          return obj;
        });

        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    };

    reader.readAsArrayBuffer(file);
  });
};