import React, { useState } from 'react';
import { uthmEvents } from './calendarData';
import { FaDownload, FaWhatsapp } from 'react-icons/fa';
import html2canvas from "html2canvas";
import './App.css';

const App = () => {

  // STATES
  const [activeSem, setActiveSem] = useState(1);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  // WHATSAPP SHARE
  const handleWhatsAppShare = () => {
    const message = "Check out UTHM Academic Calendar 📅✨";
    const url = window.location.href;

    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message + " " + url)}`;
    const win = window.open(whatsappURL, '_blank');

    if (!win) alert("Popup blocked! Please allow popups.");
  };

  // DOWNLOAD IMAGE
  const handleDownloadImage = () => {
    const element = document.querySelector(".calendar-gallery");

    html2canvas(element).then(canvas => {
      const link = document.createElement("a");
      link.download = "uthm-calendar.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  // JOHOR WEEKEND
  const isJohorWeekend = (day) => day === 5 || day === 6;

  const today = new Date().toISOString().split('T')[0];

  const renderMonth = (month, year) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthName = new Date(year, month).toLocaleString('ms-MY', { month: 'long' });

    const offset = firstDay === 0 ? 6 : firstDay - 1;
    
    let tiles = [];

    for (let i = 0; i < offset; i++) {
      tiles.push(<div key={`e-${i}`} className="tile empty" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = dateObj.toISOString().split('T')[0];

      const events = uthmEvents
        .filter(e => dateStr >= e.start && dateStr <= (e.end || e.start))
        .filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

      tiles.push(
        <div 
          key={d} 
          className={`tile 
            ${isJohorWeekend(dateObj.getDay()) ? 'weekend' : ''} 
            ${dateStr === today ? 'today' : ''}
          `}
          onClick={() => {
            if (events.length > 0) {
              setSelectedEvents(events);
              setShowModal(true);
            }
          }}
        >
          <span className="day-num">{d}</span>

          <div className="dots">
            {events.map((ev, i) => (
              <span 
                key={i} 
                className={`dot ${ev.extendedProps.category}`} 
                title={ev.title} 
              />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="month-card" key={`${month}-${year}`}>
        <h3>{monthName} {year}</h3>

        <div className="days-header">
          {['Is', 'Se', 'Ra', 'Kh', 'Ju', 'Sa', 'Ah'].map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="days-grid">{tiles}</div>
      </div>
    );
  };

  return (
    <div className={darkMode ? "app-dark" : "app-light"}>

      <header className="hero">
        <div className="year-pill">2025 / 2026</div>

        <h1>Bila <span>UTHM</span> Cuti?</h1>

        {/* DARK MODE */}
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌙" : "☀️"}
        </button>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search"
        />

        <div className="toggle-group">
          <button 
            className={activeSem === 1 ? 'active' : ''} 
            onClick={() => setActiveSem(1)}
          >
            Sem I
          </button>

          <button 
            className={activeSem === 2 ? 'active' : ''} 
            onClick={() => setActiveSem(2)}
          >
            Sem II
          </button>
        </div>

        <div className="legend">
          <div className="item"><span className="dot lecture" /> Kuliah</div>
          <div className="item"><span className="dot exam" /> Periksa</div>
          <div className="item"><span className="dot break" /> Cuti</div>
        </div>
      </header>

      <div className="calendar-gallery">
        {activeSem === 1 
          ? [8, 9, 10, 11, 0, 1].map(m => renderMonth(m, m >= 8 ? 2025 : 2026)) 
          : [2, 3, 4, 5, 6].map(m => renderMonth(m, 2026))
        }
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Events</h2>

            {selectedEvents.map((ev, i) => (
              <div key={i}>
                <strong>{ev.title}</strong>
                <p>{ev.start}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FLOATING BUTTONS */}
      <div className="fab-container">

        <button 
          className="fab whatsapp"
          onClick={handleWhatsAppShare}
        >
          <FaWhatsapp />
        </button>

        <button 
          className="fab"
          onClick={handleDownloadImage}
        >
          📤
        </button>

        <button 
          className="fab"
          onClick={() => window.open('/Kalendar_Akademik_BM-01.pdf', '_blank')}
        >
          <FaDownload />
        </button>

      </div>

    </div>
  );
};

export default App;