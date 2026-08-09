import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, ListOrdered, Clock, DollarSign, Bell, Globe, 
  Search, Plus, MoreVertical, Edit2, LayoutGrid, Layers, Grid, 
  Settings2, Users, Star, Store, UserCircle, Activity, 
  ChevronDown, ArrowUpRight, TrendingUp, Calendar, ShoppingBag,
  Megaphone, Tag, Download, MessageSquare, CheckCircle2, ChevronRight,
  Menu as MenuIcon, X, UtensilsCrossed, Smartphone, Check, QrCode, RefreshCw,
  Pencil, Trash2, AlertTriangle, Eye, EyeOff, FolderEdit, FolderMinus, List,
  CreditCard, Banknote, Landmark, Wallet, Filter
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
    liveOrders: 'Live Orders (Today)',
    orderHistory: 'Order History',
    payments: 'Payments',
    menuItems: 'Menu Items',
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
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'live_orders', 'order_history', 'menu', 'payments', 'customers', 'tables', 'staff', 'settings'

  // Supabase Data States
  const [todayOrders, setTodayOrders] = useState([]); // Orders created today >= 00:00 AM
  const [allHistoryOrders, setAllHistoryOrders] = useState([]); // All past orders across all dates
  const [menuItems, setMenuItems] = useState([]);
  const [waiterCalls, setWaiterCalls] = useState([]);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [liveStatusFilter, setLiveStatusFilter] = useState('all'); // 'all', 'received', 'accepted', 'preparing', 'ready'
  const [historyTimeframe, setHistoryTimeframe] = useState('today'); // 'today', 'weekly', 'monthly', 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('all');
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true);
  const [categoriesList, setCategoriesList] = useState(['Starters', 'Mains', 'Pizzas', 'Desserts', 'Drinks']);
  const [menuViewMode, setMenuViewMode] = useState('grid'); // 'grid' or 'table'

  // Modal States
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCustomPaymentModalOpen, setIsCustomPaymentModalOpen] = useState(false);
  const [editingCustomMethod, setEditingCustomMethod] = useState(null);

  // Form States
  const [newMenuItem, setNewMenuItem] = useState({ 
    name: '', description: '', price: '', category: 'Mains', image_url: '', is_available: true 
  });
  const [editMenuItemForm, setEditMenuItemForm] = useState({ 
    id: '', name: '', description: '', price: '', category: 'Mains', image_url: '', is_available: true 
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryNameInput, setEditCategoryNameInput] = useState('');

  // Operational Settings State
  const [settingsForm, setSettingsForm] = useState({
    name: 'ZOM Restaurant & Bar',
    phone: '+251 91 123 4567',
    hours: '08:00 AM - 11:00 PM',
    taxRate: '15',
    currency: 'ETB (Br)'
  });

  // Payment Configuration Settings State
  const [paymentSettings, setPaymentSettings] = useState({
    telebirr_enabled: true,
    cbe_birr_enabled: true,
    chapa_enabled: true,
    cash_enabled: true,
    telebirr_number: '0911234567',
    telebirr_account_name: 'ZOM Restaurant',
    cbe_account_number: '1000123456789',
    cbe_account_name: 'ZOM Restaurant',
    chapa_merchant_key: 'CHAPA-SECRET-KEY',
    chapa_account_name: 'ZOM Restaurant',
    custom_payment_methods: []
  });

  // Custom Payment Method Form State
  const [customMethodForm, setCustomMethodForm] = useState({
    id: '', name: '', account_number: '', account_name: '', enabled: true
  });

  const t = TRANSLATIONS[lang];

  // Fetch initial database rows & subscribe to real-time updates
  useEffect(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayISO = startOfToday.toISOString();

    const fetchAllData = async () => {
      const [todayRes, historyRes, menuRes, waiterRes, settingsRes] = await Promise.all([
        supabase.from('orders').select('*').gte('created_at', todayISO).order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('menu_items').select('*').order('id', { ascending: true }),
        supabase.from('waiter_calls').select('*').gte('created_at', todayISO).order('created_at', { ascending: false }),
        supabase.from('restaurant_settings').select('*').eq('id', 1).maybeSingle()
      ]);
      
      if (todayRes.data) setTodayOrders(todayRes.data);
      if (historyRes.data) setAllHistoryOrders(historyRes.data);

      if (menuRes.data) {
        setMenuItems(menuRes.data);
        const dbCats = Array.from(new Set(menuRes.data.map(m => m.category).filter(Boolean)));
        setCategoriesList(prev => Array.from(new Set([...prev, ...dbCats])));
      }
      if (waiterRes.data) setWaiterCalls(waiterRes.data);

      if (settingsRes.data) {
        setSettingsForm({
          name: settingsRes.data.name || 'ZOM Restaurant & Bar',
          phone: settingsRes.data.phone || '+251 91 123 4567',
          hours: settingsRes.data.hours || '08:00 AM - 11:00 PM',
          taxRate: (settingsRes.data.tax_rate ?? 15).toString(),
          currency: settingsRes.data.currency || 'ETB (Br)'
        });
        setPaymentSettings({
          telebirr_enabled: settingsRes.data.telebirr_enabled ?? true,
          cbe_birr_enabled: settingsRes.data.cbe_birr_enabled ?? true,
          chapa_enabled: settingsRes.data.chapa_enabled ?? true,
          cash_enabled: settingsRes.data.cash_enabled ?? true,
          telebirr_number: settingsRes.data.telebirr_number || '0911234567',
          telebirr_account_name: settingsRes.data.telebirr_account_name || 'ZOM Restaurant',
          cbe_account_number: settingsRes.data.cbe_account_number || '1000123456789',
          cbe_account_name: settingsRes.data.cbe_account_name || 'ZOM Restaurant',
          chapa_merchant_key: settingsRes.data.chapa_merchant_key || 'CHAPA-SECRET-KEY',
          chapa_account_name: settingsRes.data.chapa_account_name || 'ZOM Restaurant',
          custom_payment_methods: Array.isArray(settingsRes.data.custom_payment_methods) ? settingsRes.data.custom_payment_methods : []
        });
        localStorage.setItem('restaurant_settings', JSON.stringify(settingsRes.data));
      }
    };

    fetchAllData();

    // REAL-TIME CHANNEL FOR LIVE ORDERS & HISTORY SYNC
    const liveOrdersChannel = supabase
      .channel('admin-live-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        if (payload.eventType === 'INSERT') {
          const newOrder = payload.new;
          setAllHistoryOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);

          const isToday = new Date(newOrder.created_at) >= startOfToday;
          if (isToday) {
            setTodayOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedOrder = payload.new;
          setAllHistoryOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
          setTodayOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        } else if (payload.eventType === 'DELETE') {
          setAllHistoryOrders(prev => prev.filter(o => o.id !== payload.old.id));
          setTodayOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
        supabase.from('menu_items').select('*').order('id', { ascending: true }).then(({ data }) => {
          if (data) {
            setMenuItems(data);
            const dbCats = Array.from(new Set(data.map(m => m.category).filter(Boolean)));
            setCategoriesList(prev => Array.from(new Set([...prev, ...dbCats])));
          }
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
      supabase.removeChannel(liveOrdersChannel);
    };
  }, []);

  // --- DASHBOARD METRICS ---
  const ordersTodayCount = todayOrders.length;
  const totalSalesAmount = useMemo(() => {
    return todayOrders.reduce((sum, o) => sum + (o.total_amount || o.total || 0), 0);
  }, [todayOrders]);

  const avgOrderValue = useMemo(() => {
    return ordersTodayCount > 0 ? (totalSalesAmount / ordersTodayCount).toFixed(2) : '0.00';
  }, [ordersTodayCount, totalSalesAmount]);

  const activeTablesCount = useMemo(() => {
    return new Set(todayOrders.filter(o => o.status !== 'served').map(o => o.table_number)).size;
  }, [todayOrders]);

  // --- DYNAMIC CHART DATA FOR DASHBOARD ---
  const chartData = useMemo(() => {
    const timeSlots = [0, 4, 8, 12, 16, 20, 24];
    const slotTotals = [0, 0, 0, 0, 0, 0];

    todayOrders.forEach(o => {
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
  }, [todayOrders]);

  // --- RECENT ACTIVITY LOGS ---
  const recentActivity = useMemo(() => {
    const activities = [];
    todayOrders.forEach(o => {
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
  }, [todayOrders, waiterCalls]);

  // ================= 1. DEDICATED LIVE ORDERS COMPUTATION =================
  // Strictly today's non-served active tickets with morning reset
  const liveActiveOrdersList = useMemo(() => {
    let list = todayOrders.filter(o => o.status !== 'served');

    if (liveStatusFilter !== 'all') {
      list = list.filter(o => (o.status || 'received') === liveStatusFilter);
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
  }, [todayOrders, liveStatusFilter, searchQuery]);

  // ================= 2. DEDICATED ORDER HISTORY COMPUTATION & METRICS =================
  const filteredHistoryOrders = useMemo(() => {
    let list = allHistoryOrders;
    const now = new Date();

    // Timeframe Filtering
    if (historyTimeframe === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      list = list.filter(o => new Date(o.created_at) >= startOfDay);
    } else if (historyTimeframe === 'weekly') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      list = list.filter(o => new Date(o.created_at) >= sevenDaysAgo);
    } else if (historyTimeframe === 'monthly') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      list = list.filter(o => new Date(o.created_at) >= startOfMonth);
    } else if (historyTimeframe === 'custom') {
      if (customStartDate) {
        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        list = list.filter(o => new Date(o.created_at) >= start);
      }
      if (customEndDate) {
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        list = list.filter(o => new Date(o.created_at) <= end);
      }
    }

    // Search bar filtering by Order ID, Table Number, or Customer Phone
    if (historySearchQuery.trim()) {
      const q = historySearchQuery.toLowerCase();
      list = list.filter(o => 
        o.id.toString().includes(q) || 
        (o.table_number && o.table_number.toString().includes(q)) ||
        (o.phone && o.phone.toString().includes(q)) ||
        (o.customer_phone && o.customer_phone.toString().includes(q)) ||
        (o.instructions && o.instructions.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allHistoryOrders, historyTimeframe, customStartDate, customEndDate, historySearchQuery]);

  // Aggregated Summary Metrics Header for Order History
  const historyMetrics = useMemo(() => {
    const count = filteredHistoryOrders.length;
    const totalRev = filteredHistoryOrders.reduce((sum, o) => sum + (o.total_amount || o.total || 0), 0);
    const avgVal = count > 0 ? (totalRev / count).toFixed(2) : '0.00';
    return { count, totalRev, avgVal };
  }, [filteredHistoryOrders]);

  // --- FILTERED MENU ITEMS FOR MENU TAB ---
  const filteredMenuItems = useMemo(() => {
    const itemSalesMap = {};
    allHistoryOrders.forEach(order => {
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
      const nameStr = m.name_en || (typeof m.name === 'object' ? (m.name.en || m.name.am) : m.name) || 'Item';
      const descStr = m.description_en || (typeof m.description === 'object' ? (m.description.en || m.description.am) : m.description) || '';
      const sales = itemSalesMap[nameStr] || { sold: 0, rev: 0 };
      return {
        id: m.id,
        name: nameStr,
        description: descStr,
        category: m.category || 'Mains',
        price: m.price || 0,
        image: m.image_url || m.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
        image_url: m.image_url || m.image || '',
        is_available: m.is_available ?? true,
        sold: sales.sold,
        revenue: sales.rev,
        raw: m
      };
    });

    if (menuCategoryFilter !== 'all') {
      items = items.filter(i => i.category.toLowerCase() === menuCategoryFilter.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => 
        i.name.toLowerCase().includes(q) || 
        i.category.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
      );
    }

    return items;
  }, [menuItems, allHistoryOrders, menuCategoryFilter, searchQuery]);

  // --- UPDATE ORDER STATUS IN SUPABASE ---
  const updateOrderStatus = async (orderId, newStatus) => {
    setTodayOrders(prev => prev.map(o => o.id.toString() === orderId.toString() ? { ...o, status: newStatus } : o));
    setAllHistoryOrders(prev => prev.map(o => o.id.toString() === orderId.toString() ? { ...o, status: newStatus } : o));

    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) console.error("Failed to update order status:", error);
  };

  // --- CSV REPORT EXPORT GENERATOR ---
  const exportHistoryCSV = () => {
    if (filteredHistoryOrders.length === 0) {
      alert("No order history entries available to export.");
      return;
    }

    const headers = ["Order ID", "Table Number", "Status", "Total Amount (Br)", "Items Count", "Phone", "Instructions", "Created At"];
    const rows = filteredHistoryOrders.map(o => [
      formatOrderLabel(o.id),
      o.table_number || '?',
      o.status || 'received',
      (o.total_amount || o.total || 0).toFixed(2),
      ((o.items || o.cart || [])).reduce((sum, i) => sum + (i.quantity || i.qty || 1), 0),
      `"${o.phone || o.customer_phone || ''}"`,
      `"${(o.instructions || '').replace(/"/g, '""')}"`,
      new Date(o.created_at).toLocaleString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `order_history_report_${historyTimeframe}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ================= MENU & CATEGORY ACTIONS =================
  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    if (!newMenuItem.name || !newMenuItem.price) {
      alert("Please enter a valid item name and price.");
      return;
    }

    try {
      const payload = {
        name_en: newMenuItem.name.trim(),
        name_am: newMenuItem.name.trim(),
        description_en: newMenuItem.description.trim(),
        category: newMenuItem.category,
        price: parseFloat(newMenuItem.price),
        image_url: newMenuItem.image_url.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
        is_available: newMenuItem.is_available
      };

      const { data, error } = await supabase.from('menu_items').insert([payload]).select();

      if (error) {
        alert("Error adding menu item: " + error.message);
      } else {
        if (data && data[0]) {
          setMenuItems(prev => [...prev, data[0]]);
        }
        setIsAddMenuModalOpen(false);
        setNewMenuItem({ name: '', description: '', price: '', category: categoriesList[0] || 'Mains', image_url: '', is_available: true });
      }
    } catch (err) {
      console.error("Failed to insert menu item:", err);
    }
  };

  const handleOpenEditItemModal = (item) => {
    setEditingMenuItem(item);
    setEditMenuItemForm({
      id: item.id,
      name: item.name || '',
      description: item.description || '',
      price: item.price !== undefined ? item.price.toString() : '',
      category: item.category || 'Mains',
      image_url: item.image_url || item.image || '',
      is_available: item.is_available ?? true
    });
  };

  const handleUpdateMenuItem = async (e) => {
    e.preventDefault();
    if (!editMenuItemForm.name || !editMenuItemForm.price) {
      alert("Please enter a valid title and price.");
      return;
    }

    try {
      const payload = {
        name_en: editMenuItemForm.name.trim(),
        name_am: editMenuItemForm.name.trim(),
        description_en: editMenuItemForm.description.trim(),
        category: editMenuItemForm.category,
        price: parseFloat(editMenuItemForm.price),
        image_url: editMenuItemForm.image_url.trim(),
        is_available: editMenuItemForm.is_available
      };

      const { data, error } = await supabase
        .from('menu_items')
        .update(payload)
        .eq('id', editMenuItemForm.id)
        .select();

      if (error) {
        alert("Error updating item: " + error.message);
      } else {
        if (data && data[0]) {
          setMenuItems(prev => prev.map(m => m.id === editMenuItemForm.id ? { ...m, ...data[0] } : m));
        } else {
          setMenuItems(prev => prev.map(m => m.id === editMenuItemForm.id ? { ...m, ...payload } : m));
        }
        setEditingMenuItem(null);
      }
    } catch (err) {
      console.error("Failed to update menu item:", err);
    }
  };

  const handleDeleteMenuItem = async (itemId, itemName) => {
    if (!window.confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', itemId);
      if (error) {
        alert("Error deleting item: " + error.message);
      } else {
        setMenuItems(prev => prev.filter(m => m.id !== itemId));
      }
    } catch (err) {
      console.error("Failed to delete menu item:", err);
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    const catName = newCategoryName.trim();
    if (!catName) return;
    if (!categoriesList.some(c => c.toLowerCase() === catName.toLowerCase())) {
      setCategoriesList(prev => [...prev, catName]);
    }
    setMenuCategoryFilter(catName);
    setIsAddCategoryModalOpen(false);
    setNewCategoryName('');
  };

  const handleOpenEditCategory = (catName) => {
    setEditingCategory(catName);
    setEditCategoryNameInput(catName);
  };

  const handleUpdateCategoryName = async (e) => {
    e.preventDefault();
    const oldName = editingCategory;
    const newName = editCategoryNameInput.trim();

    if (!newName) {
      alert("Category name cannot be empty.");
      return;
    }

    if (oldName === newName) {
      setEditingCategory(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ category: newName })
        .eq('category', oldName);

      if (error) {
        alert("Failed to update category items in database: " + error.message);
        return;
      }

      setCategoriesList(prev => prev.map(c => c === oldName ? newName : c));
      setMenuItems(prev => prev.map(item => item.category === oldName ? { ...item, category: newName } : item));

      if (menuCategoryFilter === oldName) {
        setMenuCategoryFilter(newName);
      }

      setEditingCategory(null);
    } catch (err) {
      console.error("Error updating category name:", err);
    }
  };

  const handleDeleteCategory = async (catToDelete) => {
    const linkedItems = menuItems.filter(m => (m.category || '').toLowerCase() === catToDelete.toLowerCase());
    const confirmText = linkedItems.length > 0 
      ? `Are you sure you want to delete category "${catToDelete}"?\n\nWARNING: This will permanently delete ${linkedItems.length} menu item(s) linked to this category from Supabase!`
      : `Are you sure you want to delete category "${catToDelete}"?`;

    if (!window.confirm(confirmText)) return;

    try {
      if (linkedItems.length > 0) {
        const { error: deleteError } = await supabase
          .from('menu_items')
          .delete()
          .eq('category', catToDelete);

        if (deleteError) {
          alert("Error deleting category items: " + deleteError.message);
          return;
        }
      }

      setCategoriesList(prev => prev.filter(c => c.toLowerCase() !== catToDelete.toLowerCase()));
      setMenuItems(prev => prev.filter(m => (m.category || '').toLowerCase() !== catToDelete.toLowerCase()));

      if (menuCategoryFilter.toLowerCase() === catToDelete.toLowerCase()) {
        setMenuCategoryFilter('all');
      }
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  // ================= CUSTOM PAYMENT METHOD ACTIONS =================
  const handleOpenAddCustomPayment = () => {
    setEditingCustomMethod(null);
    setCustomMethodForm({ id: '', name: '', account_number: '', account_name: '', enabled: true });
    setIsCustomPaymentModalOpen(true);
  };

  const handleOpenEditCustomPayment = (method) => {
    setEditingCustomMethod(method);
    setCustomMethodForm({
      id: method.id,
      name: method.name || '',
      account_number: method.account_number || '',
      account_name: method.account_name || '',
      enabled: method.enabled ?? true
    });
    setIsCustomPaymentModalOpen(true);
  };

  const handleSaveCustomPaymentMethod = (e) => {
    e.preventDefault();
    if (!customMethodForm.name.trim() || !customMethodForm.account_number.trim()) {
      alert("Please provide both Gateway Name and Account/Phone Number.");
      return;
    }

    if (editingCustomMethod) {
      setPaymentSettings(prev => ({
        ...prev,
        custom_payment_methods: prev.custom_payment_methods.map(m => 
          m.id === editingCustomMethod.id ? { ...customMethodForm, id: editingCustomMethod.id } : m
        )
      }));
    } else {
      const newMethod = {
        id: `custom_${Date.now()}`,
        name: customMethodForm.name.trim(),
        account_number: customMethodForm.account_number.trim(),
        account_name: customMethodForm.account_name.trim(),
        enabled: customMethodForm.enabled
      };
      setPaymentSettings(prev => ({
        ...prev,
        custom_payment_methods: [...(prev.custom_payment_methods || []), newMethod]
      }));
    }

    setIsCustomPaymentModalOpen(false);
  };

  const handleDeleteCustomPaymentMethod = (id, name) => {
    if (!window.confirm(`Are you sure you want to delete custom payment method "${name}"?`)) return;
    setPaymentSettings(prev => ({
      ...prev,
      custom_payment_methods: prev.custom_payment_methods.filter(m => m.id !== id)
    }));
  };

  const handleToggleCustomPaymentMethod = (id, enabled) => {
    setPaymentSettings(prev => ({
      ...prev,
      custom_payment_methods: prev.custom_payment_methods.map(m => m.id === id ? { ...m, enabled } : m)
    }));
  };

  // --- SAVE RESTAURANT & PAYMENT SETTINGS ---
  const handleSaveSettings = async () => {
    const payload = {
      id: 1,
      name: settingsForm.name,
      phone: settingsForm.phone,
      hours: settingsForm.hours,
      tax_rate: parseFloat(settingsForm.taxRate) || 15,
      currency: settingsForm.currency,
      telebirr_enabled: paymentSettings.telebirr_enabled,
      cbe_birr_enabled: paymentSettings.cbe_birr_enabled,
      chapa_enabled: paymentSettings.chapa_enabled,
      cash_enabled: paymentSettings.cash_enabled,
      telebirr_number: paymentSettings.telebirr_number,
      telebirr_account_name: paymentSettings.telebirr_account_name,
      cbe_account_number: paymentSettings.cbe_account_number,
      cbe_account_name: paymentSettings.cbe_account_name,
      chapa_merchant_key: paymentSettings.chapa_merchant_key,
      chapa_account_name: paymentSettings.chapa_account_name,
      custom_payment_methods: paymentSettings.custom_payment_methods || [],
      updated_at: new Date().toISOString()
    };

    localStorage.setItem('restaurant_settings', JSON.stringify(payload));

    try {
      const { error } = await supabase.from('restaurant_settings').upsert(payload);
      if (error) {
        alert("Settings saved locally! (Supabase status: " + error.message + ")");
      } else {
        alert("All operational and payment settings successfully saved to database!");
      }
    } catch (err) {
      alert("Saved to local storage.");
    }
  };

  // --- NAVIGATION HANDLER (SEPARATED LIVE ORDERS & ORDER HISTORY) ---
  const handleNavClick = (id) => {
    if (id === 'dashboard') setActiveTab('dashboard');
    else if (id === 'liveOrders') setActiveTab('live_orders');
    else if (id === 'orderHistory') setActiveTab('order_history');
    else if (id === 'menuItems') setActiveTab('menu');
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
      (activeTab === 'live_orders' && id === 'liveOrders') ||
      (activeTab === 'order_history' && id === 'orderHistory') ||
      (activeTab === 'menu' && id === 'menuItems') ||
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
          <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
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
            <p className="text-xs text-neutral-500 font-medium mt-1">Live customer orders today</p>
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

      {/* Middle Grid: Chart + Feeds */}
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
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{liveActiveOrdersList.length}</span>
          </div>
          <div className="flex-grow space-y-4">
            {liveActiveOrdersList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-neutral-400 gap-2">
                <ShoppingBag size={32} className="opacity-40" />
                <p className="text-sm font-medium">No live active orders today</p>
              </div>
            ) : (
              liveActiveOrdersList.slice(0, 5).map(order => (
                <div key={order.id} className="flex justify-between items-center border-b border-neutral-100 pb-3 last:border-0">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-neutral-900">{formatOrderLabel(order.id)}</span>
                      <span className="text-xs font-semibold text-neutral-600">Table {order.table_number}</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-medium">
                      {((order.items || order.cart || [])).reduce((s, i) => s + (i.quantity || i.qty || 1), 0)} items • {getTimeAgo(order.created_at)}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                    order.status === 'ready' ? 'bg-green-100 text-green-700' :
                    order.status === 'preparing' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status || 'received'}
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
    </div>
  );

  // ================= 2. DEDICATED LIVE ORDERS VIEW (activeTab === 'live_orders') =================
  const renderLiveOrdersView = () => {
    const countByStatus = {
      received: todayOrders.filter(o => o.status === 'received').length,
      accepted: todayOrders.filter(o => o.status === 'accepted').length,
      preparing: todayOrders.filter(o => o.status === 'preparing').length,
      ready: todayOrders.filter(o => o.status === 'ready').length
    };

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight text-neutral-900">Live Active Orders Board</h2>
              <span className="bg-green-500 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full animate-pulse">
                REALTIME
              </span>
            </div>
            <p className="text-neutral-500 text-xs font-medium mt-1">
              Active tickets created today (Resets automatically every morning at 00:00 AM)
            </p>
          </div>

          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold px-3 py-2 rounded-xl">
            <Clock size={16} /> Daily Reset Active • {liveActiveOrdersList.length} Live Ticket(s)
          </div>
        </div>

        {/* Live Kanban Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">Received</span>
            <span className="text-2xl font-black text-blue-900">{countByStatus.received}</span>
          </div>
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block mb-1">Accepted</span>
            <span className="text-2xl font-black text-purple-900">{countByStatus.accepted}</span>
          </div>
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl">
            <span className="text-xs font-bold text-orange-700 uppercase tracking-wider block mb-1">Preparing</span>
            <span className="text-2xl font-black text-orange-900">{countByStatus.preparing}</span>
          </div>
          <div className="bg-green-50 border border-green-200 p-4 rounded-2xl">
            <span className="text-xs font-bold text-green-700 uppercase tracking-wider block mb-1">Ready for Service</span>
            <span className="text-2xl font-black text-green-900">{countByStatus.ready}</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-neutral-200">
          {['all', 'received', 'accepted', 'preparing', 'ready'].map(st => (
            <button
              key={st}
              onClick={() => setLiveStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                liveStatusFilter === st ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {st} ({st === 'all' ? liveActiveOrdersList.length : todayOrders.filter(o => o.status === st).length})
            </button>
          ))}
        </div>

        {/* Live Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {liveActiveOrdersList.length === 0 ? (
            <div className="col-span-full py-16 text-center text-neutral-400 font-medium bg-white rounded-2xl border border-neutral-200">
              <CheckCircle2 size={40} className="mx-auto mb-2 opacity-30 text-green-500" />
              <p className="font-bold text-neutral-700">No active live orders for this status today!</p>
              <p className="text-xs text-neutral-400 mt-1">New incoming orders will appear here dynamically in real-time.</p>
            </div>
          ) : (
            liveActiveOrdersList.map(order => {
              const itemsList = order.items || order.cart || [];
              const total = order.total_amount || order.total || 0;
              const currentStatus = order.status || 'received';

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-black text-lg text-neutral-900">{formatOrderLabel(order.id)}</h3>
                        <span className="text-xs font-bold text-neutral-500">Table {order.table_number || '?'}</span>
                      </div>
                      <span className={`text-xs font-black uppercase px-3 py-1 rounded-xl shadow-sm ${
                        currentStatus === 'ready' ? 'bg-green-100 text-green-800' :
                        currentStatus === 'preparing' ? 'bg-orange-100 text-orange-800' :
                        currentStatus === 'accepted' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {currentStatus}
                      </span>
                    </div>

                    <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 space-y-1.5 mb-3">
                      <p className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Ordered Items:</p>
                      {itemsList.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-neutral-800 font-medium">
                          <span>{item.quantity || item.qty || 1}x {typeof item.name === 'object' ? (item.name.en || item.name.am) : item.name}</span>
                          <span className="font-bold">{((item.price || 0) * (item.quantity || item.qty || 1)).toFixed(2)} Br</span>
                        </div>
                      ))}
                    </div>

                    {order.instructions && (
                      <p className="text-xs text-orange-700 bg-orange-50 p-2.5 rounded-xl border border-orange-100 font-medium mb-3">
                        <strong>Note:</strong> {order.instructions}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-neutral-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-400 font-semibold">{getTimeAgo(order.created_at)}</span>
                      <span className="text-lg font-black text-neutral-900">{total.toFixed(2)} Br</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-neutral-500 whitespace-nowrap">Update Status:</label>
                      <select 
                        value={currentStatus}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="w-full text-xs font-bold bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      >
                        <option value="received">Received</option>
                        <option value="accepted">Accepted</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="served">Served (Complete Ticket)</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // ================= 3. DEDICATED ORDER HISTORY VIEW (activeTab === 'order_history') =================
  const renderOrderHistoryView = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-neutral-900">Order History & Sales Audit</h2>
          <p className="text-neutral-500 text-xs font-medium mt-1">Complete historical records across all dates and completed statuses</p>
        </div>
        <button onClick={exportHistoryCSV} className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all">
          <Download size={16} /> Export Filtered CSV Report
        </button>
      </div>

      {/* Summary Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-md">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">Total Filtered Revenue</span>
          <h3 className="text-3xl font-black text-neutral-900">{historyMetrics.totalRev.toLocaleString()} <span className="text-base text-neutral-400 font-medium">Br</span></h3>
          <p className="text-xs text-neutral-400 font-medium mt-1 uppercase">{historyTimeframe} timeframe</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-md">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">Total Filtered Orders</span>
          <h3 className="text-3xl font-black text-blue-600">{historyMetrics.count} <span className="text-base text-neutral-400 font-medium">orders</span></h3>
          <p className="text-xs text-neutral-400 font-medium mt-1 uppercase">{historyTimeframe} timeframe</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-md">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">Average Order Value</span>
          <h3 className="text-3xl font-black text-purple-600">{historyMetrics.avgVal} <span className="text-base text-neutral-400 font-medium">Br</span></h3>
          <p className="text-xs text-neutral-400 font-medium mt-1 uppercase">{historyTimeframe} timeframe</p>
        </div>
      </div>

      {/* Timeframe Filter Tabs & Date Pickers */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter size={14} /> Timeframe:
            </span>
            <button
              onClick={() => setHistoryTimeframe('today')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                historyTimeframe === 'today' ? 'bg-orange-600 text-white shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setHistoryTimeframe('weekly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                historyTimeframe === 'weekly' ? 'bg-orange-600 text-white shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Weekly (7 Days)
            </button>
            <button
              onClick={() => setHistoryTimeframe('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                historyTimeframe === 'monthly' ? 'bg-orange-600 text-white shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setHistoryTimeframe('custom')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                historyTimeframe === 'custom' ? 'bg-orange-600 text-white shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Custom Range
            </button>
          </div>

          {/* Search Bar for History */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input 
              type="text"
              placeholder="Search Order ID, Table #, Phone..."
              value={historySearchQuery}
              onChange={(e) => setHistorySearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        </div>

        {/* Custom Date Pickers */}
        {historyTimeframe === 'custom' && (
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-neutral-100 animate-fadeIn">
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 mb-1">Start Date</label>
              <input 
                type="date" 
                value={customStartDate} 
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 mb-1">End Date</label>
              <input 
                type="date" 
                value={customEndDate} 
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium"
              />
            </div>
            <button 
              onClick={() => { setCustomStartDate(''); setCustomEndDate(''); }}
              className="mt-5 text-xs text-red-600 hover:underline font-bold"
            >
              Clear Custom Dates
            </button>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold text-neutral-400 border-b border-neutral-100 bg-neutral-50">
                <th className="px-5 py-3.5 font-medium">Order ID</th>
                <th className="px-5 py-3.5 font-medium">Table</th>
                <th className="px-5 py-3.5 font-medium">Customer Phone</th>
                <th className="px-5 py-3.5 font-medium">Items Ordered</th>
                <th className="px-5 py-3.5 font-medium">Total Amount</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredHistoryOrders.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-12 text-neutral-400 font-medium">No order history records found matching timeframe</td></tr>
              ) : (
                filteredHistoryOrders.map(order => {
                  const itemsList = order.items || order.cart || [];
                  const total = order.total_amount || order.total || 0;
                  const currentStatus = order.status || 'received';

                  return (
                    <tr key={order.id} className="text-sm hover:bg-neutral-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-neutral-900">{formatOrderLabel(order.id)}</td>
                      <td className="px-5 py-4 font-bold text-neutral-700">Table {order.table_number || '?'}</td>
                      <td className="px-5 py-4 text-xs font-medium text-neutral-600">{order.phone || order.customer_phone || 'N/A'}</td>
                      <td className="px-5 py-4 text-xs font-medium text-neutral-600 max-w-xs">
                        {itemsList.map((i, idx) => `${i.quantity || i.qty || 1}x ${typeof i.name === 'object' ? (i.name.en || i.name.am) : i.name}`).join(', ')}
                      </td>
                      <td className="px-5 py-4 font-black text-neutral-900">{total.toFixed(2)} Br</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg ${
                          currentStatus === 'served' ? 'bg-neutral-100 text-neutral-600' :
                          currentStatus === 'ready' ? 'bg-green-100 text-green-700' :
                          currentStatus === 'preparing' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {currentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-neutral-400">{new Date(order.created_at).toLocaleString()}</td>
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

  // 4. MENU VIEW
  const renderMenuView = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-neutral-900">Menu & Category Management</h2>
          <p className="text-neutral-500 text-xs font-medium mt-1">Organize categories, update pricing, edit items, and manage availability</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsAddCategoryModalOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all">
            <Plus size={16} /> Add Category
          </button>
          <button onClick={() => setIsAddMenuModalOpen(true)} className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all">
            <Plus size={16} /> Add Menu Item
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-purple-600" />
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">Categories Management</h3>
            <span className="text-xs text-neutral-400 font-semibold">({categoriesList.length} categories)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 font-medium">Layout View:</span>
            <button 
              onClick={() => setMenuViewMode('grid')}
              className={`p-1.5 rounded-lg border transition-all ${menuViewMode === 'grid' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setMenuViewMode('table')}
              className={`p-1.5 rounded-lg border transition-all ${menuViewMode === 'table' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'}`}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setMenuCategoryFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              menuCategoryFilter === 'all' ? 'bg-neutral-900 text-white shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All Items ({menuItems.length})
          </button>

          {categoriesList.map(cat => {
            const count = menuItems.filter(i => (i.category || '').toLowerCase() === cat.toLowerCase()).length;
            const isSelected = menuCategoryFilter.toLowerCase() === cat.toLowerCase();

            return (
              <div 
                key={cat} 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  isSelected ? 'bg-orange-50 border-orange-500 text-orange-800 shadow-sm' : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <button onClick={() => setMenuCategoryFilter(cat)} className="flex items-center gap-1">
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-orange-200 text-orange-900' : 'bg-neutral-100 text-neutral-500'}`}>
                    {count}
                  </span>
                </button>

                <div className="flex items-center gap-1 border-l border-neutral-200 pl-1.5 ml-0.5">
                  <button 
                    onClick={() => handleOpenEditCategory(cat)}
                    className="p-1 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Pencil size={12} />
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(cat)}
                    className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {menuViewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredMenuItems.length === 0 ? (
            <div className="col-span-full py-16 text-center text-neutral-400 font-medium bg-white rounded-2xl border border-neutral-200">
              <UtensilsCrossed size={40} className="mx-auto mb-2 opacity-30" />
              <p>No menu items found matching the selected filter</p>
            </div>
          ) : (
            filteredMenuItems.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group relative">
                <div className="relative">
                  <img src={item.image} alt={item.name} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-md backdrop-blur-sm ${
                      item.is_available ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
                    }`}>
                      {item.is_available ? 'Available' : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-neutral-900/90 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md">
                    {item.price} Br
                  </div>
                </div>

                <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-neutral-900 text-base leading-snug mb-1">{item.name}</h3>
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">{item.category}</p>
                    {item.description && (
                      <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{item.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <div className="text-[11px] font-medium text-neutral-400">
                      Sold: <strong className="text-neutral-800">{item.sold}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleOpenEditItemModal(item)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteMenuItem(item.id, item.name)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold text-neutral-400 border-b border-neutral-100 bg-neutral-50">
                  <th className="px-5 py-3.5 font-medium">Item Details</th>
                  <th className="px-5 py-3.5 font-medium">Category</th>
                  <th className="px-5 py-3.5 font-medium">Price</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium">Sold / Revenue</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredMenuItems.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-12 text-neutral-400 font-medium">No menu items found</td></tr>
                ) : (
                  filteredMenuItems.map(item => (
                    <tr key={item.id} className="text-sm hover:bg-neutral-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0" />
                          <div>
                            <p className="font-bold text-neutral-900">{item.name}</p>
                            {item.description && <p className="text-xs text-neutral-400 line-clamp-1">{item.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-purple-700 text-xs uppercase">{item.category}</td>
                      <td className="px-5 py-4 font-black text-neutral-900">{item.price} Br</td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                          item.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.is_available ? 'Available' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-neutral-500">
                        {item.sold} sold • <span className="font-bold text-neutral-800">{item.revenue.toLocaleString()} Br</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEditItemModal(item)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteMenuItem(item.id, item.name)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // 5. PAYMENTS VIEW
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
              {allHistoryOrders.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-neutral-400 font-medium">No payment records found</td></tr>
              ) : (
                allHistoryOrders.map(o => (
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

  // 6. CUSTOMERS VIEW
  const renderCustomersView = () => {
    const tableCustomerMap = {};
    allHistoryOrders.forEach(o => {
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

  // 7. TABLES VIEW
  const renderTablesView = () => {
    const tablesList = Array.from({ length: 12 }, (_, i) => i + 1);
    const activeTableNumbers = new Set(todayOrders.filter(o => o.status !== 'served').map(o => o.table_number));

    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-neutral-900">Restaurant Tables Layout</h2>
          <p className="text-neutral-500 text-xs font-medium mt-1">Live status monitoring and digital QR codes for dining tables</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {tablesList.map(tNum => {
            const isOccupied = activeTableNumbers.has(tNum);
            const activeOrder = todayOrders.find(o => o.table_number === tNum && o.status !== 'served');

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

  // 8. STAFF VIEW
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

  // 9. SETTINGS VIEW
  const renderSettingsView = () => (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-neutral-900">Restaurant Settings & Configuration</h2>
        <p className="text-neutral-500 text-xs font-medium mt-1">Manage operational details, payment method toggles, custom gateways, and paired account credentials</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-md space-y-5">
        <h3 className="font-bold text-lg text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
          <Store className="text-orange-500" size={20} /> General Operational Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>

      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-100 pb-4">
          <div>
            <h3 className="font-bold text-lg text-neutral-900 flex items-center gap-2">
              <CreditCard className="text-orange-500" size={20} /> Payment Methods & Custom Gateways
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">Manage default and custom payment methods with paired Account Holder Names</p>
          </div>
          <button 
            onClick={handleOpenAddCustomPayment}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all whitespace-nowrap"
          >
            <Plus size={16} /> Add Custom Payment Method
          </button>
        </div>

        {/* SUBSECTION A: PAYMENT METHODS TOGGLE */}
        <div>
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">A. Payment Methods Toggle & Custom Gateways</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Telebirr Toggle */}
            <div className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${paymentSettings.telebirr_enabled ? 'border-cyan-500 bg-cyan-50/50' : 'border-neutral-200 bg-neutral-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${paymentSettings.telebirr_enabled ? 'bg-cyan-500 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                  <Smartphone size={20} />
                </div>
                <div>
                  <span className="font-bold text-sm text-neutral-900 block">Telebirr</span>
                  <span className="text-[11px] text-neutral-500">{paymentSettings.telebirr_enabled ? 'Active on Checkout' : 'Disabled'}</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={paymentSettings.telebirr_enabled}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, telebirr_enabled: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            {/* CBE Birr Toggle */}
            <div className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${paymentSettings.cbe_birr_enabled ? 'border-purple-600 bg-purple-50/50' : 'border-neutral-200 bg-neutral-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${paymentSettings.cbe_birr_enabled ? 'bg-purple-600 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                  <Landmark size={20} />
                </div>
                <div>
                  <span className="font-bold text-sm text-neutral-900 block">CBE Birr</span>
                  <span className="text-[11px] text-neutral-500">{paymentSettings.cbe_birr_enabled ? 'Active on Checkout' : 'Disabled'}</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={paymentSettings.cbe_birr_enabled}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, cbe_birr_enabled: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Chapa Toggle */}
            <div className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${paymentSettings.chapa_enabled ? 'border-emerald-500 bg-emerald-50/50' : 'border-neutral-200 bg-neutral-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${paymentSettings.chapa_enabled ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <span className="font-bold text-sm text-neutral-900 block">Chapa</span>
                  <span className="text-[11px] text-neutral-500">{paymentSettings.chapa_enabled ? 'Active on Checkout' : 'Disabled'}</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={paymentSettings.chapa_enabled}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, chapa_enabled: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Cash to Waiter Toggle */}
            <div className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${paymentSettings.cash_enabled ? 'border-orange-500 bg-orange-50/50' : 'border-neutral-200 bg-neutral-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${paymentSettings.cash_enabled ? 'bg-orange-500 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                  <Banknote size={20} />
                </div>
                <div>
                  <span className="font-bold text-sm text-neutral-900 block">Cash to Waiter</span>
                  <span className="text-[11px] text-neutral-500">{paymentSettings.cash_enabled ? 'Active on Checkout' : 'Disabled'}</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={paymentSettings.cash_enabled}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, cash_enabled: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            {/* CUSTOM PAYMENT METHODS LIST */}
            {paymentSettings.custom_payment_methods && paymentSettings.custom_payment_methods.map(method => (
              <div key={method.id} className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${method.enabled ? 'border-blue-500 bg-blue-50/50' : 'border-neutral-200 bg-neutral-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${method.enabled ? 'bg-blue-600 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                    <Wallet size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-neutral-900 block">{method.name}</span>
                    <span className="text-[11px] text-neutral-500 font-medium">{method.account_number} • {method.account_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleOpenEditCustomPayment(method)}
                    className="p-1.5 text-neutral-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button 
                    onClick={() => handleDeleteCustomPaymentMethod(method.id, method.name)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={method.enabled}
                      onChange={(e) => handleToggleCustomPaymentMethod(method.id, e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* SUBSECTION B: PAYMENT ACCOUNT DETAILS FORM */}
        <div className="pt-4 border-t border-neutral-100 space-y-4">
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">B. Payment Receiver Credentials (Paired Number & Account Holder Name)</h4>
          
          <div className="p-4 rounded-2xl bg-cyan-50/40 border border-cyan-100 space-y-3">
            <h5 className="font-bold text-xs text-cyan-900 flex items-center gap-1.5"><Smartphone size={14}/> Telebirr Credentials</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Telebirr Merchant / Phone Number</label>
                <input 
                  type="text" 
                  value={paymentSettings.telebirr_number}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, telebirr_number: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Telebirr Account Holder Name</label>
                <input 
                  type="text" 
                  value={paymentSettings.telebirr_account_name}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, telebirr_account_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-3">
            <h5 className="font-bold text-xs text-purple-900 flex items-center gap-1.5"><Landmark size={14}/> CBE Birr Credentials</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">CBE Birr Account Number</label>
                <input 
                  type="text" 
                  value={paymentSettings.cbe_account_number}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, cbe_account_number: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">CBE Account Holder Name</label>
                <input 
                  type="text" 
                  value={paymentSettings.cbe_account_name}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, cbe_account_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-3">
            <h5 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5"><CreditCard size={14}/> Chapa Credentials</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Chapa Public Key / Merchant Account</label>
                <input 
                  type="text" 
                  value={paymentSettings.chapa_merchant_key}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, chapa_merchant_key: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Chapa Account Holder Name</label>
                <input 
                  type="text" 
                  value={paymentSettings.chapa_account_name}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, chapa_account_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button 
          onClick={handleSaveSettings} 
          className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2 active:scale-95"
        >
          <Check size={18} /> Save All Restaurant & Payment Settings
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

      {/* SIDEBAR NAVIGATION */}
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
          
          {/* SEPARATED LIVE ORDERS & ORDER HISTORY SIDEBAR LINKS */}
          <SidebarCategory label={t.navOrders} />
          <SidebarItem icon={Clock} label={t.liveOrders} id="liveOrders" badge={liveActiveOrdersList.length > 0 ? liveActiveOrdersList.length.toString() : null} />
          <SidebarItem icon={ListOrdered} label={t.orderHistory} id="orderHistory" />
          <SidebarItem icon={DollarSign} label={t.payments} id="payments" />
          
          <SidebarCategory label={t.navMenu} />
          <SidebarItem icon={LayoutGrid} label={t.menuItems} id="menuItems" />
          <SidebarItem icon={Settings2} label={t.menuSettings} id="menuSettings" />

          <SidebarCategory label={t.navCustomers} />
          <SidebarItem icon={Users} label={t.customers} id="customers" />
          <SidebarItem icon={Star} label={t.reviews} id="reviews" />

          <SidebarCategory label={t.navRestaurant} />
          <SidebarItem icon={Store} label={t.tables} id="tables" />
          <SidebarItem icon={UserCircle} label={t.staff} id="staff" />
          <SidebarItem icon={Settings2} label={t.settings} id="settings" />
        </div>

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
            {activeTab === 'live_orders' && renderLiveOrdersView()}
            {activeTab === 'order_history' && renderOrderHistoryView()}
            {activeTab === 'menu' && renderMenuView()}
            {activeTab === 'payments' && renderPaymentsView()}
            {activeTab === 'customers' && renderCustomersView()}
            {activeTab === 'tables' && renderTablesView()}
            {activeTab === 'staff' && renderStaffView()}
            {activeTab === 'settings' && renderSettingsView()}
          </div>

          <div className="mt-8 pt-4 border-t border-neutral-200 flex justify-between text-[11px] font-semibold text-neutral-400 max-w-[1400px] mx-auto">
            <p>© 2026 ZOM Tech. All rights reserved.</p>
            <p>Version 1.0.0</p>
          </div>
        </main>
      </div>

      {/* --- ADD MENU ITEM MODAL --- */}
      {isAddMenuModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setIsAddMenuModalOpen(false); }}
        >
          <div className="max-h-[90vh] flex flex-col w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
            {/* Sticky Header */}
            <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-lg font-black text-neutral-900">{t.addMenuItem}</h3>
              <button 
                type="button"
                onClick={() => setIsAddMenuModalOpen(false)} 
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <X size={20}/>
              </button>
            </div>

            {/* Form Container */}
            <form onSubmit={handleAddMenuItem} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Body */}
              <div className="overflow-y-auto p-6 space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Item Title / Name *</label>
                  <input 
                    type="text" required
                    placeholder="e.g. Pepperoni Pizza"
                    value={newMenuItem.name}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Description</label>
                  <textarea 
                    rows="2"
                    placeholder="Short description of ingredients..."
                    value={newMenuItem.description}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-xl text-sm font-medium resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Category *</label>
                    <select 
                      value={newMenuItem.category}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, category: e.target.value })}
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium bg-white"
                    >
                      {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Price (Br) *</label>
                    <input 
                      type="number" step="0.01" required
                      placeholder="e.g. 450"
                      value={newMenuItem.price}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Image URL</label>
                  <input 
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newMenuItem.image_url}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, image_url: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Availability Status</label>
                  <select
                    value={newMenuItem.is_available ? 'true' : 'false'}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, is_available: e.target.value === 'true' })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium bg-white"
                  >
                    <option value="true">Available</option>
                    <option value="false">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="p-4 border-t flex justify-end gap-3 bg-gray-50 sticky bottom-0 z-10">
                <button 
                  type="button" 
                  onClick={() => setIsAddMenuModalOpen(false)} 
                  className="px-5 py-2.5 bg-neutral-200 hover:bg-neutral-300 font-bold text-neutral-700 text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 font-bold text-white text-xs rounded-xl shadow-md shadow-orange-600/20 transition-all"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MENU ITEM MODAL --- */}
      {editingMenuItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingMenuItem(null); }}
        >
          <div className="max-h-[90vh] flex flex-col w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
            {/* Sticky Header */}
            <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Pencil size={16}/></div>
                <h3 className="text-lg font-black text-neutral-900">Edit Menu Item</h3>
              </div>
              <button 
                type="button"
                onClick={() => setEditingMenuItem(null)} 
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <X size={20}/>
              </button>
            </div>

            {/* Form Container */}
            <form onSubmit={handleUpdateMenuItem} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Body */}
              <div className="overflow-y-auto p-6 space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Item Title / Name *</label>
                  <input 
                    type="text" required
                    value={editMenuItemForm.name}
                    onChange={(e) => setEditMenuItemForm({ ...editMenuItemForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Description</label>
                  <textarea 
                    rows="2"
                    value={editMenuItemForm.description}
                    onChange={(e) => setEditMenuItemForm({ ...editMenuItemForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-xl text-sm font-medium resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Category *</label>
                    <select 
                      value={editMenuItemForm.category}
                      onChange={(e) => setEditMenuItemForm({ ...editMenuItemForm, category: e.target.value })}
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium bg-white"
                    >
                      {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Price (Br) *</label>
                    <input 
                      type="number" step="0.01" required
                      value={editMenuItemForm.price}
                      onChange={(e) => setEditMenuItemForm({ ...editMenuItemForm, price: e.target.value })}
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Image URL</label>
                  <input 
                    type="url"
                    value={editMenuItemForm.image_url}
                    onChange={(e) => setEditMenuItemForm({ ...editMenuItemForm, image_url: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Availability Status</label>
                  <select
                    value={editMenuItemForm.is_available ? 'true' : 'false'}
                    onChange={(e) => setEditMenuItemForm({ ...editMenuItemForm, is_available: e.target.value === 'true' })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium bg-white"
                  >
                    <option value="true">Available</option>
                    <option value="false">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="p-4 border-t flex justify-end gap-3 bg-gray-50 sticky bottom-0 z-10">
                <button 
                  type="button" 
                  onClick={() => setEditingMenuItem(null)} 
                  className="px-5 py-2.5 bg-neutral-200 hover:bg-neutral-300 font-bold text-neutral-700 text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 font-bold text-white text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD CATEGORY MODAL --- */}
      {isAddCategoryModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setIsAddCategoryModalOpen(false); }}
        >
          <div className="max-h-[90vh] flex flex-col w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
            {/* Sticky Header */}
            <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-lg font-black text-neutral-900">{t.addCategory}</h3>
              <button 
                type="button"
                onClick={() => setIsAddCategoryModalOpen(false)} 
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <X size={20}/>
              </button>
            </div>

            {/* Form Container */}
            <form onSubmit={handleAddCategory} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Body */}
              <div className="overflow-y-auto p-6 space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Category Name</label>
                  <input 
                    type="text" required
                    placeholder="e.g. Beverages"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="p-4 border-t flex justify-end gap-3 bg-gray-50 sticky bottom-0 z-10">
                <button 
                  type="button" 
                  onClick={() => setIsAddCategoryModalOpen(false)} 
                  className="px-5 py-2.5 bg-neutral-200 hover:bg-neutral-300 font-bold text-neutral-700 text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 font-bold text-white text-xs rounded-xl shadow-md shadow-purple-600/20 transition-all"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT CATEGORY MODAL --- */}
      {editingCategory && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingCategory(null); }}
        >
          <div className="max-h-[90vh] flex flex-col w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
            {/* Sticky Header */}
            <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><FolderEdit size={16}/></div>
                <h3 className="text-lg font-black text-neutral-900">Edit Category</h3>
              </div>
              <button 
                type="button"
                onClick={() => setEditingCategory(null)} 
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <X size={20}/>
              </button>
            </div>

            {/* Form Container */}
            <form onSubmit={handleUpdateCategoryName} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Body */}
              <div className="overflow-y-auto p-6 space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Category Name</label>
                  <input 
                    type="text" required
                    value={editCategoryNameInput}
                    onChange={(e) => setEditCategoryNameInput(e.target.value)}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">Renaming will automatically update all linked items in Supabase.</p>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="p-4 border-t flex justify-end gap-3 bg-gray-50 sticky bottom-0 z-10">
                <button 
                  type="button" 
                  onClick={() => setEditingCategory(null)} 
                  className="px-5 py-2.5 bg-neutral-200 hover:bg-neutral-300 font-bold text-neutral-700 text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 font-bold text-white text-xs rounded-xl shadow-md shadow-purple-600/20 transition-all"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT CUSTOM PAYMENT METHOD MODAL --- */}
      {isCustomPaymentModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setIsCustomPaymentModalOpen(false); }}
        >
          <div className="max-h-[90vh] flex flex-col w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
            {/* Sticky Header */}
            <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Wallet size={16}/></div>
                <h3 className="text-lg font-black text-neutral-900">{editingCustomMethod ? 'Edit Custom Gateway' : 'Add Custom Payment Gateway'}</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsCustomPaymentModalOpen(false)} 
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <X size={20}/>
              </button>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSaveCustomPaymentMethod} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Body */}
              <div className="overflow-y-auto p-6 space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Gateway Name *</label>
                  <input 
                    type="text" required
                    placeholder="e.g. BOA Digital, Awash Birr"
                    value={customMethodForm.name}
                    onChange={(e) => setCustomMethodForm({ ...customMethodForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Account / Phone / Merchant Number *</label>
                  <input 
                    type="text" required
                    placeholder="e.g. 013201234567"
                    value={customMethodForm.account_number}
                    onChange={(e) => setCustomMethodForm({ ...customMethodForm, account_number: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Account Holder Name *</label>
                  <input 
                    type="text" required
                    placeholder="e.g. ZOM Restaurant & Bar"
                    value={customMethodForm.account_name}
                    onChange={(e) => setCustomMethodForm({ ...customMethodForm, account_name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Status</label>
                  <select
                    value={customMethodForm.enabled ? 'true' : 'false'}
                    onChange={(e) => setCustomMethodForm({ ...customMethodForm, enabled: e.target.value === 'true' })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium bg-white"
                  >
                    <option value="true">Enabled (Active on Checkout)</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="p-4 border-t flex justify-end gap-3 bg-gray-50 sticky bottom-0 z-10">
                <button 
                  type="button" 
                  onClick={() => setIsCustomPaymentModalOpen(false)} 
                  className="px-5 py-2.5 bg-neutral-200 hover:bg-neutral-300 font-bold text-neutral-700 text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 font-bold text-white text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all"
                >
                  {editingCustomMethod ? 'Update Gateway' : 'Create Gateway'}
                </button>
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
