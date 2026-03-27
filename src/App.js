import React, { useState, useEffect } from "react";
import { uthmEvents } from "./calendarData";
import { FaDownload, FaWhatsapp, FaTh, FaList } from "react-icons/fa";
import html2canvas from "html2canvas";
import "./App.css";

const App = () => {
  const [activeSem, setActiveSem] = useState(1);
  const [view, setView] = useState("calendar");
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(true);
  const [currentWeek, setCurrentWeek] = useState([]);

  const today = new Date();

  // Calculate current week dates
  useEffect(() => {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday start
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      week.push(d.toISOString().split("T")[0]);
    }
    setCurrentWeek(week);
  }, [today]);

  const handleWhatsAppShare = () => {
    const message = "Check out UTHM Academic Calendar 📅✨";
    const url = window.location.href;
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message + " " + url)}`;
    const win = window.open(whatsappURL, "_blank");
    if (!win) alert("Popup blocked! Please allow popups.");
  };

  const handleDownloadImage = () => {
    html2canvas(document.querySelector(".calendar-container")).then((canvas) => {
      const link = document.createElement("a");
      link.download = "uthm-calendar.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const isJohorWeekend = (day) => day === 5 || day === 6;

  const filteredEvents = (dateStr) =>
    uthmEvents
      .filter((e) => dateStr >= e.start && dateStr <= (e.end || e.start))
      .filter((e) => e.title.toLowerCase().includes(search.toLowerCase()))
      .filter((e) => filter === "all" || e.extendedProps.category === filter);

  const renderMonth = (month, year) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthName = new Date(year, month).toLocaleString("ms-MY", { month: "long" });
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const tiles = [];

    for (let i = 0; i < offset; i++) tiles.push(<div key={`empty-${i}`} className="tile empty" />);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = dateObj.toISOString().split("T")[0];
      const events = filteredEvents(dateStr);

      const isThisWeek = currentWeek.includes(dateStr);
      const tileClass = `tile ${isJohorWeekend(dateObj.getDay()) ? "weekend" : ""} ${
        dateStr === today.toISOString().split("T")[0] ? "today" : ""
      } ${isThisWeek ? "current-week" : ""}`;

      tiles.push(
        <div
          key={d}
          className={tileClass}
          draggable={events.length > 0}
          onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify(events))}
          onClick={() => events.length > 0 && (setSelectedEvents(events), setShowModal(true))}
        >
          <span className="day-num">{d}</span>
          <div className="dots">
            {events.map((ev, i) => (
              <span key={i} className={`dot ${ev.extendedProps.category}`} title={ev.title}></span>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="month-card" key={`${month}-${year}`}>
        <h3>{monthName} {year}</h3>
        <div className="days-header">
          {["Is", "Se", "Ra", "Kh", "Ju", "Sa", "Ah"].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="days-grid">{tiles}</div>
      </div>
    );
  };

  const renderListView = () => {
    const events = uthmEvents
      .filter((e) => e.title.toLowerCase().includes(search.toLowerCase()))
      .filter((e) => filter === "all" || e.extendedProps.category === filter)
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    return (
      <div className="list-view">
        {events.map((ev, i) => (
          <div key={i} className={`list-item ${ev.extendedProps.category}`}>
            <strong>{ev.title}</strong>
            <p>{ev.start} {ev.end ? `- ${ev.end}` : ""}</p>
          </div>
        ))}
      </div>
    );
  };

  const nextBreak = uthmEvents
    .filter((e) => e.extendedProps.category === "break" && e.start >= today.toISOString().split("T")[0])
    .sort((a, b) => new Date(a.start) - new Date(b.start))[0];

  return (
    <div className={darkMode ? "app-dark glass" : "app-light glass"}>
      <header className="hero">
        <div className="year-pill">2025 / 2026</div>
        <h1>Bila <span>UTHM</span> Cuti?</h1>

        <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
          {darkMode ? "🌙" : "☀️"}
        </button>

        <div className="top-controls">
          <input type="text" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="lecture">Kuliah</option>
            <option value="exam">Periksa</option>
            <option value="break">Cuti</option>
          </select>
          <button onClick={() => setView(view === "calendar" ? "list" : "calendar")}>
            {view === "calendar" ? <FaList /> : <FaTh />}
          </button>
        </div>

        {nextBreak && <p className="ai-hint">Next break: {nextBreak.title} on {nextBreak.start}</p>}

        <div className="toggle-group">
          <button className={activeSem === 1 ? "active" : ""} onClick={() => setActiveSem(1)}>Sem I</button>
          <button className={activeSem === 2 ? "active" : ""} onClick={() => setActiveSem(2)}>Sem II</button>
        </div>
      </header>

      <div className="calendar-container">
        {view === "calendar"
          ? activeSem === 1
            ? [8, 9, 10, 11, 0, 1].map((m) => renderMonth(m, m >= 8 ? 2025 : 2026))
            : [2, 3, 4, 5, 6].map((m) => renderMonth(m, 2026))
          : renderListView()}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Events</h2>
            {selectedEvents.map((ev, i) => (
              <div key={i}>
                <strong>{ev.title}</strong>
                <p>{ev.start} {ev.end ? `- ${ev.end}` : ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fab-container">
        <button className="fab whatsapp" onClick={handleWhatsAppShare}> <FaWhatsapp /> </button>
        <button className="fab" onClick={handleDownloadImage}> 📤 </button>
        <button className="fab" onClick={() => window.open("/Kalendar_Akademik_BM-01.pdf", "_blank")}> <FaDownload /> </button>
      </div>
    </div>
  );
};

export default App;