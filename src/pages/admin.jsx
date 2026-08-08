import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, ListOrdered, Clock, DollarSign, Bell, Globe, 
  Search, Plus, MoreVertical, Edit2, LayoutGrid, Layers, Grid, 
  Settings2, Users, Star, Store, UserCircle, Activity, 
  ChevronDown, ArrowUpRight, TrendingUp, Calendar, ShoppingBag,
  Megaphone, Tag, Download, MessageSquare, CheckCircle2, ChevronRight,
  Menu as MenuIcon, X, UtensilsCrossed, Smartphone
} from 'lucide-react';

// --- TRANSLATIONS ---
const TRANSLATIONS = {
  en: {
    appTitle: 'ZOM Tech',
    searchPlaceholder: 'Search orders, tables, menu...',
    adminName: 'Admin',
    restaurantName: 'ZOM Restaurant',
    goodMorning: 'Good morning, Admin 👋',
    whatsHappening: "Here's what's happening at ZOM Tech today.",
    // Sidebar Categories
    navMain: 'MAIN',
    navOrders: 'ORDERS',
    navMenu: 'MENU',
    navCustomers: 'CUSTOMERS',
    navRestaurant: 'RESTAURANT',
    // Sidebar Items
    dashboard: 'Dashboard',
    liveOrders: 'Live Orders',
    orderHistory: 'Order History',
    payments: 'Payments',
    menuItems: 'Menu Items',
    categories: 'Categories',
    modifiers: 'Modifiers',
    addons: 'Add-ons',
    menuSettings: 'Menu Settings',
    customers: 'Customers',
    reviews: 'Reviews',
    tables: 'Tables',
    staff: 'Staff',
    settings: 'Settings',
    // Status Widget
    restStatus: 'Restaurant Status',
    open: 'Open',
    openSince: 'Open since 08:00 AM',
    closeRest: 'Close Restaurant',
    // Stats
    totalSales: 'Total Sales',
    ordersToday: 'Orders Today',
    avgOrderValue: 'Average Order Value',
    activeTables: 'Active Tables',
    vsYesterday: 'vs yesterday',
    occupied: 'occupied',
    // Sections
    salesOverview: 'Sales Overview',
    today: 'Today',
    viewAll: 'View all',
    viewAllLive: 'View all live orders',
    viewAllActivity: 'View all activity',
    recentActivity: 'Recent Activity',
    topMenuItems: 'Top Menu Items',
    manageMenu: 'Manage Menu',
    viewFullMenu: 'View full menu',
    quickActions: 'Quick Actions',
    // Menu Tabs/Table
    bestSellers: 'Best Sellers',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    item: 'Item',
    category: 'Category',
    price: 'Price',
    sold: 'Sold',
    revenue: 'Revenue',
    status: 'Status',
    actions: 'Actions',
    available: 'Available',
    // Quick Actions
    addMenuItem: 'Add Menu Item',
    addCategory: 'Add Category',
    manageTables: 'Manage Tables',
    sendAnnouncement: 'Send Announcement',
    discountPromo: 'Discount / Promo',
    exportReports: 'Export Reports',
    // Promo Card
    enableNotifsTitle: 'Enable Order Notifications',
    enableNotifsDesc: 'Get real-time notifications for new orders on your phone.',
    enableNow: 'Enable Now'
  },
  am: {
    appTitle: 'ዞም ቴክ',
    searchPlaceholder: 'ትዕዛዞች፣ ጠረጴዛዎች ይፈልጉ...',
    adminName: 'አስተዳዳሪ',
    restaurantName: 'ዞም ሬስቶራንት',
    goodMorning: 'እንደምን አደሩ, አስተዳዳሪ 👋',
    whatsHappening: "ዛሬ በዞም ቴክ ውስጥ የሚሆነው ይህ ነው።",
    // Sidebar Categories
    navMain: 'ዋና',
    navOrders: 'ትዕዛዞች',
    navMenu: 'ሜኑ',
    navCustomers: 'ደንበኞች',
    navRestaurant: 'ሬስቶራንት',
    // Sidebar Items
    dashboard: 'ዳሽቦርድ',
    liveOrders: 'የአሁን ትዕዛዞች',
    orderHistory: 'የትዕዛዝ ታሪክ',
    payments: 'ክፍያዎች',
    menuItems: 'የምግብ ዝርዝር',
    categories: 'ምድቦች',
    modifiers: 'ማስተካከያዎች',
    addons: 'ተጨማሪዎች',
    menuSettings: 'የሜኑ ቅንብሮች',
    customers: 'ደንበኞች',
    reviews: 'አስተያየቶች',
    tables: 'ጠረጴዛዎች',
    staff: 'ሰራተኞች',
    settings: 'ቅንብሮች',
    // Status Widget
    restStatus: 'የሬስቶራንት ሁኔታ',
    open: 'ክፍት ነው',
    openSince: 'ከ 02:00 ጀምሮ ክፍት',
    closeRest: 'ሬስቶራንት ዝጋ',
    // Stats
    totalSales: 'ጠቅላላ ሽያጭ',
    ordersToday: 'የዛሬ ትዕዛዞች',
    avgOrderValue: 'አማካይ የትዕዛዝ ዋጋ',
    activeTables: 'የተያዙ ጠረጴዛዎች',
    vsYesterday: 'ከትናንት ጋር ሲነፃፀር',
    occupied: 'ተይዟል',
    // Sections
    salesOverview: 'የሽያጭ አጠቃላይ እይታ',
    today: 'ዛሬ',
    viewAll: 'ሁሉንም እይ',
    viewAllLive: 'ሁሉንም የአሁን ትዕዛዞች እይ',
    viewAllActivity: 'ሁሉንም እንቅስቃሴ እይ',
    recentActivity: 'የቅርብ ጊዜ እንቅስቃሴዎች',
    topMenuItems: 'ተወዳጅ ምግቦች',
    manageMenu: 'ሜኑ አስተዳድር',
    viewFullMenu: 'ሙሉ ሜኑ እይ',
    quickActions: 'ፈጣን ተግባራት',
    // Menu Tabs/Table
    bestSellers: 'በጣም የተሸጡ',
    lowStock: 'ያለቀባቸው',
    outOfStock: 'አልቋል',
    item: 'ምግብ',
    category: 'ምድብ',
    price: 'ዋጋ',
    sold: 'ተሽጧል',
    revenue: 'ገቢ',
    status: 'ሁኔታ',
    actions: 'ተግባር',
    available: 'አለ',
    // Quick Actions
    addMenuItem: 'ምግብ ጨምር',
    addCategory: 'ምድብ ጨምር',
    manageTables: 'ጠረጴዛዎችን አስተዳድር',
    sendAnnouncement: 'ማስታወቂያ ላክ',
    discountPromo: 'ቅናሽ / ፕሮሞ',
    exportReports: 'ሪፖርት አውጣ',
    // Promo Card
    enableNotifsTitle: 'የትዕዛዝ ማሳወቂያዎችን አብራ',
    enableNotifsDesc: 'በስልክዎ ላይ ለአዳዲስ ትዕዛዞች የጽሑፍ ማሳወቂያዎችን ያግኙ።',
    enableNow: 'አሁን አብራ'
  }
};

