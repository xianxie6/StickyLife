import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import './electron.d.ts';
import { DesktopWidget } from './components/DesktopWidget';
import { StickyNote } from './types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { useStore } from './store/useStore';

// Detect touch device
const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

function App() {
  const { tasks, isLoading, updateTasks, addTask, updateTask, deleteTask } = useStore();
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [completedNotes, setCompletedNotes] = useState<StickyNote[]>([]);
  const isIgnoringRef = useRef(true);

  // 同步 store 中的 tasks 到本地 state
  useEffect(() => {
    if (!isLoading) {
      // 分离已完成和未完成的任务
      const activeTasks = tasks.filter(t => !t.completed);
      const completed = tasks.filter(t => t.completed);
      setNotes(activeTasks);
      setCompletedNotes(completed);
    }
  }, [tasks, isLoading]);

  const addNote = useCallback((note: Omit<StickyNote, 'id' | 'createdAt'>) => {
    const newNote: StickyNote = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setNotes(prev => [...prev, newNote]);
    addTask(newNote);
  }, [addTask]);

  const updateNote = useCallback((id: string, updates: Partial<StickyNote>) => {
    setNotes(prev => prev.map(note => note.id === id ? { ...note, ...updates } : note));
    updateTask(id, updates);
  }, [updateTask]);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    deleteTask(id);
  }, [deleteTask]);

  const completeNote = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setCompletedNotes(prev => [...prev, { ...note, completed: true }]);
      setNotes(prev => prev.filter(n => n.id !== id));
      updateTask(id, { completed: true });
    }
  }, [notes, updateTask]);

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
        className="w-full h-full overflow-hidden"
        style={{
          backgroundColor: 'transparent',
          pointerEvents: 'none' // 默认点击穿透
        }}
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
    </DndProvider>
  );
}

export default App;
