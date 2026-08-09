// File: DigitalMenuApp.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, Plus, Minus, Leaf, Flame, Utensils, Coffee, Pizza, 
  IceCream, Info, ChevronLeft, ChevronDown, Users, MessageSquare, MapPin, 
  Smartphone, Landmark, CheckCircle2, Search, X, Globe, Clock, Check,
  Bell, BellRing, Receipt, PlusCircle, Upload, Loader2, AlertCircle, ScanText,
  Banknote, Copy, CreditCard, Wallet
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- MULTILINGUAL DATA & TRANSLATIONS ---

const TRANSLATIONS = {
  en: {
    appTitle: 'ZOM Tech Menu',
    location: 'Addis Ababa',
    searchPlaceholder: 'Search menu...',
    categories: { All: 'All', Starters: 'Starters', Mains: 'Mains', Pizzas: 'Pizzas', Desserts: 'Desserts', Drinks: 'Drinks' },
    tags: { veg: 'Veg', vegan: 'Vegan', spicy: 'Spicy' },
    add: 'Add',
    added: 'Added to cart',
    yourOrder: 'Your Cart',
    activeOrder: 'Active Order',
    emptyCart: 'Your cart is empty.',
    browseMenu: 'Browse Menu',
    orderItems: 'Order Items',
    tableNumber: 'Table Number',
    tableSelectPrompt: 'Select Table Number',
    splitBill: 'Split the Bill?',
    howManyPeople: 'How many people?',
    extraInstructions: 'Extra Instructions',
    instructionsPlaceholder: 'Allergies, extra spicy, no onions...',
    sendToKitchen: 'Send to Kitchen',
    updateOrder: 'Update Order',
    payBill: 'Request Bill & Pay',
    orderMore: 'Order More Items',
    tableRequired: 'Please select your table number to continue.',
    checkout: 'Checkout',
    orderSummary: 'Order Summary',
    splitWays: 'Split',
    ways: 'ways',
    person: 'person',
    subtotal: 'Subtotal',
    vat: 'VAT (15%)',
    selectPayment: 'Select Payment Method',
    confirmPayment: 'Confirm Payment',
    selectMethodFirst: 'Select a Payment Method',
    paymentVerification: 'Payment Verification',
    transactionId: 'Transaction ID / Reference Number',
    transactionIdPlaceholder: 'Enter transaction ID',
    or: 'OR',
    uploadReceipt: 'Upload Receipt (Screenshot)',
    tapToUpload: 'Tap to select image',
    receiptUploaded: 'Receipt Uploaded',
    fillVerification: 'Provide Trans. ID or Upload Receipt',
    verifyingTitle: 'Verifying Payment...',
    verifyingSms: 'Scanning merchant SMS gateway for matching transaction...',
    verificationFailed: 'Verification Rejected',
    verificationErrorDesc: 'We could not find a matching SMS for this amount or Transaction ID. Please verify your details or upload a clearer screenshot.',
    tryAgain: 'Try Again',
    orderNumber: 'Order #104',
    paymentSuccess: 'Payment Successful!',
    thanksMessage: 'Thank you for dining with us.',
    startNewSession: 'Start New Session',
    receipt: 'Final Receipt',
    totalPaid: 'Total Paid',
    status: [
      'Order received',
      'Kitchen accepted',
      'Preparing',
      'Ready',
      'Served'
    ],
    callWaiter: 'Call Waiter',
    waiterOnWay: 'Waiter is on the way!',
    callWaiterTitle: 'How can we help you?',
    waiterReasons: {
      order: 'Ready to order',
      water: 'Need water',
      napkins: 'More napkins',
      bill: 'Get the bill',
      other: 'Other (Type below)'
    },
    customReasonPlaceholder: 'Please type your request here...',
    sendRequest: 'Send Request',
    cancel: 'Cancel',
    cash: 'Cash (Pay Waiter)',
    copy: 'Copy',
    copied: 'Copied!',
    accountName: 'Name',
    callWaiterForCash: 'Call Waiter to Pay',
    cashPendingTitle: 'Waiter Called',
    cashPendingDesc: 'Your waiter is on the way to collect the cash payment at your table.'
  },
  am: {
    appTitle: 'ዞም ቴክ ሜኑ',
    location: 'አዲስ አበባ',
    searchPlaceholder: 'ምግብ ይፈልጉ...',
    categories: { All: 'ሁሉም', Starters: 'መክሰስ', Mains: 'ዋና ምግብ', Pizzas: 'ፒዛ', Desserts: 'ጣፋጭ', Drinks: 'መጠጥ' },
    tags: { veg: 'የጾም', vegan: 'ቪጋን', spicy: 'የሚያቃጥል' },
    add: 'ጨምር',
    added: 'ወደ ቅርጫት ገብቷል',
    yourOrder: 'ቅርጫትዎ',
    activeOrder: 'የአሁን ትዕዛዝ',
    emptyCart: 'ቅርጫትዎ ባዶ ነው።',
    browseMenu: 'ሜኑ ይመልከቱ',
    orderItems: 'የታዘዙት',
    tableNumber: 'የጠረጴዛ ቁጥር',
    tableSelectPrompt: 'የጠረጴዛ ቁጥር ይምረጡ',
    splitBill: 'ሂሳብ ይከፈላል?',
    howManyPeople: 'ለስንት ሰው?',
    extraInstructions: 'ተጨማሪ መመሪያዎች',
    instructionsPlaceholder: 'አለርጂ፣ በጣም የሚያቃጥል...',
    sendToKitchen: 'ወደ ወጥ ቤት ላክ',
    updateOrder: 'ትዕዛዝ አስተካክል',
    payBill: 'ሂሳብ ክፈል',
    orderMore: 'ተጨማሪ እዘዝ',
    tableRequired: 'እባክዎ ለመቀጠል የጠረጴዛ ቁጥር ይምረጡ።',
    checkout: 'ክፍያ',
    orderSummary: 'የትዕዛዝ ማጠቃለያ',
    splitWays: 'ለ',
    ways: 'ተከፍሏል',
    person: 'ሰው',
    subtotal: 'ድምር',
    vat: 'ተ.እ.ታ (15%)',
    selectPayment: 'የመክፈያ ዘዴ ይምረጡ',
    confirmPayment: 'ክፍያ አረጋግጥ',
    selectMethodFirst: 'የመክፈያ ዘዴ ይምረጡ',
    paymentVerification: 'የክፍያ ማረጋገጫ',
    transactionId: 'የትራንዛክሽን ቁጥር (Transaction ID)',
    transactionIdPlaceholder: 'የትራንዛክሽን ቁጥር ያስገቡ',
    or: 'ወይም',
    uploadReceipt: 'የክፍያ ደረሰኝ (ስክሪንሾት) ይጫኑ',
    tapToUpload: 'ምስል ለመምረጥ ይጫኑ',
    receiptUploaded: 'ደረሰኝ ተጭኗል',
    fillVerification: 'ትራንዛክሽን ቁጥር ያስገቡ ወይም ደረሰኝ ይጫኑ',
    verifyingTitle: 'ክፍያ በመረጋገጥ ላይ...',
    verifyingSms: 'ተመሳሳይ ክፍያ መኖሩን የሻጭ የጽሑፍ መልእክቶችን (SMS) በመፈተሽ ላይ...',
    verificationFailed: 'ማረጋገጥ አልተቻለም',
    verificationErrorDesc: 'ከባንክ የተላከ ተመሳሳይ የጽሑፍ መልእክት (SMS) ማግኘት አልቻልንም። እባክዎ የትራንዛክሽን ቁጥሩን ያረጋግጡ ወይም ደረሰኙን እንደገና ይጫኑ።',
    tryAgain: 'እንደገና ይሞክሩ',
    orderNumber: 'ትዕዛዝ #104',
    paymentSuccess: 'ክፍያ ተሳክቷል!',
    thanksMessage: 'ከእኛ ጋር ስለተመገቡ እናመሰግናለን።',
    startNewSession: 'አዲስ ትዕዛዝ ጀምር',
    receipt: 'የመጨረሻ ደረሰኝ',
    totalPaid: 'አጠቃላይ ክፍያ',
    status: [
      'ትዕዛዝ ደርሷል',
      'ወጥ ቤት ተቀብሏል',
      'እየተዘጋጀ ነው',
      'ዝግጁ ነው',
      'ቀርቧል'
    ],
    callWaiter: 'አስተናጋጅ ጥራ',
    waiterOnWay: 'አስተናጋጅ እየመጣ ነው!',
    callWaiterTitle: 'እንዴት ልንረዳዎ እንችላለን?',
    waiterReasons: {
      order: 'ለማዘዝ ዝግጁ ነኝ',
      water: 'ውሃ እፈልጋለሁ',
      napkins: 'ተጨማሪ ሶፍት',
      bill: 'ሂሳብ አምጡልኝ',
      other: 'ሌላ (ከታች ይፃፉ)'
    },
    customReasonPlaceholder: 'እባክዎ ጥያቄዎን እዚህ ይፃፉ...',
    sendRequest: 'ጥያቄ ላክ',
    cancel: 'ሰርዝ',
    cash: 'ጥሬ ገንዘብ (ለአስተናጋጅ)',
    copy: 'ቅዳ',
    copied: 'ተቀድቷል!',
    accountName: 'ስም',
    callWaiterForCash: 'ለመክፈል አስተናጋጅ ይጠሩ',
    cashPendingTitle: 'አስተናጋጅ ተጠርቷል',
    cashPendingDesc: 'አስተናጋጁ የጥሬ ገንዘብ ክፍያ ለመቀበል ወደ ጠረጴዛዎ እየመጣ ነው።'
  }
};

