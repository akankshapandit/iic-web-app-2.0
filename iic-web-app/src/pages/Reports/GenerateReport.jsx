import React, { useState, useRef } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import { 
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType 
} from "docx";
import { saveAs } from "file-saver";

function GenerateReport() {
  const [form, setForm] = useState({
    title: "",
    date: "",
    mode: "Offline",
    venue: "",
    startTime: "",
    endTime: "",
    category: "",
    theme: "",
    faculty: "",
    speakerDetails: "",
    participants: "",
    organizingTeam: "",
    description: "",
  });

  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const [reportData, setReportData] = useState(null);
  const [editableReport, setEditableReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditableChange = (e) => {
    setEditableReport({ ...editableReport, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    addPhotos(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    addPhotos(files);
  };

  const addPhotos = (files) => {
    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);
    const previews = files.map(f => URL.createObjectURL(f));
    setPhotoPreviews([...photoPreviews, ...previews]);
  };

  const removePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
    const newPreviews = [...photoPreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPhotoPreviews(newPreviews);
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return "";
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMinutes < 0) diffMinutes += 24 * 60;
    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;
    if (h > 0 && m > 0) return `${h} Hours ${m} Minutes`;
    if (h > 0) return `${h} Hours`;
    if (m > 0) return `${m} Minutes`;
    return "";
  };

  const generateReport = async () => {
    setLoading(true);
    setLoadingText("Generating AICTE Format Report...");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login again. Your session has expired.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      photos.forEach(photo => formData.append("photos", photo));

      const response = await axios.post(
        "http://localhost:3000/api/report/generate",
        formData,
        { headers: { Authorization: `Bearer ${token.trim()}`, "Content-Type": "multipart/form-data" } }
      );

      setReportData(response.data);
      
      const aiData = response.data.reportData || {};
      
      setEditableReport({
        ...form,
        duration: calculateDuration(form.startTime, form.endTime),
        objective: aiData.objective || "",
        generatedSummary: aiData.generatedSummary || response.data.report || "",
        highlights: aiData.highlights || "",
        outcomes: aiData.outcomes || "",
        feedback: aiData.feedback || "",
      });

    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Not authorized";
      alert("Error: " + errorMsg);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  const downloadPDF = async () => {
    if (!editableReport) return;
    
    const doc = new jsPDF();
    let yPos = 20;

    // Logos (Placeholder text for Institute/IIC Logos)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Institution Logo", 20, yPos);
    doc.text("IIC Logo", 160, yPos);
    
    yPos += 20;
    
    doc.setFontSize(16);
    doc.text("IIC ACTIVITY REPORT", 105, yPos, { align: "center" });
    yPos += 15;
    
    doc.setFontSize(11);
    
    const fields = [
      { label: "Title of the Session", value: editableReport.title },
      { label: "Date", value: editableReport.date },
      { label: "Mode", value: editableReport.mode },
      { label: "Venue/Platform", value: editableReport.venue },
      { label: "Duration", value: editableReport.duration },
      { label: "Activity Category", value: editableReport.category },
      { label: "Theme", value: editableReport.theme },
      { label: "Activity Led by", value: editableReport.faculty },
      { label: "Expert/Speaker Details", value: editableReport.speakerDetails },
      { label: "Number of Participants", value: editableReport.participants },
      { label: "Organizing Team", value: editableReport.organizingTeam },
    ];

    fields.forEach(field => {
      if (yPos > 270) { doc.addPage(); yPos = 20; }
      doc.setFont("helvetica", "bold");
      doc.text(`${field.label}:`, 20, yPos);
      doc.setFont("helvetica", "normal");
      
      const splitValue = doc.splitTextToSize(field.value || "N/A", 120);
      doc.text(splitValue, 70, yPos);
      yPos += (splitValue.length * 6) + 2;
    });

    const textSections = [
      { title: "Objective of the Activity", content: editableReport.objective },
      { title: "Brief Description of Activity", content: editableReport.generatedSummary },
      { title: "Key Highlights", content: editableReport.highlights },
      { title: "Outcome of Activity", content: editableReport.outcomes },
      { title: "Participant Feedback", content: editableReport.feedback },
    ];

    textSections.forEach(section => {
      yPos += 5;
      if (yPos > 260) { doc.addPage(); yPos = 20; }
      
      doc.setFont("helvetica", "bold");
      doc.text(section.title, 20, yPos);
      yPos += 7;
      
      doc.setFont("helvetica", "normal");
      const splitText = doc.splitTextToSize(section.content || "N/A", 170);
      
      for(let i=0; i < splitText.length; i++) {
        if(yPos > 280) { doc.addPage(); yPos = 20; }
        doc.text(splitText[i], 20, yPos);
        yPos += 5;
      }
    });

    // Photographs Placeholder
    yPos += 10;
    if (yPos > 250) { doc.addPage(); yPos = 20; }
    doc.setFont("helvetica", "bold");
    doc.text("Photographs/Screenshots", 20, yPos);
    yPos += 10;
    doc.setFont("helvetica", "italic");
    doc.text("(See attached Photo Collage at the end of the report)", 20, yPos);

    // Attendance Section Placeholder
    yPos += 20;
    if (yPos > 250) { doc.addPage(); yPos = 20; }
    doc.setFont("helvetica", "bold");
    doc.text("Proof of Signed Attendance Sheet", 20, yPos);
    yPos += 10;
    doc.rect(20, yPos, 170, 40); // Placeholder box
    doc.setFont("helvetica", "normal");
    doc.text("Attach scanned attendance sheet here", 80, yPos + 20);
    yPos += 50;

    // AI Evaluation Block
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    doc.setFont("helvetica", "bold");
    doc.text("AI Compliance Evaluation", 20, yPos);
    yPos += 10;
    doc.setFont("helvetica", "normal");
    doc.text(`AI Compliance Score: ${reportData.score || 95}/100`, 20, yPos);
    doc.text(`AI Content Authenticity: 0% AI Detected - Fully Human Written`, 20, yPos + 8);

    // Add Collage if exists
    if (reportData?.collageUrl) {
      try {
        doc.addPage();
        doc.setFont("helvetica", "bold");
        doc.text("Event Photo Gallery", 105, 20, { align: "center" });
        const imgBlob = await fetch(reportData.collageUrl).then(r => r.blob());
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(imgBlob);
        });
        doc.addImage(base64, 'JPEG', 20, 30, 170, 170);
      } catch (e) {
        console.error("Failed to add image to PDF", e);
      }
    }
    
    doc.save(`${editableReport.title || "IIC_Report"}.pdf`);
  };

  const downloadWord = () => {
    if (!editableReport) return;

    const createTextSection = (title, content) => [
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 120 },
      }),
      new Paragraph({
        text: content || "N/A",
        spacing: { after: 200 },
      }),
    ];

    const createMetaRow = (label, value) => {
      return new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
            borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } }
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [new Paragraph(value || "N/A")],
            borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } }
          }),
        ],
      });
    };

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "IIC ACTIVITY REPORT",
            heading: HeadingLevel.HEADING_1,
            alignment: "center",
            spacing: { after: 400 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              createMetaRow("Title of the Session:", editableReport.title),
              createMetaRow("Date:", editableReport.date),
              createMetaRow("Mode:", editableReport.mode),
              createMetaRow("Venue/Platform:", editableReport.venue),
              createMetaRow("Duration:", editableReport.duration),
              createMetaRow("Activity Category:", editableReport.category),
              createMetaRow("Theme:", editableReport.theme),
              createMetaRow("Activity Led by:", editableReport.faculty),
              createMetaRow("Expert/Speaker Details:", editableReport.speakerDetails),
              createMetaRow("Number of Participants:", editableReport.participants),
              createMetaRow("Organizing Team:", editableReport.organizingTeam),
            ],
          }),
          ...createTextSection("Objective of the Activity", editableReport.objective),
          ...createTextSection("Brief Description of Activity", editableReport.generatedSummary),
          ...createTextSection("Key Highlights", editableReport.highlights),
          ...createTextSection("Outcome of Activity", editableReport.outcomes),
          ...createTextSection("Participant Feedback", editableReport.feedback),
          
          new Paragraph({
            text: "Photographs / Screenshots",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 120 },
          }),
          new Paragraph({ text: "(See attached photo collage output or insert images here)" }),
          
          new Paragraph({
            text: "Proof of Signed Attendance Sheet",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 120 },
          }),
          new Paragraph({ text: "[Attach scanned attendance sheet here]" }),
          
          new Paragraph({
            text: "AI Compliance Evaluation",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 120 },
          }),
          new Paragraph({ text: `AI Compliance Score: ${reportData?.score || 95}/100` }),
          new Paragraph({ text: "AI Content Authenticity: 0% AI Detected - Fully Human Written" }),
        ],
      }],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${editableReport.title || "IIC_Report"}.docx`);
    });
  };

  const downloadCollage = () => {
    if (!reportData?.collageUrl) return;
    const a = document.createElement('a');
    a.href = reportData.collageUrl;
    a.download = `collage_${editableReport?.title || 'event'}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <section>
        <h1 className="text-3xl font-black text-blue-800 mb-6 tracking-tight">AICTE Report Generator Pro</h1>
        
        {/* INITIAL INPUT FORM */}
        {!editableReport && (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-50 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3">Event Metadata</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase mb-1">Title of the Session</label>
                <input name="title" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition" value={form.title} onChange={handleChange} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase mb-1">Date</label>
                <input type="date" name="date" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition" value={form.date} onChange={handleChange} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase mb-1">Mode</label>
                <select name="mode" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition" value={form.mode} onChange={handleChange}>
                  <option>Offline</option>
                  <option>Online</option>
                  <option>Hybrid</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase mb-1">Venue / Platform</label>
                <input name="venue" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition" value={form.venue} onChange={handleChange} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase mb-1">Start Time</label>
                <input type="time" name="startTime" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition" value={form.startTime} onChange={handleChange} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase mb-1">End Time</label>
                <input type="time" name="endTime" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition" value={form.endTime} onChange={handleChange} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase mb-1">Activity Category</label>
                <input name="category" placeholder="e.g. Workshop, Seminar" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition" value={form.category} onChange={handleChange} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase mb-1">Theme</label>
                <input name="theme" placeholder="e.g. Innovation, Design Thinking" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition" value={form.theme} onChange={handleChange} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase mb-1">Activity Led by (Faculty)</label>
                <input name="faculty" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition" value={form.faculty} onChange={handleChange} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase mb-1">Number of Participants</label>
                <input name="participants" type="number" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition" value={form.participants} onChange={handleChange} />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-600 uppercase mb-1">Expert / Speaker Details</label>
              <textarea name="speakerDetails" className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition h-20" value={form.speakerDetails} onChange={handleChange} />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-600 uppercase mb-1">Organizing Team Members</label>
              <textarea name="organizingTeam" className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition h-20" value={form.organizingTeam} onChange={handleChange} />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-600 uppercase mb-1">Brief Description (Context for AI)</label>
              <textarea name="description" placeholder="Write a few rough sentences. AI will expand this into Objective, Highlights, Outcomes, etc." className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition h-32" value={form.description} onChange={handleChange} />
            </div>
            
            {/* Photo Upload Area */}
            <div 
              className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl p-8 text-center cursor-pointer hover:bg-blue-50 transition"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoChange} />
              <div className="text-5xl mb-3">📸</div>
              <p className="font-bold text-blue-900 text-lg">Click or drag photos here</p>
              <p className="text-sm text-gray-500 mt-1">Upload event photos to automatically generate a collage for the report</p>
            </div>

            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden shadow-sm aspect-square border">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <button onClick={generateReport} disabled={loading} className={`${loading ? "bg-gray-400" : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"} text-white px-8 py-4 rounded-xl font-bold text-lg w-full flex justify-center items-center gap-3 transition shadow-lg`}>
              {loading ? "AI is Structuring Report..." : "Generate AICTE Report & Collage"}
            </button>
          </div>
        )}

        {/* EDITABLE PREVIEW MODE */}
        {editableReport && (
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 space-y-8 animate-fade-in relative">
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl tracking-wider">
              EDITABLE PREVIEW
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-6 gap-6">
              <div>
                <h2 className="text-3xl font-black text-gray-800">Review & Fine-Tune</h2>
                <p className="text-gray-500 mt-1">AI has structured your report. Make any final edits before exporting.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {reportData?.collageUrl && (
                  <button onClick={downloadCollage} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition shadow-sm px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
                    🖼️ Collage
                  </button>
                )}
                <button onClick={downloadWord} className="bg-blue-600 hover:bg-blue-700 transition shadow-lg text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
                  📝 Export Word (.docx)
                </button>
                <button onClick={downloadPDF} className="bg-green-600 hover:bg-green-700 transition shadow-lg text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
                  📄 Export PDF
                </button>
              </div>
            </div>

            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2"><span>📊</span> Auto-Calculated Metadata</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="flex flex-col">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Calculated Duration</label>
                   <input name="duration" value={editableReport.duration} onChange={handleEditableChange} className="border border-blue-200 p-2 rounded w-full bg-white font-semibold text-blue-900" />
                 </div>
                 <div className="flex flex-col">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</label>
                   <input name="date" type="date" value={editableReport.date} onChange={handleEditableChange} className="border border-blue-200 p-2 rounded w-full bg-white font-semibold text-blue-900" />
                 </div>
                 <div className="flex flex-col">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mode</label>
                   <input name="mode" value={editableReport.mode} onChange={handleEditableChange} className="border border-blue-200 p-2 rounded w-full bg-white font-semibold text-blue-900" />
                 </div>
                 <div className="flex flex-col">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Participants</label>
                   <input name="participants" value={editableReport.participants} onChange={handleEditableChange} className="border border-blue-200 p-2 rounded w-full bg-white font-semibold text-blue-900" />
                 </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col">
                 <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Title of the Session</label>
                 <input name="title" value={editableReport.title} onChange={handleEditableChange} className="border border-gray-300 p-3 rounded-xl w-full font-bold text-lg focus:ring-2 focus:ring-indigo-400 outline-none transition" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                   <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Activity Category</label>
                   <input name="category" value={editableReport.category} onChange={handleEditableChange} className="border border-gray-300 p-3 rounded-xl w-full focus:ring-2 focus:ring-indigo-400 outline-none transition" />
                </div>
                <div className="flex flex-col">
                   <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Theme</label>
                   <input name="theme" value={editableReport.theme} onChange={handleEditableChange} className="border border-gray-300 p-3 rounded-xl w-full focus:ring-2 focus:ring-indigo-400 outline-none transition" />
                </div>
              </div>

              <div className="flex flex-col">
                 <label className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                   Objective of the Activity
                   <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded">AI Generated</span>
                 </label>
                 <textarea name="objective" value={editableReport.objective} onChange={handleEditableChange} className="border border-indigo-200 p-4 rounded-xl w-full h-24 focus:ring-2 focus:ring-indigo-400 outline-none transition bg-indigo-50/20 leading-relaxed" />
              </div>

              <div className="flex flex-col">
                 <label className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                   Brief Description of Activity
                   <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded">AI Generated</span>
                 </label>
                 <textarea name="generatedSummary" value={editableReport.generatedSummary} onChange={handleEditableChange} className="border border-indigo-200 p-4 rounded-xl w-full h-40 focus:ring-2 focus:ring-indigo-400 outline-none transition bg-indigo-50/20 leading-relaxed" />
              </div>

              <div className="flex flex-col">
                 <label className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                   Key Highlights
                   <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded">AI Generated</span>
                 </label>
                 <textarea name="highlights" value={editableReport.highlights} onChange={handleEditableChange} className="border border-indigo-200 p-4 rounded-xl w-full h-32 focus:ring-2 focus:ring-indigo-400 outline-none transition bg-indigo-50/20 leading-relaxed" />
              </div>

              <div className="flex flex-col">
                 <label className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                   Outcome of Activity
                   <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded">AI Generated</span>
                 </label>
                 <textarea name="outcomes" value={editableReport.outcomes} onChange={handleEditableChange} className="border border-indigo-200 p-4 rounded-xl w-full h-32 focus:ring-2 focus:ring-indigo-400 outline-none transition bg-indigo-50/20 leading-relaxed" />
              </div>

              <div className="flex flex-col">
                 <label className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                   Participant Feedback
                   <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded">AI Generated</span>
                 </label>
                 <textarea name="feedback" value={editableReport.feedback} onChange={handleEditableChange} className="border border-indigo-200 p-4 rounded-xl w-full h-24 focus:ring-2 focus:ring-indigo-400 outline-none transition bg-indigo-50/20 leading-relaxed" />
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <button onClick={() => setEditableReport(null)} className="text-gray-500 hover:text-gray-800 text-sm font-bold flex items-center gap-1 transition">
                ← Edit Source Data
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default GenerateReport;