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
    openSince: 'Open since 08:00 AM',
    closeRest: 'Close Restaurant',
    openRest: 'Open Restaurant',
    totalSales: 'Total Sales',
    ordersToday: 'Orders Today',
    avgOrderValue: 'Average Order Value',
    activeTables: 'Active Tables',
    vsYesterday: 'vs yesterday',
    occupied: 'occupied',
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
    addMenuItem: 'Add Menu Item',
    addCategory: 'Add Category',
    manageTables: 'Manage Tables',
    sendAnnouncement: 'Send Announcement',
    discountPromo: 'Discount / Promo',
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
    openSince: 'ከ 02:00 ጀምሮ ክፍት',
    closeRest: 'ሬስቶራንት ዝጋ',
    openRest: 'ሬስቶራንት ክፈት',
    totalSales: 'ጠቅላላ ሽያጭ',
    ordersToday: 'የዛሬ ትዕዛዞች',
    avgOrderValue: 'አማካይ የትዕዛዝ ዋጋ',
    activeTables: 'የተያዙ ጠረጴዛዎች',
    vsYesterday: 'ከትናንት ጋር ሲነፃፀር',
    occupied: 'ተይዟል',
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
    addMenuItem: 'ምግብ ጨምር',
    addCategory: 'ምድብ ጨምር',
    manageTables: 'ጠረጴዛዎችን አስተዳድር',
    sendAnnouncement: 'ማስታወቂያ ላክ',
    discountPromo: 'ቅናሽ / ፕሮሞ',
    exportReports: 'ሪፖርት አውጣ',
    enableNotifsTitle: 'የትዕዛዝ ማሳወቂያዎችን አብራ',
    enableNotifsDesc: 'በስልክዎ ላይ ለአዳዲስ ትዕዛዞች የጽሑፍ ማሳወቂያዎችን ያግኙ።',
    enableNow: 'አሁን አብራ'
  }
};

// Helper for time ago formatting
const getTimeAgo = (timestamp) => {
  const diff = Math.floor((new Date() - new Date(timestamp)) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff} min ago`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return 'Over a day ago';
};

// Helper to format clean order labels
const formatOrderLabel = (id) => {
  if (!id) return '#Order';
  const str = id.toString();
  if (str.includes('-')) return `#Order${str.slice(0, 4)}`;
  return `#Order${str}`;
};

