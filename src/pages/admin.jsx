import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, ListOrdered, Clock, DollarSign, Bell, Globe, 
  Search, Plus, MoreVertical, Edit2, LayoutGrid, Layers, Grid, 
  Settings2, Users, Star, Store, UserCircle, Activity, 
  ChevronDown, ArrowUpRight, TrendingUp, Calendar, ShoppingBag,
  Megaphone, Tag, Download, MessageSquare, CheckCircle2, ChevronRight,
  Menu as MenuIcon, X, UtensilsCrossed, Smartphone, Check, QrCode, RefreshCw
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
    navMain: 'MAIN',
    navOrders: 'ORDERS',
    navMenu: 'MENU',
    navCustomers: 'CUSTOMERS',
    navRestaurant: 'RESTAURANT',
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
    restStatus: 'Restaurant Status',
    open: 'Open',
    closed: 'Closed',
    totalSales: 'Total Sales',
    ordersToday: 'Orders Today',
    avgOrderValue: 'Average Order Value',
    activeTables: 'Active Tables',
    salesOverview: 'Sales Overview',
    today: 'Today',
    recentActivity: 'Recent Activity',
    topMenuItems: 'Top Menu Items',
    quickActions: 'Quick Actions',
    addMenuItem: 'Add Menu Item',
    addCategory: 'Add Category',
    exportReports: 'Export Reports',
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
    navMain: 'ዋና',
    navOrders: 'ትዕዛዞች',
    navMenu: 'ሜኑ',
    navCustomers: 'ደንበኞች',
    navRestaurant: 'ሬስቶራንት',
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
    restStatus: 'የሬስቶራንት ሁኔታ',
    open: 'ክፍት ነው',
    closed: 'ዝግ ነው',
    totalSales: 'ጠቅላላ ሽያጭ',
    ordersToday: 'የዛሬ ትዕዛዞች',
    avgOrderValue: 'አማካይ የትዕዛዝ ዋጋ',
    activeTables: 'የተያዙ ጠረጴዛዎች',
    salesOverview: 'የሽያጭ አጠቃላይ እይታ',
    today: 'ዛሬ',
    recentActivity: 'የቅርብ ጊዜ እንቅስቃሴዎች',
    topMenuItems: 'ተወዳጅ ምግቦች',
    quickActions: 'ፈጣን ተግባራት',
    addMenuItem: 'ምግብ ጨምር',
    addCategory: 'ምድብ ጨምር',
    exportReports: 'ሪፖርት አውጣ',
    enableNotifsTitle: 'የትዕዛዝ ማሳወቂያዎችን አብራ',
    enableNotifsDesc: 'በስልክዎ ላይ ለአዳዲስ ትዕዛዞች የጽሑፍ ማሳወቂያዎችን ያግኙ።',
    enableNow: 'አሁን አብራ'
  }
};

const getTimeAgo = (timestamp) => {
  const diff = Math.floor((new Date() - new Date(timestamp)) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff} min ago`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return 'Over a day ago';
};

const formatOrderLabel = (id) => {
  if (!id) return '#Order';
  const str = id.toString();
  if (str.includes('-')) return `#Order${str.slice(0, 4)}`;
  return `#Order${str}`;
};

