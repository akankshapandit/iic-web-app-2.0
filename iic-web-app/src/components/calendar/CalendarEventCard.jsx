eventContent={(eventInfo) => {
  return (
    <div className="event-card w-full h-full px-2 py-2 rounded-lg bg-white/10 backdrop-blur-md shadow-md transition-all duration-200">

      <div className="event-title text-[12px] font-bold text-white truncate">
        {eventInfo.event.title}
      </div>

      <div className="event-department text-[10px] text-gray-200 truncate">
        {eventInfo.event.extendedProps.department}
      </div>

      <div className="flex items-center gap-1 mt-1 text-[11px]">
        <span className="text-lg">👨‍🏫</span>
        <span className="event-faculty text-gray-100 truncate">
          {eventInfo.event.extendedProps.faculty}
        </span>
      </div>

    </div>
  );
}}