import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import './electron.d.ts';
import { DesktopWidget } from './components/DesktopWidget';
import { StickyNote } from './types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

// Detect touch device
const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

function App() {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [completedNotes, setCompletedNotes] = useState<StickyNote[]>([]);
  const isIgnoringRef = useRef(true);

  // Load data from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('stickylife-notes');
    const savedCompleted = localStorage.getItem('stickylife-completed');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedCompleted) setCompletedNotes(JSON.parse(savedCompleted));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('stickylife-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('stickylife-completed', JSON.stringify(completedNotes));
  }, [completedNotes]);

  const addNote = useCallback((note: Omit<StickyNote, 'id' | 'createdAt'>) => {
    const newNote: StickyNote = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setNotes(prev => [...prev, newNote]);
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<StickyNote>) => {
    setNotes(prev => prev.map(note => note.id === id ? { ...note, ...updates } : note));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  }, []);

  const completeNote = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setCompletedNotes(prev => [...prev, { ...note, completed: true }]);
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  }, [notes]);

  const migrateNote = useCallback((id: string, newLayer: 'daily' | 'weekly' | 'yearly', newDate?: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id === id) {
        return {
          ...note,
          layer: newLayer,
          date: newDate || note.date,
          migrationCount: (note.migrationCount || 0) + 1
        };
      }
      return note;
    }));
  }, []);

  const handleMouseEnterNote = useCallback(async () => {
    if (isIgnoringRef.current && window.electronAPI) {
      isIgnoringRef.current = false;
      await window.electronAPI.setIgnoreCursorEvents(false);
    }
  }, []);

  const handleMouseLeaveNote = useCallback(async () => {
    if (!isIgnoringRef.current && window.electronAPI) {
      isIgnoringRef.current = true;
      await window.electronAPI.setIgnoreCursorEvents(true);
    }
  }, []);

  const handleMouseEnterBackground = useCallback(async () => {
    if (!isIgnoringRef.current && window.electronAPI) {
      isIgnoringRef.current = true;
      await window.electronAPI.setIgnoreCursorEvents(true);
    }
  }, []);

  const backend = isTouchDevice() ? TouchBackend : HTML5Backend;

  // Desktop mode - Always show DesktopWidget
  return (
    <DndProvider backend={backend}>
      <div 
        className="background-container"
        onMouseEnter={handleMouseEnterBackground}
        onMouseLeave={handleMouseLeaveNote}
      >
        <div
          onMouseEnter={handleMouseEnterNote}
          onMouseLeave={handleMouseLeaveNote}
        >
          <DesktopWidget
            notes={notes}
            completedNotes={completedNotes}
            onAddNote={addNote}
            onUpdateNote={updateNote}
            onDeleteNote={deleteNote}
            onCompleteNote={completeNote}
            onMigrateNote={migrateNote}
          />
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
