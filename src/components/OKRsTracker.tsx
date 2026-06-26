import React, { useState } from 'react';
import { OKR, TeamMember } from '../types';
import { 
  TrendingUp, 
  Target, 
  CheckCircle, 
  Plus, 
  Trash2, 
  X,
  PlusSquare,
  Users
} from 'lucide-react';

interface OKRsTrackerProps {
  okrs: OKR[];
  team: TeamMember[];
  onAddOKR: (okr: OKR) => void;
  onUpdateOKR: (okr: OKR) => void;
}

export default function OKRsTracker({ okrs, team, onAddOKR, onUpdateOKR }: OKRsTrackerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newObjective, setNewObjective] = useState('');
  const [newOwner, setNewOwner] = useState(team[0]?.id || '');
  const [newDept, setNewDept] = useState('Engineering');

  // Key Result input helpers
  const [krText1, setKrText1] = useState('');
  const [krTarget1, setKrTarget1] = useState(100);
  const [krUnit1, setKrUnit1] = useState('%');

  const [krText2, setKrText2] = useState('');
  const [krTarget2, setKrTarget2] = useState(10);
  const [krUnit2, setKrUnit2] = useState('milestones');

  const handleCreateOKR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjective.trim()) return;

    const keyResults = [];
    if (krText1.trim()) {
      keyResults.push({
        id: `kr_${Date.now()}_1`,
        text: krText1,
        target: krTarget1,
        current: 0,
        unit: krUnit1 || '%'
      });
    }
    if (krText2.trim()) {
      keyResults.push({
        id: `kr_${Date.now()}_2`,
        text: krText2,
        target: krTarget2,
        current: 0,
        unit: krUnit2 || 'milestones'
      });
    }

    const newOkr: OKR = {
      id: `okr_${Date.now()}`,
      objective: newObjective,
      ownerId: newOwner,
      department: newDept,
      progress: 0,
      keyResults
    };

    onAddOKR(newOkr);
    setIsAdding(false);

    // Reset
    setNewObjective('');
    setKrText1('');
    setKrText2('');
  };

  const handleUpdateKRProgress = (okr: OKR, krId: string, currentVal: number) => {
    const updatedKeyResults = okr.keyResults.map(kr => {
      if (kr.id === krId) {
        const value = Math.max(0, Math.min(kr.target, currentVal));
        return { ...kr, current: value };
      }
      return kr;
    });

    // Recalculate average progress of OKR based on KRs
    const totalProgress = updatedKeyResults.reduce((acc, kr) => {
      const percentage = kr.target > 0 ? (kr.current / kr.target) * 100 : 0;
      return acc + percentage;
    }, 0);
    const averageProgress = Math.round(totalProgress / (updatedKeyResults.length || 1));

    onUpdateOKR({
      ...okr,
      keyResults: updatedKeyResults,
      progress: averageProgress
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Objectives & Key Results (OKRs)</h2>
          <p className="text-gray-400 text-sm font-light">Define, trace, and align strategic department goals with measurable quantitative benchmarks.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-5 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-gray-800 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Plus size={14} /> Establish New OKR
        </button>
      </div>

      {/* OKR Cards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {okrs.map(okr => {
          const owner = team.find(m => m.id === okr.ownerId);

          return (
            <div key={okr.id} className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-6 hover:border-gray-300 transition-all">
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono tracking-wider text-blue-600 bg-blue-50 border border-blue-100/30 px-2.5 py-1 rounded uppercase font-bold">
                    {okr.department} Dept
                  </span>
                  {owner && (
                    <div className="flex items-center gap-2" title={`${owner.name} (${owner.role})`}>
                      <span className="text-xs text-gray-500 font-medium">{owner.name.split(' ')[0]}</span>
                      <img src={owner.avatar} className="w-5 h-5 rounded-full object-cover border border-gray-200" alt={owner.name} />
                    </div>
                  )}
                </div>

                {/* Objective details */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Target size={18} className="text-gray-400 shrink-0 mt-0.5" />
                    <h3 className="font-bold text-gray-900 text-base leading-tight">
                      {okr.objective}
                    </h3>
                  </div>
                  
                  {/* Global Progress */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                      <span className="uppercase tracking-wider text-[10px]">Collective Progress</span>
                      <span className="text-gray-900 font-mono font-bold text-sm">{okr.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-700" 
                        style={{ width: `${okr.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Key Results list */}
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <h4 className="text-[9px] font-mono uppercase text-gray-400 tracking-wider font-bold">Measurable Key Results</h4>
                  {okr.keyResults.map(kr => {
                    const percentage = Math.round((kr.current / kr.target) * 100);

                    return (
                      <div key={kr.id} className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 space-y-3 text-xs">
                        <div className="flex justify-between items-start gap-4">
                          <p className="font-bold text-gray-700 leading-tight">{kr.text}</p>
                          <span className="text-[10px] font-mono text-blue-600 bg-blue-50 border border-blue-100/35 px-1.5 py-0.5 rounded font-bold shrink-0">{percentage}%</span>
                        </div>

                        {/* Interactive Key Result Slider for progress tuning */}
                        <div className="space-y-1 pt-1">
                          <input
                            type="range"
                            min="0"
                            max={kr.target}
                            value={kr.current}
                            onChange={e => handleUpdateKRProgress(okr, kr.id, parseFloat(e.target.value))}
                            className="w-full accent-black cursor-pointer h-1 bg-gray-200 rounded-lg appearance-none"
                          />
                          <div className="flex justify-between text-[9px] font-mono text-gray-400">
                            <span>Current: <strong className="text-gray-700">{kr.current}</strong> {kr.unit}</span>
                            <span>Target: <strong className="text-gray-700">{kr.target}</strong> {kr.unit}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {okr.keyResults.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No key results currently defined. Please add key targets.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add OKR Overlay Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/15 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-xl bg-white p-6 rounded-3xl border border-zinc-200 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3 mb-4">
              <h3 className="text-base font-sans font-medium text-zinc-950">Add Corporate Objective (OKR)</h3>
              <button onClick={() => setIsAdding(false)} className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-50">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOKR} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 block">Strategic Objective Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Expand global customer experience metrics"
                  value={newObjective}
                  onChange={e => setNewObjective(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-600 block">Objective Sponsor / Owner</label>
                  <select
                    value={newOwner}
                    onChange={e => setNewOwner(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none bg-white"
                  >
                    {team.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.department})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-600 block">Department Alignment</label>
                  <select
                    value={newDept}
                    onChange={e => setNewDept(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none bg-white"
                  >
                    <option value="Product">Product & Design</option>
                    <option value="Engineering">Engineering & IT</option>
                    <option value="Human Resources">Human Resources & Culture</option>
                    <option value="Operations">Operations & Supply</option>
                    <option value="Finance">Finance & Control</option>
                  </select>
                </div>
              </div>

              {/* Key Results configuration subform */}
              <div className="border-t border-zinc-100 pt-4 space-y-4">
                <h4 className="text-xs font-semibold text-zinc-700 flex items-center gap-1">
                  <TrendingUp size={14} /> Establish Quantitative Key Results (Max 2)
                </h4>

                {/* KR 1 */}
                <div className="p-3 bg-zinc-50 border border-zinc-200/50 rounded-2xl space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase font-mono block">Key Result #1</label>
                    <input
                      type="text"
                      placeholder="e.g. Conduct training seminars for 100% customer reps"
                      value={krText1}
                      onChange={e => setKrText1(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase font-mono block">Target Value</label>
                      <input
                        type="number"
                        value={krTarget1}
                        onChange={e => setKrTarget1(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase font-mono block">Unit</label>
                      <input
                        type="text"
                        placeholder="e.g. % or events"
                        value={krUnit1}
                        onChange={e => setKrUnit1(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* KR 2 */}
                <div className="p-3 bg-zinc-50 border border-zinc-200/50 rounded-2xl space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase font-mono block">Key Result #2 (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Reduce customer ticket response times to under 15 min"
                      value={krText2}
                      onChange={e => setKrText2(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase font-mono block">Target Value</label>
                      <input
                        type="number"
                        value={krTarget2}
                        onChange={e => setKrTarget2(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase font-mono block">Unit</label>
                      <input
                        type="text"
                        placeholder="e.g. min or releases"
                        value={krUnit2}
                        onChange={e => setKrUnit2(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="w-1/2 py-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl font-medium text-xs text-zinc-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-medium text-xs shadow-sm"
                >
                  Confirm OKR Alignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
