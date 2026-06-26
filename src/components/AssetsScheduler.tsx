import React, { useState } from 'react';
import { CorporateAsset, Booking, TeamMember } from '../types';
import { 
  Calendar, 
  MapPin, 
  Layers, 
  CheckCircle, 
  Clock, 
  Plus, 
  Trash2, 
  X,
  Info
} from 'lucide-react';

interface AssetsSchedulerProps {
  assets: CorporateAsset[];
  bookings: Booking[];
  team: TeamMember[];
  onAddBooking: (booking: Booking) => void;
  onDeleteBooking: (id: string) => void;
  onUpdateAssetStatus: (id: string, status: CorporateAsset['status']) => void;
}

export default function AssetsScheduler({ 
  assets, 
  bookings, 
  team, 
  onAddBooking, 
  onDeleteBooking,
  onUpdateAssetStatus
}: AssetsSchedulerProps) {
  const [selectedAsset, setSelectedAsset] = useState<CorporateAsset | null>(assets[0] || null);
  const [isBooking, setIsBooking] = useState(false);
  const [assetFilter, setAssetFilter] = useState<string>('all');

  // Form states for booking
  const [bookedBy, setBookedBy] = useState(team[0]?.name || '');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('09:00 - 10:30');
  const [purpose, setPurpose] = useState('');

  const TIME_SLOTS = [
    '09:00 - 10:30',
    '10:30 - 12:00',
    '12:00 - 13:30',
    '13:30 - 15:00',
    '15:00 - 16:30',
    '16:30 - 18:00'
  ];

  const filteredAssets = assets.filter(a => assetFilter === 'all' || a.type === assetFilter);

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !bookingDate || !purpose.trim()) return;

    // Double check slot availability
    const conflict = bookings.find(b => 
      b.assetId === selectedAsset.id && 
      b.date === bookingDate && 
      b.timeSlot === bookingSlot
    );

    if (conflict) {
      alert(`Conflict: This resource is already booked for ${bookingSlot} on ${bookingDate} by ${conflict.bookedBy}.`);
      return;
    }

    const newBooking: Booking = {
      id: `booking_${Date.now()}`,
      assetId: selectedAsset.id,
      bookedBy,
      date: bookingDate,
      timeSlot: bookingSlot,
      purpose
    };

    onAddBooking(newBooking);
    onUpdateAssetStatus(selectedAsset.id, 'reserved');
    setIsBooking(false);
    
    // Reset
    setPurpose('');
    setBookingDate('');
  };

  const getAssetBookings = (assetId: string) => {
    return bookings.filter(b => b.assetId === assetId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-100 pb-6">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Resource Planner & Scheduling</h2>
        <p className="text-gray-400 text-sm font-light">Book boardrooms, request test kits, or reserve vehicles for client travel.</p>
      </div>

      {/* Asset Type Filter */}
      <div className="flex gap-2">
        {['all', 'room', 'vehicle', 'hardware'].map(type => (
          <button
            key={type}
            onClick={() => setAssetFilter(type)}
            className={`px-4 py-1.5 text-[10px] font-bold rounded-full border uppercase tracking-wider transition-all ${
              assetFilter === type
                ? 'bg-black border-black text-white shadow-xs'
                : 'bg-gray-100 border-gray-200/50 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? 'All Assets' : `${type}s`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Asset listing */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Inventory Status</h3>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredAssets.map(asset => {
                const isSelected = selectedAsset?.id === asset.id;
                const assetBookingsCount = getAssetBookings(asset.id).length;

                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-black bg-[#F5F5F7] shadow-xs'
                        : 'border-gray-100 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] font-mono tracking-wide px-2 py-0.5 rounded border uppercase font-bold ${
                        asset.status === 'available'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50'
                          : asset.status === 'reserved'
                          ? 'bg-blue-50 text-blue-700 border-blue-100/50'
                          : 'bg-gray-100 text-gray-500 border-gray-200/40'
                      }`}>
                        {asset.status}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 font-bold">{assetBookingsCount} bookings</span>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 mt-2">{asset.name}</h4>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{asset.description}</p>
                    
                    {asset.location && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono mt-3">
                        <MapPin size={10} className="text-gray-300" />
                        <span>{asset.location}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Selected Asset Schedule timeline */}
        <div className="lg:col-span-7">
          {selectedAsset ? (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[9px] font-mono uppercase text-gray-400 font-bold tracking-wider">{selectedAsset.type} Planner</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-0.5">{selectedAsset.name}</h3>
                </div>
                <button
                  onClick={() => setIsBooking(true)}
                  className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} /> Schedule Booking
                </button>
              </div>

              {/* Booking timelines / list */}
              <div className="space-y-4">
                <h4 className="text-[9px] font-mono uppercase text-gray-400 tracking-wider font-bold">Active Reservations</h4>
                <div className="space-y-3">
                  {getAssetBookings(selectedAsset.id).map(booking => (
                    <div key={booking.id} className="p-4 bg-gray-50/50 border border-gray-200/40 rounded-xl flex justify-between items-center">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="p-1 bg-white text-gray-500 rounded-md border border-gray-100">
                            <Clock size={12} />
                          </span>
                          <span className="text-xs font-mono font-bold text-gray-800">{booking.date} | {booking.timeSlot}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-900 mt-1">{booking.purpose}</p>
                        <p className="text-[10px] text-gray-400">Reserved by: <span className="font-semibold text-gray-500">{booking.bookedBy}</span></p>
                      </div>
                      <button
                        onClick={() => onDeleteBooking(booking.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition-all shrink-0"
                        title="Cancel reservation"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {getAssetBookings(selectedAsset.id).length === 0 && (
                    <div className="border border-dashed border-gray-250 rounded-xl p-8 text-center text-gray-400 text-xs space-y-1.5">
                      <Calendar size={20} className="mx-auto text-gray-300" />
                      <p className="font-light">No reservations currently active for this resource.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Resource Description card */}
              <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 space-y-2">
                <h5 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Info size={12} className="text-blue-500" /> Resource Specifications
                </h5>
                <p className="text-xs text-gray-600 leading-relaxed font-light">{selectedAsset.description}</p>
                {selectedAsset.location && (
                  <p className="text-[10px] text-gray-400 font-mono">Positioning: <span className="font-bold text-gray-600">{selectedAsset.location}</span></p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400 h-full flex items-center justify-center font-light text-xs">
              Select an asset to view its timeline scheduling
            </div>
          )}
        </div>
      </div>

      {/* Booking Form Overlay Modal */}
      {isBooking && selectedAsset && (
        <div className="fixed inset-0 bg-black/15 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white p-6 rounded-3xl border border-zinc-200 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-sans font-medium text-zinc-950">Book Corporate Asset</h3>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{selectedAsset.name}</p>
              </div>
              <button onClick={() => setIsBooking(false)} className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-50">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 block">Reserved By</label>
                <select
                  value={bookedBy}
                  onChange={e => setBookedBy(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none bg-white"
                >
                  {team.map(m => (
                    <option key={m.id} value={m.name}>{m.name} ({m.department})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-600 block">Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-600 block">Time Slot</label>
                  <select
                    value={bookingSlot}
                    onChange={e => setBookingSlot(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none bg-white"
                  >
                    {TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 block">Objective / Meeting Purpose</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SOC2 Audit Alignment Meeting"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsBooking(false)}
                  className="w-1/2 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl font-medium text-xs text-zinc-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-medium text-xs shadow-sm"
                >
                  Confirm Scheduling
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
