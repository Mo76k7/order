import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, CheckCircle, Clock, Utensils, ArrowRight, Check, AlertCircle, ShoppingBag } from 'lucide-react';

const formatOrderLabel = (id) => {
  if (!id) return '#Order';
  const str = id.toString();
  if (str.includes('-')) return `#Order${str.slice(0, 4)}`;
  return `#Order${str}`;
};

export default function WaiterApp() {
  const [calls, setCalls] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'calls'

  useEffect(() => {
    fetchCalls();
    fetchReadyOrders();

    // Channel for waiter_calls
    const callsChannel = supabase
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

    // Channel for waiter-orders (listening for status = 'ready' or status = 'served')
    const ordersChannel = supabase
      .channel('waiter-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const updatedOrder = payload.new;
          if (updatedOrder.status === 'ready' || updatedOrder.status === 'served') {
            setReadyOrders(prev => {
              const exists = prev.some(o => o.id.toString() === updatedOrder.id.toString());
              if (!exists) return [updatedOrder, ...prev];
              return prev.map(o => o.id.toString() === updatedOrder.id.toString() ? updatedOrder : o);
            });
          } else {
            setReadyOrders(prev => prev.filter(o => o.id.toString() !== updatedOrder.id.toString()));
          }
        } else if (payload.eventType === 'DELETE') {
          setReadyOrders(prev => prev.filter(o => o.id.toString() !== payload.old.id.toString()));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(callsChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  const fetchCalls = async () => {
    const { data, error } = await supabase
      .from('waiter_calls')
      .select('*')
      .neq('status', 'resolved')
      .neq('status', 'done')
      .order('created_at', { ascending: true });
    
    if (data) setCalls(data);
    else if (error) console.error("Error fetching waiter calls:", error);
  };

  const fetchReadyOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['ready', 'served'])
      .order('created_at', { ascending: false });

    if (data) setReadyOrders(data);
    else if (error) console.error("Error fetching ready orders:", error);
  };

  const markResolved = async (id) => {
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

  const markOrderServed = async (orderId) => {
    setReadyOrders(prev => prev.map(o => o.id.toString() === orderId.toString() ? { ...o, status: 'served' } : o));
    const { error } = await supabase
      .from('orders')
      .update({ status: 'served' })
      .eq('id', orderId);

    if (error) {
      console.error("Error updating order to served:", error);
      fetchReadyOrders();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans flex flex-col">
      <header className="bg-neutral-900 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Bell className="text-orange-400" size={28} />
          <div>
            <h1 className="text-2xl font-black tracking-tight">Waiter Dashboard</h1>
            <p className="text-xs text-neutral-400 font-medium">Real-time table service & pickup alerts</p>
          </div>
        </div>

        <div className="flex bg-neutral-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
              activeTab === 'orders' ? 'bg-orange-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShoppingBag size={16} /> Ready Dishes
            {readyOrders.filter(o => o.status === 'ready').length > 0 && (
              <span className="bg-white text-orange-600 text-xs px-2 py-0.5 rounded-full font-black">
                {readyOrders.filter(o => o.status === 'ready').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('calls')}
            className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
              activeTab === 'calls' ? 'bg-orange-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Bell size={16} /> Table Calls
            {calls.length > 0 && (
              <span className="bg-white text-orange-600 text-xs px-2 py-0.5 rounded-full font-black">
                {calls.length}
              </span>
            )}
          </button>
        </div>
      </header>
      
      <main className="flex-grow p-4 sm:p-6 overflow-y-auto">
        {activeTab === 'orders' ? (
          readyOrders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-400 gap-4 opacity-70 py-20">
              <CheckCircle size={64} />
              <p className="text-xl font-bold">No orders waiting for pickup</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {readyOrders.map(order => {
                const isReady = order.status === 'ready';
                return (
                  <div key={order.id} className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden flex flex-col h-full transform transition-transform hover:scale-[1.02] ${isReady ? 'border-emerald-500 shadow-emerald-500/10' : 'border-neutral-200 opacity-80'}`}>
                    <div className={`${isReady ? 'bg-emerald-600' : 'bg-neutral-800'} text-white p-4 flex justify-between items-center`}>
                      <div>
                        <span className="font-black text-2xl tracking-tight">Table {order.table_number || '?'}</span>
                        <p className="text-xs font-bold text-white/80">{formatOrderLabel(order.id)}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${isReady ? 'bg-white text-emerald-700 animate-pulse' : 'bg-white/20 text-white'}`}>
                        {order.status}
                      </span>
                    </div>

                    {order.instructions && (
                      <div className="bg-yellow-50 border-b border-yellow-100 p-3 text-yellow-800 text-xs font-medium flex items-center gap-1.5">
                        <AlertCircle size={14} className="flex-shrink-0" />
                        <span>{order.instructions}</span>
                      </div>
                    )}
                    
                    <div className="p-4 flex-grow bg-neutral-50">
                      <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Utensils size={14} /> Items to serve
                      </p>
                      <ul className="space-y-1.5">
                        {(order.cart || []).map((item, idx) => (
                          <li key={idx} className="flex gap-2 text-sm font-bold text-neutral-800">
                            <span className="bg-neutral-200 text-neutral-800 text-xs font-black px-1.5 py-0.5 rounded min-w-[20px] text-center">{item.quantity || item.qty || 1}x</span>
                            <span>{typeof item.name === 'object' ? (item.name.en || item.name.am) : item.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-white border-t border-neutral-100 mt-auto">
                      {isReady ? (
                        <button 
                          onClick={() => markOrderServed(order.id)}
                          className="w-full bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2"
                        >
                          <ArrowRight size={18} /> Mark Served to Table
                        </button>
                      ) : (
                        <div className="py-2 text-center text-xs font-bold text-neutral-400 flex items-center justify-center gap-1">
                          <Check size={14} /> Served
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          calls.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-400 gap-4 opacity-70 py-20">
              <CheckCircle size={64} />
              <p className="text-xl font-bold">No pending table calls</p>
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
                    {call.reason && (
                      <p className="mt-2 text-sm font-bold text-orange-600 bg-orange-50 p-2 rounded-lg border border-orange-100">
                        {call.reason}
                      </p>
                    )}
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
          )
        )}
      </main>
    </div>
  );
}
