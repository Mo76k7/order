import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, CheckCircle, Clock } from 'lucide-react';

export default function WaiterApp() {
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    fetchCalls();

    const channel = supabase
      .channel('public:waiter_calls')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waiter_calls' }, payload => {
        if (payload.eventType === 'INSERT') {
          if (payload.new.status !== 'resolved' && payload.new.status !== 'done') {
            setCalls(prev => {
              if (prev.some(c => c.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          }
        } else if (payload.eventType === 'UPDATE') {
          if (payload.new.status === 'resolved' || payload.new.status === 'done') {
            setCalls(prev => prev.filter(c => c.id !== payload.new.id));
          } else {
            setCalls(prev => {
              const exists = prev.some(c => c.id === payload.new.id);
              if (!exists) return [...prev, payload.new];
              return prev.map(c => c.id === payload.new.id ? payload.new : c);
            });
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCalls = async () => {
    const { data, error } = await supabase
      .from('waiter_calls')
      .select('*')
      .neq('status', 'resolved')
      .neq('status', 'done')
      .order('created_at', { ascending: true });
    
    if (data) {
      setCalls(data);
    } else if (error) {
      console.error("Error fetching waiter calls:", error);
    }
  };

  const markResolved = async (id) => {
    // Optimistic update
    setCalls(prev => prev.filter(c => c.id !== id));

    const { error } = await supabase
      .from('waiter_calls')
      .update({ status: 'resolved' })
      .eq('id', id);

    if (error) {
      console.error("Error resolving call:", error);
      fetchCalls();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans flex flex-col">
      <header className="bg-neutral-900 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Bell className="text-orange-400" size={28} />
          <h1 className="text-2xl font-black tracking-tight">Waiter Dashboard</h1>
        </div>
      </header>
      
      <main className="flex-grow p-4 sm:p-6 overflow-y-auto">
        {calls.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-400 gap-4 opacity-70">
            <CheckCircle size={64} />
            <p className="text-xl font-bold">No pending requests</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {calls.map(call => (
              <div key={call.id} className="bg-white rounded-2xl shadow-sm border-2 border-neutral-200 overflow-hidden flex flex-col h-full transform transition-transform hover:scale-[1.02]">
                <div className="bg-orange-500 text-white p-4 flex justify-between items-center">
                  <span className="font-black text-2xl tracking-tight">Table {call.table_number || '?'}</span>
                  <Bell size={24} className="animate-pulse" />
                </div>
                
                <div className="p-4 flex-grow flex flex-col justify-center bg-neutral-50">
                  <p className="text-neutral-500 text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock size={14} /> Requested at
                  </p>
                  <p className="text-lg font-medium text-neutral-800">
                    {new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="p-3 bg-white border-t border-neutral-100 mt-auto">
                  <button 
                    onClick={() => markResolved(call.id)}
                    className="w-full bg-green-100 hover:bg-green-500 text-green-700 hover:text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2"
                  >
                    <CheckCircle size={20} /> Mark Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
