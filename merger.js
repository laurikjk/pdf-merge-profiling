const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const profiler = require("v8-profiler-node8");

function logMemoryUsage(stage) {
  const used = process.memoryUsage();
  const messages = [];
  for (let key in used) {
    messages.push(
      `${key}: ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`,
    );
  }
  console.log(`${stage} - Memory Usage: ${messages.join(", ")}`);
}

async function mergePDFs(pdfFiles, outputFilename) {
  const mergedPdf = await PDFDocument.create();

  for (const pdfFile of pdfFiles) {
    const pdfBytes = fs.readFileSync(pdfFile);
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });
  }

  const mergedPdfFile = await mergedPdf.save();
  fs.writeFileSync(outputFilename, mergedPdfFile);
}

const pdfFiles = ["file1.pdf", "file2.pdf", "file3.pdf"];
const outputFilename = "merged.pdf";

console.time("Total Execution Time");
profiler.startProfiling("PDF Merge", true);

logMemoryUsage("Before Merging");

mergePDFs(pdfFiles, outputFilename)
  .then(() => {
    logMemoryUsage("After Merging");
    console.timeEnd("Total Execution Time");

    const profile = profiler.stopProfiling("PDF Merge");
    profile.export(function (error, result) {
      fs.writeFileSync("profile.cpuprofile", result);
      profile.delete();
      console.log("Profile saved!");
      console.log("PDFs have been merged successfully!");
    });
  })
  .catch((err) => {
    console.error("An error occurred:", err);
  });
