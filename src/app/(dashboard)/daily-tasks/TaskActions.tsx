'use client';

import { useState, useEffect } from 'react';
import { MoreVertical, Trash2, Edit2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { deleteDailyTask } from './actions';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Props {
  taskId: number;
  ownerId: string | null;
}

export default function TaskActions({ taskId, ownerId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<{ userId: string | null; isAdmin: boolean }>({
    userId: null,
    isAdmin: false
  });
  const [loadingSession, setLoadingSession] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setSessionInfo({
        userId: data.user?.id ?? null,
        isAdmin: data.user?.user_metadata?.role === 'admin'
      });
      setLoadingSession(false);
    });
  }, []);

  const canEdit = !loadingSession && (sessionInfo.isAdmin || (sessionInfo.userId && ownerId === sessionInfo.userId));

  if (!canEdit) return null;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    setIsDeleting(true);
    try {
      await deleteDailyTask(taskId);
      router.refresh();
    } catch (e) {
      alert('Failed to delete task.');
      console.error(e);
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="task-actions-container">
      <button 
        className="task-actions-trigger" 
        onClick={toggleMenu}
        disabled={isDeleting}
        title="More actions"
      >
        {isDeleting ? <Loader2 size={16} className="spin-icon" /> : <MoreVertical size={16} />}
      </button>

      {isOpen && (
        <>
          <div className="task-actions-overlay" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
          <div className="task-actions-menu glass-panel" onClick={(e) => e.stopPropagation()}>
            <Link 
              href={`/daily-tasks/edit/${taskId}`} 
              className="task-action-item"
              onClick={() => setIsOpen(false)}
            >
              <Edit2 size={14} />
              <span>Edit Task</span>
            </Link>
            <button 
              className="task-action-item text-red" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 size={14} />
              <span>Delete Task</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
