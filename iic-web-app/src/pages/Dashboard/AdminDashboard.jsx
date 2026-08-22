import React, { useState, useEffect } from "react";
import DashboardStats from "../../components/dashboard/DashboardStats";
import { API_BASE_URL } from "../../config";

function AdminDashboard() {
  const [notifications, setNotifications] = useState({
    pending: [],
    sent: [],
    upcoming: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/events/dashboard-stats`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const renderNotificationCard = (event, type) => {
    let bgColor = "bg-white";
    let borderColor = "border-gray-200";
    let icon = "🔔";

    if (type === "pending") {
      bgColor = "bg-orange-50";
      borderColor = "border-orange-200";
      icon = "🔴";
    } else if (type === "sent") {
      bgColor = "bg-green-50";
      borderColor = "border-green-200";
      icon = "✅";
    } else if (type === "upcoming") {
      bgColor = "bg-blue-50";
      borderColor = "border-blue-200";
      icon = "📅";
    }

    return (
      <div key={event._id} className={`${bgColor} border ${borderColor} rounded-xl p-4 shadow-sm hover:shadow-md transition flex gap-4 items-start`}>
        <div className="text-2xl">{icon}</div>
        <div>
          <h4 className="font-semibold text-gray-800">{event.title}</h4>
          <p className="text-sm text-gray-600 mb-1">
            {new Date(event.date).toLocaleDateString()} &middot; {event.venue}
          </p>
          <div className="text-xs px-2 py-1 bg-white/60 rounded-full inline-block border border-black/5 text-gray-700 mt-2">
            👨‍🏫 {event.facultyName}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
        <DashboardStats />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <span>📢</span> Reminders & Notifications
        </h2>

        {loading ? (
          <div className="text-gray-500 font-medium">Loading notifications...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Pending Reminders */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-orange-600 border-b pb-2">Pending (Auto-Reminder Enabled)</h3>
              {notifications.pending.length > 0 ? (
                notifications.pending.map((evt) => renderNotificationCard(evt, "pending"))
              ) : (
                <p className="text-sm text-gray-500 italic">No pending reminders.</p>
              )}
            </div>

            {/* Upcoming Reminders */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-600 border-b pb-2">Upcoming (June/July)</h3>
              {notifications.upcoming.length > 0 ? (
                notifications.upcoming.map((evt) => renderNotificationCard(evt, "upcoming"))
              ) : (
                <p className="text-sm text-gray-500 italic">No upcoming reminders.</p>
              )}
            </div>

            {/* Sent Reminders */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-600 border-b pb-2">Recently Sent</h3>
              {notifications.sent.length > 0 ? (
                notifications.sent.slice(0, 5).map((evt) => renderNotificationCard(evt, "sent")) // Show only top 5 sent
              ) : (
                <p className="text-sm text-gray-500 italic">No sent reminders yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
