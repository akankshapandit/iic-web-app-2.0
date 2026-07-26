import { Routes, Route } from "react-router-dom";

import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import GenerateReport from "../pages/Reports/GenerateReport";
import Home from "../pages/Home/Home";
import FinalAuditPage from "../pages/FinalAuditPage";

// New page imports
import Achievements from "../pages/Achievements/Achievements";
import IECell from "../pages/IECell/IECell";
import Incubation from "../pages/Incubation/Incubation";
import EventCalendar from "../pages/Events/EventCalendar";
import EventArchive from "../pages/Events/EventArchive";
import IPRCell from "../pages/IPRCell/IPRCell";
import IPRActivities from "../pages/IPRCell/IPRActivities";
import IPRCellMembers from "../pages/IPRCell/IPRCellMembers";
import StudentStartUps from "../pages/Startups/StudentStartUps";
import FacultyStartups from "../pages/Startups/FacultyStartups";
import Members from "../pages/Members/Members";
import KSCSTIPCellReport from "../pages/IPRCell/KSCSTIPCellReport";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/generate-report" element={<GenerateReport />} />
      <Route path="/final-audit" element={<FinalAuditPage />} />

      {/* New Routes */}
      <Route path="/achievements" element={<Achievements />} />
      <Route path="/ie-cell" element={<IECell />} />
      <Route path="/incubation" element={<Incubation />} />
      <Route path="/events/calendar" element={<EventCalendar />} />
      <Route path="/events/archive" element={<EventArchive />} />
      <Route path="/patents" element={<IPRCell />} />
      <Route path="/startups" element={<StudentStartUps />} />
      <Route path="/faculty-startups" element={<FacultyStartups />} />
      <Route path="/members" element={<Members />} />
      <Route path="/ipr-members" element={<IPRCellMembers />} />
      <Route path="/ipr-reports" element={<KSCSTIPCellReport />} />
      <Route path="/ipr-activities" element={<IPRActivities />} />
    </Routes>
  );
}

export default AppRoutes;