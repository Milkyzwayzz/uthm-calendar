import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { uthmEvents } from './calendarData';
import { 
  FaSun, FaMoon, FaPlus, FaList, FaCalendarAlt, FaFilter, 
  FaSearch, FaBell, FaCog, FaQuestionCircle, FaCheckCircle,
  FaTimesCircle, FaEdit, FaTrash, FaSave, FaExclamationTriangle
} from 'react-icons/fa';
import './App.css';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // calendar, list
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState(uthmEvents);
  const [activeFilters, setActiveFilters] = useState({
    lectures: true,
    exams: true,
    breaks: true,
    holidays: true,
    custom: true
  });
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'custom' });
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const calendarRef = useRef(null);

  // Dark mode toggle
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // Filter events based on active filters
  useEffect(() => {
    const filtered = uthmEvents.filter(event => {
      if (!activeFilters.lectures && event.extendedProps?.category === 'lecture') return false;
      if (!activeFilters.exams && event.extendedProps?.category === 'exam') return false;
      if (!activeFilters.breaks && event.extendedProps?.category === 'break') return false;
      if (!activeFilters.holidays && event.extendedProps?.category === 'holiday') return false;
      if (!activeFilters.custom && event.extendedProps?.category === 'custom') return false;
      return true;
    });
    setFilteredEvents(filtered);
  }, [activeFilters]);

  // AI Chat responses
  const getAIResponse = (question) => {
    const lowerQuestion = question.toLowerCase();
    const responses = {
      sem1: "Semester 1 (2025/2026) runs from **1 March 2025 to 27 June 2025**. There are 3 breaks:\n• Mid-Sem Break: 14-18 April 2025 (5 days)\n• Study Week: 23-27 June 2025\n• Semester Break: 28 June - 31 August 2025",
      sem2: "Semester 2 runs from **1 September 2025 to 13 February 2026**. Breaks include:\n• Mid-Sem Break: 27-31 October 2025\n• Revision Week: 2-6 February 2026\n• Chinese New Year Break: 17-27 January 2026",
      breaks: "Breaks are scheduled for student rest and preparation:\n• **Mid-Sem Breaks**: 1 week for assignments/review\n• **Study/Revision Weeks**: Exam preparation\n• **Semester Breaks**: 8-12 weeks for holidays/rest",
      exams: "Final exams are held after revision weeks:\n• Sem 1: 30 June - 11 July 2025\n• Sem 2: 9-20 February 2026\nCheck individual faculty schedules for exact times."
    };

    if (lowerQuestion.includes('sem 1') || lowerQuestion.includes('semester 1')) return responses.sem1;
    if (lowerQuestion.includes('sem 2') || lowerQuestion.includes('semester 2')) return responses.sem2;
    if (lowerQuestion.includes('break')) return responses.breaks;
    if (lowerQuestion.includes('exam')) return responses.exams;
    
    return "Great question! Ask me about semester dates, breaks, exams, or holidays. For example: 'When is Sem 1 break?'";
  };

  const handleAIQuestion = () => {
    if (!aiInput.trim()) return;
    
    const userMessage = { type: 'user', text: aiInput, time: new Date() };
    const aiResponse = { 
      type: 'ai', 
      text: getAIResponse(aiInput), 
      time: new Date() 
    };
    
    setAiMessages(prev => [...prev, userMessage, aiResponse]);
    setAiInput('');
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    
    const event = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: newEvent.date,
      extendedProps: { category: 'custom' }
    };
    
    setFilteredEvents(prev => [...prev, event]);
    setShowAddModal(false);
    setNewEvent({ title: '', date: '', type: 'custom' });
  };

  const deleteEvent = (eventId) => {
    setFilteredEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const toggleFilter = (filter) => {
    setActiveFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const getCountdown = (targetDate) => {
    const now = new Date();
    const diff = new Date(targetDate) - now;
    if (diff < 0) return 'Past';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} days`;
  };

  const listViewEvents = filteredEvents
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 10);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>
            <FaCalendarAlt /> UTHM Academic Calendar 2025/2026
          </h1>
          <div className="indicators">
            <div className="indicator active">
              <FaCheckCircle /> Lectures: {filteredEvents.filter(e => e.extendedProps?.category === 'lecture').length}
            </div>
            <div className="indicator">
              <FaExclamationTriangle /> Exams: {filteredEvents.filter(e => e.extendedProps?.category === 'exam').length}
            </div>
            <div className="indicator">
              <FaSun /> Next Break: {getCountdown('2025-04-14')}
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <button className="icon-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button className="icon-btn secondary" onClick={() => setShowFilters(!showFilters)}>
            <FaFilter />
          </button>
          <button className="icon-btn primary" onClick={() => setShowAddModal(true)}>
            <FaPlus />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        {/* View Toggle */}
        <div className="view-toggle">
          <button 
            className={viewMode === 'calendar' ? 'active' : ''}
            onClick={() => setViewMode('calendar')}
          >
            <FaCalendarAlt /> Calendar
          </button>
          <button 
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            <FaList /> List
          </button>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="calendar-container">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={filteredEvents}
              eventDisplay="block"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,listWeek'
              }}
              height="70vh"
              eventContent={(arg) => (
                <div className={`event-badge ${arg.event.extendedProps?.category}`}>
                  <strong>{arg.event.title}</strong>
                </div>
              )}
              dayMaxEvents={3}
            />
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="list-container">
            <div className="list-header">
              <FaSearch /> Upcoming Events
            </div>
            {listViewEvents.map(event => (
              <div key={event.id} className={`list-item ${event.extendedProps?.category}`}>
                <div className="list-date">
                  {new Date(event.date).toLocaleDateString('en-MY', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="list-content">
                  <h4>{event.title}</h4>
                  <span className="category">{event.extendedProps?.category?.toUpperCase()}</span>
                </div>
                {event.extendedProps?.category === 'custom' && (
                  <button 
                    className="delete-btn"
                    onClick={() => deleteEvent(event.id)}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Filters Sidebar */}
      {showFilters && (
        <div className="filters-sidebar">
          <h3><FaFilter /> Filters</h3>
          {Object.entries(activeFilters).map(([key, active]) => (
            <label key={key} className="filter-item">
              <input
                type="checkbox"
                checked={active}
                onChange={() => toggleFilter(key)}
              />
              <span className={`filter-color ${key}`}></span>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
          ))}
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3><FaPlus /> Add New Event</h3>
            <input
              type="text"
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
            />
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
            />
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn primary" onClick={addEvent}>
                <FaSave /> Add Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat */}
      <button className="ai-chat-btn" onClick={() => setShowAIChat(!showAIChat)}>
        <FaQuestionCircle /> AI Assistant
      </button>
      {showAIChat && (
        <div className="ai-chat">
          <div className="ai-chat-header">
            <FaQuestionCircle /> UTHM Calendar AI
            <button onClick={() => setShowAIChat(false)}>×</button>
          </div>
          <div className="ai-messages">
            {aiMessages.map((msg, idx) => (
              <div key={idx} className={`ai-message ${msg.type}`}>
                <div>{msg.text}</div>
                <small>{msg.time.toLocaleTimeString()}</small>
              </div>
            ))}
          </div>
          <div className="ai-input">
            <input
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAIQuestion()}
              placeholder="Ask about semesters, breaks, exams..."
            />
            <button onClick={handleAIQuestion}>Send</button>
          </div>
        </div>
      )}

      {/* Feedback Form */}
      <button className="feedback-btn" onClick={() => setShowFeedback(true)}>
        <FaCog /> Feedback
      </button>
      {showFeedback && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Feedback</h3>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tell us what you think about the calendar..."
            />
            <div className="modal-actions">
              <button className="btn primary" onClick={() => {
                alert('Thank you for your feedback!');
                setShowFeedback(false);
                setFeedbackText('');
              }}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;