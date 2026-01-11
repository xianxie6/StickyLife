import React, { useState } from 'react';
import { StickyNote } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X } from 'lucide-react';

interface TodayFocusAreaProps {
  notes: StickyNote[];
  onAddNote: (note: Omit<StickyNote, 'id' | 'createdAt'>) => void;
  onUpdateNote: (id: string, updates: Partial<StickyNote>) => void;
  onDeleteNote: (id: string) => void;
  onCompleteNote: (id: string) => void;
}

export function TodayFocusArea({ 
  notes, 
  onAddNote, 
  onUpdateNote, 
  onDeleteNote,
  onCompleteNote 
}: TodayFocusAreaProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayNotes = notes.filter(note => note.date === today).slice(0, 5);

  const handleAdd = () => {
    if (newContent.trim()) {
      onAddNote({
        content: newContent,
        layer: 'daily',
        date: today,
        color: '#FFF9C4'
      });
      setNewContent('');
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string) => {
    if (editContent.trim()) {
      onUpdateNote(id, { content: editContent });
      setEditingId(null);
      setEditContent('');
    }
  };

  return (
    <div className="flex items-stretch gap-3 min-h-32">
      <AnimatePresence mode="popLayout">
        {/* Existing Today Notes */}
        {todayNotes.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -20 }}
            transition={{ delay: index * 0.05 }}
            className="flex-shrink-0"
          >
            {editingId === note.id ? (
              <div
                className="w-40 h-40 rounded-sm paper-texture p-3 flex flex-col"
                style={{
                  backgroundColor: '#FFF9C4',
                  boxShadow: '0 4px 10px rgba(45, 52, 54, 0.12), 0 2px 4px rgba(45, 52, 54, 0.08)',
                }}
              >
                <textarea
                  autoFocus
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.metaKey) handleEdit(note.id);
                    if (e.key === 'Escape') {
                      setEditingId(null);
                      setEditContent('');
                    }
                  }}
                  className="w-full flex-1 bg-transparent resize-none outline-none text-sm handwritten"
                  style={{ color: 'rgba(45, 52, 54, 0.85)' }}
                />
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => handleEdit(note.id)}
                    className="flex-1 py-1 rounded bg-white/60 hover:bg-white/80 transition-all text-xs"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditContent('');
                    }}
                    className="flex-1 py-1 rounded hover:bg-black/5 transition-all text-xs"
                  >
                    ✗
                  </button>
                </div>
              </div>
            ) : (
              <motion.div
                className="w-40 h-40 rounded-sm paper-texture p-3 cursor-pointer group relative"
                style={{
                  backgroundColor: '#FFF9C4',
                  boxShadow: '0 4px 10px rgba(45, 52, 54, 0.12), 0 2px 4px rgba(45, 52, 54, 0.08)',
                }}
                whileHover={{ scale: 1.05, rotate: 2 }}
                onDoubleClick={() => {
                  setEditingId(note.id);
                  setEditContent(note.content);
                }}
              >
                {/* Migration indicator */}
                {(note.migrationCount || 0) > 0 && (
                  <div className="dog-ear" title={`已顺延 ${note.migrationCount} 次`}>
                    {note.migrationCount! > 1 && (
                      <span className="absolute top-0.5 right-0.5 text-xs text-white font-bold drop-shadow">
                        {note.migrationCount}
                      </span>
                    )}
                  </div>
                )}

                <div className="text-sm handwritten leading-relaxed overflow-hidden" style={{ color: 'rgba(45, 52, 54, 0.85)' }}>
                  {note.content}
                </div>

                {/* Hover actions */}
                <div className="absolute inset-x-2 bottom-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompleteNote(note.id);
                    }}
                    className="flex-1 py-1 rounded bg-white/80 hover:bg-white transition-all text-xs flex items-center justify-center"
                    title="完成"
                  >
                    <Check className="w-3 h-3" style={{ color: '#55EFC4' }} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(note.id);
                    }}
                    className="flex-1 py-1 rounded bg-white/80 hover:bg-white transition-all text-xs flex items-center justify-center"
                    title="删除"
                  >
                    <X className="w-3 h-3" style={{ color: '#FF7675' }} />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}

        {/* Add New Note */}
        {todayNotes.length < 5 && (
          <motion.div
            key="add-button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-shrink-0"
          >
            {isAdding ? (
              <div
                className="w-40 h-40 rounded-sm paper-texture p-3 flex flex-col"
                style={{
                  backgroundColor: '#FFF9C4',
                  boxShadow: '0 4px 10px rgba(45, 52, 54, 0.12), 0 2px 4px rgba(45, 52, 54, 0.08)',
                }}
              >
                <textarea
                  autoFocus
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.metaKey) handleAdd();
                    if (e.key === 'Escape') {
                      setIsAdding(false);
                      setNewContent('');
                    }
                  }}
                  placeholder="今天要做什么..."
                  className="w-full flex-1 bg-transparent resize-none outline-none text-sm handwritten"
                  style={{ color: 'rgba(45, 52, 54, 0.85)' }}
                />
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={handleAdd}
                    className="flex-1 py-1 rounded bg-white/60 hover:bg-white/80 transition-all text-xs"
                  >
                    添加
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewContent('');
                    }}
                    className="flex-1 py-1 rounded hover:bg-black/5 transition-all text-xs"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <motion.button
                onClick={() => setIsAdding(true)}
                className="w-40 h-40 rounded-sm border-2 border-dashed border-white/50 hover:border-white/80 flex items-center justify-center transition-all group"
                whileHover={{ scale: 1.05 }}
                style={{
                  backgroundColor: 'rgba(255, 249, 196, 0.2)',
                }}
              >
                <div className="text-center opacity-60 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-8 h-8 mx-auto mb-1" />
                  <p className="text-xs">新便签</p>
                </div>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {todayNotes.length === 0 && !isAdding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex items-center justify-center opacity-40"
        >
          <div className="text-center">
            <div className="text-3xl mb-2">✨</div>
            <p className="text-sm">点击添加今日任务</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
