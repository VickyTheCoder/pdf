let pdfFile
let imageFile
let generatedPdfBlob

const pdfInput=document.getElementById("pdfInput")
const imgInput=document.getElementById("imgInput")

document.getElementById("pickPdf").onclick=()=>{
pdfInput.click()
}

document.getElementById("pickImage").onclick=()=>{
imgInput.click()
}

pdfInput.onchange = e => {

const file = e.target.files[0]

if (!file) return

if (file.type !== "application/pdf") {
    alert("Please select a valid PDF file")
    pdfInput.value = ""
    return
}

pdfFile = file
alert("PDF selected successfully")

}

imgInput.onchange = e => {

const file = e.target.files[0]

if (!file) return

if (!file.type.startsWith("image/")) {
    alert("Please select a PNG or JPG image")
    imgInput.value = ""
    return
}

imageFile = file
alert("Image selected successfully")

}
document.getElementById("generatePdf").onclick=async()=>{

if(!pdfFile || !imageFile){
alert("Select both files")
return
}

const pdfBytes=await pdfFile.arrayBuffer()
const pdfDoc=await PDFLib.PDFDocument.load(pdfBytes)

const pages=pdfDoc.getPages()
const lastPageIndex=pages.length-1

pdfDoc.removePage(lastPageIndex)

const imgBytes=await imageFile.arrayBuffer()

let img
if(imageFile.type.includes("png")){
img=await pdfDoc.embedPng(imgBytes)
}else{
img=await pdfDoc.embedJpg(imgBytes)
}

const page=pdfDoc.addPage()
const {width,height}=page.getSize()

page.drawImage(img,{
x:0,
y:0,
width:width,
height:height
})

const newPdfBytes=await pdfDoc.save()

generatedPdfBlob=new Blob([newPdfBytes],{type:"application/pdf"})

document.getElementById("sharePdf").disabled=false

alert("New PDF created")
}

document.getElementById("sharePdf").onclick=async()=>{

const file=new File([generatedPdfBlob],"final.pdf",{type:"application/pdf"})

if(navigator.canShare && navigator.canShare({files:[file]})){

await navigator.share({
files:[file],
title:"Final PDF"
})

}else{

alert("Sharing not supported")

}

}
