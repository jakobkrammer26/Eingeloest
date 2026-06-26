import React, { useState } from 'react';
import { TeamMember } from '../types';
import { 
  Users, 
  Mail, 
  Tag, 
  Building, 
  Plus, 
  X, 
  CheckCircle,
  Briefcase
} from 'lucide-react';

interface TeamDirectoryProps {
  team: TeamMember[];
  onAddMember: (member: TeamMember) => void;
}

export default function TeamDirectory({ team, onAddMember }: TeamDirectoryProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [deptFilter, setDeptFilter] = useState<string>('all');

  // New member states
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDept, setNewDept] = useState('Product');
  const [newAvatar, setNewAvatar] = useState('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80');

  const AVATARS_POOL = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  ];

  const DEPARTMENTS = ['Product', 'Engineering', 'Human Resources', 'Operations', 'Finance'];

  const filteredTeam = team.filter(m => deptFilter === 'all' || m.department === deptFilter);

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRole.trim()) return;

    const newMember: TeamMember = {
      id: `member_${Date.now()}`,
      name: newName,
      role: newRole,
      email: newEmail || `${newName.toLowerCase().replace(' ', '.')}@effer.corp`,
      department: newDept,
      avatar: newAvatar
    };

    onAddMember(newMember);
    setIsAdding(false);

    // Reset
    setNewName('');
    setNewRole('');
    setNewEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-sans font-medium text-zinc-900 tracking-tight">Corporate Roster Directory</h2>
          <p className="text-zinc-500 text-sm">Review employee credentials, departments, roles, and administrative points of contact.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-zinc-950 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus size={16} /> Register New Staff
        </button>
      </div>

      {/* Dept filters */}
      <div className="flex gap-2 border-b border-zinc-100 pb-3 overflow-x-auto">
        <button
          onClick={() => setDeptFilter('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border uppercase tracking-wider transition-all ${
            deptFilter === 'all'
              ? 'bg-zinc-950 border-zinc-950 text-white shadow-xs'
              : 'bg-zinc-50 border-zinc-200/50 text-zinc-500 hover:bg-zinc-100'
          }`}
        >
          All Departments
        </button>
        {DEPARTMENTS.map(dept => (
          <button
            key={dept}
            onClick={() => setDeptFilter(dept)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border uppercase tracking-wider transition-all shrink-0 ${
              deptFilter === dept
                ? 'bg-zinc-950 border-zinc-950 text-white shadow-xs'
                : 'bg-zinc-50 border-zinc-200/50 text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Team Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredTeam.map(member => (
          <div key={member.id} className="bg-white rounded-3xl border border-zinc-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4 text-center items-center">
            <div className="flex flex-col items-center">
              {/* Profile image */}
              <div className="w-20 h-20 bg-zinc-100 rounded-full overflow-hidden border-2 border-zinc-100 relative shadow-inner">
                <img src={member.avatar} className="object-cover w-full h-full" alt={member.name} />
              </div>
              
              <h3 className="text-sm font-semibold text-zinc-950 mt-3 leading-tight">{member.name}</h3>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">{member.role}</p>

              {/* Department badge */}
              <span className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-wide font-bold bg-zinc-50 border border-zinc-100 text-zinc-600 rounded-md">
                <Building size={10} /> {member.department}
              </span>
            </div>

            {/* Email contact */}
            <div className="w-full border-t border-zinc-50 pt-3 flex items-center justify-center gap-1.5 text-xs text-zinc-500 font-mono">
              <Mail size={12} className="text-zinc-400" />
              <a href={`mailto:${member.email}`} className="hover:underline hover:text-zinc-900 truncate">
                {member.email}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Hire Roster Modal Overlay */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/15 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white p-6 rounded-3xl border border-zinc-200 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3 mb-4">
              <h3 className="text-base font-sans font-medium text-zinc-950">Register New Staff Member</h3>
              <button onClick={() => setIsAdding(false)} className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-50">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 block">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 block">Role Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Security Engineer"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-600 block">Department</label>
                  <select
                    value={newDept}
                    onChange={e => setNewDept(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none bg-white"
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-600 block">Corporate Email</label>
                  <input
                    type="email"
                    placeholder="Auto-generated if empty"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Avatar Selector pool */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600 block">Choose Avatar Photo</label>
                <div className="flex gap-3">
                  {AVATARS_POOL.map((url, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setNewAvatar(url)}
                      className={`w-12 h-12 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                        newAvatar === url ? 'border-zinc-950 scale-105 shadow-sm' : 'border-transparent hover:border-zinc-300'
                      }`}
                    >
                      <img src={url} className="object-cover w-full h-full" alt="option" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="w-1/2 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl font-medium text-xs text-zinc-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-medium text-xs shadow-sm"
                >
                  Publish Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
