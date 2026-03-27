import React, { useState } from 'react';
import { uthmEvents } from './calendarData';
import { FaDownload, FaWhatsapp } from 'react-icons/fa';
import './App.css';

const App = () => {

  const handleWhatsAppShare = () => {
    const message = "Check out UTHM Academic Calendar 📅✨";
    const url = window.location.href;

    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message + " " + url)}`;

    const win = window.open(whatsappURL, '_blank');
    if (!win) {
      alert("Popup blocked! Please allow popups to share.");
    }
  };
  const [activeSem, setActiveSem] = useState(1);

  // Group A (Johor): 5 = Jumaat, 6 = Sabtu
  const isJohorWeekend = (day) => day === 5 || day === 6;

  const renderMonth = (month, year) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthName = new Date(year, month).toLocaleString('ms-MY', { month: 'long' });

    // Monday start offset: 0=Isnin, 6=Ahad
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    
    let tiles = [];
    for (let i = 0; i < offset; i++) tiles.push(<div key={`e-${i}`} className="tile empty" />);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = dateObj.toISOString().split('T')[0];
      const events = uthmEvents.filter(e => dateStr >= e.start && dateStr <= (e.end || e.start));

      tiles.push(
        <div key={d} className={`tile ${isJohorWeekend(dateObj.getDay()) ? 'weekend' : ''}`}>
          <span className="day-num">{d}</span>
          <div className="dots">
            {events.map((ev, i) => (
              <span key={i} className={`dot ${ev.extendedProps.category}`} title={ev.title} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="month-card" key={`${month}-${year}`}>
        <h3>{monthName} {year}</h3>
        <div className="days-header">
          {['Is', 'Se', 'Ra', 'Kh', 'Ju', 'Sa', 'Ah'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="days-grid">{tiles}</div>
      </div>
    );
  };

  return (
    <div className="app-dark">
      <header className="hero">
        <div className="year-pill">2025 / 2026</div>
        <h1>Bila <span>UTHM</span> Cuti?</h1>
        
        <div className="toggle-group">
          <button className={activeSem === 1 ? 'active' : ''} onClick={() => setActiveSem(1)}>Sem I</button>
          <button className={activeSem === 2 ? 'active' : ''} onClick={() => setActiveSem(2)}>Sem II</button>
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

      <div className="fab-container">
        <button 
          className="fab whatsapp" title="Share on WhatsApp"
          onClick={handleWhatsAppShare}
        >
          <FaWhatsapp />
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