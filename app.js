// State
let pdfFile = null;
let imageFile = null;
let generatedPdfBlob = null;

// Inputs
const pdfInput = document.getElementById("pdfInput");
const imgInput = document.getElementById("imgInput");

// Buttons
const pickPdfBtn = document.getElementById("pickPdf");
const pickImageBtn = document.getElementById("pickImage");
const generateBtn = document.getElementById("generatePdf");
const shareBtn = document.getElementById("sharePdf");

// Initial state
pickImageBtn.disabled = true;
generateBtn.disabled = true;
shareBtn.disabled = true;
imgInput.disabled = true;

// Step 1 → Pick PDF
pickPdfBtn.onclick = () => {
    pdfInput.click();
};

pdfInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
        pdfInput.value = "";
        return;
    }

    pdfFile = file;

    // Enable next step
    pickImageBtn.disabled = false;
    imgInput.disabled = false;
};

// Step 2 → Pick Image
pickImageBtn.onclick = () => {
    imgInput.click();
};

imgInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        imgInput.value = "";
        return;
    }

    imageFile = file;

    // Enable next step
    generateBtn.disabled = false;
};

// Step 3 → Generate PDF
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

    // Enable share button
    shareBtn.disabled = false;
};

// Step 4 → Share PDF
shareBtn.onclick = async () => {

    if (!generatedPdfBlob) return;

    const file = new File([generatedPdfBlob], "final.pdf", {
        type: "application/pdf"
    });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
            files: [file],
            title: "Final PDF"
        });
    } else {
        // Fallback: download
        const url = URL.createObjectURL(generatedPdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "final.pdf";
        a.click();
    }
};
