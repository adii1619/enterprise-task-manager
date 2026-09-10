'use client';

import { useState } from 'react';
import { useBoardStore } from '@/lib/store';
import { ChecklistItem, Priority, Task, TaskAssignee, TaskTag } from '@/types';
import { useWorkspaceStore } from '@/lib/workspace-store';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
}

export default function TaskModal({ task, onClose }: TaskModalProps) {
  const { updateTask, deleteTask } = useBoardStore();
  const members = useWorkspaceStore((state) => state.currentWorkspace?.members || []);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [assigneeId, setAssigneeId] = useState(
    typeof task.assigneeId === 'string' ? task.assigneeId : task.assigneeId?._id || ''
  );
  const [checklist, setChecklist] = useState<ChecklistItem[]>(task.checklist || []);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [dueDate, setDueDate] = useState(toDateTimeLocal(task.dueDate));
  const [tags, setTags] = useState<TaskTag[]>(task.tags || []);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [isDeleting, setIsDeleting] = useState(false);

  const addChecklistItem = () => {
    const itemTitle = newChecklistTitle.trim();
    if (!itemTitle) return;
    setChecklist((items) => [
      ...items,
      { _id: crypto.randomUUID(), title: itemTitle, completed: false },
    ]);
    setNewChecklistTitle('');
  };

  const addTag = () => {
    const tagName = newTagName.trim();
    if (!tagName) return;
    setTags((currentTags) => [...currentTags, { name: tagName, color: newTagColor }]);
    setNewTagName('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await updateTask(task._id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      assigneeId: assigneeId || undefined,
      checklist,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      tags,
    });
    onClose();
  };

  const handleDelete = async () => {
    await deleteTask(task._id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-semibold text-slate-800">Task Details</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close task details"
            className="text-sm font-bold text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Due date</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">Checklist</label>
            <div className="space-y-2">
              {checklist.map((item) => (
                <div key={item._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() =>
                      setChecklist((items) =>
                        items.map((currentItem) =>
                          currentItem._id === item._id
                            ? { ...currentItem, completed: !currentItem.completed }
                            : currentItem
                        )
                      )
                    }
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span className={`min-w-0 flex-1 text-sm ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {item.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => setChecklist((items) => items.filter((currentItem) => currentItem._id !== item._id))}
                    aria-label={`Remove ${item.title}`}
                    className="text-slate-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                placeholder="Add a subtask"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <button type="button" onClick={addChecklistItem} className="rounded-lg bg-slate-100 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">Tags</label>
            <div className="mb-2 flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span key={`${tag.name}-${index}`} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-white" style={{ backgroundColor: tag.color }}>
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => setTags((currentTags) => currentTags.filter((_, tagIndex) => tagIndex !== index))}
                    aria-label={`Remove ${tag.name} tag`}
                    className="text-white/80 hover:text-white"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                aria-label="Tag color"
                className="h-9 w-10 cursor-pointer rounded border border-slate-200 bg-white p-1"
              />
              <button type="button" onClick={addTag} className="rounded-lg bg-slate-100 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Assignee</label>
            <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
              <option value="">Unassigned</option>
              {members.map((member) => {
                const profile = typeof member.userId === 'string' ? null : (member.userId as TaskAssignee);
                return profile ? <option key={profile._id} value={profile._id}>{profile.name} ({member.role})</option> : null;
              })}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more context..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-red-600">Confirm?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleting(false)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsDeleting(true)}
                className="text-xs font-medium text-red-500 hover:text-red-700"
              >
                Delete Task
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function toDateTimeLocal(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
