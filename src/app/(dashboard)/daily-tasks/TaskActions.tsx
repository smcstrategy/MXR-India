'use client';

import { useState } from 'react';
import { MoreVertical, edit2, Trash2, Edit2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { deleteDailyTask } from './actions';
import { useRouter } from 'next/navigation';

interface Props {
  taskId: number;
  ownerId: string | null;
  currentUserId: string | null;
  isAdmin: boolean;
}

export default function TaskActions({ taskId, ownerId, currentUserId, isAdmin }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const canEdit = isAdmin || (currentUserId && ownerId === currentUserId);

  if (!canEdit) return null;

  const handleDelete = async () => {
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

  return (
    <div className="task-actions-container">
      <button 
        className="task-actions-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDeleting}
      >
        {isDeleting ? <Loader2 size={16} className="spin-icon" /> : <MoreVertical size={16} />}
      </button>

      {isOpen && (
        <>
          <div className="task-actions-overlay" onClick={() => setIsOpen(false)} />
          <div className="task-actions-menu glass-panel">
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
