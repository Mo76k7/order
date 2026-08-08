import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChefHat, Clock, CheckCircle2, AlertCircle, 
  Utensils, Globe, ArrowRight, Check, Flame, 
  Timer, RotateCcw, LayoutGrid, MonitorPlay, 
  Volume2, VolumeX, PlusSquare, Maximize
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- TRANSLATIONS ---
const TRANSLATIONS = {
  en: {
    appTitle: 'ZOM Tech Kitchen',
    newStatus: 'NEW ORDER',
    acceptedStatus: 'ACCEPTED',
    preparingStatus: 'PREPARING',
    readyStatus: 'READY',
    table: 'TABLE',
    order: 'Order',
    instructions: 'Special Instructions:',
    acceptOrder: 'Accept Order',
    startPreparing: 'Start Preparing',
    markReady: 'Mark as Ready',
    markServed: 'Mark Served',
    undo: 'Undo',
    minsAgo: 'm ago',
    justNow: 'Just now',
    noOrders: 'No active orders at the moment.',
    items: 'items',
    timeElapsed: 'Time Elapsed',
    activeOrders: 'Active Orders',
    tvMode: 'TV Mode',
    exitTvMode: 'Exit TV Mode',
    soundOn: 'Sound On',
    soundOff: 'Sound Off',
    testOrder: 'Test Order'
  },
  am: {
    appTitle: 'ዞም ቴክ ወጥ ቤት',
    newStatus: 'አዲስ ትዕዛዝ',
    acceptedStatus: 'ተቀብሏል',
    preparingStatus: 'እየተዘጋጀ ነው',
    readyStatus: 'ዝግጁ ነው',
    table: 'ጠረጴዛ',
    order: 'ትዕዛዝ',
    instructions: 'ልዩ መመሪያዎች:',
    acceptOrder: 'ትዕዛዝ ተቀበል',
    startPreparing: 'ማዘጋጀት ጀምር',
    markReady: 'ዝግጁ አድርግ',
    markServed: 'አቅርብ',
    undo: 'መልስ',
    minsAgo: 'ደቂቃ በፊት',
    justNow: 'አሁን',
    noOrders: 'በአሁኑ ጊዜ ምንም ትዕዛዝ የለም።',
    items: 'ምግቦች',
    timeElapsed: 'የወሰደው ጊዜ',
    activeOrders: 'የአሁን ትዕዛዞች',
    tvMode: 'ቲቪ ሞድ',
    exitTvMode: 'ከቲቪ ሞድ ውጣ',
    soundOn: 'ድምጽ አብራ',
    soundOff: 'ድምጽ አጥፋ',
    testOrder: 'ትዕዛዝ ሞክር'
  }
};