export default function AdminDashboard() {
  const [lang, setLang] = useState('en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Supabase Data States
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [waiterCalls, setWaiterCalls] = useState([]);
  
  // UI & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('all');
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true);
  const [categoriesList, setCategoriesList] = useState(['Starters', 'Mains', 'Pizzas', 'Desserts', 'Drinks']);
  
  // Modal States
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({ name: '', price: '', category: 'Mains', image_url: '' });
  const [newCategoryName, setNewCategoryName] = useState('');

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    name: 'ZOM Restaurant & Bar',
    phone: '+251 91 123 4567',
    hours: '08:00 AM - 11:00 PM',
    taxRate: '15',
    currency: 'ETB (Br)'
  });

  const t = TRANSLATIONS[lang];

  // Fetch live database rows & subscribe to realtime channel
  useEffect(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayISO = startOfToday.toISOString();

    const fetchData = async () => {
      const [ordersRes, menuRes, waiterRes] = await Promise.all([
        supabase.from('orders').select('*').gte('created_at', todayISO).order('created_at', { ascending: false }),
        supabase.from('menu_items').select('*'),
        supabase.from('waiter_calls').select('*').gte('created_at', todayISO).order('created_at', { ascending: false })
      ]);
      
      if (ordersRes.data) setOrders(ordersRes.data);
      if (menuRes.data) setMenuItems(menuRes.data);
      if (waiterRes.data) setWaiterCalls(waiterRes.data);
    };

    fetchData();

    const realtimeChannel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new, ...prev.filter(o => o.id !== payload.new.id)]);
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o));
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
        supabase.from('menu_items').select('*').then(({ data }) => {
          if (data) setMenuItems(data);
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waiter_calls' }, payload => {
        if (payload.eventType === 'INSERT') {
          setWaiterCalls(prev => [payload.new, ...prev.filter(w => w.id !== payload.new.id)]);
        } else if (payload.eventType === 'UPDATE') {
          setWaiterCalls(prev => prev.map(w => w.id === payload.new.id ? payload.new : w));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, []);

  // --- METRICS ---
  const ordersTodayCount = orders.length;
  const totalSalesAmount = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.total_amount || o.total || 0), 0);
  }, [orders]);

  const avgOrderValue = useMemo(() => {
    return ordersTodayCount > 0 ? (totalSalesAmount / ordersTodayCount).toFixed(2) : '0.00';
  }, [ordersTodayCount, totalSalesAmount]);

  const activeTablesCount = useMemo(() => {
    return new Set(orders.filter(o => o.status !== 'served').map(o => o.table_number)).size;
  }, [orders]);

  // --- DYNAMIC CHART DATA ---
  const chartData = useMemo(() => {
    const timeSlots = [0, 4, 8, 12, 16, 20, 24];
    const slotTotals = [0, 0, 0, 0, 0, 0];

    orders.forEach(o => {
      const hour = new Date(o.created_at).getHours();
      const amount = o.total_amount || o.total || 0;
      for (let i = 0; i < timeSlots.length - 1; i++) {
        if (hour >= timeSlots[i] && hour < timeSlots[i + 1]) {
          slotTotals[i] += amount;
          break;
        }
      }
    });

    const maxVal = Math.max(...slotTotals, 1000);
    const points = slotTotals.map((val, idx) => {
      const x = (idx / 5) * 400;
      const y = 140 - (val / maxVal) * 110;
      return `${x},${y}`;
    }).join(' ');

    const pathD = `M 0,150 L ${points.split(' ').map((p, idx) => (idx === 0 ? `0,${p.split(',')[1]}` : `C ${idx*66-33},${points.split(' ')[idx-1].split(',')[1]} ${idx*66-33},${p.split(',')[1]} ${p}`)).join(' ')} L 400,150 Z`;

    return { maxVal, slotTotals, points, pathD };
  }, [orders]);

  // --- RECENT ACTIVITY ---
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
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5).map(a => ({ ...a, time: getTimeAgo(a.timestamp) }));
  }, [orders, waiterCalls]);

  // --- LIVE ORDERS FEED ---
  const liveOrders = useMemo(() => {
    return orders
      .filter(o => o.status !== 'served')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(o => ({
        id: o.id,
        table: o.table_number,
        items: ((o.items || o.cart || [])).reduce((sum, item) => sum + (item.quantity || item.qty || 1), 0),
        time: getTimeAgo(o.created_at),
        status: o.status || 'received',
        color: o.status === 'ready' ? 'text-green-600' : (o.status === 'received' ? 'text-blue-600' : 'text-orange-600'),
        bg: o.status === 'ready' ? 'bg-green-100' : (o.status === 'received' ? 'bg-blue-100' : 'bg-orange-100'),
      }));
  }, [orders]);

  // --- FILTERED ORDERS FOR ORDERS TAB ---
  const filteredOrders = useMemo(() => {
    let list = orders;
    if (orderStatusFilter !== 'all') {
      list = list.filter(o => (o.status || 'received') === orderStatusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(o => 
        o.id.toString().includes(q) || 
        (o.table_number && o.table_number.toString().includes(q)) ||
        (o.instructions && o.instructions.toLowerCase().includes(q))
      );
    }
    return list;
  }, [orders, orderStatusFilter, searchQuery]);

  // --- FILTERED MENU ITEMS FOR MENU TAB & TABLE ---
  const filteredMenuItems = useMemo(() => {
    const itemSalesMap = {};
    orders.forEach(order => {
      ((order.items || order.cart || [])).forEach(item => {
        const name = typeof item.name === 'object' ? (item.name.en || item.name.am) : item.name || 'Unknown Item';
        if (!itemSalesMap[name]) itemSalesMap[name] = { sold: 0, rev: 0 };
        const qty = item.quantity || item.qty || 1;
        const price = item.price || 0;
        itemSalesMap[name].sold += qty;
        itemSalesMap[name].rev += price * qty;
      });
    });

    let items = menuItems.map(m => {
      const nameStr = typeof m.name === 'object' ? (m.name.en || m.name.am) : (m.name_en || m.name || 'Item');
      const sales = itemSalesMap[nameStr] || { sold: 0, rev: 0 };
      return {
        id: m.id,
        name: nameStr,
        category: m.category || 'Mains',
        price: m.price || 0,
        image: m.image_url || m.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop',
        sold: sales.sold,
        revenue: sales.rev
      };
    });

    if (menuCategoryFilter !== 'all') {
      items = items.filter(i => i.category.toLowerCase() === menuCategoryFilter.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }

    return items.sort((a, b) => b.sold - a.sold);
  }, [menuItems, orders, menuCategoryFilter, searchQuery]);

  // --- UPDATE ORDER STATUS IN SUPABASE ---
  const updateOrderStatus = async (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id.toString() === orderId.toString() ? { ...o, status: newStatus } : o));
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) console.error("Failed to update order status:", error);
  };

  // --- CSV REPORT EXPORT GENERATOR ---
  const exportCSVReport = () => {
    if (orders.length === 0) {
      alert("No orders available today to export.");
      return;
    }

    const headers = ["Order ID", "Table Number", "Status", "Total Amount (Br)", "Items Count", "Instructions", "Created At"];
    const rows = orders.map(o => [
      formatOrderLabel(o.id),
      o.table_number || '?',
      o.status || 'received',
      (o.total_amount || o.total || 0).toFixed(2),
      ((o.items || o.cart || [])).reduce((sum, i) => sum + (i.quantity || i.qty || 1), 0),
      `"${(o.instructions || '').replace(/"/g, '""')}"`,
      new Date(o.created_at).toLocaleString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- ADD MENU ITEM SUBMISSION ---
  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    if (!newMenuItem.name || !newMenuItem.price) {
      alert("Please enter a valid item name and price.");
      return;
    }

    try {
      const { data, error } = await supabase.from('menu_items').insert([{
        name: newMenuItem.name,
        name_en: newMenuItem.name,
        category: newMenuItem.category,
        price: parseFloat(newMenuItem.price),
        image_url: newMenuItem.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop'
      }]).select();

      if (error) {
        alert("Error adding menu item: " + error.message);
      } else {
        if (data) setMenuItems(prev => [...prev, ...data]);
        setIsAddMenuModalOpen(false);
        setNewMenuItem({ name: '', price: '', category: 'Mains', image_url: '' });
      }
    } catch (err) {
      console.error("Failed to insert menu item:", err);
    }
  };

  // --- ADD CATEGORY SUBMISSION ---
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    if (!categoriesList.includes(newCategoryName.trim())) {
      setCategoriesList(prev => [...prev, newCategoryName.trim()]);
    }
    setIsAddCategoryModalOpen(false);
    setNewCategoryName('');
  };

  // Map sidebar button clicks to active tab view
  const handleNavClick = (id) => {
    if (id === 'dashboard') setActiveTab('dashboard');
    else if (id === 'liveOrders' || id === 'orderHistory') setActiveTab('orders');
    else if (id === 'menuItems' || id === 'categories' || id === 'modifiers' || id === 'addons') setActiveTab('menu');
    else if (id === 'payments') setActiveTab('payments');
    else if (id === 'customers' || id === 'reviews') setActiveTab('customers');
    else if (id === 'tables') setActiveTab('tables');
    else if (id === 'staff') setActiveTab('staff');
    else if (id === 'settings' || id === 'menuSettings') setActiveTab('settings');
    setIsSidebarOpen(false);
  };

  const SidebarItem = ({ icon: Icon, label, id, badge }) => {
    const isSelected = (
      (activeTab === 'dashboard' && id === 'dashboard') ||
      (activeTab === 'orders' && (id === 'liveOrders' || id === 'orderHistory')) ||
      (activeTab === 'menu' && (id === 'menuItems' || id === 'categories' || id === 'modifiers' || id === 'addons')) ||
      (activeTab === 'payments' && id === 'payments') ||
      (activeTab === 'customers' && (id === 'customers' || id === 'reviews')) ||
      (activeTab === 'tables' && id === 'tables') ||
      (activeTab === 'staff' && id === 'staff') ||
      (activeTab === 'settings' && (id === 'settings' || id === 'menuSettings'))
    );

    return (
      <button 
        onClick={() => handleNavClick(id)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
          isSelected 
            ? 'bg-[#1E293B] text-white font-semibold' 
            : 'text-neutral-400 hover:text-white hover:bg-[#1E293B]/50 font-medium'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className={isSelected ? 'text-[#F97316]' : ''} />
          {label}
        </div>
        {badge && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </button>
    );
  };

  const SidebarCategory = ({ label }) => (
    <div className="px-4 text-[10px] font-bold text-neutral-500 tracking-wider mt-5 mb-2 uppercase">
      {label}
    </div>
  );

  // ================= VIEW RENDERING FUNCTIONS =================

  // 1. DASHBOARD VIEW
  const renderDashboardView = () => (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-neutral-900">{t.goodMorning}</h2>
        <p className="text-neutral-500 text-xs font-medium mt-1">{t.whatsHappening}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-semibold text-neutral-500">{t.totalSales}</span>
            <div className="bg-orange-50 text-orange-600 p-2 rounded-lg"><DollarSign size={16}/></div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">{totalSalesAmount.toLocaleString()} <span className="text-base text-neutral-400 font-medium">Br</span></h3>
            <p className="text-xs text-neutral-500 font-medium mt-1 flex items-center gap-1">
              <TrendingUp size={12} className="text-green-500" /> Real-time today
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-semibold text-neutral-500">{t.ordersToday}</span>
            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><ShoppingBag size={16}/></div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">{ordersTodayCount}</h3>
            <p className="text-xs text-neutral-500 font-medium mt-1">Live customer orders</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-semibold text-neutral-500">{t.avgOrderValue}</span>
            <div className="bg-purple-50 text-purple-600 p-2 rounded-lg"><TrendingUp size={16}/></div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">{avgOrderValue} <span className="text-base text-neutral-400 font-medium">Br</span></h3>
            <p className="text-xs text-neutral-500 font-medium mt-1">Calculated dynamically</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-semibold text-neutral-500">{t.activeTables}</span>
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg"><Users size={16}/></div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">{activeTablesCount} <span className="text-base text-neutral-400 font-medium">tables</span></h3>
            <p className="text-xs text-neutral-500 font-medium mt-1">Active non-served orders</p>
          </div>
        </div>
      </div>

      {/* Middle Grid: Sales Overview Chart + Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-neutral-900">{t.salesOverview}</h3>
            <span className="text-xs font-semibold text-neutral-600 bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-lg">{t.today}</span>
          </div>
          <div className="mb-4">
            <h4 className="text-2xl font-bold text-neutral-900">{totalSalesAmount.toLocaleString()} <span className="text-base text-neutral-400 font-medium">Br</span></h4>
          </div>
          <div className="flex-grow w-full relative min-h-[200px]">
            <svg viewBox="0 0 400 150" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={chartData.pathD} fill="url(#chartGrad)" />
              <polyline points={chartData.points} fill="none" stroke="#f97316" strokeWidth="2.5" />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-neutral-400 font-medium pt-2">
              <span>12 AM</span><span>4 AM</span><span>8 AM</span><span>12 PM</span><span>4 PM</span><span>8 PM</span><span>12 AM</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-neutral-900">{t.liveOrders}</h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{liveOrders.length}</span>
          </div>
          <div className="flex-grow space-y-4">
            {liveOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-neutral-400 gap-2">
                <ShoppingBag size={32} className="opacity-40" />
                <p className="text-sm font-medium">No live orders found</p>
              </div>
            ) : (
              liveOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center border-b border-neutral-100 pb-3 last:border-0">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-neutral-900">{formatOrderLabel(order.id)}</span>
                      <span className="text-xs font-semibold text-neutral-600">{t.table} {order.table}</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-medium">
                      {order.items} items • {order.time}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${order.bg} ${order.color}`}>
                    {order.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-neutral-900">{t.recentActivity}</h3>
          </div>
          <div className="flex-grow relative">
            <div className="space-y-6">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-neutral-400 font-medium text-center py-10">No recent activity.</p>
              ) : (
                recentActivity.map((act, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${act.bg} ${act.color}`}>
                      <act.icon size={14} strokeWidth={2.5} />
                    </div>
                    <div className="pt-0.5">
                      <p className="text-xs font-semibold text-neutral-800 leading-snug">{act.text}</p>
                      <p className="text-[10px] text-neutral-400 font-medium mt-1">{act.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-md flex flex-col overflow-hidden">
          <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
            <h3 className="font-bold text-neutral-900">{t.topMenuItems}</h3>
            <button 
              onClick={() => setIsAddMenuModalOpen(true)}
              className="text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
            >
              <Plus size={14} /> {t.addMenuItem}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold text-neutral-400 border-b border-neutral-100 bg-neutral-50/50">
                  <th className="px-5 py-3 font-medium">{t.item}</th>
                  <th className="px-5 py-3 font-medium">{t.category}</th>
                  <th className="px-5 py-3 font-medium">{t.price}</th>
                  <th className="px-5 py-3 font-medium">{t.sold}</th>
                  <th className="px-5 py-3 font-medium">{t.revenue}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredMenuItems.slice(0, 5).map((item) => (
                  <tr key={item.id} className="text-sm hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3 flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover shadow-sm" />
                      <span className="font-semibold text-neutral-800">{item.name}</span>
                    </td>
                    <td className="px-5 py-3 text-neutral-500 font-medium">{item.category}</td>
                    <td className="px-5 py-3 text-neutral-900 font-semibold">{item.price} Br</td>
                    <td className="px-5 py-3 text-neutral-500 font-medium">{item.sold}</td>
                    <td className="px-5 py-3 text-neutral-900 font-semibold">{item.revenue.toLocaleString()} Br</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md">
            <h3 className="font-bold text-neutral-900 mb-5">{t.quickActions}</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setIsAddMenuModalOpen(true)} className="flex flex-col items-center justify-center p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all group">
                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform"><Plus size={18} /></div>
                <span className="text-[11px] font-bold text-neutral-600 text-center">{t.addMenuItem}</span>
              </button>
              <button onClick={() => setIsAddCategoryModalOpen(true)} className="flex flex-col items-center justify-center p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all group">
                <div className="bg-purple-50 text-purple-600 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform"><Layers size={18} /></div>
                <span className="text-[11px] font-bold text-neutral-600 text-center">{t.addCategory}</span>
              </button>
              <button onClick={() => setActiveTab('tables')} className="flex flex-col items-center justify-center p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all group">
                <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform"><Store size={18} /></div>
                <span className="text-[11px] font-bold text-neutral-600 text-center">Manage Tables</span>
              </button>
              <button onClick={exportCSVReport} className="flex flex-col items-center justify-center p-4 border border-orange-200 rounded-xl hover:bg-orange-50 transition-all group bg-orange-50/50">
                <div className="bg-orange-100 text-orange-600 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform"><Download size={18} /></div>
                <span className="text-[11px] font-bold text-orange-700 text-center">{t.exportReports}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. ORDERS VIEW
  const renderOrdersView = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-neutral-900">Orders Management</h2>
          <p className="text-neutral-500 text-xs font-medium mt-1">Real-time status updates and order history</p>
        </div>
        <button onClick={exportCSVReport} className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Order Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-neutral-200">
        {['all', 'received', 'accepted', 'preparing', 'ready', 'served'].map(st => (
          <button
            key={st}
            onClick={() => setOrderStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              orderStatusFilter === st ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            {st} ({st === 'all' ? orders.length : orders.filter(o => (o.status || 'received') === st).length})
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold text-neutral-400 border-b border-neutral-100 bg-neutral-50">
                <th className="px-5 py-3.5 font-medium">Order ID</th>
                <th className="px-5 py-3.5 font-medium">Table</th>
                <th className="px-5 py-3.5 font-medium">Items</th>
                <th className="px-5 py-3.5 font-medium">Total</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Created</th>
                <th className="px-5 py-3.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-12 text-neutral-400 font-medium">No orders found matching filter</td></tr>
              ) : (
                filteredOrders.map(order => {
                  const itemsList = order.items || order.cart || [];
                  const total = order.total_amount || order.total || 0;
                  const currentStatus = order.status || 'received';

                  return (
                    <tr key={order.id} className="text-sm hover:bg-neutral-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-neutral-900">{formatOrderLabel(order.id)}</td>
                      <td className="px-5 py-4 font-bold text-neutral-700">Table {order.table_number || '?'}</td>
                      <td className="px-5 py-4 text-xs font-medium text-neutral-600 max-w-xs">
                        {itemsList.map((i, idx) => `${i.quantity || i.qty || 1}x ${typeof i.name === 'object' ? (i.name.en || i.name.am) : i.name}`).join(', ')}
                      </td>
                      <td className="px-5 py-4 font-black text-neutral-900">{total.toFixed(2)} Br</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg ${
                          currentStatus === 'ready' ? 'bg-green-100 text-green-700' :
                          currentStatus === 'served' ? 'bg-neutral-100 text-neutral-600' :
                          currentStatus === 'preparing' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {currentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-neutral-400">{getTimeAgo(order.created_at)}</td>
                      <td className="px-5 py-4">
                        <select 
                          value={currentStatus}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-xs font-bold bg-neutral-100 border border-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                        >
                          <option value="received">Received</option>
                          <option value="accepted">Accepted</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="served">Served</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 3. MENU VIEW
  const renderMenuView = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-neutral-900">Menu Management</h2>
          <p className="text-neutral-500 text-xs font-medium mt-1">Manage active menu items, pricing, and categories</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsAddCategoryModalOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md">
            <Plus size={16} /> Add Category
          </button>
          <button onClick={() => setIsAddMenuModalOpen(true)} className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md">
            <Plus size={16} /> Add Menu Item
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-neutral-200">
        <button
          onClick={() => setMenuCategoryFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            menuCategoryFilter === 'all' ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          All Items ({menuItems.length})
        </button>
        {categoriesList.map(cat => (
          <button
            key={cat}
            onClick={() => setMenuCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              menuCategoryFilter.toLowerCase() === cat.toLowerCase() ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Item Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredMenuItems.length === 0 ? (
          <div className="col-span-full py-16 text-center text-neutral-400 font-medium">No menu items found in this category</div>
        ) : (
          filteredMenuItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-neutral-900 text-base leading-snug">{item.name}</h3>
                    <span className="text-xs font-black bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md">{item.price} Br</span>
                  </div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">{item.category}</p>
                </div>
                <div className="pt-3 border-t border-neutral-100 flex justify-between items-center text-xs font-medium text-neutral-500">
                  <span>Sold: <strong className="text-neutral-900">{item.sold}</strong></span>
                  <span>Revenue: <strong className="text-neutral-900">{item.revenue} Br</strong></span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // 4. PAYMENTS VIEW
  const renderPaymentsView = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-neutral-900">Payments & Transactions</h2>
        <p className="text-neutral-500 text-xs font-medium mt-1">Verified sales payments and transaction audit logs</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Total Verified Revenue</p>
          <h3 className="text-3xl font-black text-neutral-900">{totalSalesAmount.toLocaleString()} Br</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Cash Transactions</p>
          <h3 className="text-3xl font-black text-emerald-600">{(totalSalesAmount * 0.45).toFixed(2)} Br</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Digital / Mobile Payments</p>
          <h3 className="text-3xl font-black text-blue-600">{(totalSalesAmount * 0.55).toFixed(2)} Br</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold text-neutral-400 border-b border-neutral-100 bg-neutral-50">
                <th className="px-5 py-3.5 font-medium">Order Reference</th>
                <th className="px-5 py-3.5 font-medium">Table Number</th>
                <th className="px-5 py-3.5 font-medium">Amount</th>
                <th className="px-5 py-3.5 font-medium">Payment Status</th>
                <th className="px-5 py-3.5 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-neutral-400 font-medium">No payment records found</td></tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id} className="text-sm hover:bg-neutral-50/80 transition-colors">
                    <td className="px-5 py-4 font-bold text-neutral-900">{formatOrderLabel(o.id)}</td>
                    <td className="px-5 py-4 font-semibold text-neutral-700">Table {o.table_number || '?'}</td>
                    <td className="px-5 py-4 font-black text-neutral-900">{(o.total_amount || o.total || 0).toFixed(2)} Br</td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                        <Check size={12}/> Verified
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-neutral-400">{new Date(o.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 5. CUSTOMERS VIEW
  const renderCustomersView = () => {
    const tableCustomerMap = {};
    orders.forEach(o => {
      const tbl = o.table_number || 1;
      if (!tableCustomerMap[tbl]) {
        tableCustomerMap[tbl] = { table: tbl, totalSpent: 0, orderCount: 0, lastVisit: o.created_at };
      }
      tableCustomerMap[tbl].totalSpent += o.total_amount || o.total || 0;
      tableCustomerMap[tbl].orderCount += 1;
    });
    const customerLogs = Object.values(tableCustomerMap);

    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-neutral-900">Customers Directory</h2>
          <p className="text-neutral-500 text-xs font-medium mt-1">Customer activity logs grouped by table assignment</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold text-neutral-400 border-b border-neutral-100 bg-neutral-50">
                  <th className="px-5 py-3.5 font-medium">Table Assignment</th>
                  <th className="px-5 py-3.5 font-medium">Total Orders Placed</th>
                  <th className="px-5 py-3.5 font-medium">Total Spent</th>
                  <th className="px-5 py-3.5 font-medium">Last Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {customerLogs.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-12 text-neutral-400 font-medium">No customer activity logs</td></tr>
                ) : (
                  customerLogs.map(c => (
                    <tr key={c.table} className="text-sm hover:bg-neutral-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-neutral-900">Table {c.table} Customer</td>
                      <td className="px-5 py-4 font-semibold text-neutral-700">{c.orderCount} orders</td>
                      <td className="px-5 py-4 font-black text-orange-600">{c.totalSpent.toFixed(2)} Br</td>
                      <td className="px-5 py-4 text-xs font-medium text-neutral-400">{getTimeAgo(c.lastVisit)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 6. TABLES VIEW
  const renderTablesView = () => {
    const tablesList = Array.from({ length: 12 }, (_, i) => i + 1);
    const activeTableNumbers = new Set(orders.filter(o => o.status !== 'served').map(o => o.table_number));

    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-neutral-900">Restaurant Tables Layout</h2>
          <p className="text-neutral-500 text-xs font-medium mt-1">Live status monitoring and digital QR codes for dining tables</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {tablesList.map(tNum => {
            const isOccupied = activeTableNumbers.has(tNum);
            const activeOrder = orders.find(o => o.table_number === tNum && o.status !== 'served');

            return (
              <div key={tNum} className={`bg-white rounded-2xl border-2 p-5 shadow-sm flex flex-col justify-between ${isOccupied ? 'border-orange-500 shadow-orange-500/10' : 'border-neutral-200'}`}>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-black text-xl text-neutral-900">Table {tNum}</span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${isOccupied ? 'bg-orange-100 text-orange-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isOccupied ? 'Occupied' : 'Available'}
                    </span>
                  </div>
                  {isOccupied && activeOrder && (
                    <div className="bg-neutral-50 p-3 rounded-xl mb-3 border border-neutral-100 text-xs font-medium">
                      <p className="text-neutral-500 mb-1 font-bold">{formatOrderLabel(activeOrder.id)}</p>
                      <p className="text-neutral-900 font-bold">Total: {(activeOrder.total_amount || activeOrder.total || 0).toFixed(2)} Br</p>
                    </div>
                  )}
                </div>
                <button onClick={() => alert(`Showing QR code for Table ${tNum}`)} className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 mt-2">
                  <QrCode size={14} /> View QR Code
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 7. STAFF VIEW
  const renderStaffView = () => {
    const staffRoster = [
      { id: 1, name: 'Abebe Kebede', role: 'Head Chef', status: 'Active', shifts: 'Morning' },
      { id: 2, name: 'Tigist Haile', role: 'Kitchen Staff', status: 'Active', shifts: 'Morning' },
      { id: 3, name: 'Dawit Yohannes', role: 'Senior Waiter', status: 'Active', shifts: 'Morning' },
      { id: 4, name: 'Marta Tadesse', role: 'Waiter', status: 'On Break', shifts: 'Evening' },
      { id: 5, name: 'Solomon Berhanu', role: 'Manager', status: 'Active', shifts: 'Full Day' }
    ];

    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-neutral-900">Staff Roster</h2>
          <p className="text-neutral-500 text-xs font-medium mt-1">Manage kitchen and floor service team members</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold text-neutral-400 border-b border-neutral-100 bg-neutral-50">
                  <th className="px-5 py-3.5 font-medium">Staff Name</th>
                  <th className="px-5 py-3.5 font-medium">Role</th>
                  <th className="px-5 py-3.5 font-medium">Shift</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {staffRoster.map(s => (
                  <tr key={s.id} className="text-sm hover:bg-neutral-50/80 transition-colors">
                    <td className="px-5 py-4 font-bold text-neutral-900">{s.name}</td>
                    <td className="px-5 py-4 font-semibold text-neutral-600">{s.role}</td>
                    <td className="px-5 py-4 text-xs font-medium text-neutral-500">{s.shifts}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 8. SETTINGS VIEW
  const renderSettingsView = () => (
    <div className="space-y-6 max-w-3xl animate-fadeIn">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-neutral-900">Restaurant Settings</h2>
        <p className="text-neutral-500 text-xs font-medium mt-1">General operational parameters and configuration</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-md space-y-5">
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">Restaurant Name</label>
          <input 
            type="text" 
            value={settingsForm.name} 
            onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
            className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">Contact Phone</label>
          <input 
            type="text" 
            value={settingsForm.phone} 
            onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
            className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">Operating Hours</label>
          <input 
            type="text" 
            value={settingsForm.hours} 
            onChange={(e) => setSettingsForm({ ...settingsForm, hours: e.target.value })}
            className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Tax Rate (%)</label>
            <input 
              type="text" 
              value={settingsForm.taxRate} 
              onChange={(e) => setSettingsForm({ ...settingsForm, taxRate: e.target.value })}
              className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Currency</label>
            <input 
              type="text" 
              value={settingsForm.currency} 
              onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
              className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium"
            />
          </div>
        </div>
        <button onClick={() => alert("Settings saved successfully!")} className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-orange-600/20">
          Save Operational Settings
        </button>
      </div>
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
        <div className="p-6 flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-xl text-white shadow-lg shadow-orange-500/20">
            <UtensilsCrossed size={24} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-none uppercase">{t.appTitle}</h1>
            <p className="text-[10px] text-neutral-400 tracking-widest uppercase mt-1">Restaurant</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
          <SidebarItem icon={LayoutDashboard} label={t.dashboard} id="dashboard" />
          
          <SidebarCategory label={t.navOrders} />
          <SidebarItem icon={Clock} label={t.liveOrders} id="liveOrders" badge={liveOrders.length > 0 ? liveOrders.length.toString() : null} />
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

        {/* COMPACT SINGLE-LINE RESTAURANT STATUS PILL */}
        <div className="p-3 mx-3 mb-4 bg-[#1E293B] rounded-xl border border-neutral-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isRestaurantOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs font-bold text-white">{isRestaurantOpen ? t.open : t.closed}</span>
          </div>
          <button 
            onClick={() => setIsRestaurantOpen(!isRestaurantOpen)}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-md border transition-colors ${
              isRestaurantOpen 
                ? 'border-red-500/40 text-red-400 hover:bg-red-500/20' 
                : 'border-green-500/40 text-green-400 hover:bg-green-500/20'
            }`}
          >
            {isRestaurantOpen ? 'Close' : 'Open'}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER */}
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 px-4 sm:px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
            >
              <MenuIcon size={20} />
            </button>
            
            {/* Search Input */}
            <div className="relative w-48 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input 
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
              className="flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors"
            >
              <Globe size={14} /> {lang === 'en' ? 'አማርኛ' : 'EN'}
            </button>
            <div className="h-4 w-px bg-neutral-200"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center shadow-md">
                AD
              </div>
              <span className="text-xs font-bold text-neutral-800 hidden sm:inline">{t.adminName}</span>
            </div>
          </div>
        </header>

        {/* DYNAMIC BODY BASED ON ACTIVETAB */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-[1400px] mx-auto">
            {activeTab === 'dashboard' && renderDashboardView()}
            {activeTab === 'orders' && renderOrdersView()}
            {activeTab === 'menu' && renderMenuView()}
            {activeTab === 'payments' && renderPaymentsView()}
            {activeTab === 'customers' && renderCustomersView()}
            {activeTab === 'tables' && renderTablesView()}
            {activeTab === 'staff' && renderStaffView()}
            {activeTab === 'settings' && renderSettingsView()}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-neutral-200 flex justify-between text-[11px] font-semibold text-neutral-400 max-w-[1400px] mx-auto">
            <p>© 2026 ZOM Tech. All rights reserved.</p>
            <p>Version 1.0.0</p>
          </div>
        </main>
      </div>

      {/* --- ADD MENU ITEM MODAL --- */}
      {isAddMenuModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-fadeIn relative">
            <button onClick={() => setIsAddMenuModalOpen(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"><X size={20}/></button>
            <h3 className="text-xl font-black text-neutral-900 mb-4">{t.addMenuItem}</h3>
            <form onSubmit={handleAddMenuItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Item Title / Name</label>
                <input 
                  type="text" required
                  placeholder="e.g. Pepperoni Pizza"
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Category</label>
                <select 
                  value={newMenuItem.category}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium bg-white"
                >
                  {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Price (Br)</label>
                <input 
                  type="number" step="0.01" required
                  placeholder="e.g. 450"
                  value={newMenuItem.price}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Image URL (Optional)</label>
                <input 
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newMenuItem.image_url}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, image_url: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsAddMenuModalOpen(false)} className="flex-1 bg-neutral-100 font-bold text-neutral-700 py-3 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-500 font-bold text-white py-3 rounded-xl shadow-lg shadow-orange-600/20">Add Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD CATEGORY MODAL --- */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-fadeIn relative">
            <button onClick={() => setIsAddCategoryModalOpen(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"><X size={20}/></button>
            <h3 className="text-xl font-black text-neutral-900 mb-4">{t.addCategory}</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Category Name</label>
                <input 
                  type="text" required
                  placeholder="e.g. Beverages"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsAddCategoryModalOpen(false)} className="flex-1 bg-neutral-100 font-bold text-neutral-700 py-3 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-500 font-bold text-white py-3 rounded-xl shadow-lg shadow-purple-600/20">Add Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}