export default function AdminDashboard() {
  const [lang, setLang] = useState('en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('dashboard');

  // Supabase Data States
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [waiterCalls, setWaiterCalls] = useState([]);
  
  // Interactive UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true);
  const [categoriesList, setCategoriesList] = useState(['Starters', 'Mains', 'Pizzas', 'Desserts', 'Drinks']);
  
  // Modal States
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({ name: '', price: '', category: 'Mains', image_url: '' });
  const [newCategoryName, setNewCategoryName] = useState('');

  const t = TRANSLATIONS[lang];

  // Fetch live rows & subscribe to admin-realtime channel
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

    // Unified admin-realtime channel
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

  // --- DYNAMIC METRICS CALCULATIONS ---
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

  // --- DYNAMIC SALES CHART AGGREGATION ---
  const chartData = useMemo(() => {
    const timeSlots = [0, 4, 8, 12, 16, 20, 24]; // Hours: 12 AM, 4 AM, 8 AM, 12 PM, 4 PM, 8 PM, 12 AM
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

  // --- RECENT ACTIVITY TIMELINE ---
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

  // --- TOP MENU ITEMS AGGREGATION & SEARCH FILTER ---
  const filteredMenuItemsTable = useMemo(() => {
    const itemSalesMap = {};
    orders.forEach(order => {
      ((order.items || order.cart || [])).forEach(item => {
        const name = typeof item.name === 'object' ? (item.name.en || item.name.am) : item.name || 'Unknown Item';
        if (!itemSalesMap[name]) {
          itemSalesMap[name] = { sold: 0, rev: 0 };
        }
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

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }

    return items.sort((a, b) => b.sold - a.sold);
  }, [menuItems, orders, searchQuery]);

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
        <div className="p-6 flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-xl text-white shadow-lg shadow-orange-500/20">
            <UtensilsCrossed size={24} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-none uppercase">{t.appTitle}</h1>
            <p className="text-[10px] text-neutral-400 tracking-widest uppercase mt-1">Restaurant</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6 custom-scrollbar">
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

        {/* Restaurant Status Widget */}
        <div className="p-4 mx-4 mb-6 bg-[#1E293B] rounded-xl border border-neutral-700/50">
          <div className="flex items-center gap-2 mb-2 text-neutral-400 text-xs font-semibold">
            <div className={`w-2 h-2 rounded-full ${isRestaurantOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span>{t.restStatus}</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-sm text-white">{isRestaurantOpen ? t.open : t.closed}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{t.openSince}</p>
            </div>
            <button 
              onClick={() => setIsRestaurantOpen(!isRestaurantOpen)}
              className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors ${
                isRestaurantOpen 
                  ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' 
                  : 'border-green-500/50 text-green-400 hover:bg-green-500/10'
              }`}
            >
              {isRestaurantOpen ? t.closeRest : t.openRest}
            </button>
          </div>
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
            
            {/* Search Input with Real-time Filter */}
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

        {/* BODY */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-[1400px] mx-auto space-y-8 animate-fadeIn">
            
            {/* Greeting */}
            <div>
              <h2 className="text-2xl font-black tracking-tight text-neutral-900">{t.goodMorning}</h2>
              <p className="text-neutral-500 text-xs font-medium mt-1">{t.whatsHappening}</p>
            </div>

            {/* TOP ROW: REAL-TIME STATS METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Total Sales */}
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

              {/* Orders Today */}
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

              {/* Avg Order Value */}
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

              {/* Active Tables */}
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

            {/* MIDDLE GRID: CHART + LIVE ORDERS + RECENT ACTIVITY */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Sales Overview Chart (Dynamic Aggregation) */}
              <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-neutral-900">{t.salesOverview}</h3>
                  <span className="text-xs font-semibold text-neutral-600 bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-lg">
                    {t.today}
                  </span>
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
                  {/* X Axis Labels */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-neutral-400 font-medium pt-2">
                    <span>12 AM</span><span>4 AM</span><span>8 AM</span><span>12 PM</span><span>4 PM</span><span>8 PM</span><span>12 AM</span>
                  </div>
                </div>
              </div>

              {/* Live Orders Feed */}
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

              {/* Recent Activity Timeline */}
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

            {/* BOTTOM GRID: TOP MENU ITEMS TABLE + QUICK ACTIONS */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Top Menu Items Table */}
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {filteredMenuItemsTable.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-8 text-neutral-400 font-medium">No menu items found</td></tr>
                      ) : (
                        filteredMenuItemsTable.map((item) => (
                          <tr key={item.id} className="text-sm hover:bg-neutral-50 transition-colors">
                            <td className="px-5 py-3 flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover shadow-sm" />
                              <span className="font-semibold text-neutral-800">{item.name}</span>
                            </td>
                            <td className="px-5 py-3 text-neutral-500 font-medium">{item.category}</td>
                            <td className="px-5 py-3 text-neutral-900 font-semibold">{item.price} Br</td>
                            <td className="px-5 py-3 text-neutral-500 font-medium">{item.sold}</td>
                            <td className="px-5 py-3 text-neutral-900 font-semibold">{item.revenue.toLocaleString()} Br</td>
                            <td className="px-5 py-3">
                              <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md">{t.available}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Quick Actions + Promo */}
              <div className="flex flex-col gap-6">
                
                {/* Quick Actions Grid */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md">
                  <h3 className="font-bold text-neutral-900 mb-5">{t.quickActions}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setIsAddMenuModalOpen(true)}
                      className="flex flex-col items-center justify-center p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all group"
                    >
                      <div className="bg-blue-50 text-blue-600 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform"><Plus size={18} /></div>
                      <span className="text-[11px] font-bold text-neutral-600 text-center">{t.addMenuItem}</span>
                    </button>
                    <button 
                      onClick={() => setIsAddCategoryModalOpen(true)}
                      className="flex flex-col items-center justify-center p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all group"
                    >
                      <div className="bg-purple-50 text-purple-600 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform"><Layers size={18} /></div>
                      <span className="text-[11px] font-bold text-neutral-600 text-center">{t.addCategory}</span>
                    </button>
                    <button 
                      onClick={() => alert("Manage tables feature opened.")}
                      className="flex flex-col items-center justify-center p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all group"
                    >
                      <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform"><Store size={18} /></div>
                      <span className="text-[11px] font-bold text-neutral-600 text-center">{t.manageTables}</span>
                    </button>
                    <button 
                      onClick={() => alert("Send announcement feature opened.")}
                      className="flex flex-col items-center justify-center p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all group"
                    >
                      <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform"><Megaphone size={18} /></div>
                      <span className="text-[11px] font-bold text-neutral-600 text-center">{t.sendAnnouncement}</span>
                    </button>
                    <button 
                      onClick={() => alert("Promo feature opened.")}
                      className="flex flex-col items-center justify-center p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all group"
                    >
                      <div className="bg-pink-50 text-pink-600 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform"><Tag size={18} /></div>
                      <span className="text-[11px] font-bold text-neutral-600 text-center">{t.discountPromo}</span>
                    </button>
                    <button 
                      onClick={exportCSVReport}
                      className="flex flex-col items-center justify-center p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all group bg-orange-50/50 border-orange-200"
                    >
                      <div className="bg-orange-100 text-orange-600 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform"><Download size={18} /></div>
                      <span className="text-[11px] font-bold text-orange-700 text-center">{t.exportReports}</span>
                    </button>
                  </div>
                </div>

                {/* Promo Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md relative overflow-hidden flex items-center gap-4">
                  <div className="bg-orange-100 p-3 rounded-xl flex-shrink-0 relative">
                    <Smartphone className="text-orange-600" size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900 mb-1 leading-tight">{t.enableNotifsTitle}</h4>
                    <p className="text-[11px] text-neutral-500 font-medium mb-3 leading-snug pr-4">{t.enableNotifsDesc}</p>
                    <button onClick={() => alert("Real-time notifications enabled.")} className="text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors">
                      {t.enableNow}
                    </button>
                  </div>
                </div>

              </div>
            </div>

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
