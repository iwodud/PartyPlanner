import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// TODO: Upewnij się, że ścieżka do AuthContext jest poprawna
import { UserAuth } from '../Context/AuthContext'; 

const locales = { pl };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const CustomToolbar = ({ label, onNavigate, view, onView }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2">
        <button onClick={() => onNavigate('PREV')} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition flex items-center">
          &larr; <span className="hidden sm:inline ml-1">Poprzedni</span>
        </button>
        <button onClick={() => onNavigate('TODAY')} className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold transition">
          Dzisiaj
        </button>
        <button onClick={() => onNavigate('NEXT')} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition flex items-center">
          <span className="hidden sm:inline mr-1">Następny</span> &rarr;
        </button>
      </div>

      <div className="text-2xl md:text-3xl font-extrabold text-gray-800 capitalize text-center">
        {label}
      </div>

      <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 shadow-inner">
        {['month', 'week', 'day'].map((vName) => (
          <button
            key={vName}
            onClick={() => onView(vName)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              view === vName ? 'bg-white text-indigo-600 shadow font-bold' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {vName === 'month' ? 'Miesiąc' : vName === 'week' ? 'Tydzień' : 'Dzień'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function CalendarPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { session } = UserAuth(); // Pobieramy aktualną sesję użytkownika

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(Views.MONTH);

  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Stan do śledzenia, czy edytujemy istniejące wydarzenie, czy dodajemy nowe
  const [editingEventId, setEditingEventId] = useState(null);

  const [formData, setFormData] = useState({
    title: '', date: '', startTime: '12:00', endTime: '13:00', location: '', description: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Otwieranie formularza dla NOWEGO wydarzenia
  const openAddModal = () => {
    setEditingEventId(null);
    setFormData({ title: '', date: '', startTime: '12:00', endTime: '13:00', location: '', description: '' });
    setIsModalOpen(true);
  };

  // Otwieranie formularza dla EDYCJI wydarzenia
  const openEditModal = () => {
    if (!selectedEvent) return;
    
    setEditingEventId(selectedEvent.id);
    setFormData({
      title: selectedEvent.title,
      date: format(selectedEvent.start, 'yyyy-MM-dd'),
      startTime: format(selectedEvent.start, 'HH:mm'),
      endTime: format(selectedEvent.end, 'HH:mm'),
      location: selectedEvent.location || '',
      description: selectedEvent.description || ''
    });
    setSelectedEvent(null); // Zamykamy modal szczegółów
    setIsModalOpen(true);   // Otwieramy modal edycji
  };

  // Zapisywanie (dodawanie lub edycja)
  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;

    const [year, month, day] = formData.date.split('-').map(Number);
    const [startH, startM] = formData.startTime.split(':').map(Number);
    const [endH, endM] = formData.endTime.split(':').map(Number);

    const eventData = {
      title: formData.title,
      start: new Date(year, month - 1, day, startH, startM),
      end: new Date(year, month - 1, day, endH, endM),
      location: formData.location,
      description: formData.description,
      // TODO (Backend): Backend przypisze group_id
    };

    if (editingEventId) {
      // TODO (Backend): Tutaj zapytanie UPDATE (np. supabase.from('events').update(...).eq('id', editingEventId))
      setEvents(prev => prev.map(ev => ev.id === editingEventId ? { ...ev, ...eventData } : ev));
    } else {
      // TODO (Backend): Tutaj zapytanie INSERT. Baza nada własne ID.
      const newEvent = {
        ...eventData,
        id: Date.now(), 
        creator_id: session?.user?.id // Zapisujemy ID twórcy!
      };
      setEvents(prev => [...prev, newEvent]);
    }

    setIsModalOpen(false);
  };

  // Usuwanie wydarzenia
  const handleDeleteEvent = () => {
    if (!window.confirm("Czy na pewno chcesz usunąć to wydarzenie?")) return;
    
    // TODO (Backend): Tutaj zapytanie DELETE (np. supabase.from('events').delete().eq('id', selectedEvent.id))
    setEvents(prev => prev.filter(ev => ev.id !== selectedEvent.id));
    setSelectedEvent(null);
  };

  const customFormats = {
    dayFormat: (date) => `${['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'][date.getDay()]}, ${format(date, 'dd.MM')}`,
    weekdayFormat: (date) => ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'][date.getDay()],
    dayHeaderFormat: (date) => format(date, 'EEEE, dd MMMM yyyy', { locale: pl }),
    monthHeaderFormat: (date) => format(date, 'MMMM yyyy', { locale: pl }),
  };

  // Sprawdzamy czy zalogowany użytkownik jest twórcą wybranego wydarzenia
  const isCreator = selectedEvent && session?.user && selectedEvent.creator_id === session.user.id;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 select-none">
      {/* Nagłówek strony */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={() => navigate(`/groups/${groupId}`)} 
            className="text-indigo-600 hover:underline mb-2 text-sm font-medium flex items-center cursor-pointer"
          >
            &larr; Wróć do grupy
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Kalendarz wydarzeń</h1>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium shadow transition-colors cursor-pointer"
        >
          + Dodaj wydarzenie
        </button>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-gray-200 h-[700px] select-none">
        <Calendar
          localizer={localizer}
          events={events}
          date={currentDate}
          onNavigate={setCurrentDate}
          view={currentView}
          onView={setCurrentView}
          onDrillDown={(date) => {
            setCurrentDate(date);
            setCurrentView(Views.DAY);
          }}
          components={{ toolbar: CustomToolbar }}
          formats={customFormats}
          culture="pl"
          onSelectEvent={setSelectedEvent}
        />
      </div>

      {/* Modal Dodawania / Edycji */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingEventId ? 'Edytuj wydarzenie' : 'Nowe wydarzenie'}
            </h2>
            <form onSubmit={handleSaveEvent} className="space-y-3">
              <input type="text" name="title" required placeholder="Nazwa wydarzenia" value={formData.title} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
              <input type="date" name="date" required value={formData.date} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
              <div className="flex gap-3">
                <input type="time" name="startTime" required value={formData.startTime} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
                <input type="time" name="endTime" required value={formData.endTime} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <input type="text" name="location" placeholder="Miejsce (np. Pub, Discord)" value={formData.location} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
              <textarea name="description" placeholder="Dodatkowe informacje..." value={formData.description} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none h-24"></textarea>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Anuluj</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm">Zapisz</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Szczegółów */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedEvent.title}</h2>
            <div className="bg-indigo-50 text-indigo-800 p-3 rounded-lg mb-4 text-sm">
              <p className="mb-1"><strong>Data:</strong> {format(selectedEvent.start, 'dd.MM.yyyy')}</p>
              <p><strong>Godzina:</strong> {format(selectedEvent.start, 'HH:mm')} - {format(selectedEvent.end, 'HH:mm')}</p>
            </div>
            {selectedEvent.location && <p className="text-gray-700 mb-2 text-sm"><span className="font-semibold text-gray-900">Miejsce:</span> {selectedEvent.location}</p>}
            {selectedEvent.description && <p className="text-gray-700 text-sm mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100"><span className="font-semibold text-gray-900 block mb-1">Opis:</span>{selectedEvent.description}</p>}
            
            {/* Opcje dostępne tylko dla twórcy */}
            {isCreator && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button onClick={openEditModal} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium transition-colors">
                  Edytuj
                </button>
                <button onClick={handleDeleteEvent} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-medium transition-colors">
                  Usuń
                </button>
              </div>
            )}

            <button onClick={() => setSelectedEvent(null)} className="mt-3 w-full bg-gray-900 hover:bg-black text-white py-2.5 rounded-lg font-medium transition-colors shadow">
              Zamknij
            </button>
          </div>
        </div>
      )}
    </div>
  );
}