// --- UTILS ---
const getTimeAgo = (timestamp) => {
  const diff = Math.floor((new Date() - timestamp) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff} min ago`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return 'Over a day ago';
};

export default function AdminDashboard() {
  const [lang, setLang] = useState('en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('dashboard');

  const [orders, setOrders] = useState([]);
  const [waiterCalls, setWaiterCalls] = useState([]);
  
  useEffect(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayISO = startOfToday.toISOString();

    const fetchData = async () => {
      const [ordersRes, waiterRes] = await Promise.all([
        supabase.from('orders').select('*').gte('created_at', todayISO),
        supabase.from('waiter_calls').select('*').gte('created_at', todayISO)
      ]);
      
      if (ordersRes.data) setOrders(ordersRes.data);
      if (waiterRes.data) setWaiterCalls(waiterRes.data);
    };

    fetchData();

    const ordersChannel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => {
            if (prev.some(o => o.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => {
            const exists = prev.some(o => o.id === payload.new.id);
            if (!exists) return [payload.new, ...prev];
            return prev.map(o => o.id === payload.new.id ? payload.new : o);
          });
        }
      })
      .subscribe();

    const waiterChannel = supabase
      .channel('admin:waiter_calls')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waiter_calls' }, payload => {
        if (payload.eventType === 'INSERT') {
          setWaiterCalls(prev => {
            if (prev.some(w => w.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setWaiterCalls(prev => prev.map(w => w.id === payload.new.id ? payload.new : w));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(waiterChannel);
    };
  }, []);

  const topMenuItems = useMemo(() => {
    const itemMap = {};
    orders.forEach(order => {
      (order.cart || []).forEach(item => {
        const name = item.name?.en || item.name || 'Unknown';
        if (!itemMap[name]) {
          itemMap[name] = {
            image: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=50&h=50&fit=crop',
            name: name,
            cat: item.category || 'Unknown',
            price: item.price || 0,
            sold: 0,
            rev: 0
          };
        }
        itemMap[name].sold += item.quantity || 1;
        itemMap[name].rev += (item.price || 0) * (item.quantity || 1);
      });
    });
    return Object.values(itemMap).sort((a, b) => b.sold - a.sold).slice(0, 5);
  }, [orders]);

const formatOrderLabel = (id) => {
  if (!id) return '#Order';
  const str = id.toString();
  if (str.includes('-')) return `#Order${str.slice(0, 4)}`;
  return `#Order${str}`;
};

  const recentActivity = useMemo(() => {
    const activities = [];
    orders.forEach(o => {
      activities.push({
        type: 'order',
        icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-100',
        text: `New ${formatOrderLabel(o.id)} from Table ${o.table_number}`,
        timestamp: new Date(o.created_at).getTime()
      });
      if (o.payment_status === 'verified') {
        activities.push({
          type: 'payment',
          icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100',
          text: `Payment verified for ${formatOrderLabel(o.id)}`,
          timestamp: new Date(o.created_at).getTime() + 1000
        });
      }
    });
    waiterCalls.forEach(w => {
      activities.push({
        type: 'waiter',
        icon: Bell, color: 'text-blue-500', bg: 'bg-blue-100',
        text: `Waiter called to Table ${w.table_number}`,
        timestamp: new Date(w.created_at).getTime()
      });
    });
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5).map(a => ({...a, time: getTimeAgo(a.timestamp)}));
  }, [orders, waiterCalls]);

  const liveOrders = useMemo(() => {
    return orders
      .filter(o => o.status !== 'served')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(o => ({
        id: o.id,
        table: o.table_number,
        items: (o.cart || []).reduce((sum, item) => sum + (item.quantity || 1), 0),
        time: getTimeAgo(new Date(o.created_at).getTime()),
        status: o.status,
        color: o.status === 'ready' ? 'text-green-600' : (o.status === 'new' ? 'text-blue-600' : 'text-orange-600'),
        bg: o.status === 'ready' ? 'bg-green-100' : (o.status === 'new' ? 'bg-blue-100' : 'bg-orange-100'),
      }));
  }, [orders]);

  const ordersToday = orders.length;
  const totalSales = orders.reduce((sum, o) => sum + (o.total_amount || o.total || 0), 0);
  const avgOrderValue = ordersToday > 0 ? (totalSales / ordersToday).toFixed(2) : '0.00';
  const activeTablesCount = new Set(orders.filter(o => o.status !== 'served').map(o => o.table_number)).size;

  const t = TRANSLATIONS[lang];

  const SidebarItem = ({ icon: Icon, label, id, badge }) => (
    <button 
      onClick={() => { setActiveRoute(id); setIsSidebarOpen(false); }}
      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
        activeRoute === id 
          ? 'bg-[#1E293B] text-white font-semibold' 
          : 'text-neutral-400 hover:text-white hover:bg-[#1E293B]/50 font-medium'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={activeRoute === id ? 'text-[#F97316]' : ''} />
        {label}
      </div>
      {badge && (
        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );

  const SidebarCategory = ({ label }) => (
    <div className="px-4 text-[10px] font-bold text-neutral-500 tracking-wider mt-6 mb-2 uppercase">
      {label}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-neutral-900">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#0F172A] text-white flex flex-col z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-xl text-white shadow-lg shadow-orange-500/20">
            <UtensilsCrossed size={24} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-none uppercase">{t.appTitle}</h1>
            <p className="text-[10px] text-neutral-400 tracking-widest uppercase mt-1">Restaurant</p>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 pb-6 custom-scrollbar">
          <SidebarItem icon={LayoutDashboard} label={t.dashboard} id="dashboard" />
          
          <SidebarCategory label={t.navOrders} />
          <SidebarItem icon={Clock} label={t.liveOrders} id="liveOrders" badge="12" />
          <SidebarItem icon={ListOrdered} label={t.orderHistory} id="orderHistory" />
          <SidebarItem icon={DollarSign} label={t.payments} id="payments" />
          
          <SidebarCategory label={t.navMenu} />
          <SidebarItem icon={LayoutGrid} label={t.menuItems} id="menuItems" />
          <SidebarItem icon={Layers} label={t.categories} id="categories" />
          <SidebarItem icon={Grid} label={t.modifiers} id="modifiers" />
          <SidebarItem icon={Plus} label={t.addons} id="addons" />
          <SidebarItem icon={Settings2} label={t.menuSettings} id="menuSettings" />

          <SidebarCategory label={t.navCustomers} />
          <SidebarItem icon={Users} label={t.customers} id="customers" />
          <SidebarItem icon={Star} label={t.reviews} id="reviews" />

          <SidebarCategory label={t.navRestaurant} />
          <SidebarItem icon={Store} label={t.tables} id="tables" />
          <SidebarItem icon={UserCircle} label={t.staff} id="staff" />
          <SidebarItem icon={Settings2} label={t.settings} id="settings" />
        </div>

        {/* Restaurant Status Widget */}
        <div className="p-4 mx-4 mb-6 bg-[#1E293B] rounded-xl border border-neutral-700/50">
          <div className="flex items-center gap-2 mb-2 text-neutral-400 text-xs font-semibold">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            {t.restStatus}
          </div>
          <h3 className="text-xl font-bold mb-1">{t.open}</h3>
          <p className="text-xs text-neutral-500 mb-4">{t.openSince}</p>
          <button className="w-full py-2 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-sm font-medium transition-colors">
            {t.closeRest}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="bg-white h-16 border-b border-neutral-200 flex items-center justify-between px-4 sm:px-8 z-30 flex-shrink-0">
          <div className="flex items-center gap-4 w-full max-w-md">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg">
              <MenuIcon size={20} />
            </button>
            
            {/* Search Bar */}
            <div className="hidden sm:flex relative w-full items-center">
              <Search className="absolute left-3 text-neutral-400" size={16} />
              <input 
                type="text" placeholder={t.searchPlaceholder} 
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg pl-9 pr-12 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <kbd className="bg-white border border-neutral-200 rounded px-1.5 py-0.5 text-[10px] font-sans font-semibold text-neutral-400">⌘ K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
              className="flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 font-semibold text-sm transition-colors"
            >
              <Globe size={16} /> <span className="hidden sm:inline">{lang === 'en' ? 'አማርኛ' : 'EN'}</span>
            </button>

            <button className="relative text-neutral-600 hover:text-neutral-900 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
            </button>
            
            <div className="h-6 w-px bg-neutral-200 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-neutral-900 leading-none">{t.adminName}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">{t.restaurantName}</p>
              </div>
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces" alt="Admin" className="w-8 h-8 rounded-full bg-neutral-200 object-cover" />
            </div>
          </div>
        </header>

        {/* DASHBOARD SCROLL AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">
            
            {/* Greeting */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">{t.goodMorning}</h2>
              <p className="text-sm text-neutral-500 mt-1">{t.whatsHappening}</p>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-semibold text-neutral-500">{t.totalSales}</span>
                  <div className="bg-purple-50 text-purple-600 p-2 rounded-lg"><Calendar size={16}/></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">{totalSales.toLocaleString()} <span className="text-base text-neutral-400 font-medium">Br</span></h3>
                  <p className="text-xs font-semibold text-green-600 flex items-center gap-1">
                    <ArrowUpRight size={14}/> 18.6% <span className="text-neutral-400 font-medium">{t.vsYesterday}</span>
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-semibold text-neutral-500">{t.ordersToday}</span>
                  <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><ShoppingBag size={16}/></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">{ordersToday}</h3>
                  <p className="text-xs font-semibold text-green-600 flex items-center gap-1">
                    <ArrowUpRight size={14}/> 12.3% <span className="text-neutral-400 font-medium">{t.vsYesterday}</span>
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-semibold text-neutral-500">{t.avgOrderValue}</span>
                  <div className="bg-orange-50 text-orange-600 p-2 rounded-lg"><TrendingUp size={16}/></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">{avgOrderValue} <span className="text-base text-neutral-400 font-medium">Br</span></h3>
                  <p className="text-xs font-semibold text-green-600 flex items-center gap-1">
                    <ArrowUpRight size={14}/> 8.7% <span className="text-neutral-400 font-medium">{t.vsYesterday}</span>
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-semibold text-neutral-500">{t.activeTables}</span>
                  <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg"><Users size={16}/></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">{activeTablesCount} <span className="text-base text-neutral-400 font-medium">/ 32</span></h3>
                  <p className="text-xs text-neutral-500 font-medium mt-1">56% {t.occupied}</p>
                </div>
              </div>
            </div>

            {/* Middle Grid: Chart + Live Orders + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Chart */}
              <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-neutral-900">{t.salesOverview}</h3>
                  <button className="flex items-center gap-2 text-xs font-semibold text-neutral-600 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded-lg transition-colors">
                    {t.today} <ChevronDown size={14} />
                  </button>
                </div>
                <div className="mb-4">
                  <h4 className="text-2xl font-bold text-neutral-900">{totalSales.toLocaleString()} <span className="text-base text-neutral-400 font-medium">Br</span></h4>
                </div>
                <div className="flex-grow w-full relative min-h-[200px]">
                  {/* SVG Chart Mockup matching screenshot exactly */}
                  <svg viewBox="0 0 400 150" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,150 L0,120 C20,130 30,120 50,110 C80,90 90,110 110,90 C130,70 140,50 160,50 C180,50 190,80 220,60 C250,40 270,50 300,45 C320,40 330,30 360,20 C380,10 390,20 400,10 L400,150 Z" fill="url(#chartGrad)" />
                    <path d="M0,120 C20,130 30,120 50,110 C80,90 90,110 110,90 C130,70 140,50 160,50 C180,50 190,80 220,60 C250,40 270,50 300,45 C320,40 330,30 360,20 C380,10 390,20 400,10" fill="none" stroke="#f97316" strokeWidth="2.5" />
                    {/* Tooltip dot */}
                    <circle cx="220" cy="60" r="4" fill="#f97316" stroke="white" strokeWidth="2" />
                  </svg>
                  {/* Y Axis Labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-neutral-400 py-2">
                    <span>8K</span><span>6K</span><span>4K</span><span>2K</span><span>0</span>
                  </div>
                  {/* X Axis Labels */}
                  <div className="absolute bottom-0 left-6 right-0 flex justify-between text-[10px] text-neutral-400">
                    <span>12 AM</span><span>4 AM</span><span>8 AM</span><span>12 PM</span><span>4 PM</span><span>8 PM</span><span>12 AM</span>
                  </div>
                  {/* Tooltip Popup */}
                  <div className="absolute top-4 left-1/2 bg-white border border-neutral-200 shadow-lg rounded-lg p-2 flex flex-col items-center">
                    <span className="text-[10px] text-neutral-500 font-semibold mb-0.5">12 PM</span>
                    <span className="text-xs font-bold text-neutral-900">6,240 Br</span>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-neutral-200 rotate-45"></div>
                  </div>
                </div>
              </div>

              {/* Live Orders */}
              <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-neutral-900">{t.liveOrders}</h3>
                  <a href="#" className="text-xs font-bold text-blue-600 hover:underline">{t.viewAll}</a>
                </div>
                <div className="flex-grow space-y-4">
                  {liveOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-neutral-400 gap-2">
                      <ShoppingBag size={32} className="opacity-40" />
                      <p className="text-sm font-medium">No live orders found</p>
                    </div>
                  ) : liveOrders.map(order => (
                    <div key={order.id} className="flex justify-between items-center group cursor-pointer">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-neutral-900">{formatOrderLabel(order.id)}</span>
                          <span className="text-sm font-semibold text-neutral-600">{t.table} {order.table}</span>
                        </div>
                        <div className="text-[11px] text-neutral-400 font-medium">
                          {order.items} items • {order.time}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${order.bg} ${order.color}`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                    {t.viewAllLive} <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-neutral-900">{t.recentActivity}</h3>
                </div>
                <div className="flex-grow relative">
                  {/* Timeline connecting line */}
                  <div className="absolute left-4 top-4 bottom-4 w-px bg-neutral-100 -z-10"></div>
                  
                  <div className="space-y-6">
                    {recentActivity.length === 0 ? <p className="text-sm text-neutral-500">No recent activity.</p> : recentActivity.map((act, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${act.bg} ${act.color}`}>
                          <act.icon size={14} strokeWidth={2.5} />
                        </div>
                        <div className="pt-0.5">
                          <p className="text-xs font-semibold text-neutral-800 leading-snug whitespace-pre-line">{act.text}</p>
                          <p className="text-[10px] text-neutral-400 font-medium mt-1">{act.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                    {t.viewAllActivity} <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>

            </div>

            {/* Bottom Grid: Menu Items + Quick Actions */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Top Menu Items Table */}
              <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-md flex flex-col overflow-hidden">
                <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
                  <h3 className="font-bold text-neutral-900">{t.topMenuItems}</h3>
                  <button className="text-xs font-semibold text-neutral-700 border border-neutral-200 px-3 py-1.5 rounded-lg hover:bg-neutral-50 transition-colors">
                    {t.manageMenu}
                  </button>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-6 px-5 border-b border-neutral-200">
                  <button className="text-sm font-bold text-orange-500 border-b-2 border-orange-500 py-3">{t.bestSellers}</button>
                  <button className="text-sm font-semibold text-neutral-400 hover:text-neutral-700 py-3">{t.lowStock}</button>
                  <button className="text-sm font-semibold text-neutral-400 hover:text-neutral-700 py-3">{t.outOfStock}</button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs font-semibold text-neutral-400 border-b border-neutral-100 bg-neutral-50/50">
                        <th className="px-5 py-3 font-medium">{t.item}</th>
                        <th className="px-5 py-3 font-medium">{t.category}</th>
                        <th className="px-5 py-3 font-medium">{t.price}</th>
                        <th className="px-5 py-3 font-medium">{t.sold}</th>
                        <th className="px-5 py-3 font-medium">{t.revenue}</th>
                        <th className="px-5 py-3 font-medium">{t.status}</th>
                        <th className="px-5 py-3 font-medium">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {topMenuItems.length === 0 ? <tr><td colSpan="7" className="text-center py-4 text-neutral-500">No data available</td></tr> : topMenuItems.map((item, i) => (
                        <tr key={i} className="text-sm hover:bg-neutral-50 transition-colors">
                          <td className="px-5 py-3 flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover shadow-sm" />
                            <span className="font-semibold text-neutral-800">{item.name}</span>
                          </td>
                          <td className="px-5 py-3 text-neutral-500 font-medium">{item.cat}</td>
                          <td className="px-5 py-3 text-neutral-900 font-semibold">{item.price} Br</td>
                          <td className="px-5 py-3 text-neutral-500 font-medium">{item.sold}</td>
                          <td className="px-5 py-3 text-neutral-900 font-semibold">{item.rev.toLocaleString()} Br</td>
                          <td className="px-5 py-3">
                            <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md">{t.available}</span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex gap-2 text-neutral-400">
                              <button className="hover:text-blue-600 transition-colors"><Edit2 size={14} /></button>
                              <button className="hover:text-neutral-900 transition-colors"><MoreVertical size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-neutral-100 text-center bg-neutral-50/50">
                  <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex justify-center items-center gap-1">
                    {t.viewFullMenu} <ArrowUpRight size={12} />
                  </a>
                </div>
              </div>

              {/* Right Column: Quick Actions + Promo */}
              <div className="flex flex-col gap-6">
                
                {/* Quick Actions Grid */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md">
                  <h3 className="font-bold text-neutral-900 mb-5">{t.quickActions}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex flex-col items-center justify-center p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all group">
                      <div className="bg-blue-50 text-blue-600 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform"><Plus size={18} /></div>
                      <span className="text-[11px] font-bold text-neutral-600 text-center">{t.addMenuItem}</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all group">
                      <div className="bg-purple-50 text-purple-600 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform"><Layers size={18} /></div>
                      <span className="text-[11px] font-bold text-neutral-600 text-center">{t.addCategory}</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all group">
                      <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform"><Store size={18} /></div>
                      <span className="text-[11px] font-bold text-neutral-600 text-center">{t.manageTables}</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all group">
                      <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform"><Megaphone size={18} /></div>
                      <span className="text-[11px] font-bold text-neutral-600 text-center">{t.sendAnnouncement}</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all group">
                      <div className="bg-pink-50 text-pink-600 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform"><Tag size={18} /></div>
                      <span className="text-[11px] font-bold text-neutral-600 text-center">{t.discountPromo}</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all group">
                      <div className="bg-orange-50 text-orange-600 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform"><Download size={18} /></div>
                      <span className="text-[11px] font-bold text-neutral-600 text-center">{t.exportReports}</span>
                    </button>
                  </div>
                </div>

                {/* Promo Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md relative overflow-hidden flex items-center gap-4">
                  <button className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600"><X size={14}/></button>
                  <div className="bg-orange-100 p-3 rounded-xl flex-shrink-0 relative">
                    <Smartphone className="text-orange-600" size={28} />
                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                      <div className="bg-yellow-400 w-2 h-2 rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900 mb-1 leading-tight">{t.enableNotifsTitle}</h4>
                    <p className="text-[11px] text-neutral-500 font-medium mb-3 leading-snug pr-4">{t.enableNotifsDesc}</p>
                    <button className="text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors">
                      {t.enableNow}
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Footer Footer */}
          <div className="mt-8 pt-4 border-t border-neutral-200 flex justify-between text-[11px] font-semibold text-neutral-400 max-w-[1400px] mx-auto">
            <p>© 2026 ZOM Tech. All rights reserved.</p>
            <p>Version 1.0.0</p>
          </div>

        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        /* Custom scrollbars */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }

        /* Main area scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}