export default function KitchenApp() {
  const [lang, setLang] = useState('en');
  const [orders, setOrders] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // App Modes
  const [isTvMode, setIsTvMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const soundEnabledRef = useRef(false);
  
  // Audio Context Ref
  const audioCtxRef = useRef(null);

  const t = TRANSLATIONS[lang];

  // Initialize clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const transformOrder = (row) => ({
    id: row.id.toString(),
    table: row.table_number?.toString() || '?',
    status: row.status,
    timestamp: row.created_at,
    instructions: row.instructions || '',
    items: row.items || row.cart || []
  });

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .neq('status', 'served')
      .order('created_at', { ascending: false });
    
    if (data) {
      setOrders(data.map(transformOrder));
    }
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('kitchen-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        console.log("Realtime event received in kitchen:", payload);
        if (payload.eventType === 'INSERT') {
          if (payload.new.status !== 'served') {
            setOrders(prev => {
              if (prev.some(o => o.id === payload.new.id.toString())) return prev;
              return [transformOrder(payload.new), ...prev];
            });
            playNotificationSound();
          }
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => {
            if (payload.new.status === 'served') {
              return prev.filter(o => o.id !== payload.new.id.toString());
            }
            const exists = prev.some(o => o.id === payload.new.id.toString());
            if (!exists) {
              return [transformOrder(payload.new), ...prev];
            }
            return prev.map(order => 
              order.id === payload.new.id.toString() ? transformOrder(payload.new) : order
            );
          });
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id.toString()));
        }
      })
      .subscribe((status) => {
        console.log("Kitchen realtime subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- SOUND NOTIFICATION (Web Audio API) ---
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playNotificationSound = () => {
    if (!soundEnabledRef.current || !audioCtxRef.current) return;
    
    const ctx = audioCtxRef.current;
    
    // Play two quick, loud chimes (like a service bell)
    const playChime = (startTime, freq) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      // Volume envelope (loud attack, quick decay)
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(1, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
      
      osc.start(startTime);
      osc.stop(startTime + 0.6);
    };

    const now = ctx.currentTime;
    playChime(now, 880);       // A5
    playChime(now + 0.15, 1046.5); // C6
  };

  const toggleSound = () => {
    if (!soundEnabled) initAudio();
    setSoundEnabled(!soundEnabled);
    soundEnabledRef.current = !soundEnabled;
  };

  // --- LOGIC ---
  const changeOrderStatus = async (orderId, newStatus) => {
    setOrders(prev => {
      if (newStatus === 'served') {
        return prev.filter(order => order.id !== orderId.toString());
      }
      return prev.map(order => 
        order.id === orderId.toString() ? { ...order, status: newStatus } : order
      );
    });

    await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
  };

  const simulateNewOrder = async () => {
    initAudio();
    const newTable = Math.floor(Math.random() * 20) + 1;
    await supabase.from('orders').insert([{
      table_number: newTable,
      items: [{ qty: 1, name: { en: 'Burger & Fries', am: 'በርገር እና ቺፕስ' } }],
      cart: [{ qty: 1, name: { en: 'Burger & Fries', am: 'በርገር እና ቺፕስ' } }],
      total_amount: 350,
      total: 350,
      status: 'received',
      instructions: 'Test order from Kitchen app'
    }]);
  };

  const getMinutesElapsed = (timestamp) => {
    const diff = Math.floor((currentTime - new Date(timestamp)) / 60000);
    return diff < 0 ? 0 : diff;
  };

  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const activeOrders = useMemo(() => {
    return orders
      .filter(o => o.status !== 'served')
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [orders]);


// Helper to format clean order labels without raw UUIDs
const formatOrderLabel = (id) => {
  if (!id) return '#Order';
  const str = id.toString();
  if (str.includes('-')) return `#Order${str.slice(0, 4)}`;
  return `#Order${str}`;
};

  // --- STANDARD MODE CARD ---
  const StandardCard = ({ order }) => {
    const minsElapsed = getMinutesElapsed(order.timestamp);
    const isLate = minsElapsed >= 15 && order.status !== 'ready';

    let headerBg = 'bg-[#DC2626]';
    let statusLabel = t.newStatus;
    let StatusIcon = AlertCircle;

    if (order.status === 'received' || order.status === 'new') {
      if (isLate) headerBg = 'bg-[#DC2626] animate-pulse-slow';
    } else if (order.status === 'accepted') {
      headerBg = 'bg-[#2563EB]';
      statusLabel = t.acceptedStatus;
      StatusIcon = CheckCircle2;
    } else if (order.status === 'preparing') {
      headerBg = 'bg-[#F59E0B]';
      statusLabel = t.preparingStatus;
      StatusIcon = Flame;
    } else if (order.status === 'ready') {
      headerBg = 'bg-[#10B981]';
      statusLabel = t.readyStatus;
      StatusIcon = Check;
    }

    return (
      <div className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden flex flex-col h-full ${isLate && order.status !== 'ready' ? 'border-red-400 shadow-red-500/20' : 'border-neutral-200'}`}>
        <div className={`${headerBg} text-white p-3 flex flex-col gap-2 transition-colors`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="bg-white/20 px-2 py-1 rounded text-lg font-black tracking-wider">{formatOrderLabel(order.id)}</span>
              <span className="font-bold flex items-center gap-1"><Utensils size={16}/> {t.table} {order.table}</span>
            </div>
            <div className={`flex items-center gap-1.5 font-bold px-2 py-1 rounded-lg ${isLate && order.status !== 'ready' ? 'bg-red-800 text-white' : 'bg-white/20'}`}>
              <Clock size={16} />
              {minsElapsed === 0 ? t.justNow : `${minsElapsed} ${t.minsAgo}`}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-black tracking-widest bg-black/20 w-fit px-2 py-1 rounded-md">
            <StatusIcon size={14} /> {statusLabel}
          </div>
        </div>

        {order.instructions && (
          <div className="bg-yellow-100 border-b border-yellow-200 p-3 flex gap-2 text-yellow-800">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-0.5">{t.instructions}</p>
              <p className="font-medium text-sm">{order.instructions}</p>
            </div>
          </div>
        )}

        <div className="p-4 flex-grow bg-neutral-50/50">
          <ul className="space-y-3">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <span className="bg-neutral-200 text-neutral-800 font-black px-2 py-0.5 rounded text-sm min-w-[28px] text-center">{item.qty || item.quantity || 1}</span>
                <span className="font-bold text-neutral-800 text-lg leading-tight mt-0.5">{typeof item.name === 'object' ? (item.name[lang] || item.name.en) : item.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-3 bg-white border-t border-neutral-100 flex gap-2 mt-auto">
          {(order.status === 'received' || order.status === 'new') && (
            <button onClick={() => changeOrderStatus(order.id, 'accepted')} className="flex-1 bg-blue-100 hover:bg-blue-600 text-blue-700 hover:text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2">
              <CheckCircle2 size={20} /> {t.acceptOrder}
            </button>
          )}
          {order.status === 'accepted' && (
            <>
              <button onClick={() => changeOrderStatus(order.id, 'received')} className="p-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl transition-colors" title={t.undo}><RotateCcw size={20} /></button>
              <button onClick={() => changeOrderStatus(order.id, 'preparing')} className="flex-1 bg-orange-100 hover:bg-orange-500 text-orange-700 hover:text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2">
                <Flame size={20} /> {t.startPreparing}
              </button>
            </>
          )}
          {order.status === 'preparing' && (
            <>
              <button onClick={() => changeOrderStatus(order.id, 'accepted')} className="p-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl transition-colors" title={t.undo}><RotateCcw size={20} /></button>
              <button onClick={() => changeOrderStatus(order.id, 'ready')} className="flex-1 bg-green-100 hover:bg-green-600 text-green-700 hover:text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2">
                <Check size={20} /> {t.markReady}
              </button>
            </>
          )}
          {order.status === 'ready' && (
            <>
              <button onClick={() => changeOrderStatus(order.id, 'preparing')} className="p-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl transition-colors" title={t.undo}><RotateCcw size={20} /></button>
              <div className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                <CheckCircle2 size={20} /> Ready for Pickup
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // --- TV / BIG SCREEN MODE CARD ---
  const TvCard = ({ order }) => {
    const minsElapsed = getMinutesElapsed(order.timestamp);
    const isLate = minsElapsed >= 15 && order.status !== 'ready';

    let bgClass = 'bg-[#DC2626] text-white';
    let statusLabel = t.newStatus;
    let nextStatus = 'accepted';
    let undoStatus = null;

    if (order.status === 'accepted') {
      bgClass = 'bg-[#2563EB] text-white';
      statusLabel = t.acceptedStatus;
      nextStatus = 'preparing';
      undoStatus = 'received';
    } else if (order.status === 'preparing') {
      bgClass = 'bg-[#F59E0B] text-neutral-900';
      statusLabel = t.preparingStatus;
      nextStatus = 'ready';
      undoStatus = 'accepted';
    } else if (order.status === 'ready') {
      bgClass = 'bg-[#10B981] text-white';
      statusLabel = t.readyStatus;
      nextStatus = null;
      undoStatus = 'preparing';
    }

    if ((order.status === 'received' || order.status === 'new') && isLate) {
      bgClass = 'bg-[#DC2626] text-white animate-pulse-slow';
    }

    const handleTap = () => {
      if (nextStatus) changeOrderStatus(order.id, nextStatus);
    };

    const handleUndo = (e) => {
      e.stopPropagation();
      if (undoStatus) changeOrderStatus(order.id, undoStatus);
    };

    return (
      <div 
        onClick={handleTap}
        className={`relative flex flex-col p-6 rounded-2xl shadow-xl cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] transition-all select-none border-4 border-black/10 ${bgClass}`}
        style={{ minHeight: '400px' }}
      >
        {/* Undo Button (Top Right corner) */}
        {undoStatus && (
          <button 
            onClick={handleUndo}
            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-current p-3 rounded-full backdrop-blur-sm transition-colors"
          >
            <RotateCcw size={28} />
          </button>
        )}

        {/* Header Row: ID and Time */}
        <div className="flex justify-between items-start font-black text-5xl sm:text-6xl mb-4 pr-16 leading-none">
          <span className="tracking-tighter">{formatOrderLabel(order.id)}</span>
          <div className="flex flex-col items-end">
            <span>{formatTime(order.timestamp)}</span>
            <span className="text-2xl sm:text-3xl opacity-80 mt-1">({minsElapsed}m)</span>
          </div>
        </div>

        {/* Table Number */}
        <div className="text-4xl sm:text-5xl font-black mb-8 border-b-4 border-black/10 pb-4 tracking-tight">
          {t.table} {order.table}
        </div>

        {/* Items List */}
        <div className="flex-grow space-y-4 mb-8">
          {order.instructions && (
            <div className="bg-black/10 p-3 rounded-xl mb-4 text-2xl sm:text-3xl font-bold flex gap-3">
              <AlertCircle className="flex-shrink-0 mt-1" size={32} />
              <span>{order.instructions}</span>
            </div>
          )}
          {order.items.map((item, idx) => (
            <div key={idx} className="text-3xl sm:text-4xl font-bold leading-tight flex gap-4">
              <span className="font-black bg-black/10 px-3 rounded-lg">{item.qty || item.quantity || 1}x</span>
              <span className="uppercase">{typeof item.name === 'object' ? (item.name[lang] || item.name.en) : item.name}</span>
            </div>
          ))}
        </div>

        {/* Status Footer */}
        <div className="text-4xl sm:text-5xl font-black tracking-widest uppercase bg-black/10 p-4 rounded-xl text-center mt-auto">
          {order.status === 'ready' ? 'READY FOR PICKUP' : statusLabel}
        </div>
      </div>
    );
  };

  // --- RENDER ---
  return (
    <div className={`min-h-screen font-sans flex flex-col h-screen overflow-hidden ${isTvMode ? 'bg-black' : 'bg-[#111827] text-white'}`}>
      
      {/* STANDARD NAVBAR (Hidden in TV Mode) */}
      {!isTvMode && (
        <header className="bg-neutral-900 text-white p-4 flex justify-between items-center shadow-md z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <ChefHat size={28} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none">{t.appTitle}</h1>
              <p className="text-white/60 text-xs font-bold mt-1 flex items-center gap-1">
                <Clock size={12}/> {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Sound Toggle */}
            <button 
              onClick={toggleSound}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full font-bold transition-colors text-sm ${soundEnabled ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="hidden sm:inline">{soundEnabled ? t.soundOn : t.soundOff}</span>
            </button>

            {/* TV Mode Toggle */}
            <button 
              onClick={() => setIsTvMode(true)}
              className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white px-3 py-2 rounded-full font-bold transition-colors text-sm ml-2 shadow-lg shadow-orange-600/20"
            >
              <MonitorPlay size={16} /> <span className="hidden sm:inline">{t.tvMode}</span>
            </button>

            {/* Language */}
            <button 
              onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full font-bold transition-colors text-sm ml-2"
            >
              <Globe size={16} /> {lang === 'en' ? 'አማርኛ' : 'EN'}
            </button>
          </div>
        </header>
      )}

      {/* MAIN CONTENT AREA */}
      <main className={`flex-grow overflow-y-auto ${isTvMode ? 'p-4 sm:p-6' : 'p-4 sm:p-6'}`}>
        
        {activeOrders.length === 0 ? (
          <div className={`h-full flex flex-col items-center justify-center gap-4 ${isTvMode ? 'text-white/40' : 'text-neutral-400 opacity-60'}`}>
            <CheckCircle2 size={isTvMode ? 120 : 64} />
            <p className={`font-bold ${isTvMode ? 'text-4xl' : 'text-xl'}`}>{t.noOrders}</p>
          </div>
        ) : (
          <div className={`grid gap-4 sm:gap-6 ${
            isTvMode 
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
            {activeOrders.map(order => (
               isTvMode ? <TvCard key={order.id} order={order} /> : <StandardCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>

      {/* TV MODE EXIT BUTTON & CONTROLS (Floating) */}
      {isTvMode && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
          <button 
            onClick={toggleSound}
            className={`backdrop-blur-md p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center ${soundEnabled ? 'bg-blue-600/80 text-white' : 'bg-neutral-800/80 text-white/50 hover:bg-neutral-700/80'}`}
            title={soundEnabled ? t.soundOn : t.soundOff}
          >
            {soundEnabled ? <Volume2 size={28} /> : <VolumeX size={28} />}
          </button>
          <button 
            onClick={() => setIsTvMode(false)}
            className="bg-neutral-800/80 hover:bg-neutral-700/80 backdrop-blur-md text-white px-6 py-4 rounded-full font-black text-lg shadow-2xl flex items-center gap-3 transition-transform hover:scale-105 border border-white/10"
          >
            <Maximize size={24} className="rotate-45" /> {t.exitTvMode}
          </button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-slow {
          0%, 100% { background-color: #b91c1c; } /* darker red */
          50% { background-color: #ef4444; }    /* brighter red */
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #a1a1aa; }
        
        /* Dark mode scrollbar for TV mode */
        body.tv-mode ::-webkit-scrollbar-thumb { background: #3f3f46; }
      `}} />
    </div>
  );
}


