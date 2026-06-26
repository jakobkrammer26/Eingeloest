import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Task, TeamMember } from '../types';
import { 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square, 
  Calendar, 
  AlertTriangle, 
  Sparkles, 
  X, 
  ArrowRight,
  RefreshCw,
  Tag
} from 'lucide-react';

interface ProjectsBoardProps {
  tasks: Task[];
  team: TeamMember[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export default function ProjectsBoard({ tasks, team, onAddTask, onUpdateTask, onDeleteTask }: ProjectsBoardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // Form states for new task
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newAssignee, setNewAssignee] = useState(team[0]?.id || '');
  const [newDueDate, setNewDueDate] = useState('');
  const [newTagsString, setNewTagsString] = useState('');

  // Kanban stages
  const STAGES: { id: Task['stage']; label: string; color: string }[] = [
    { id: 'todo', label: 'To Do', color: 'bg-zinc-100 text-zinc-800 border-zinc-200' },
    { id: 'in_progress', label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-100' },
    { id: 'review', label: 'In Review', color: 'bg-purple-50 text-purple-700 border-purple-100' },
    { id: 'done', label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' }
  ];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const tagsArray = newTagsString
      ? newTagsString.split(',').map(t => t.trim()).filter(Boolean)
      : ['Operational'];

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: newTitle,
      description: newDesc,
      stage: 'todo',
      priority: newPriority,
      assigneeId: newAssignee,
      dueDate: newDueDate || new Date().toISOString().split('T')[0],
      checklist: [],
      tags: tagsArray
    };

    onAddTask(newTask);
    setIsAdding(false);
    // Reset
    setNewTitle('');
    setNewDesc('');
    setNewPriority('medium');
    setNewDueDate('');
    setNewTagsString('');
  };

  const handleToggleChecklist = (task: Task, itemId: string) => {
    const updatedChecklist = task.checklist.map(item => 
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    onUpdateTask({ ...task, checklist: updatedChecklist });
  };

  const handleMoveStage = (task: Task, direction: 'forward' | 'backward') => {
    const sequence: Task['stage'][] = ['todo', 'in_progress', 'review', 'done'];
    const currIndex = sequence.indexOf(task.stage);
    let nextIndex = currIndex;

    if (direction === 'forward' && currIndex < sequence.length - 1) {
      nextIndex = currIndex + 1;
    } else if (direction === 'backward' && currIndex > 0) {
      nextIndex = currIndex - 1;
    }

    if (nextIndex !== currIndex) {
      onUpdateTask({ ...task, stage: sequence[nextIndex] });
    }
  };

  // AI Task Optimizer using server endpoint
  const handleAIEnhance = async (task: Task) => {
    setAnalyzingId(task.id);
    try {
      const res = await fetch('/api/gemini/analyze-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description
        })
      });
      if (!res.ok) throw new Error('Failed to analyze');
      const data = await res.json();
      
      const enrichedChecklist = data.checklistItems?.map((text: string, idx: number) => ({
        id: `c_${Date.now()}_${idx}`,
        text,
        done: false
      })) || [];

      onUpdateTask({
        ...task,
        description: data.improvedDescription || task.description,
        priority: (data.priority === 'low' || data.priority === 'medium' || data.priority === 'high') 
          ? data.priority 
          : task.priority,
        checklist: enrichedChecklist,
        tags: data.tags?.length ? data.tags : task.tags
      });
    } catch (err) {
      console.error(err);
      alert('AI Task enhancement is currently unavailable. Please check your network or API keys.');
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Enterprise Sprint Board</h2>
          <p className="text-gray-400 text-sm font-light">Coordinate project lifecycles, assign owners, and utilize Gemini to break down deliverables.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-5 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-gray-800 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Plus size={14} /> Initiate New Task
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {STAGES.map(stage => {
          const stageTasks = tasks.filter(t => t.stage === stage.id);
          return (
            <div key={stage.id} className="bg-[#F5F5F7]/70 rounded-2xl border border-gray-200/60 p-4 flex flex-col min-h-[500px]">
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200/50">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${stage.color}`}>
                  {stage.label}
                </span>
                <span className="text-xs font-mono text-gray-400 font-semibold">{stageTasks.length}</span>
              </div>

              {/* Task Cards */}
              <div className="space-y-4 flex-1">
                {stageTasks.map(task => {
                  const assignee = team.find(m => m.id === task.assigneeId);
                  const isAILoading = analyzingId === task.id;

                  return (
                    <div 
                      key={task.id}
                      className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all space-y-3.5 relative group"
                    >
                      {/* Top labels */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag, i) => (
                            <span key={i} className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100/30 uppercase tracking-wide">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded tracking-wider font-semibold ${
                          task.priority === 'high' 
                            ? 'bg-rose-50 text-rose-700 border border-rose-100/50' 
                            : task.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100/50'
                            : 'bg-gray-100 text-gray-500 border border-gray-200/40'
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Content with elegant vertical timeline line from the design */}
                      <div className="flex items-start gap-3">
                        <div className="w-1 bg-gray-100 self-stretch mt-1 rounded-full shrink-0"></div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-gray-900 leading-tight">{task.title}</h4>
                          <p className="text-xs text-gray-400 font-light leading-relaxed">{task.description}</p>
                        </div>
                      </div>

                      {/* Checklist */}
                      {task.checklist && task.checklist.length > 0 && (
                        <div className="border-t border-gray-100 pt-3 space-y-1.5">
                          <span className="text-[9px] font-mono font-bold text-gray-400 block mb-1">MILESTONES ({task.checklist.filter(c => c.done).length}/{task.checklist.length})</span>
                          {task.checklist.map(item => (
                            <div 
                              key={item.id} 
                              onClick={() => handleToggleChecklist(task, item.id)}
                              className="flex items-start gap-2 cursor-pointer group/item"
                            >
                              <input 
                                type="checkbox" 
                                checked={item.done} 
                                onChange={() => {}} // handled by click parent
                                className="w-3.5 h-3.5 rounded-full border-gray-300 accent-blue-500 cursor-pointer mt-0.5 shrink-0" 
                              />
                              <span className={`text-[11px] leading-tight ${item.done ? 'line-through text-gray-300' : 'text-gray-500'}`}>
                                {item.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Footer Info */}
                      <div className="flex items-center justify-between border-t border-gray-50 pt-2.5 text-[11px] text-gray-400">
                        <div className="flex items-center gap-1 font-mono text-[10px]">
                          <Calendar size={11} className="text-gray-300" />
                          <span>{task.dueDate}</span>
                        </div>
                        {assignee && (
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-gray-500 text-xs">{assignee.name.split(' ')[0]}</span>
                            <img src={assignee.avatar} className="w-4 h-4 rounded-full object-cover border border-gray-200" alt={assignee.name} />
                          </div>
                        )}
                      </div>

                      {/* Action Overlays / Controls */}
                      <div className="pt-2 border-t border-gray-50 flex justify-between items-center gap-1">
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-50 transition-colors"
                          title="Delete deliverable"
                        >
                          <Trash2 size={13} />
                        </button>

                        <div className="flex items-center gap-1.5">
                          {/* AI Enhance Button */}
                          <button
                            onClick={() => handleAIEnhance(task)}
                            disabled={isAILoading}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all inline-flex items-center gap-1 ${
                              isAILoading
                                ? 'bg-amber-50 border-amber-100 text-amber-500 animate-pulse'
                                : 'bg-amber-50/60 border-amber-100/50 text-amber-700 hover:bg-amber-50 hover:border-amber-200'
                            }`}
                            title="Generate checklists and optimal metadata with Gemini"
                          >
                            {isAILoading ? (
                              <RefreshCw size={10} className="animate-spin" />
                            ) : (
                              <Sparkles size={10} className="text-amber-500 fill-amber-500" />
                            )}
                            {isAILoading ? 'Optimizing...' : 'AI Enhance'}
                          </button>

                          {/* Navigation Buttons */}
                          <div className="flex gap-0.5">
                            <button
                              disabled={task.stage === 'todo'}
                              onClick={() => handleMoveStage(task, 'backward')}
                              className="px-1.5 py-0.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-gray-500 disabled:opacity-30 text-xs font-semibold"
                            >
                              &larr;
                            </button>
                            <button
                              disabled={task.stage === 'done'}
                              onClick={() => handleMoveStage(task, 'forward')}
                              className="px-1.5 py-0.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-gray-500 disabled:opacity-30 text-xs font-semibold"
                            >
                              &rarr;
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {stageTasks.length === 0 && (
                  <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 text-xs font-light">
                    No items in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Creation Drawer / Modal overlay */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/15 backdrop-blur-xs flex items-center justify-end z-50">
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="w-full max-w-md h-full bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                <h3 className="text-lg font-sans font-medium text-zinc-950">Add Corporate Deliverable</h3>
                <button onClick={() => setIsAdding(false)} className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-50">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4 text-sm">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-600 block">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Finalize compliance reports"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-600 block">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Provide details about compliance criteria, targets, and goals."
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-600 block">Priority</label>
                    <select
                      value={newPriority}
                      onChange={e => setNewPriority(e.target.value as any)}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-600 block">Due Date</label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={e => setNewDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-600 block">Assignee</label>
                  <select
                    value={newAssignee}
                    onChange={e => setNewAssignee(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none bg-white"
                  >
                    {team.map(member => (
                      <option key={member.id} value={member.id}>{member.name} ({member.department})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-600 block">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g., Security, Legal, Finance"
                    value={newTagsString}
                    onChange={e => setNewTagsString(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-zinc-950 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors mt-6 shadow-sm"
                >
                  Create Deliverable
                </button>
              </form>
            </div>
            
            <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
              <Sparkles size={16} className="text-amber-600 fill-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 leading-normal">
                <p className="font-semibold">Protip: Leverage AI Enhancement</p>
                <p className="mt-0.5">Once created, click the "AI Enhance" button on the card. Gemini will automatically refine descriptions, map tags, and build an executable checklist based on industry standards!</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
