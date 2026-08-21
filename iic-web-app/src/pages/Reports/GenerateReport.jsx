import React, { useState, useRef } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import { 
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType, ImageRun, Header, TableLayoutType, VerticalAlign 
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
    category: "IIC Calendar Activity",
    theme: "Innovation & Design Thinking",
    faculty: "Institute Council",
    speakerDetails: "",
    participants: "",
    organizingTeam: "",
    description: "",
    feedbackLink: "",
    twitterUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    linkedInUrl: "",
    videoUrl: "",
    keyOutputs: "",
    kpis: "",
    speakerMobile: "",
    speakerEmailOrLinkedIn: "",
    studentParticipants: "",
    facultyParticipants: "",
    externalParticipants: "0",
    organizerName: "",
    organizerMobile: "",
  });

  const [actualPosterFile, setActualPosterFile] = useState(null);
  const [, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [extractingPoster, setExtractingPoster] = useState(false);
  const [posterExtracted, setPosterExtracted] = useState(false);
  const [extractedDetails, setExtractedDetails] = useState(null);
  const posterInputRef = useRef(null);

  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const [attendanceFiles, setAttendanceFiles] = useState([]);
  const [attendancePreviews, setAttendancePreviews] = useState([]);
  const attendanceInputRef = useRef(null);

  const [feedbackScreenshotFile, setFeedbackScreenshotFile] = useState(null);
  const [feedbackScreenshotPreview, setFeedbackScreenshotPreview] = useState(null);
  const feedbackScreenshotInputRef = useRef(null);

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

  const handlePosterUpload = async (file) => {
    if (!file) return;
    setActualPosterFile(file);
    setPosterFile(file);
    if (file.type.startsWith("image/")) {
      setPosterPreview(URL.createObjectURL(file));
    } else {
      setPosterPreview(null);
    }

    setExtractingPoster(true);
    try {
      const formData = new FormData();
      formData.append("poster", file);

      const response = await axios.post(
        "http://localhost:3000/api/report/extract-poster",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const data = response.data || {};
      
      const formattedSpeaker = [
        data.speakerName ? `Name: ${data.speakerName}` : "",
        data.speakerDesignation ? `Designation: ${data.speakerDesignation}` : "",
        data.speakerOrganization ? `Organization: ${data.speakerOrganization}` : ""
      ].filter(Boolean).join("\n");

      setForm((prev) => ({
        ...prev,
        title: data.title || prev.title,
        date: data.date || prev.date,
        startTime: data.startTime || prev.startTime,
        endTime: data.endTime || prev.endTime,
        venue: data.venue || prev.venue,
        speakerDetails: data.speakerDetails || formattedSpeaker || prev.speakerDetails,
        faculty: data.faculty || data.speakerName || prev.faculty,
      }));

      setExtractedDetails({
        title: data.title || "Not detected",
        dateFormatted: data.dateFormatted || data.date || "Not detected",
        startTime: data.startTime || "N/A",
        endTime: data.endTime || "N/A",
        venue: data.venue || "Not detected",
        speakerName: data.speakerName || "Not detected",
        speakerDesignation: data.speakerDesignation || "Not detected",
        speakerOrganization: data.speakerOrganization || "Not detected",
      });

      setPosterExtracted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to extract metadata from poster: " + (err.response?.data?.error || err.message));
    } finally {
      setExtractingPoster(false);
    }
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

  const handleAttendanceChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setAttendanceFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setAttendancePreviews((prev) => [...prev, ...previews]);
  };

  const removeAttendance = (index) => {
    setAttendanceFiles((prev) => prev.filter((_, i) => i !== index));
    setAttendancePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleFeedbackScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFeedbackScreenshotFile(file);
    setFeedbackScreenshotPreview(URL.createObjectURL(file));
  };

  const removeFeedbackScreenshot = () => {
    setFeedbackScreenshotFile(null);
    if (feedbackScreenshotPreview) URL.revokeObjectURL(feedbackScreenshotPreview);
    setFeedbackScreenshotPreview(null);
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return "N/A";
    
    const parseTimeToMinutes = (timeStr) => {
      if (!timeStr) return null;
      const str = String(timeStr).trim().toUpperCase();
      
      const isPM = str.includes("PM");
      const isAM = str.includes("AM");
      const cleanTime = str.replace(/AM|PM/g, "").trim();
      
      const parts = cleanTime.split(":");
      if (parts.length < 2) return null;
      
      let hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      
      if (isNaN(hours) || isNaN(minutes)) return null;
      
      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;
      
      return hours * 60 + minutes;
    };

    const startMins = parseTimeToMinutes(start);
    const endMins = parseTimeToMinutes(end);

    if (startMins === null || endMins === null) return "N/A";

    let diff = endMins - startMins;
    if (diff < 0) diff += 24 * 60;

    const h = Math.floor(diff / 60);
    const m = diff % 60;

    if (h > 0 && m > 0) return `${h} Hours ${m} Minutes`;
    if (h > 0) return `${h} Hour${h > 1 ? "s" : ""}`;
    if (m > 0) return `${m} Minute${m > 1 ? "s" : ""}`;
    return "0 Minutes";
  };

  const calculateDurationInMinutes = (start, end) => {
    if (!start || !end) return "N/A";
    
    const parseTimeToMinutes = (timeStr) => {
      if (!timeStr) return null;
      const str = String(timeStr).trim().toUpperCase();
      const isPM = str.includes("PM");
      const isAM = str.includes("AM");
      const cleanTime = str.replace(/AM|PM/g, "").trim();
      const parts = cleanTime.split(":");
      if (parts.length < 2) return null;
      let hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      if (isNaN(hours) || isNaN(minutes)) return null;
      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const startMins = parseTimeToMinutes(start);
    const endMins = parseTimeToMinutes(end);

    if (startMins === null || endMins === null) return "N/A";

    let diff = endMins - startMins;
    if (diff < 0) diff += 24 * 60;
    return `${diff} min`;
  };

  const getOfficialSections = (rep) => {
    if (!rep) return [];
    
    const durationVal = rep.duration || calculateDuration(rep.startTime, rep.endTime);
    const speakerFormatted = extractedDetails?.speakerName 
      ? `Name:\n${extractedDetails.speakerName}\n\nDesignation:\n${extractedDetails.speakerDesignation || "N/A"}\n\nOrganization / Institution:\n${extractedDetails.speakerOrganization || "N/A"}` 
      : rep.speakerDetails || "N/A";

    const participantDetailsStr = `Total no. of Student participation: ${rep.participants || ''}\nTotal no. of Staff (Teaching/Non-teaching) participation: \nTotal no of External participation: `;

    const photoInstruction = `4 to 5 Photographs/Screenshots (1 Photo can be geotagged) that show the 1) Print/Soft copy of Banner used for the activity, 2) Speakers/Dais Photo with banner in the background, 3) Participation of students and Staffs(Teaching/Non-teaching) in the activity (one photo can be captured covering guest and participants from front and back, if conducted any physical activity), 4) Unique/Activity moments, where candid moments can be captured to get broader view of the activity engagement level.`;

    const mediaInstruction = `Screenshots of pre-activity announcements and post-activity updates shared on the institute's social media platforms should be included. If available, attach photo/screenshots of media coverage such as newspaper articles, online news portals, or institutional newsletters highlighting the activity.\n\nN/A`;

    return [
      { key: "title", title: "Title of the Session", content: rep.title || "N/A" },
      { key: "date", title: "Date with Month & Year", content: extractedDetails?.dateFormatted || rep.date || "N/A" },
      { key: "duration", title: "Duration (in hours)", content: durationVal },
      { key: "mode", title: "Mode", content: rep.mode || "Offline" },
      { key: "venue", title: "Venue / Platform", content: rep.venue || "N/A" },
      { key: "category", title: "Activity Category", content: rep.category || "IIC Calendar Activity" },
      { key: "objective", title: "Objective of the Activity", content: rep.objective || "N/A", isAI: true },
      { key: "faculty", title: "Activity Led by", content: rep.faculty || "Institute Council" },
      { key: "theme", title: "Theme", content: rep.theme || "Innovation & Design Thinking" },
      { key: "speakerDetails", title: "Expert / Speaker Details", content: speakerFormatted },
      { key: "generatedSummary", title: "Brief Description of the Activity", content: rep.generatedSummary || rep.description || "N/A" },
      { key: "participants", title: "Participant details:", content: participantDetailsStr },
      { key: "highlights", title: "Key Highlights:", content: rep.highlights || "Briefly mention the most important moments, insights, and engagement points of the activity in 5-8 lines (in short bullet points (5–8 points) that help to understand what made the session meaningful)." },
      { key: "outcomes", title: "Outcome of the activity:", content: rep.outcomes || "Clearly mention what participants gained. The outcome should align with and reflect the KPIs mentioned in the activity details on the IIC portal." },
      { key: "keyOutputs", title: "Key Outputs / Measurable Parameters:", content: rep.keyOutputs || "N/A" },
      { key: "kpis", title: "KPIs (with Quantified Metrics):", content: rep.kpis || "N/A" },
      { key: "feedback", title: "Feedback / Reflection:", content: rep.feedback || "Include 2–3 participants feedback" },
      { key: "organizingTeam", title: "Organizing Team Members Details:", content: rep.organizingTeam || "N/A" },
      { key: "photographs", title: "Photographs/Screenshots:", content: photoInstruction, isPhotoSection: true },
      { key: "mediaCoverage", title: "Media Coverage and Pre & Post Activity Social Media Post screenshot:", content: mediaInstruction },
      { key: "registrationLink", title: "Registration Link:", content: rep.registrationLink || reportData?.registrationLink || "N/A" },
      { key: "attendanceDetails", title: "Attendance details:", content: "Proof of signed Attendance sheet" }
    ];
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

      const calculatedDur = calculateDuration(form.startTime, form.endTime);
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      
      if (actualPosterFile) formData.append("poster", actualPosterFile);
      photos.forEach(photo => formData.append("photos", photo));
      attendanceFiles.forEach(att => formData.append("attendanceSheets", att));
      if (feedbackScreenshotFile) formData.append("feedbackScreenshot", feedbackScreenshotFile);

      const response = await axios.post(
        "http://localhost:3000/api/report/generate",
        formData,
        { headers: { Authorization: `Bearer ${token.trim()}`, "Content-Type": "multipart/form-data" } }
      );

      setReportData(response.data);
      
      const aiData = response.data.reportData || {};
      const exactFacultyBrief = (form.description && form.description.trim()) ? form.description.trim() : (aiData.generatedSummary || response.data.report || "N/A");
      
      setEditableReport({
        ...form,
        duration: calculatedDur,
        objective: aiData.objective || "",
        generatedSummary: exactFacultyBrief,
        description: exactFacultyBrief
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

// Helpers to load official logos directly from public/logos at runtime
const fetchLogoBuffer = async (logoPath) => {
  const res = await fetch(logoPath);
  if (!res.ok) throw new Error(`Failed to load logo from ${logoPath}`);
  return await res.arrayBuffer();
};

const fetchLogoBase64 = async (logoPath) => {
  const res = await fetch(logoPath);
  if (!res.ok) throw new Error(`Failed to load logo from ${logoPath}`);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

  const downloadPDF = async () => {
    if (!editableReport) return;
    
    const doc = new jsPDF();
    
    // Fetch official logos directly from public/logos at report generation time
    let cmritBase64 = null;
    let iicBase64 = null;
    try {
      cmritBase64 = await fetchLogoBase64("/logos/CMRIT NEW LOGO-1 (1).png");
      iicBase64 = await fetchLogoBase64("/logos/image(616).png");
    } catch (err) {
      console.error("Error loading official header logos for PDF:", err);
    }

    // Draw header logos ONLY on Page 1
    if (cmritBase64) {
      try { doc.addImage(cmritBase64, "PNG", 20, 8, 44, 22); } catch (e) { console.error(e); }
    }
    if (iicBase64) {
      try { doc.addImage(iicBase64, "PNG", 146, 8, 44, 22); } catch (e) { console.error(e); }
    }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138);
    doc.text("IIC ACTIVITY REPORT", 105, 38, { align: "center" });

    let yPos = 48; // Spacing ensures content starts below header logos without overlap

    const checkNewPage = (neededHeight = 15) => {
      if (yPos + neededHeight > 275) {
        doc.addPage();
        yPos = 20; // Subsequent pages (2, 3, etc.) start at top without header logos
      }
    };

    const sections = getOfficialSections(editableReport);

    for (const sec of sections) {
      checkNewPage(18);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(29, 78, 216);
      doc.text(sec.title, 20, yPos);
      yPos += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(31, 41, 55);

      const lines = String(sec.content || "N/A").split("\n");
      for (const line of lines) {
        const splitText = doc.splitTextToSize(line, 170);
        for (let i = 0; i < splitText.length; i++) {
          checkNewPage(7);
          doc.text(splitText[i], 20, yPos);
          yPos += 5;
        }
      }

      // Feedback Link & Screenshot
      if (sec.key === "feedback") {
        if (reportData?.feedbackLink) {
          checkNewPage(14);
          doc.setFont("helvetica", "bold");
          doc.text("Feedback link:", 20, yPos);
          yPos += 5;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(37, 99, 235);
          doc.text(reportData.feedbackLink, 20, yPos);
          yPos += 7;
          doc.setTextColor(31, 41, 55);
        }
        if (reportData?.feedbackScreenshotUrl) {
          try {
            checkNewPage(110);
            doc.setFont("helvetica", "bold");
            doc.text("Sample Feedback(screenshot)", 20, yPos);
            yPos += 6;
            const imgBlob = await fetch(reportData.feedbackScreenshotUrl).then(r => r.blob());
            const base64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(imgBlob);
            });
            doc.addImage(base64, 'JPEG', 20, yPos, 170, 100);
            yPos += 110;
          } catch (e) { console.error(e); }
        }
      }

      // Photo collage
      if (sec.isPhotoSection && reportData?.collageUrl) {
        try {
          checkNewPage(130);
          const imgBlob = await fetch(reportData.collageUrl).then(r => r.blob());
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(imgBlob);
          });
          doc.addImage(base64, 'JPEG', 20, yPos + 5, 170, 120);
          yPos += 130;
        } catch (e) {
          console.error("Failed to add collage image to PDF section", e);
        }
      }

      // Attendance Sheet Images
      if (sec.key === "attendanceDetails" && reportData?.attendanceUrls && reportData.attendanceUrls.length > 0) {
        for (const url of reportData.attendanceUrls) {
          try {
            doc.addPage();
            yPos = 20;
            const imgBlob = await fetch(url).then(r => r.blob());
            const base64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(imgBlob);
            });
            doc.addImage(base64, 'JPEG', 20, yPos, 170, 220);
            yPos = 250;
          } catch (e) { console.error(e); }
        }
      }

      yPos += 4;
    }

    // Social Media and Video Links Table
    const sm = reportData?.socialMedia || {};
    const activeSocials = [
      sm.twitter && { platform: "Twitter", url: sm.twitter },
      sm.facebook && { platform: "Facebook", url: sm.facebook },
      sm.instagram && { platform: "Instagram", url: sm.instagram },
      sm.linkedIn && { platform: "LinkedIn", url: sm.linkedIn },
      (sm.videoUrl || reportData?.videoUrl || editableReport.videoUrl) && { platform: "Video / Drive Link", url: sm.videoUrl || reportData?.videoUrl || editableReport.videoUrl },
    ].filter(Boolean);

    if (activeSocials.length > 0) {
      checkNewPage(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(29, 78, 216);
      doc.text("Social Media and Video Links", 20, yPos);
      yPos += 8;
      doc.setFontSize(10);

      activeSocials.forEach(s => {
        const splitUrl = doc.splitTextToSize(s.url, 120);
        const itemHeight = (splitUrl.length * 5) + 3;
        checkNewPage(itemHeight);
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(31, 41, 55);
        doc.text(`${s.platform}:`, 20, yPos);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(37, 99, 235);
        doc.text(splitUrl, 70, yPos);
        doc.setTextColor(31, 41, 55);
        yPos += itemHeight;
      });
      yPos += 4;
    }

    // Event Poster Page
    if (reportData?.posterUrl) {
      try {
        doc.addPage();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Event Poster", 105, 20, { align: "center" });
        const imgBlob = await fetch(reportData.posterUrl).then(r => r.blob());
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(imgBlob);
        });
        doc.addImage(base64, 'JPEG', 20, 30, 170, 220);
      } catch (e) { console.error("Failed to add poster image to PDF", e); }
    }

    // Append Additional Event Information Table at the very end of PDF report
    const infoPdf = reportData?.additionalInfo || {};
    const speakerNamePdf = extractedDetails?.speakerName || editableReport.faculty || "N/A";
    const designationPdf = extractedDetails?.speakerDesignation || "N/A";
    const mobilePdf = infoPdf.speakerMobile || editableReport.speakerMobile || "N/A";
    const emailPdf = infoPdf.speakerEmailOrLinkedIn || editableReport.speakerEmailOrLinkedIn || "N/A";
    const datePdf = extractedDetails?.dateFormatted || editableReport.date || "N/A";
    const durationMinsPdf = calculateDurationInMinutes(editableReport.startTime, editableReport.endTime);
    const studentsPdf = infoPdf.studentParticipants || editableReport.studentParticipants || "N/A";
    const facultyPdf = infoPdf.facultyParticipants || editableReport.facultyParticipants || "N/A";
    const externalPdf = (infoPdf.externalParticipants !== undefined && infoPdf.externalParticipants !== "") ? infoPdf.externalParticipants : (editableReport.externalParticipants || "0");
    
    let organizerCellPdf = "N/A";
    if (infoPdf.organizerName || editableReport.organizerName) {
      const orgName = infoPdf.organizerName || editableReport.organizerName;
      const orgMob = infoPdf.organizerMobile || editableReport.organizerMobile;
      organizerCellPdf = orgMob ? `${orgName}\nContact No:${orgMob}` : orgName;
    }

    const eventInfoRowsPdf = [
      { id: "1", particular: "Name of the Resource Person", detail: speakerNamePdf },
      { id: "2", particular: "Designation", detail: designationPdf },
      { id: "3", particular: "Contact Details - Mobile", detail: mobilePdf },
      { id: "4", particular: "Contact Details – e-mail id", detail: emailPdf },
      { id: "5", particular: "Date of event", detail: datePdf },
      { id: "6", particular: "Duration in mins", detail: durationMinsPdf },
      { id: "7", particular: "Number of student participations", detail: studentsPdf },
      { id: "8", particular: "Number of faculty participations", detail: facultyPdf },
      { id: "9", particular: "Number of external participations", detail: externalPdf },
      { id: "10", particular: "Name of the Organizer", detail: organizerCellPdf },
    ];

    if (yPos > 180) { doc.addPage(); yPos = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(29, 78, 216);
    doc.text("Additional Event Information", 20, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);

    eventInfoRowsPdf.forEach(row => {
      if (yPos > 270) { doc.addPage(); yPos = 20; }
      doc.setFont("helvetica", "bold");
      doc.text(`${row.id}. ${row.particular}:`, 20, yPos);
      doc.setFont("helvetica", "normal");
      const splitDetail = doc.splitTextToSize(row.detail, 95);
      doc.text(splitDetail, 95, yPos);
      yPos += (splitDetail.length * 5) + 3;
    });

    doc.save(`AICTE_Report_${editableReport.title || 'event'}.pdf`);
  };

  const downloadWord = async () => {
    if (!editableReport) return;

    const sections = getOfficialSections(editableReport);

    let collageBuffer = null;
    if (reportData?.collageUrl) {
      try {
        const res = await fetch(reportData.collageUrl);
        collageBuffer = await res.arrayBuffer();
      } catch (e) { console.error("Collage fetch err", e); }
    }

    let feedbackSSBuffer = null;
    if (reportData?.feedbackScreenshotUrl) {
      try {
        const res = await fetch(reportData.feedbackScreenshotUrl);
        feedbackSSBuffer = await res.arrayBuffer();
      } catch (e) { console.error("Feedback SS fetch err", e); }
    }

    let posterBuffer = null;
    if (reportData?.posterUrl) {
      try {
        const res = await fetch(reportData.posterUrl);
        posterBuffer = await res.arrayBuffer();
      } catch (e) { console.error("Poster fetch err", e); }
    }

    let attendanceBuffers = [];
    if (reportData?.attendanceUrls && reportData.attendanceUrls.length > 0) {
      for (const url of reportData.attendanceUrls) {
        try {
          const res = await fetch(url);
          const buf = await res.arrayBuffer();
          attendanceBuffers.push(buf);
        } catch (e) { console.error("Attendance fetch err", e); }
      }
    }

    const wordParagraphs = [
      new Paragraph({
        alignment: "center",
        space: { after: 300 },
        children: [new TextRun({ text: "IIC ACTIVITY REPORT", bold: true, size: 32, color: "1E3A8A" })]
      })
    ];

    sections.forEach((sec) => {
      wordParagraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          space: { before: 240, after: 80 },
          children: [
            new TextRun({ text: sec.title, bold: true, color: "1D4ED8", size: 24 })
          ]
        })
      );

      const lines = String(sec.content || "N/A").split("\n");
      lines.forEach((line) => {
        wordParagraphs.push(
          new Paragraph({
            space: { after: 120 },
            children: [new TextRun({ text: line, size: 22, color: "1F2937" })]
          })
        );
      });

      // Special insertions for Feedback, Collage, Attendance
      if (sec.key === "feedback") {
        if (reportData?.feedbackLink) {
          wordParagraphs.push(
            new Paragraph({
              space: { before: 120, after: 40 },
              children: [new TextRun({ text: "Feedback link:", bold: true, underline: {}, size: 22, color: "1D4ED8" })]
            }),
            new Paragraph({
              space: { after: 120 },
              children: [new TextRun({ text: reportData.feedbackLink, size: 22, color: "2563EB" })]
            })
          );
        }
        if (feedbackSSBuffer) {
          wordParagraphs.push(
            new Paragraph({
              space: { before: 120, after: 40 },
              children: [new TextRun({ text: "Sample Feedback(screenshot)", bold: true, underline: {}, size: 22, color: "1D4ED8" })]
            }),
            new Paragraph({
              alignment: "center",
              space: { before: 100, after: 200 },
              children: [
                new ImageRun({
                  data: feedbackSSBuffer,
                  transformation: { width: 500, height: 320 }
                })
              ]
            })
          );
        }
      }

      if (sec.isPhotoSection && collageBuffer) {
        wordParagraphs.push(
          new Paragraph({
            alignment: "center",
            space: { before: 200, after: 200 },
            children: [
              new ImageRun({
                data: collageBuffer,
                transformation: { width: 500, height: 375 }
              })
            ]
          })
        );
      }

      if (sec.key === "attendanceDetails" && attendanceBuffers.length > 0) {
        attendanceBuffers.forEach((buf) => {
          wordParagraphs.push(
            new Paragraph({
              alignment: "center",
              space: { before: 150, after: 200 },
              children: [
                new ImageRun({
                  data: buf,
                  transformation: { width: 500, height: 650 }
                })
              ]
            })
          );
        });
      }
    });

    // Social Media Links Table
    const sm = reportData?.socialMedia || {};
    const activeSocials = [
      sm.twitter && { platform: "Twitter", url: sm.twitter },
      sm.facebook && { platform: "Facebook", url: sm.facebook },
      sm.instagram && { platform: "Instagram", url: sm.instagram },
      sm.linkedIn && { platform: "LinkedIn", url: sm.linkedIn },
      (sm.videoUrl || reportData?.videoUrl || editableReport.videoUrl) && { platform: "Video / Drive Link", url: sm.videoUrl || reportData?.videoUrl || editableReport.videoUrl },
    ].filter(Boolean);

    if (activeSocials.length > 0) {
      wordParagraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          space: { before: 240, after: 80 },
          children: [new TextRun({ text: "Social Media and Video Links", bold: true, color: "1D4ED8", size: 24 })]
        })
      );

      const tableRows = [
        new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              width: { size: 3200, type: WidthType.DXA },
              noWrap: true,
              verticalAlign: VerticalAlign.CENTER,
              children: [new Paragraph({ children: [new TextRun({ text: "Platform", bold: true, size: 22 })] })]
            }),
            new TableCell({
              width: { size: 6800, type: WidthType.DXA },
              verticalAlign: VerticalAlign.CENTER,
              children: [new Paragraph({ children: [new TextRun({ text: "Link", bold: true, size: 22 })] })]
            })
          ]
        }),
        ...activeSocials.map(item => new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              width: { size: 3200, type: WidthType.DXA },
              noWrap: true,
              verticalAlign: VerticalAlign.CENTER,
              children: [new Paragraph({ children: [new TextRun({ text: item.platform, bold: true, size: 22 })] })]
            }),
            new TableCell({
              width: { size: 6800, type: WidthType.DXA },
              verticalAlign: VerticalAlign.CENTER,
              children: [new Paragraph({ children: [new TextRun({ text: item.url, size: 22, color: "2563EB" })] })]
            })
          ]
        }))
      ];

      wordParagraphs.push(
        new Table({
          layout: TableLayoutType.FIXED,
          autofit: false,
          columnWidths: [3200, 6800],
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows
        })
      );
    }

    // Event Poster Section
    if (posterBuffer) {
      wordParagraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          space: { before: 240, after: 80 },
          children: [new TextRun({ text: "Event Poster", bold: true, color: "1D4ED8", size: 24 })]
        }),
        new Paragraph({
          alignment: "center",
          space: { before: 150, after: 200 },
          children: [
            new ImageRun({
              data: posterBuffer,
              transformation: { width: 500, height: 650 }
            })
          ]
        })
      );
    }

    // Append Additional Event Information Table at the very end of Word report
    const info = reportData?.additionalInfo || {};
    const speakerNameVal = extractedDetails?.speakerName || editableReport.faculty || "N/A";
    const designationVal = extractedDetails?.speakerDesignation || "N/A";
    const mobileVal = info.speakerMobile || editableReport.speakerMobile || "N/A";
    const emailVal = info.speakerEmailOrLinkedIn || editableReport.speakerEmailOrLinkedIn || "N/A";
    const dateVal = extractedDetails?.dateFormatted || editableReport.date || "N/A";
    const durationMinsVal = calculateDurationInMinutes(editableReport.startTime, editableReport.endTime);
    const studentsVal = info.studentParticipants || editableReport.studentParticipants || "N/A";
    const facultyVal = info.facultyParticipants || editableReport.facultyParticipants || "N/A";
    const externalVal = (info.externalParticipants !== undefined && info.externalParticipants !== "") ? info.externalParticipants : (editableReport.externalParticipants || "0");
    
    let organizerCellVal = "N/A";
    if (info.organizerName || editableReport.organizerName) {
      const orgName = info.organizerName || editableReport.organizerName;
      const orgMob = info.organizerMobile || editableReport.organizerMobile;
      organizerCellVal = orgMob ? `${orgName}\nContact No:${orgMob}` : orgName;
    }

    const eventInfoRows = [
      { id: "1", particular: "Name of the Resource Person", detail: speakerNameVal },
      { id: "2", particular: "Designation", detail: designationVal },
      { id: "3", particular: "Contact Details - Mobile", detail: mobileVal },
      { id: "4", particular: "Contact Details – e-mail id", detail: emailVal },
      { id: "5", particular: "Date of event (If more than 1 day, mention from and to date)", detail: dateVal },
      { id: "6", particular: "Duration in mins", detail: durationMinsVal },
      { id: "7", particular: "Number of student participations", detail: studentsVal },
      { id: "8", particular: "Number of faculty participations", detail: facultyVal },
      { id: "9", particular: "Number of external participations", detail: externalVal },
      { id: "10", particular: "Name of the Organizer", detail: organizerCellVal },
    ];

    const tableHeader = new TableRow({
      children: [
        new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "S. No", bold: true, size: 22 })] })] }),
        new TableCell({ width: { size: 45, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Particulars", bold: true, size: 22 })] })] }),
        new TableCell({ width: { size: 45, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Details", bold: true, size: 22 })] })] }),
      ]
    });

    const infoTableRows = eventInfoRows.map(row => 
      new TableRow({
        children: [
          new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: row.id, size: 22 })] })] }),
          new TableCell({ width: { size: 45, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: row.particular, size: 22 })] })] }),
          new TableCell({ width: { size: 45, type: WidthType.PERCENTAGE }, children: row.detail.split("\n").map(line => new Paragraph({ children: [new TextRun({ text: line, size: 22 })] })) }),
        ]
      })
    );

    wordParagraphs.push(
      new Paragraph({ space: { before: 300, after: 150 } }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [tableHeader, ...infoTableRows]
      })
    );

    // Fetch official logos directly from public/logos at report generation time
    let cmritBuffer = null;
    let iicBuffer = null;
    try {
      cmritBuffer = await fetchLogoBuffer("/logos/CMRIT NEW LOGO-1 (1).png");
      iicBuffer = await fetchLogoBuffer("/logos/image(616).png");
    } catch (e) {
      console.error("Error loading official header logos for DOCX:", e);
    }

    const cmritUint8 = cmritBuffer ? new Uint8Array(cmritBuffer) : null;
    const iicUint8 = iicBuffer ? new Uint8Array(iicBuffer) : null;

    const headerChildren = [];

    if (cmritUint8 || iicUint8) {
      const firstPageHeaderTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE }
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [
                  new Paragraph({
                    children: cmritUint8 ? [
                      new ImageRun({
                        data: cmritUint8,
                        transformation: { width: 110, height: 50 },
                        type: "png"
                      })
                    ] : []
                  })
                ]
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [
                  new Paragraph({
                    alignment: "right",
                    children: iicUint8 ? [
                      new ImageRun({
                        data: iicUint8,
                        transformation: { width: 110, height: 50 },
                        type: "png"
                      })
                    ] : []
                  })
                ]
              })
            ]
          })
        ]
      });

      headerChildren.push(firstPageHeaderTable);
    }

    // Always append a paragraph so <w:hdr> satisfies OpenXML schema requirement
    headerChildren.push(new Paragraph({ space: { after: 120 } }));

    const firstPageHeader = new Header({
      children: headerChildren
    });

    const defaultEmptyHeader = new Header({
      children: [new Paragraph({})]
    });

    const doc = new Document({
      sections: [{
        properties: {
          titlePage: true // Configure Word for Different First Page Header!
        },
        headers: {
          first: firstPageHeader,
          default: defaultEmptyHeader
        },
        children: wordParagraphs
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `AICTE_Report_${editableReport.title || 'event'}.docx`);
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
          <div className="space-y-8">
            {/* STEP 1: UPLOAD EVENT POSTER */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <span className="text-xs font-black tracking-widest text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200">Step 1</span>
                  <h2 className="text-2xl font-black text-gray-800 mt-2 flex items-center gap-2">
                    <span>🖼️</span> Upload Event Poster
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Upload an event poster (Image or PDF). OCR + AI Vision will automatically detect and extract all metadata.</p>
                </div>
              </div>

              {!posterExtracted && !extractingPoster && (
                <div 
                  className="border-3 border-dashed border-blue-300 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 rounded-2xl p-10 text-center cursor-pointer hover:border-blue-500 hover:shadow-lg transition group"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) handlePosterUpload(file);
                  }}
                  onClick={() => posterInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    accept="image/*,application/pdf" 
                    className="hidden" 
                    ref={posterInputRef} 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handlePosterUpload(file);
                    }} 
                  />
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition shadow-inner text-blue-600">
                    📤
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">Click or Drag & Drop Event Poster Here</h3>
                  <p className="text-xs text-gray-500 mb-3">Supports JPG, PNG, WEBP, or PDF event posters</p>
                  <span className="inline-block px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:from-blue-700 hover:to-indigo-700 transition">
                    Select Poster File
                  </span>
                </div>
              )}

              {extractingPoster && (
                <div className="border-2 border-blue-200 bg-blue-50/60 rounded-2xl p-10 text-center space-y-4 animate-pulse">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <h3 className="text-lg font-bold text-blue-900">🤖 AI Vision & OCR Extracting Metadata...</h3>
                  <p className="text-xs text-blue-600">Detecting Event Title, Date, Time, Venue, and Expert/Resource Person details...</p>
                </div>
              )}

              {posterExtracted && extractedDetails && (
                <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-200/80 rounded-2xl p-6 shadow-md space-y-5">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>
                      <span className="font-extrabold text-emerald-900 text-xs tracking-wide uppercase">✨ Automatically Extracted Metadata</span>
                    </div>
                    <button 
                      onClick={() => posterInputRef.current?.click()}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-white border border-emerald-300 px-3 py-1.5 rounded-lg shadow-sm hover:bg-emerald-50 transition flex items-center gap-1"
                    >
                      🔄 Re-upload Poster
                    </button>
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      className="hidden" 
                      ref={posterInputRef} 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handlePosterUpload(file);
                      }} 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {posterPreview && (
                      <div className="md:col-span-1">
                        <div className="rounded-xl overflow-hidden shadow border border-emerald-200 max-h-64 flex items-center justify-center bg-black/5">
                          <img src={posterPreview} alt="Uploaded Poster" className="w-full h-full object-contain" />
                        </div>
                      </div>
                    )}

                    <div className={`${posterPreview ? "md:col-span-2" : "md:col-span-3"} space-y-3 text-xs`}>
                      <div>
                        <label className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block mb-0.5">Event Title</label>
                        <div className="text-sm font-black text-gray-900 bg-white/90 p-3 rounded-xl border border-emerald-100 shadow-sm leading-snug">
                          {extractedDetails.title}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block mb-0.5">Date</label>
                          <div className="font-bold text-gray-800 bg-white/90 p-2.5 rounded-xl border border-emerald-100">
                            📅 {extractedDetails.dateFormatted}
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block mb-0.5">Time</label>
                          <div className="font-bold text-gray-800 bg-white/90 p-2.5 rounded-xl border border-emerald-100">
                            ⏰ {extractedDetails.startTime} {extractedDetails.endTime !== "N/A" ? `– ${extractedDetails.endTime}` : ""}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block mb-0.5">Complete Venue</label>
                        <div className="font-medium text-gray-800 bg-white/90 p-2.5 rounded-xl border border-emerald-100 leading-relaxed text-xs">
                          📍 {extractedDetails.venue}
                        </div>
                      </div>

                      <div className="bg-white/95 p-3.5 rounded-xl border border-emerald-200 space-y-0.5">
                        <label className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider block mb-1">👨‍🏫 Expert / Resource Person</label>
                        <p className="font-bold text-gray-900 text-xs">{extractedDetails.speakerName}</p>
                        <p className="text-[11px] font-semibold text-emerald-700">{extractedDetails.speakerDesignation}</p>
                        <p className="text-[11px] text-gray-600">{extractedDetails.speakerOrganization}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: ADDITIONAL EVENT METADATA */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-50 space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <span className="text-xs font-black tracking-widest text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200">Step 2</span>
                  <h2 className="text-xl font-bold text-gray-800 mt-2">Additional Event Details</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Fill in event parameters and context for AI report generation.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1">Mode (Offline / Online / Hybrid)</label>
                  <select name="mode" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition text-sm bg-white font-medium" value={form.mode} onChange={handleChange}>
                    <option value="Offline">Offline</option>
                    <option value="Online">Online</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1">Activity Category</label>
                  <select name="category" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition text-sm bg-white font-medium" value={form.category} onChange={handleChange}>
                    <option value="IIC Calendar Activity">IIC Calendar Activity</option>
                    <option value="MIC Driven Activity">MIC Driven Activity</option>
                    <option value="Self Driven Activity">Self Driven Activity</option>
                    <option value="Celebration Activity">Celebration Activity</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1">Activity Led By</label>
                  <select name="faculty" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition text-sm bg-white font-medium" value={form.faculty} onChange={handleChange}>
                    <option value="Institute Council">Institute Council</option>
                    <option value="Student Council">Student Council</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1">Theme</label>
                  <select
                    name="theme"
                    className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition text-sm bg-white font-medium"
                    value={form.theme}
                    onChange={handleChange}
                  >
                    <option value="IPR & Technology Transfer">IPR & Technology Transfer</option>
                    <option value="Innovation & Design Thinking">Innovation & Design Thinking</option>
                    <option value="Entrepreneurship & Startup">Entrepreneurship & Startup</option>
                    <option value="Pre-Incubation & Incubation Management">Pre-Incubation & Incubation Management</option>
                    <option value="Safe and Trusted AI">Safe and Trusted AI</option>
                    <option value="Human Capital">Human Capital</option>
                    <option value="Science">Science</option>
                    <option value="Resilience, Innovation & Efficiency">Resilience, Innovation & Efficiency</option>
                    <option value="Inclusion for Social Empowerment">Inclusion for Social Empowerment</option>
                    <option value="Democratizing AI Resources">Democratizing AI Resources</option>
                    <option value="Economic Growth & Social Good">Economic Growth & Social Good</option>
                  </select>
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1">Number of Participants</label>
                  <input name="participants" type="number" placeholder="e.g. 120" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition text-sm font-medium" value={form.participants} onChange={handleChange} />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase mb-1">Brief Description of the Activity (Faculty Entered)</label>
                <textarea name="description" placeholder="Enter the event brief description. This exact text will be inserted into the final report without any AI modifications or rewrites." className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition h-28 text-sm font-medium" value={form.description} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1">Key Outputs / Measurable Parameters (Manually Written)</label>
                  <textarea name="keyOutputs" placeholder="e.g. No. of functional prototypes developed/tested: 10&#10;1. Interview problem solving platform...&#10;2. Voice to Text Converter..." className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition h-28 text-sm font-medium" value={form.keyOutputs} onChange={handleChange} />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1">KPIs (with Quantified Metrics) (Manually Written)</label>
                  <textarea name="kpis" placeholder="e.g. ≥5 functional prototypes developed, Deposited/Updated in YUKTI Innovation Repository:&#10;Yes. All the above 10 prototypes will be submitted..." className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition h-28 text-sm font-medium" value={form.kpis} onChange={handleChange} />
                </div>
              </div>
              
              {/* STEP 3: SUPPORTING DOCUMENTS */}
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-indigo-50 space-y-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <span className="text-xs font-black tracking-widest text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">Step 3</span>
                    <h2 className="text-xl font-bold text-gray-800 mt-2">Supporting Documents & Attachments</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Upload scanned attendance sheets, feedback screenshot, feedback link, video link, and social media URLs.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* A. Event Poster (Mandatory) */}
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-blue-900 uppercase tracking-wider block">A. Event Poster *</label>
                      <p className="text-xs text-gray-500 mt-0.5">{actualPosterFile ? actualPosterFile.name : "Uploaded in Step 1 (Mandatory)"}</p>
                    </div>
                    <button onClick={() => posterInputRef.current?.click()} className="text-xs font-bold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                      {actualPosterFile ? "Change Poster" : "Upload Poster"}
                    </button>
                  </div>

                  {/* B. Event Photos Collage Upload */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">B. Event Photos (for Photo Collage)</label>
                    <div 
                      className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl p-5 text-center cursor-pointer hover:bg-blue-50 transition"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoChange} />
                      <div className="text-3xl mb-1">📸</div>
                      <p className="font-bold text-blue-900 text-sm">Click or drag event photos here</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Automatically generates photo collage for the report</p>
                    </div>
                    {photoPreviews.length > 0 && (
                      <div className="grid grid-cols-4 gap-3 mt-3">
                        {photoPreviews.map((src, i) => (
                          <div key={i} className="relative group rounded-lg overflow-hidden shadow-sm aspect-square border">
                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                            <button onClick={(e) => { e.stopPropagation(); removePhoto(i); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* C. Attendance Sheets Upload */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">C. Attendance Sheets (Multiple Scanned Images)</label>
                    <div 
                      className="border-2 border-dashed border-emerald-200 bg-emerald-50/30 rounded-xl p-5 text-center cursor-pointer hover:bg-emerald-50 transition"
                      onClick={() => attendanceInputRef.current?.click()}
                    >
                      <input type="file" multiple accept="image/*" className="hidden" ref={attendanceInputRef} onChange={handleAttendanceChange} />
                      <div className="text-3xl mb-1">📋</div>
                      <p className="font-bold text-emerald-900 text-sm">Click to upload scanned attendance sheets</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Inserted sequentially under Attendance Details section</p>
                    </div>
                    {attendancePreviews.length > 0 && (
                      <div className="grid grid-cols-4 gap-3 mt-3">
                        {attendancePreviews.map((src, i) => (
                          <div key={i} className="relative group rounded-lg overflow-hidden shadow-sm aspect-square border border-emerald-200">
                            <img src={src} alt="Attendance Sheet Preview" className="w-full h-full object-cover" />
                            <button onClick={(e) => { e.stopPropagation(); removeAttendance(i); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* D, E & Registration Link */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">D. Feedback Screenshot</label>
                      <div className="border border-gray-300 p-3 rounded-xl flex items-center justify-between bg-white">
                        <input type="file" accept="image/*" className="hidden" ref={feedbackScreenshotInputRef} onChange={handleFeedbackScreenshotChange} />
                        <span className="text-xs text-gray-600 truncate max-w-[140px]">{feedbackScreenshotFile ? feedbackScreenshotFile.name : "No file selected"}</span>
                        {feedbackScreenshotPreview ? (
                          <button onClick={removeFeedbackScreenshot} className="text-xs text-red-600 font-bold hover:underline">Remove</button>
                        ) : (
                          <button onClick={() => feedbackScreenshotInputRef.current?.click()} className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition">Upload SS</button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">E. Feedback Link (URL)</label>
                      <input name="feedbackLink" placeholder="https://forms.gle/..." className="border border-gray-300 p-2.5 rounded-xl w-full text-sm outline-none focus:ring-2 focus:ring-blue-400 transition" value={form.feedbackLink} onChange={handleChange} />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Registration Link (URL)</label>
                      <input name="registrationLink" placeholder="Registration Form URL" className="border border-gray-300 p-2.5 rounded-xl w-full text-sm outline-none focus:ring-2 focus:ring-blue-400 transition" value={form.registrationLink} onChange={handleChange} />
                    </div>
                  </div>

                  {/* F. Social Media & Video Links */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">F. Social Media & Video Links (Optional URLs)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input name="twitterUrl" placeholder="Twitter / X URL" className="border border-gray-300 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 transition" value={form.twitterUrl} onChange={handleChange} />
                      <input name="facebookUrl" placeholder="Facebook URL" className="border border-gray-300 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 transition" value={form.facebookUrl} onChange={handleChange} />
                      <input name="instagramUrl" placeholder="Instagram URL" className="border border-gray-300 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 transition" value={form.instagramUrl} onChange={handleChange} />
                      <input name="linkedInUrl" placeholder="LinkedIn URL" className="border border-gray-300 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 transition" value={form.linkedInUrl} onChange={handleChange} />
                      <input name="videoUrl" placeholder="Video URL (Google Drive Link)" className="border border-gray-300 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 transition md:col-span-2" value={form.videoUrl} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 4: ADDITIONAL EVENT INFORMATION */}
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-purple-50 space-y-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <span className="text-xs font-black tracking-widest text-purple-600 uppercase bg-purple-50 px-3 py-1 rounded-full border border-purple-200">Step 4</span>
                    <h2 className="text-xl font-bold text-gray-800 mt-2">Additional Event Information</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Collect details to populate the final Event Information Table at the end of the report.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1">Resource Person Contact Number</label>
                    <input name="speakerMobile" placeholder="e.g. 8888495888" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-purple-400 outline-none transition text-sm font-medium" value={form.speakerMobile} onChange={handleChange} />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1">Resource Person Email / LinkedIn</label>
                    <input name="speakerEmailOrLinkedIn" placeholder="e.g. https://linkedin.com/in/... or email" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-purple-400 outline-none transition text-sm font-medium" value={form.speakerEmailOrLinkedIn} onChange={handleChange} />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1">Number of Student Participants</label>
                    <input name="studentParticipants" type="number" placeholder="e.g. 67" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-purple-400 outline-none transition text-sm font-medium" value={form.studentParticipants} onChange={handleChange} />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1">Number of Faculty Participants</label>
                    <input name="facultyParticipants" type="number" placeholder="e.g. 3" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-purple-400 outline-none transition text-sm font-medium" value={form.facultyParticipants} onChange={handleChange} />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1">Number of External Participants</label>
                    <input name="externalParticipants" type="number" placeholder="e.g. 0" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-purple-400 outline-none transition text-sm font-medium" value={form.externalParticipants} onChange={handleChange} />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1">Organizer Name</label>
                    <input name="organizerName" placeholder="e.g. Dr. S. Seetha" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-purple-400 outline-none transition text-sm font-medium" value={form.organizerName} onChange={handleChange} />
                  </div>

                  <div className="flex flex-col md:col-span-2">
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1">Organizer Contact Number</label>
                    <input name="organizerMobile" placeholder="e.g. 7708406505" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-purple-400 outline-none transition text-sm font-medium" value={form.organizerMobile} onChange={handleChange} />
                  </div>
                </div>

                <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 space-y-1 text-xs text-purple-900">
                  <p className="font-extrabold flex items-center gap-1.5"><span>⚡</span> Auto-Filled Details in Event Information Table:</p>
                  <p>• <strong>Name of Resource Person & Designation:</strong> Auto-extracted from poster</p>
                  <p>• <strong>Date of Event:</strong> Auto-extracted from poster</p>
                  <p>• <strong>Duration in mins:</strong> Auto-calculated ({calculateDurationInMinutes(form.startTime, form.endTime)})</p>
                </div>
              </div>

              <button onClick={generateReport} disabled={loading} className={`${loading ? "bg-gray-400" : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"} text-white px-8 py-4 rounded-xl font-bold text-lg w-full flex justify-center items-center gap-3 transition shadow-lg mt-6`}>
                {loading ? (loadingText || "AI is Structuring Report...") : "Generate Final AICTE Report & Table"}
              </button>
            </div>
          </div>
        )}

        {/* EDITABLE PREVIEW MODE */}
        {editableReport && (
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 space-y-8 animate-fade-in relative">
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl tracking-wider">
              EDITABLE PREVIEW (OFFICIAL IIC FORMAT)
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-6 gap-6">
              <div>
                <h2 className="text-3xl font-black text-gray-800">Review & Fine-Tune Report</h2>
                <p className="text-gray-500 mt-1">Official section sequence without tables. Make any final edits before exporting.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {reportData?.collageUrl && (
                  <button onClick={downloadCollage} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition shadow-sm px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm">
                    🖼️ Collage
                  </button>
                )}
                <button onClick={downloadWord} className="bg-blue-600 hover:bg-blue-700 transition shadow-lg text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm">
                  📝 Export Word (.docx)
                </button>
                <button onClick={downloadPDF} className="bg-green-600 hover:bg-green-700 transition shadow-lg text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm">
                  📄 Export PDF
                </button>
              </div>
            </div>

            {/* SEQUENTIAL OFFICIAL SECTIONS */}
            <div className="space-y-6">
              {getOfficialSections(editableReport).map((sec) => (
                <div key={sec.key} className="bg-gray-50/60 p-5 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                      <span>🔹</span> {sec.title}
                    </label>
                    {sec.isAI ? (
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded">AI Generated</span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Extracted / Form Data</span>
                    )}
                  </div>

                  {["objective", "generatedSummary", "highlights", "outcomes", "feedback", "speakerDetails"].includes(sec.key) ? (
                    <textarea 
                      name={sec.key === "speakerDetails" ? "speakerDetails" : sec.key} 
                      value={editableReport[sec.key] || sec.content} 
                      onChange={handleEditableChange} 
                      className={`border p-3.5 rounded-xl w-full text-sm font-medium leading-relaxed outline-none focus:ring-2 focus:ring-blue-400 transition bg-white ${sec.key === "generatedSummary" ? "h-40" : "h-28"}`} 
                    />
                  ) : (
                    <input 
                      name={sec.key} 
                      value={editableReport[sec.key] !== undefined ? editableReport[sec.key] : sec.content} 
                      onChange={handleEditableChange} 
                      className="border border-gray-300 p-3 rounded-xl w-full text-sm font-bold text-gray-800 bg-white focus:ring-2 focus:ring-blue-400 outline-none transition" 
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <button onClick={() => setEditableReport(null)} className="text-gray-500 hover:text-gray-800 text-sm font-bold flex items-center gap-1 transition">
                ← Back to Source Form
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default GenerateReport;