const CATEGORY_KEYS = ['All', 'Starters', 'Mains', 'Pizzas', 'Desserts', 'Drinks'];
const WAITER_REASON_KEYS = ['order', 'water', 'napkins', 'bill', 'other'];

const getItemName = (item, lang) => {
  if (!item || !item.name) return '';
  if (typeof item.name === 'object') return item.name[lang] || item.name.en || '';
  return String(item.name);
};

const getItemDesc = (item, lang) => {
  if (!item || !item.description) return '';
  if (typeof item.description === 'object') return item.description[lang] || item.description.en || '';
  return String(item.description);
};

export default function App() {
  // Navigation & Config State
  const [lang, setLang] = useState('en'); 
  const [currentView, setCurrentView] = useState('menu'); // 'menu', 'cart', 'activeOrder', 'checkout', 'paid', 'cashPending'
  const t = TRANSLATIONS[lang]; 
  
  // Menu State
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null); 
  
  // Cart & Orders State
  const [cart, setCart] = useState([]);
  const [justAddedId, setJustAddedId] = useState(null); 
  const [hasOrdered, setHasOrdered] = useState(false); 
  const [orderProgress, setOrderProgress] = useState(0); 
  const [activeOrderId, setActiveOrderId] = useState(null);

  // Combined Details (Cart + Checkout)
  const [orderDetails, setOrderDetails] = useState({
    tableNumber: '', instructions: '', isSplitting: false, splitCount: 2, 
    paymentMethod: '', paymentId: '', receiptFile: null
  });

  // Payment Settings State (Fetched from Supabase restaurant_settings)
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

  // Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('idle'); // idle, loading, rejected

  // Waiter State
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [waiterReason, setWaiterReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  // Restore Active Order ID from localStorage if present
  useEffect(() => {
    const savedOrderId = localStorage.getItem('activeOrderId');
    if (savedOrderId) {
      setActiveOrderId(savedOrderId);
      setHasOrdered(true);
    }
  }, []);

  // Fetch Restaurant & Payment Settings from Supabase on mount + Subscribe Realtime
  useEffect(() => {
    const fetchRestaurantSettings = async () => {
      try {
        const { data, error } = await supabase.from('restaurant_settings').select('*').eq('id', 1).maybeSingle();
        if (!error && data) {
          setPaymentSettings({
            telebirr_enabled: data.telebirr_enabled ?? true,
            cbe_birr_enabled: data.cbe_birr_enabled ?? true,
            chapa_enabled: data.chapa_enabled ?? true,
            cash_enabled: data.cash_enabled ?? true,
            telebirr_number: data.telebirr_number || '0911234567',
            telebirr_account_name: data.telebirr_account_name || 'ZOM Restaurant',
            cbe_account_number: data.cbe_account_number || '1000123456789',
            cbe_account_name: data.cbe_account_name || 'ZOM Restaurant',
            chapa_merchant_key: data.chapa_merchant_key || 'CHAPA-SECRET-KEY',
            chapa_account_name: data.chapa_account_name || 'ZOM Restaurant',
            custom_payment_methods: Array.isArray(data.custom_payment_methods) ? data.custom_payment_methods : []
          });
          localStorage.setItem('restaurant_settings', JSON.stringify(data));
        } else {
          const cached = localStorage.getItem('restaurant_settings');
          if (cached) {
            try {
              setPaymentSettings(JSON.parse(cached));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.error('Failed to fetch restaurant settings:', err);
      }
    };

    fetchRestaurantSettings();

    const settingsChannel = supabase
      .channel('menu-settings-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'restaurant_settings' },
        (payload) => {
          if (payload.new) {
            setPaymentSettings({
              telebirr_enabled: payload.new.telebirr_enabled ?? true,
              cbe_birr_enabled: payload.new.cbe_birr_enabled ?? true,
              chapa_enabled: payload.new.chapa_enabled ?? true,
              cash_enabled: payload.new.cash_enabled ?? true,
              telebirr_number: payload.new.telebirr_number || '0911234567',
              telebirr_account_name: payload.new.telebirr_account_name || 'ZOM Restaurant',
              cbe_account_number: payload.new.cbe_account_number || '1000123456789',
              cbe_account_name: payload.new.cbe_account_name || 'ZOM Restaurant',
              chapa_merchant_key: payload.new.chapa_merchant_key || 'CHAPA-SECRET-KEY',
              chapa_account_name: payload.new.chapa_account_name || 'ZOM Restaurant',
              custom_payment_methods: Array.isArray(payload.new.custom_payment_methods) ? payload.new.custom_payment_methods : []
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(settingsChannel);
    };
  }, []);

  // Fetch Menu Items from Supabase on mount
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { data, error } = await supabase.from('menu_items').select('*');
        if (!error && data) {
          const mapped = data.map(row => ({
            id: row.id,
            category: row.category || 'Mains',
            price: row.price || 0,
            dietary: Array.isArray(row.dietary) ? row.dietary : (row.dietary ? [row.dietary] : []),
            image: row.image_url || row.image || '',
            name: {
              en: row.name_en || (typeof row.name === 'object' ? row.name?.en : row.name) || '',
              am: row.name_am || (typeof row.name === 'object' ? row.name?.am : row.name) || row.name_en || ''
            },
            description: {
              en: row.description_en || (typeof row.description === 'object' ? row.description?.en : row.description) || '',
              am: row.description_am || (typeof row.description === 'object' ? row.description?.am : row.description) || row.description_en || ''
            }
          }));
          setMenuItems(mapped);
        } else {
          setMenuItems([]);
        }
      } catch (err) {
        console.error('Failed to fetch menu_items from Supabase:', err);
        setMenuItems([]);
      }
    };
    fetchMenuItems();
  }, []);

  // Realtime subscription for active order changes
  useEffect(() => {
    if (!activeOrderId) return;

    const channel = supabase
      .channel('order-status-channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${activeOrderId}`
        },
        (payload) => {
          const updatedOrder = payload.new;
          if (!updatedOrder) return;

          if (updatedOrder.payment_status === 'verified') {
            setCurrentView('paid');
          } else if (updatedOrder.payment_status === 'failed' || updatedOrder.payment_status === 'rejected') {
            setVerificationStatus('rejected');
          }

          if (updatedOrder.status !== undefined) {
            const statusMap = {
              'received': 0,
              'accepted': 1,
              'preparing': 2,
              'ready': 3,
              'served': 4
            };
            const progressIndex = statusMap[updatedOrder.status];
            if (progressIndex !== undefined) {
              setOrderProgress(progressIndex);
            } else if (typeof updatedOrder.status === 'number') {
              setOrderProgress(updatedOrder.status);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeOrderId]);

  // --- LOGIC & CALCULATIONS ---
  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (activeCategory !== 'All') {
      items = items.filter(item => item.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(item => 
        getItemName(item, lang).toLowerCase().includes(q) || 
        getItemDesc(item, lang).toLowerCase().includes(q)
      );
    }
    return items;
  }, [menuItems, activeCategory, searchQuery, lang]);

  const updateQuantity = (item, delta, e) => {
    if (e) e.stopPropagation(); 
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(i => i.id !== item.id);
        if (existing.quantity === 0 && newQty === 1) triggerAddedAnimation(item.id);
        return prev.map(i => i.id === item.id ? { ...i, quantity: newQty } : i);
      }
      triggerAddedAnimation(item.id);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const triggerAddedAnimation = (id) => {
    setJustAddedId(id);
    setTimeout(() => setJustAddedId(null), 1500);
  };

  const getItemQuantity = (id) => {
    const item = cart.find(i => i.id === id);
    return item ? item.quantity : 0;
  };

  const handleCallWaiterIconClick = () => {
    if (!waiterCalled) setIsWaiterModalOpen(true);
  };

  const submitWaiterRequest = () => {
    setIsWaiterModalOpen(false);
    setWaiterCalled(true);
    setWaiterReason('');
    setCustomReason('');
    showToast(t.waiterOnWay);
    setTimeout(() => setWaiterCalled(false), 15000);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(t.copied);
    } catch (err) {
      console.error('Copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const sendToKitchen = async () => {
    setHasOrdered(true);
    setCurrentView('activeOrder');
    try {
      const payload = {
        table_number: parseInt(orderDetails.tableNumber) || 1,
        items: cart,
        cart: cart,
        total_amount: parseFloat(cartTotal),
        status: 'received',
        instructions: orderDetails.instructions || ''
      };

      console.log("Sending order payload:", payload);

      const { data, error } = await supabase
        .from('orders')
        .insert([payload])
        .select();

      if (error) {
        console.error("Supabase Order Insert Error:", error.message, error.details, error.hint);
        alert("Failed to send order to kitchen: " + error.message);
        return;
      }

      console.log("Order successfully created in Supabase:", data);
      if (data && data.length > 0) {
        const newOrder = data[0];
        setActiveOrderId(newOrder.id);
        localStorage.setItem('activeOrderId', newOrder.id.toString());
      }
    } catch (err) {
      console.error('Supabase insertion error:', err);
    }
  };

  // --- AUTO-VERIFICATION SIMULATION & SUPABASE INSERTION ---
  const handlePaymentSubmit = async () => {
    setIsVerifying(true);
    setVerificationStatus('loading');

    // Insert order row into Supabase
    try {
      const payload = {
        table_number: parseInt(orderDetails.tableNumber) || 1,
        items: cart,
        cart: cart,
        total_amount: parseFloat(cartTotal),
        status: 'received',
        instructions: orderDetails.instructions || ''
      };

      console.log("Sending order payload:", payload);

      const { data, error } = await supabase
        .from('orders')
        .insert([payload])
        .select();

      if (error) {
        console.error("Supabase Order Insert Error:", error.message, error.details, error.hint);
        alert("Failed to send order to kitchen: " + error.message);
        setIsVerifying(false);
        setVerificationStatus('idle');
        return;
      }

      console.log("Order successfully created in Supabase:", data);
      if (data && data.length > 0) {
        const newOrder = data[0];
        setActiveOrderId(newOrder.id);
        localStorage.setItem('activeOrderId', newOrder.id.toString());
      }
    } catch (err) {
      console.error('Supabase insertion error:', err);
    }

    if (orderDetails.paymentMethod === 'cash') {
      setWaiterCalled(true);
      showToast(t.waiterOnWay);
      setIsVerifying(false);
      setVerificationStatus('idle');
      setCurrentView('cashPending');
      return;
    }

    setTimeout(() => {
      const isTestReject = orderDetails.paymentId === '123';
      const isRandomReject = Math.random() < 0.2;
      
      if (isTestReject || (isRandomReject && !orderDetails.receiptFile)) {
        setVerificationStatus('rejected');
      } else {
        setIsVerifying(false);
        setVerificationStatus('idle');
        setCurrentView('paid');
      }
    }, 4000);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = cartSubtotal * 0.15; 
  const cartTotal = cartSubtotal + tax;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);



  // --- HELPER COMPONENTS ---
  const DietaryBadge = ({ type }) => {
    if (type === 'vegetarian') return <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-700 bg-green-100 px-2 py-1 rounded-sm"><Leaf size={10} /> {t.tags.veg}</span>;
    if (type === 'vegan') return <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-sm"><Leaf size={10} /> {t.tags.vegan}</span>;
    if (type === 'spicy') return <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-700 bg-red-100 px-2 py-1 rounded-sm"><Flame size={10} /> {t.tags.spicy}</span>;
    return null;
  };

  const CategoryIcon = ({ category }) => {
    switch (category) {
      case 'Starters': return <Utensils size={16} />;
      case 'Mains': return <Utensils size={16} />;
      case 'Pizzas': return <Pizza size={16} />;
      case 'Desserts': return <IceCream size={16} />;
      case 'Drinks': return <Coffee size={16} />;
      default: return <Info size={16} />;
    }
  };

  const QuantityControl = ({ item }) => {
    const qty = getItemQuantity(item.id);
    const isJustAdded = justAddedId === item.id;

    if (isJustAdded) {
      return (
        <div className="h-9 w-full sm:w-auto px-4 bg-green-50 text-green-600 rounded-xl flex items-center justify-center gap-1.5 font-bold text-sm animate-pulse shadow-inner border border-green-200">
          <CheckCircle2 size={16} /> {t.added}
        </div>
      );
    }
    if (qty > 0) {
      return (
        <div className="h-9 flex items-center bg-neutral-100 border border-neutral-200 rounded-xl shadow-inner w-full sm:w-auto" onClick={e => e.stopPropagation()}>
          <button onClick={(e) => updateQuantity(item, -1, e)} className="h-full px-3 text-neutral-600 hover:text-orange-600 hover:bg-neutral-200 rounded-l-xl transition-colors font-bold text-lg flex items-center justify-center">−</button>
          <span className="font-bold text-sm w-8 text-center text-neutral-900">{qty}</span>
          <button onClick={(e) => updateQuantity(item, 1, e)} className="h-full px-3 text-neutral-600 hover:text-orange-600 hover:bg-neutral-200 rounded-r-xl transition-colors font-bold text-lg flex items-center justify-center">+</button>
        </div>
      );
    }
    return (
      <button
        onClick={(e) => updateQuantity(item, 1, e)}
        className="h-9 w-full sm:w-auto px-4 bg-[#EA580C] text-white hover:bg-[#EA580C]/90 rounded-2xl flex items-center justify-center gap-1.5 font-bold text-sm transition-all shadow-sm"
      >
        <Plus size={16} /> {t.add}
      </button>
    );
  };

  // --- VIEWS ---

  const renderMenu = () => (
    <div className="pb-24 animate-fadeIn">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-neutral-900 text-white p-2 rounded-xl shadow-md">
                <Utensils size={20} />
              </div>
              <div>
                <h1 className="font-black text-xl tracking-tight text-neutral-900 leading-none">{t.appTitle}</h1>
                <p className="text-xs text-neutral-500 font-medium mt-1 flex items-center gap-1"><MapPin size={10}/> {t.location}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={handleCallWaiterIconClick} className={`relative p-2 rounded-full transition-all flex items-center justify-center ${waiterCalled ? 'bg-green-100 text-green-600 shadow-inner' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                {waiterCalled ? <BellRing size={20} className="animate-pulse" /> : <Bell size={20} />}
              </button>
              <button onClick={() => setLang(lang === 'en' ? 'am' : 'en')} className="flex items-center gap-1 text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 px-3 py-2 rounded-full transition-colors">
                <Globe size={14} /> {lang === 'en' ? 'አማርኛ' : 'EN'}
              </button>
              <button onClick={() => setCurrentView(hasOrdered ? 'activeOrder' : 'cart')} className={`relative p-2.5 rounded-full transition-colors ml-1 ${hasOrdered ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>
                {hasOrdered ? <Receipt size={22} /> : <ShoppingBag size={22} />}
                {cartItemCount > 0 && !hasOrdered && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">{cartItemCount}</span>
                )}
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" placeholder={t.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-neutral-400"
            />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 p-1"><X size={14} /></button>}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-5">
        <div className="flex overflow-x-auto pb-4 mb-2 hide-scrollbar gap-2 snap-x">
          {CATEGORY_KEYS.map(catKey => (
            <button key={catKey} onClick={() => setActiveCategory(catKey)} className={`snap-start whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-bold transition-all ${activeCategory === catKey ? 'bg-neutral-900 text-white shadow-md' : 'bg-white text-neutral-600 border border-neutral-200 shadow-sm hover:bg-neutral-50'}`}>
              {catKey !== 'All' && <CategoryIcon category={catKey} />} {t.categories[catKey]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map(item => (
            <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-white rounded-2xl overflow-hidden border border-neutral-200 flex sm:flex-col shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <div className="w-32 sm:w-full sm:h-48 flex-shrink-0 relative bg-neutral-100">
                <img src={item.image} alt={getItemName(item, lang)} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute top-2 left-2 flex flex-col gap-1">{item.dietary?.map(d => <DietaryBadge key={d} type={d} />)}</div>
              </div>
              <div className="p-4 flex flex-col flex-grow justify-between gap-3">
                <div>
                  <h3 className="font-bold text-neutral-900 leading-tight mb-1">{getItemName(item, lang)}</h3>
                  <p className="text-neutral-500 text-xs line-clamp-2">{getItemDesc(item, lang)}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-auto">
                  <span className="font-black text-neutral-900 text-lg">{item.price} <span className="text-xs text-neutral-500 font-bold">Br</span></span>
                  <QuantityControl item={item} />
                </div>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && <div className="col-span-full py-10 text-center text-neutral-400 font-medium">No items found.</div>}
        </div>
      </main>

      {/* Floating View Cart / Active Order Button (Mobile) */}
      {(cartItemCount > 0 || hasOrdered) && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-20 sm:hidden">
          <button onClick={() => setCurrentView(hasOrdered ? 'activeOrder' : 'cart')} className="w-full p-4 rounded-2xl font-bold flex justify-between items-center shadow-xl bg-orange-600 text-white">
            <span className="flex items-center gap-2"><span className="bg-white/20 px-2 py-1 rounded-lg text-sm">{cartItemCount} items</span></span>
            <span>{hasOrdered ? t.activeOrder : `${t.yourOrder} • ${cartTotal.toFixed(0)} Br`}</span>
          </button>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:p-4">
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedItem(null)}></div>
          <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-slideUp sm:animate-scaleIn z-10 max-h-[90vh] flex flex-col">
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 z-10 bg-black/40 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/60"><X size={20} /></button>
            <div className="h-64 sm:h-72 w-full relative flex-shrink-0"><img src={selectedItem.image} alt={getItemName(selectedItem, lang)} className="w-full h-full object-cover" /></div>
            <div className="p-6 flex flex-col flex-grow overflow-y-auto">
              <div className="flex gap-2 mb-3">{selectedItem.dietary?.map(d => <DietaryBadge key={d} type={d} />)}</div>
              <h2 className="text-2xl font-black text-neutral-900 mb-2 leading-tight">{getItemName(selectedItem, lang)}</h2>
              <p className="text-neutral-600 text-sm mb-6 leading-relaxed flex-grow">{getItemDesc(selectedItem, lang)}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-100">
                <span className="text-2xl font-black text-neutral-900">{selectedItem.price} <span className="text-sm text-neutral-500 font-bold">Br</span></span>
                <QuantityControl item={selectedItem} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // CART VIEW
  const renderCart = () => (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col animate-fadeIn">
      <header className="bg-white border-b border-neutral-200 px-4 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
        <button onClick={() => setCurrentView(hasOrdered ? 'activeOrder' : 'menu')} className="p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"><ChevronLeft size={24} /></button>
        <h1 className="font-black text-xl flex-grow text-neutral-900">{t.yourOrder}</h1>
      </header>
      <main className="flex-grow max-w-2xl mx-auto w-full p-4 flex flex-col gap-5">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-neutral-400 gap-4">
            <ShoppingBag size={48} className="opacity-20" />
            <p className="font-medium text-lg">{t.emptyCart}</p>
            <button onClick={() => setCurrentView('menu')} className="px-6 py-2.5 bg-neutral-900 text-white rounded-full font-bold mt-2 shadow-md">{t.browseMenu}</button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
              <h2 className="font-bold text-neutral-400 text-xs uppercase tracking-wider mb-4">{t.orderItems}</h2>
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="font-medium flex-grow">
                      <div className="text-neutral-900 font-bold leading-tight">{getItemName(item, lang)}</div>
                      <div className="text-neutral-500 text-sm mt-0.5">{item.price} Br</div>
                    </div>
                    <div className="flex items-center bg-neutral-100 rounded-xl shadow-inner border border-neutral-200">
                      <button onClick={() => updateQuantity(item, -1)} className="p-2 text-neutral-600 hover:text-orange-600"><Minus size={16} /></button>
                      <span className="font-black text-sm w-6 text-center text-neutral-900">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item, 1)} className="p-2 text-neutral-600 hover:text-orange-600"><Plus size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-6">
              
              {/* Table Selection Dropdown */}
              <div>
                <label className="flex items-center gap-2 font-bold text-neutral-900 mb-2"><MapPin size={18} className="text-orange-500"/> {t.tableNumber} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select 
                    value={orderDetails.tableNumber}
                    onChange={(e) => setOrderDetails({...orderDetails, tableNumber: e.target.value})}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-bold text-lg appearance-none cursor-pointer"
                  >
                    <option value="" disabled>{t.tableSelectPrompt}</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-neutral-100">
                <label className="flex items-center gap-2 font-bold text-neutral-900 mb-2"><MessageSquare size={18} className="text-orange-500"/> {t.extraInstructions}</label>
                <textarea placeholder={t.instructionsPlaceholder} value={orderDetails.instructions} onChange={(e) => setOrderDetails({...orderDetails, instructions: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm font-medium"></textarea>
              </div>
            </div>

            <div className="mt-2 mb-8">
              <button disabled={!orderDetails.tableNumber} onClick={sendToKitchen} className="w-full bg-[#EA580C] disabled:bg-neutral-300 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2 text-lg">
                {hasOrdered ? t.updateOrder : t.sendToKitchen}
              </button>
              {!orderDetails.tableNumber && <p className="text-center text-red-500 text-sm mt-3 font-bold animate-pulse">{t.tableRequired}</p>}
            </div>
          </>
        )}
      </main>
    </div>
  );

const formatOrderLabel = (id) => {
  if (!id) return '#Order';
  const str = id.toString();
  if (str.includes('-')) return `#Order${str.slice(0, 4)}`;
  return `#Order${str}`;
};

  // ACTIVE ORDER VIEW
  const renderActiveOrder = () => (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col animate-fadeIn overflow-y-auto">
      <div className="max-w-2xl w-full mx-auto flex flex-col pt-6 px-4">
        <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-neutral-200">
          <div><h1 className="text-2xl font-black text-neutral-900">{activeOrderId ? formatOrderLabel(activeOrderId) : t.orderNumber}</h1><p className="text-sm font-bold text-neutral-500 mt-1">{t.tableNumber} {orderDetails.tableNumber}</p></div>
          <button onClick={handleCallWaiterIconClick} className="bg-orange-100 text-orange-600 p-3 rounded-full hover:bg-orange-200 transition-colors"><Bell size={24} /></button>
        </div>
        <div className="bg-white border border-neutral-200 p-6 rounded-3xl mb-6 shadow-sm">
          <div className="relative pl-6 space-y-8">
            <div className="absolute top-2 bottom-2 left-8 w-0.5 bg-neutral-200 -z-10"></div>
            {t.status.map((stepLabel, idx) => {
              const isCompleted = idx < orderProgress;
              const isCurrent = idx === orderProgress;
              return (
                <div key={idx} className="flex items-center gap-4 relative">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border-[3px] outline outline-4 outline-white z-10 transition-all duration-500 ${isCompleted ? 'bg-green-500 border-green-500' : isCurrent ? 'bg-orange-500 border-orange-500 animate-pulse' : 'bg-neutral-200 border-neutral-300'}`}>
                    {isCompleted && <Check size={10} className="text-white" />}
                  </div>
                  <span className={`font-bold text-lg transition-colors duration-500 ${isCurrent ? 'text-neutral-900' : isCompleted ? 'text-neutral-500' : 'text-neutral-400'}`}>{stepLabel}</span>
                  {isCurrent && idx < 4 && <Clock size={16} className="text-orange-500 ml-auto animate-spin-slow" />}
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl w-full shadow-sm border border-neutral-200 mb-24">
          <h3 className="font-bold text-neutral-400 text-xs uppercase tracking-wider mb-4 flex justify-between items-center">{t.orderItems} <span className="text-neutral-900 bg-neutral-100 px-2 py-1 rounded-md">{cartItemCount}</span></h3>
          <div className="space-y-3 mb-6 border-b border-neutral-100 pb-6">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between font-medium text-sm">
                <span className="text-neutral-700">{item.quantity}x {getItemName(item, lang)}</span><span className="font-bold text-neutral-900">{(item.price * item.quantity).toFixed(2)} Br</span>
              </div>
            ))}
          </div>
          <button onClick={() => setCurrentView('menu')} className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
            <PlusCircle size={18} /> {t.orderMore}
          </button>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)] z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex flex-col"><span className="text-xs font-bold text-neutral-500 uppercase">{t.subtotal}</span><span className="text-xl font-black text-neutral-900">{cartTotal.toFixed(2)} Br</span></div>
          <button onClick={() => setCurrentView('checkout')} className="bg-[#EA580C] text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-orange-600/20 active:scale-95 transition-transform">{t.payBill}</button>
        </div>
      </div>
    </div>
  );

  // CHECKOUT VIEW
  const renderCheckout = () => {
    const splitAmount = orderDetails.isSplitting ? (cartTotal / orderDetails.splitCount) : cartTotal;
    const isPaymentVerified = orderDetails.paymentMethod === 'cash' || orderDetails.paymentId.trim() !== '' || orderDetails.receiptFile !== null;

    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col animate-fadeIn">
        <header className="bg-white border-b border-neutral-200 px-4 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
          <button onClick={() => setCurrentView('activeOrder')} className="p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"><ChevronLeft size={24} /></button>
          <h1 className="font-black text-xl flex-grow text-neutral-900">{t.checkout}</h1>
        </header>

        <main className="flex-grow max-w-2xl mx-auto w-full p-4 flex flex-col gap-6 pb-40">
          <div className="bg-neutral-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <h2 className="text-white/60 font-bold text-xs uppercase tracking-widest mb-4">{t.orderSummary} • {t.tableNumber} {orderDetails.tableNumber}</h2>
            <div className="flex justify-between items-end mb-5">
              <div>
                <p className="text-4xl font-black">{cartTotal.toFixed(2)} <span className="text-xl text-white/60">Br</span></p>
                {orderDetails.isSplitting && <p className="text-orange-400 font-bold mt-2 flex items-center gap-1.5 text-sm bg-orange-500/10 w-fit px-3 py-1 rounded-lg"><Users size={14} /> {t.splitWays} {orderDetails.splitCount} {t.ways}: <span className="text-white ml-1">{splitAmount.toFixed(2)} Br</span> / {t.person}</p>}
              </div>
            </div>
            <div className="border-t border-white/10 pt-4 mt-2 text-sm text-white/70 space-y-3 font-medium">
              <div className="flex justify-between"><span>{t.subtotal}</span><span>{cartSubtotal.toFixed(2)} Br</span></div>
              <div className="flex justify-between"><span>{t.vat}</span><span>{tax.toFixed(2)} Br</span></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 font-bold text-neutral-900"><Users size={18} className="text-orange-500"/> {t.splitBill}</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={orderDetails.isSplitting} onChange={(e) => setOrderDetails({...orderDetails, isSplitting: e.target.checked})} />
                <div className="w-11 h-6 bg-neutral-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            {orderDetails.isSplitting && (
              <div className="flex items-center gap-4 bg-orange-50 p-3 rounded-xl border border-orange-100 mt-4 animate-fadeIn">
                <span className="text-sm text-neutral-700 font-bold">{t.howManyPeople}</span>
                <div className="flex items-center bg-white rounded-lg border border-orange-200 ml-auto shadow-sm">
                  <button onClick={() => setOrderDetails({...orderDetails, splitCount: Math.max(2, orderDetails.splitCount - 1)})} className="p-2 text-orange-600 hover:bg-orange-50 rounded-l-lg"><Minus size={16} /></button>
                  <span className="font-black text-sm w-6 text-center">{orderDetails.splitCount}</span>
                  <button onClick={() => setOrderDetails({...orderDetails, splitCount: Math.min(10, orderDetails.splitCount + 1)})} className="p-2 text-orange-600 hover:bg-orange-50 rounded-r-lg"><Plus size={16} /></button>
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className="font-black text-lg text-neutral-900 mb-3 px-1">{t.selectPayment}</h2>
            <div className="grid grid-cols-1 gap-3">
              
              {/* Telebirr */}
              {paymentSettings.telebirr_enabled && (
                <label className={`relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${orderDetails.paymentMethod === 'telebirr' ? 'border-cyan-500 bg-cyan-50 shadow-md' : 'border-neutral-200 bg-white hover:border-cyan-200'}`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" name="payment" value="telebirr" className="sr-only" onChange={(e) => setOrderDetails({...orderDetails, paymentMethod: e.target.value})} />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${orderDetails.paymentMethod === 'telebirr' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'bg-cyan-100 text-cyan-600'}`}><Smartphone size={24} /></div>
                    <div className="flex-grow"><h3 className="font-black text-neutral-900 text-lg tracking-tight">telebirr</h3></div>
                    {orderDetails.paymentMethod === 'telebirr' && <CheckCircle2 className="text-cyan-500 animate-scaleIn" size={24} />}
                  </div>
                  {orderDetails.paymentMethod === 'telebirr' && (
                    <div className="mt-4 pt-3 border-t border-cyan-200 animate-fadeIn" onClick={(e) => e.preventDefault()}>
                      <p className="text-xs text-neutral-600 mb-1">{t.accountName}: <span className="font-bold text-neutral-900">{paymentSettings.telebirr_account_name || 'ZOM Restaurant'}</span></p>
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-cyan-200 shadow-sm">
                        <span className="font-black text-lg tracking-wider text-cyan-700">{paymentSettings.telebirr_number}</span>
                        <button onClick={(e) => { e.stopPropagation(); copyToClipboard(paymentSettings.telebirr_number); }} className="text-cyan-700 hover:bg-cyan-100 p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"><Copy size={16}/> {t.copy}</button>
                      </div>
                    </div>
                  )}
                </label>
              )}

              {/* CBE Birr */}
              {paymentSettings.cbe_birr_enabled && (
                <label className={`relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${orderDetails.paymentMethod === 'cbe' ? 'border-purple-600 bg-purple-50 shadow-md' : 'border-neutral-200 bg-white hover:border-purple-200'}`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" name="payment" value="cbe" className="sr-only" onChange={(e) => setOrderDetails({...orderDetails, paymentMethod: e.target.value})} />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${orderDetails.paymentMethod === 'cbe' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-purple-100 text-purple-600'}`}><Landmark size={24} /></div>
                    <div className="flex-grow"><h3 className="font-black text-neutral-900 text-lg tracking-tight">CBE Birr</h3></div>
                    {orderDetails.paymentMethod === 'cbe' && <CheckCircle2 className="text-purple-600 animate-scaleIn" size={24} />}
                  </div>
                  {orderDetails.paymentMethod === 'cbe' && (
                    <div className="mt-4 pt-3 border-t border-purple-200 animate-fadeIn" onClick={(e) => e.preventDefault()}>
                      <p className="text-xs text-neutral-600 mb-1">{t.accountName}: <span className="font-bold text-neutral-900">{paymentSettings.cbe_account_name || 'ZOM Restaurant'}</span></p>
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-purple-200 shadow-sm">
                        <span className="font-black text-lg tracking-wider text-purple-700">{paymentSettings.cbe_account_number}</span>
                        <button onClick={(e) => { e.stopPropagation(); copyToClipboard(paymentSettings.cbe_account_number); }} className="text-purple-700 hover:bg-purple-100 p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"><Copy size={16}/> {t.copy}</button>
                      </div>
                    </div>
                  )}
                </label>
              )}

              {/* Chapa */}
              {paymentSettings.chapa_enabled && (
                <label className={`relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${orderDetails.paymentMethod === 'chapa' ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-neutral-200 bg-white hover:border-emerald-200'}`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" name="payment" value="chapa" className="sr-only" onChange={(e) => setOrderDetails({...orderDetails, paymentMethod: e.target.value})} />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${orderDetails.paymentMethod === 'chapa' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-emerald-100 text-emerald-600'}`}><CreditCard size={24} /></div>
                    <div className="flex-grow"><h3 className="font-black text-neutral-900 text-lg tracking-tight">Chapa Pay</h3></div>
                    {orderDetails.paymentMethod === 'chapa' && <CheckCircle2 className="text-emerald-500 animate-scaleIn" size={24} />}
                  </div>
                  {orderDetails.paymentMethod === 'chapa' && (
                    <div className="mt-4 pt-3 border-t border-emerald-200 animate-fadeIn" onClick={(e) => e.preventDefault()}>
                      <p className="text-xs text-neutral-600 mb-1">{t.accountName}: <span className="font-bold text-neutral-900">{paymentSettings.chapa_account_name || 'ZOM Restaurant'}</span></p>
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200 shadow-sm">
                        <span className="font-black text-xs tracking-wider text-emerald-700 truncate max-w-[220px]">{paymentSettings.chapa_merchant_key}</span>
                        <button onClick={(e) => { e.stopPropagation(); copyToClipboard(paymentSettings.chapa_merchant_key); }} className="text-emerald-700 hover:bg-emerald-100 p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"><Copy size={16}/> {t.copy}</button>
                      </div>
                    </div>
                  )}
                </label>
              )}

              {/* Custom Payment Methods */}
              {paymentSettings.custom_payment_methods && paymentSettings.custom_payment_methods.filter(m => m.enabled !== false).map(method => (
                <label key={method.id} className={`relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${orderDetails.paymentMethod === method.id ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-neutral-200 bg-white hover:border-blue-200'}`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" name="payment" value={method.id} className="sr-only" onChange={(e) => setOrderDetails({...orderDetails, paymentMethod: e.target.value})} />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${orderDetails.paymentMethod === method.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-blue-100 text-blue-600'}`}><Wallet size={24} /></div>
                    <div className="flex-grow"><h3 className="font-black text-neutral-900 text-lg tracking-tight">{method.name}</h3></div>
                    {orderDetails.paymentMethod === method.id && <CheckCircle2 className="text-blue-600 animate-scaleIn" size={24} />}
                  </div>
                  {orderDetails.paymentMethod === method.id && (
                    <div className="mt-4 pt-3 border-t border-blue-200 animate-fadeIn" onClick={(e) => e.preventDefault()}>
                      <p className="text-xs text-neutral-600 mb-1">{t.accountName}: <span className="font-bold text-neutral-900">{method.account_name}</span></p>
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-blue-200 shadow-sm">
                        <span className="font-black text-lg tracking-wider text-blue-700">{method.account_number}</span>
                        <button onClick={(e) => { e.stopPropagation(); copyToClipboard(method.account_number); }} className="text-blue-700 hover:bg-blue-100 p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"><Copy size={16}/> {t.copy}</button>
                      </div>
                    </div>
                  )}
                </label>
              ))}

              {/* Cash Payment */}
              {paymentSettings.cash_enabled && (
                <label className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${orderDetails.paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-neutral-200 bg-white hover:border-orange-200'}`}>
                  <input type="radio" name="payment" value="cash" className="sr-only" onChange={(e) => setOrderDetails({...orderDetails, paymentMethod: e.target.value})} />
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${orderDetails.paymentMethod === 'cash' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-orange-100 text-orange-600'}`}><Banknote size={24} /></div>
                  <div className="flex-grow"><h3 className="font-black text-neutral-900 text-lg tracking-tight">{t.cash}</h3></div>
                  {orderDetails.paymentMethod === 'cash' && <CheckCircle2 className="text-orange-500 animate-scaleIn" size={24} />}
                </label>
              )}

            </div>
          </div>

          {/* Digital Payment Verification */}
          {orderDetails.paymentMethod && orderDetails.paymentMethod !== 'cash' && (
            <div className="animate-fadeIn">
              <h2 className="font-black text-lg text-neutral-900 mb-3 px-1">{t.paymentVerification}</h2>
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-5">
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">{t.transactionId}</label>
                  <input type="text" placeholder={t.transactionIdPlaceholder} value={orderDetails.paymentId} onChange={(e) => setOrderDetails({...orderDetails, paymentId: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium" />
                </div>
                <div className="relative flex items-center justify-center py-2">
                  <div className="border-t border-neutral-200 w-full"></div>
                  <div className="absolute bg-white px-3 text-xs font-bold text-neutral-400">{t.or}</div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">{t.uploadReceipt}</label>
                  <div className="relative">
                    <input type="file" accept="image/*" onChange={(e) => { if(e.target.files && e.target.files[0]) setOrderDetails({...orderDetails, receiptFile: e.target.files[0]}); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className={`w-full border-2 border-dashed rounded-xl px-4 py-6 flex flex-col items-center justify-center transition-all ${orderDetails.receiptFile ? 'border-green-500 bg-green-50' : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100'}`}>
                      {orderDetails.receiptFile ? (
                        <>
                          <CheckCircle2 size={32} className="text-green-600 mb-2" />
                          <span className="text-green-700 font-bold">{t.receiptUploaded}</span>
                          <span className="text-green-600/70 text-xs mt-1 max-w-[200px] truncate">{orderDetails.receiptFile.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload size={32} className="text-neutral-400 mb-2" />
                          <span className="text-neutral-600 font-bold">{t.tapToUpload}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)] z-40">
          <div className="max-w-2xl mx-auto">
            <button 
              disabled={!orderDetails.paymentMethod || !isPaymentVerified || isVerifying}
              onClick={handlePaymentSubmit}
              className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2 text-white text-lg
                ${!orderDetails.paymentMethod || !isPaymentVerified ? 'bg-neutral-300' :
                  isVerifying ? 'bg-neutral-800' :
                  orderDetails.paymentMethod === 'cash' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30' :
                  orderDetails.paymentMethod === 'telebirr' ? 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/30' : 
                  'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30'
                }
              `}
            >
              {isVerifying ? (
                <><Loader2 className="animate-spin" size={20} /> {t.verifyingTitle}</>
              ) : !orderDetails.paymentMethod ? t.selectMethodFirst : 
               !isPaymentVerified ? t.fillVerification :
               orderDetails.paymentMethod === 'cash' ? t.callWaiterForCash :
               `${t.confirmPayment} (${splitAmount.toFixed(2)} Br)`}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // CASH PENDING VIEW
  const renderCashPending = () => (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6 text-neutral-900 animate-fadeIn">
      <div className="max-w-sm w-full mx-auto flex flex-col items-center text-center">
        <div className="bg-orange-100 p-5 rounded-full mb-6 animate-[pulse_2s_infinite]">
          <Banknote size={64} className="text-orange-600" />
        </div>
        <h1 className="text-3xl font-black mb-2 text-orange-700">{t.cashPendingTitle}</h1>
        <p className="text-neutral-600 font-medium mb-8 leading-relaxed">{t.cashPendingDesc}</p>
        
        <div className="bg-white p-6 rounded-3xl w-full shadow-xl border border-neutral-100 mb-8 text-left">
          <h3 className="font-bold text-neutral-400 text-xs uppercase tracking-wider mb-4 border-b border-neutral-100 pb-2">{t.orderSummary}</h3>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between font-medium text-sm"><span className="text-neutral-500">Table</span><span className="font-bold">{orderDetails.tableNumber}</span></div>
            <div className="flex justify-between font-medium text-sm"><span className="text-neutral-500">Method</span><span className="font-bold uppercase tracking-wide">{t.cash}</span></div>
            {orderDetails.isSplitting && <div className="flex justify-between font-medium text-sm"><span className="text-neutral-500">{t.splitWays}</span><span className="font-bold text-orange-600">{orderDetails.splitCount} {t.ways}</span></div>}
          </div>
          <div className="flex justify-between font-black text-xl pt-4 border-t border-dashed border-neutral-300">
            <span>{t.totalPaid}</span><span className="text-orange-600">{orderDetails.isSplitting ? (cartTotal / orderDetails.splitCount).toFixed(2) : cartTotal.toFixed(2)} Br</span>
          </div>
        </div>
        
        <button onClick={() => { setCart([]); setHasOrdered(false); setOrderDetails({ tableNumber: '', isSplitting: false, splitCount: 2, instructions: '', paymentMethod: '', paymentId: '', receiptFile: null }); setCurrentView('menu'); }} className="w-full bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95">
          {t.startNewSession}
        </button>
      </div>
    </div>
  );

  // PAID VIEW (Digital)
  const renderPaid = () => (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6 text-neutral-900 animate-fadeIn">
      <div className="max-w-sm w-full mx-auto flex flex-col items-center text-center">
        <div className="bg-green-100 p-5 rounded-full mb-6 animate-[bounce_2s_infinite]"><CheckCircle2 size={64} className="text-green-600" /></div>
        <h1 className="text-3xl font-black mb-2 text-green-700">{t.paymentSuccess}</h1>
        <p className="text-neutral-500 font-medium mb-8">{t.thanksMessage}</p>
        
        <div className="bg-white p-6 rounded-3xl w-full shadow-xl border border-neutral-100 mb-8 text-left">
          <h3 className="font-bold text-neutral-400 text-xs uppercase tracking-wider mb-4 border-b border-neutral-100 pb-2">{t.receipt}</h3>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between font-medium text-sm"><span className="text-neutral-500">Order</span><span className="font-bold">{t.orderNumber}</span></div>
            <div className="flex justify-between font-medium text-sm"><span className="text-neutral-500">Method</span><span className="font-bold uppercase tracking-wide">{orderDetails.paymentMethod}</span></div>
            {orderDetails.paymentId && <div className="flex justify-between font-medium text-sm"><span className="text-neutral-500">Ref ID</span><span className="font-bold">{orderDetails.paymentId}</span></div>}
            {orderDetails.isSplitting && <div className="flex justify-between font-medium text-sm"><span className="text-neutral-500">{t.splitWays}</span><span className="font-bold text-orange-600">{orderDetails.splitCount} {t.ways}</span></div>}
          </div>
          <div className="flex justify-between font-black text-xl pt-4 border-t border-dashed border-neutral-300">
            <span>{t.totalPaid}</span><span className="text-green-600">{orderDetails.isSplitting ? (cartTotal / orderDetails.splitCount).toFixed(2) : cartTotal.toFixed(2)} Br</span>
          </div>
        </div>
        
        <button onClick={() => { setCart([]); setHasOrdered(false); setOrderDetails({ tableNumber: '', isSplitting: false, splitCount: 2, instructions: '', paymentMethod: '', paymentId: '', receiptFile: null }); setCurrentView('menu'); }} className="w-full bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95">
          {t.startNewSession}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-100 font-sans selection:bg-orange-200 text-neutral-900 relative pb-24">
      
      {/* Toast System */}
      {toastMessage && (
        <div className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 animate-slideDown">
          <div className="bg-neutral-900 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-sm border border-neutral-800">
            <CheckCircle2 size={18} className="text-green-400" />
            {toastMessage}
          </div>
        </div>
      )}

      {/* Auto Verify Simulation Modals */}
      {isVerifying && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-md"></div>
          <div className="relative bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center max-w-sm w-full animate-scaleIn">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-neutral-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
              <ScanText className="absolute inset-0 m-auto text-orange-500 animate-pulse" size={32} />
            </div>
            <h2 className="text-2xl font-black text-neutral-900 mb-2">{t.verifyingTitle}</h2>
            <p className="text-neutral-500 font-medium leading-relaxed">{t.verifyingSms}</p>
          </div>
        </div>
      )}

      {verificationStatus === 'rejected' && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-md" onClick={() => setVerificationStatus('idle')}></div>
          <div className="relative bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center max-w-sm w-full animate-scaleIn border-b-8 border-red-500">
            <div className="bg-red-100 p-4 rounded-full mb-5 text-red-500">
              <AlertCircle size={48} />
            </div>
            <h2 className="text-2xl font-black text-neutral-900 mb-3">{t.verificationFailed}</h2>
            <p className="text-neutral-600 font-medium leading-relaxed mb-8">{t.verificationErrorDesc}</p>
            <button 
              onClick={() => setVerificationStatus('idle')}
              className="w-full bg-neutral-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all active:scale-95"
            >
              {t.tryAgain}
            </button>
          </div>
        </div>
      )}

      {/* Call Waiter Modal */}
      {isWaiterModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsWaiterModalOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-scaleIn z-10 flex flex-col">
            <h2 className="text-xl font-black text-neutral-900 mb-5">{t.callWaiterTitle}</h2>
            <div className="flex flex-col gap-2 mb-4">
              {WAITER_REASON_KEYS.map(key => (
                <button
                  key={key} onClick={() => setWaiterReason(key)}
                  className={`p-3.5 rounded-xl border-2 font-bold text-sm text-left transition-all ${waiterReason === key ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-neutral-200 bg-white text-neutral-700 hover:border-orange-200'}`}
                >
                  {t.waiterReasons[key]}
                </button>
              ))}
            </div>
            {waiterReason === 'other' && (
              <textarea className="w-full bg-neutral-50 border-2 border-neutral-200 rounded-xl px-4 py-3 h-24 resize-none focus:outline-none focus:border-orange-500 transition-all text-sm font-medium mb-2" placeholder={t.customReasonPlaceholder} value={customReason} onChange={e => setCustomReason(e.target.value)} />
            )}
            <div className="flex gap-3 mt-4 pt-4 border-t border-neutral-100">
              <button onClick={() => setIsWaiterModalOpen(false)} className="flex-1 p-3.5 rounded-xl font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors">{t.cancel}</button>
              <button disabled={!waiterReason || (waiterReason === 'other' && !customReason.trim())} onClick={submitWaiterRequest} className="flex-1 p-3.5 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-300 disabled:text-neutral-500 transition-colors shadow-sm">{t.sendRequest}</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Views */}
      {currentView === 'menu' && renderMenu()}
      {currentView === 'cart' && renderCart()}
      {currentView === 'activeOrder' && renderActiveOrder()}
      {currentView === 'checkout' && renderCheckout()}
      {currentView === 'paid' && renderPaid()}
      {currentView === 'cashPending' && renderCashPending()}

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        .animate-slideDown { animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-scaleIn { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-spin-slow { animation: spin 3s linear infinite; }
      `}} />
    </div>
  );
}
