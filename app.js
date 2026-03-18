// State
let pdfFile = null;
let imageFile = null;
let generatedPdfBlob = null;
let finalFileName = "final_share.pdf";

// Inputs
const pdfInput = document.getElementById("pdfInput");
const imgInput = document.getElementById("imgInput");

// Buttons
const generateBtn = document.getElementById("generatePdf"); // Final Copy
const shareBtn = document.getElementById("sharePdf");

// Initial state
generateBtn.disabled = true;
shareBtn.disabled = true;

// Check if both files selected
function checkEnableGenerate() {
    if (pdfFile && imageFile) {
        generateBtn.disabled = false;
    }
}

// Step 1 → Select PDF
pdfInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
        pdfInput.value = "";
        return;
    }

    pdfFile = file;

    // Prepare filename
    const name = pdfFile.name.replace(".pdf", "");
    finalFileName = name + "_share.pdf";

    checkEnableGenerate();
};

// Step 2 → Select Image
imgInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        imgInput.value = "";
        return;
    }

    imageFile = file;

    checkEnableGenerate();
};

// Step 3 → Final Copy (Generate PDF)
generateBtn.onclick = async () => {

    if (!pdfFile || !imageFile) return;

    const pdfBytes = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);

    const pages = pdfDoc.getPages();
    const lastPageIndex = pages.length - 1;

    // Remove last page
    pdfDoc.removePage(lastPageIndex);

    const imgBytes = await imageFile.arrayBuffer();

    let img;
    if (imageFile.type.includes("png")) {
        img = await pdfDoc.embedPng(imgBytes);
    } else {
        img = await pdfDoc.embedJpg(imgBytes);
    }

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    page.drawImage(img, {
        x: 0,
        y: 0,
        width: width,
        height: height
    });

    const newPdfBytes = await pdfDoc.save();

    generatedPdfBlob = new Blob([newPdfBytes], {
        type: "application/pdf"
    });

    // Enable Share
    shareBtn.disabled = false;
};

// Step 4 → Share
shareBtn.onclick = async () => {

    if (!generatedPdfBlob) return;

    const file = new File([generatedPdfBlob], finalFileName, {
        type: "application/pdf"
    });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
            files: [file],
            title: finalFileName
        });
    } else {
        // fallback download
        const url = URL.createObjectURL(generatedPdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = finalFileName;
        a.click();
    }
};
