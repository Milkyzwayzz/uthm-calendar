import React, { useState, useEffect, useCallback, useMemo } from 'react';
import '../styles/EnhancedCalendar-v2.css';
import SpiderWebCanvas from './SpiderWebCanvas';

// ============================================
// MOCK DATA - Academic Calendar 2025/2026
// ============================================
const MOCK_EVENTS = [
  { id: 1, title: 'Daftar Ulang Sem Khas', start: '2025-07-01', end: '2025-07-05', category: 'registration', semester: 'khas', priority: 'high' },
  { id: 2, title: 'Pengajaran Sem Khas', start: '2025-07-08', end: '2025-09-10', category: 'lecture', semester: 'khas', priority: 'normal' },
  { id: 3, title: 'Peperiksaan Sem Khas', start: '2025-09-15', end: '2025-09-25', category: 'exam', semester: 'khas', priority: 'high' },
  { id: 4, title: 'Daftar Ulang Sem 1', start: '2025-08-20', end: '2025-08-24', category: 'registration', semester: 'sem1', priority: 'high' },
  { id: 5, title: 'Minggu Orientasi', start: '2025-08-25', end: '2025-08-31', category: 'break', semester: 'sem1', priority: 'normal' },
  { id: 6, title: 'Pengajaran Minggu 1-4', start: '2025-09-01', end: '2025-10-02', category: 'lecture', semester: 'sem1', priority: 'normal' },
  { id: 7, title: 'Peperiksaan Pertengahan Sem 1', start: '2025-10-06', end: '2025-10-17', category: 'exam', semester: 'sem1', priority: 'high' },
  { id: 8, title: 'Cuti Hari Raya Aidilfitri', start: '2025-10-10', end: '2025-10-13', category: 'holiday', semester: 'sem1', priority: 'normal' },
  { id: 9, title: 'Pengajaran Minggu 5-8', start: '2025-10-20', end: '2025-11-14', category: 'lecture', semester: 'sem1', priority: 'normal' },
  { id: 10, title: 'Minggu Pembelajaran', start: '2025-11-17', end: '2025-11-21', category: 'break', semester: 'sem1', priority: 'normal' },
  { id: 11, title: 'Peperiksaan Akhir Sem 1', start: '2025-11-24', end: '2025-12-10', category: 'exam', semester: 'sem1', priority: 'high' },
  { id: 12, title: 'Cuti Akhir Tahun', start: '2025-12-15', end: '2026-01-05', category: 'holiday', semester: 'sem1', priority: 'normal' },
  { id: 13, title: 'Daftar Ulang Sem 2', start: '2026-01-08', end: '2026-01-12', category: 'registration', semester: 'sem2', priority: 'high' },
  { id: 14, title: 'Pengajaran Sem 2', start: '2026-01-15', end: '2026-03-10', category: 'lecture', semester: 'sem2', priority: 'normal' },
  { id: 15, title: 'Cuti Tahun Baru Cina', start: '2026-02-17', end: '2026-02-18', category: 'holiday', semester: 'sem2', priority: 'normal' },
  { id: 16, title: 'Peperiksaan Pertengahan Sem 2', start: '2026-03-15', end: '2026-03-26', category: 'exam', semester: 'sem2', priority: 'high' },
  { id: 17, title: 'Pengajaran Minggu Akhir', start: '2026-03-30', end: '2026-04-15', category: 'lecture', semester: 'sem2', priority: 'normal' },
  { id: 18, title: 'Peperiksaan Akhir Sem 2', start: '2026-04-20', end: '2026-05-10', category: 'exam', semester: 'sem2', priority: 'high' },
];

// ============================================
// UTILITIES
// ============================================
const dateUtils = {
  formatDate: (date) => date.toLocaleDateString('ms-MY', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }),
  isWeekend: (date) => [0, 6].includes(date.getDay()),
  getDaysInMonth: (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
  getFirstDayOfMonth: (date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; // Align to Monday index (0-6)
  },
  getEventColor: (category) => {
    const colors = {
      lecture: '#3b82f6',
      exam: '#ef4444',
      break: '#10b981',
      registration: '#f59e0b',
      holiday: '#ec4899',
      khas: '#8b5cf6'
    };
    return colors[category] || '#6b7280';
  }
};

// ============================================
// COMPONENT: Calendar Day Cell
// ============================================
const CalendarDay = ({ day, month, year, events, isToday, isWeekend, onDayClick }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`calendar-day ${isToday ? 'is-today' : ''} ${isWeekend ? 'is-weekend' : ''}`}
      onClick={() => events.length > 0 && onDayClick?.(events[0])}
      onMouseEnter={() => events.length > 0 && setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <div className="day-header">
        <span className="day-number">{day}</span>
        {isToday && <span className="today-badge">Hari Ini</span>}
      </div>
      
      {events.length > 0 && (
        <div className="event-dots">
          {events.slice(0, 3).map((event, idx) => (
            <div
              key={idx}
              className="event-dot"
              style={{ backgroundColor: dateUtils.getEventColor(event.category) }}
              title={event.title}
            />
          ))}
        </div>
      )}

      {showDetails && events.length > 0 && (
        <div className="day-details-popup">
          {events.map((event) => (
            <div key={event.id} className="event-preview">
              <div className="event-title">{event.title}</div>
              <div className="event-category" style={{ color: dateUtils.getEventColor(event.category) }}>
                {event.category.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// COMPONENT: Month Grid
// ============================================
const MonthGrid = ({ month, year, events, onDayClick }) => {
  const daysInMonth = dateUtils.getDaysInMonth(new Date(year, month));
  const firstDay = dateUtils.getFirstDayOfMonth(new Date(year, month));
  const today = new Date();
  
  const days = [];
  
  // Padding for blank days before start of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = dateStr === today.toISOString().split('T')[0];
    const currentDate = new Date(year, month, day);
    
    const dayEvents = events.filter(e => 
      dateStr >= e.start && dateStr <= (e.end || e.start)
    );
    
    days.push(
      <CalendarDay
        key={day}
        day={day}
        month={month}
        year={year}
        events={dayEvents}
        isToday={isToday}
        isWeekend={dateUtils.isWeekend(currentDate)}
        onDayClick={onDayClick}
      />
    );
  }
  
  const monthName = new Date(year, month).toLocaleString('ms-MY', { month: 'long', year: 'numeric' });
  
  return (
    <div className="month-grid-container glass-panel">
      <h3 className="month-title">{monthName}</h3>
      <div className="weekday-header">
        {['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad'].map(day => (
          <div key={day} className="weekday-cell">{day.slice(0, 3)}</div>
        ))}
      </div>
      <div className="calendar-grid">{days}</div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT: EnhancedCalendar
// ============================================
const EnhancedCalendar = () => {
  const [activeSemester, setActiveSemester] = useState('all');
  const [activeFilters, setActiveFilters] = useState(['lecture', 'exam', 'break', 'registration', 'holiday', 'khas']);
  const [viewMode, setViewMode] = useState('calendar');
  const [theme, setTheme] = useState('dark');
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [showTodoInput, setShowTodoInput] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // LocalStorage logic
  useEffect(() => {
    const saved = localStorage.getItem('uthmCalendarTodos');
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load todos:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('uthmCalendarTodos', JSON.stringify(todos));
  }, [todos]);

  // Data config
  const SEMESTERS = [
    { id: 'khas', label: 'Semester Khas' },
    { id: 'sem1', label: 'Semester 1' },
    { id: 'sem2', label: 'Semester 2' },
    { id: 'all', label: 'Semua' }
  ];

  const CATEGORIES = [
    { id: 'lecture', label: 'Pengajaran', color: '#3b82f6' },
    { id: 'exam', label: 'Peperiksaan', color: '#ef4444' },
    { id: 'break', label: 'Rehat/Orientasi', color: '#10b981' },
    { id: 'registration', label: 'Pendaftaran', color: '#f59e0b' },
    { id: 'holiday', label: 'Cuti Kelepasan', color: '#ec4899' },
  ];

  const filteredEvents = useMemo(() => {
    return MOCK_EVENTS.filter(event => {
      const matchesSemester = activeSemester === 'all' || event.semester === activeSemester;
      const matchesCategory = activeFilters.includes(event.category);
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSemester && matchesCategory && matchesSearch;
    });
  }, [activeSemester, activeFilters, searchTerm]);

  // Task Handlers
  const addTodo = useCallback(() => {
    if (!newTodoText.trim()) return;
    setTodos(prev => [...prev, {
      id: Date.now(),
      text: newTodoText.trim(),
      completed: false
    }]);
    setNewTodoText('');
    setShowTodoInput(false);
  }, [newTodoText]);

  const toggleTodo = useCallback((id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  const completeTodoDirectly = useCallback((id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t));
  }, []);

  const addTodoFromEvent = useCallback((event) => {
    setTodos(prev => [...prev, {
      id: Date.now(),
      text: `${event.title} (${event.start})`,
      completed: false
    }]);
    setSelectedEvent(null);
  }, []);

  // Filter toggle helpers
  const toggleFilter = useCallback((filterId) => {
    setActiveFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  }, []);

  const renderCalendarView = () => {
    const getMonthsForSemester = () => {
      switch (activeSemester) {
        case 'khas':
          return [{ m: 6, y: 2025 }, { m: 7, y: 2025 }, { m: 8, y: 2025 }];
        case 'sem1':
          return [
            { m: 8, y: 2025 }, { m: 9, y: 2025 }, { m: 10, y: 2025 },
            { m: 11, y: 2025 }, { m: 0, y: 2026 }, { m: 1, y: 2026 }
          ];
        case 'sem2':
          return [{ m: 1, y: 2026 }, { m: 2, y: 2026 }, { m: 3, y: 2026 }, { m: 4, y: 2026 }, { m: 5, y: 2026 }];
        default:
          return [
            { m: 6, y: 2025 }, { m: 7, y: 2025 }, { m: 8, y: 2025 },
            { m: 9, y: 2025 }, { m: 10, y: 2025 }, { m: 11, y: 2025 },
            { m: 0, y: 2026 }, { m: 1, y: 2026 }, { m: 2, y: 2026 }
          ];
      }
    };

    return (
      <div className="calendar-grid-container">
        {getMonthsForSemester().map((month, idx) => (
          <MonthGrid
            key={`${month.m}-${month.y}-${idx}`}
            month={month.m}
            year={month.y}
            events={filteredEvents}
            onDayClick={setSelectedEvent}
          />
        ))}
      </div>
    );
  };

  const renderListView = () => {
    if (filteredEvents.length === 0) {
      return (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3>Tiada Peristiwa Ditemui</h3>
          <p>Sila cuba tukar kata kunci carian atau penapis kategori.</p>
        </div>
      );
    }

    return (
      <div className="event-list-view">
        {filteredEvents.map(event => (
          <div 
            key={event.id} 
            className="event-list-item" 
            onClick={() => setSelectedEvent(event)}
            style={{ borderLeftColor: dateUtils.getEventColor(event.category) }}
          >
            <div className="event-list-content">
              <h4 className="event-list-title">{event.title}</h4>
              <div className="event-list-meta">
                <span>📅 {event.start} hingga {event.end || event.start}</span>
                <span className="event-category-badge">{event.category}</span>
                {event.priority === 'high' && <span className="priority-badge">⭐ Penting</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`app-wrapper app-${theme}`}>
      <div className="app">
        {/* Header */}
        <header className="app-header glass-panel">
          <div className="logo-section">
            <h1 className="logo-title">🏛️ UTHM Kalendar</h1>
            <p className="logo-subtitle">Sistem Akademik Pintar 2025/2026</p>
          </div>

          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Cari peristiwa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>

            <button
              className="theme-toggle-btn"
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              title="Tukar Tema"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Dashboard layout */}
        <div className="dashboard-grid">
          
          {/* Main Column */}
          <div className="main-column">
            
            {/* Filters panel */}
            <div className="filter-section glass-panel">
              <div className="filter-controls-wrapper">
                
                <div className="control-group">
                  <span className="control-label">📚 PILIH SEMESTER</span>
                  <div className="button-group">
                    {SEMESTERS.map(sem => (
                      <button
                        key={sem.id}
                        className={`control-btn ${activeSemester === sem.id ? 'active' : ''}`}
                        onClick={() => setActiveSemester(sem.id)}
                      >
                        {sem.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-group">
                  <span className="control-label">👁️ PAPARAN</span>
                  <div className="button-group">
                    <button
                      className={`control-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                      onClick={() => setViewMode('calendar')}
                    >
                      📅 Kalendar
                    </button>
                    <button
                      className={`control-btn ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                    >
                      📋 Senarai
                    </button>
                  </div>
                </div>

                <div className="control-group">
                  <span className="control-label">🏷️ TAPIS KATEGORI</span>
                  <div className="button-group">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        className={`control-btn ${activeFilters.includes(cat.id) ? 'active' : ''}`}
                        onClick={() => toggleFilter(cat.id)}
                        style={activeFilters.includes(cat.id) ? { borderColor: cat.color, borderLeft: `4px solid ${cat.color}` } : {}}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Academic Days content */}
            {viewMode === 'calendar' ? renderCalendarView() : renderListView()}

          </div>

          {/* Sidebar Column */}
          <div className="side-column">
            
            {/* Spider Canvas playground */}
            <SpiderWebCanvas todos={todos} onCompleteTodo={completeTodoDirectly} />

            {/* Task list panel */}
            <section className="todo-section glass-panel">
              <div className="todo-header">
                <h3 className="todo-title">
                  📝 Tugas Saya
                  <span className="todo-stats">
                    {todos.filter(t => t.completed).length}/{todos.length}
                  </span>
                </h3>
                <button
                  className="btn-toggle-todo"
                  onClick={() => setShowTodoInput(!showTodoInput)}
                  title="Tambah Tugas"
                >
                  {showTodoInput ? '✕' : '➕'}
                </button>
              </div>

              {showTodoInput && (
                <div className="todo-input-section">
                  <div className="input-group">
                    <input
                      type="text"
                      className="todo-input"
                      placeholder="Masukkan nama tugas..."
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                      autoFocus
                    />
                    <button className="btn-add-todo" onClick={addTodo}>
                      Tambah
                    </button>
                  </div>
                </div>
              )}

              <div className="todo-list">
                {todos.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', padding: '20px' }}>
                    Tiada tugas. Tambahkan satu untuk memancing labah-labah! 🕷️
                  </p>
                ) : (
                  todos.map(todo => (
                    <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                      <input
                        type="checkbox"
                        className="todo-checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                      />
                      <span className="todo-text">{todo.text}</span>
                      <div className="todo-actions">
                        <button className="btn-icon-small" onClick={() => deleteTodo(todo.id)} title="Padam">
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

          </div>

        </div>
      </div>

      {/* Details Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📅 {selectedEvent.title}</h2>
              <button className="modal-close" onClick={() => setSelectedEvent(null)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="event-detail-row">
                <span className="detail-label">Mula:</span>
                <span className="detail-value">{selectedEvent.start}</span>
              </div>
              {selectedEvent.end && (
                <div className="event-detail-row">
                  <span className="detail-label">Tamat:</span>
                  <span className="detail-value">{selectedEvent.end}</span>
                </div>
              )}
              <div className="event-detail-row">
                <span className="detail-label">Kategori:</span>
                <span className="detail-value" style={{ color: dateUtils.getEventColor(selectedEvent.category), fontWeight: 'bold' }}>
                  {selectedEvent.category}
                </span>
              </div>
              <div className="event-detail-row">
                <span className="detail-label">Semester:</span>
                <span className="detail-value">{selectedEvent.semester.toUpperCase()}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-add-todo" onClick={() => addTodoFromEvent(selectedEvent)}>
                ➕ Pin Tugas
              </button>
              <button className="btn-toggle-todo" style={{ background: '#4b5563', borderRadius: '10px', width: 'auto', padding: '0 16px' }} onClick={() => setSelectedEvent(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCalendar;