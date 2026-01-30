
import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  ShoppingBag,
  Briefcase,
  Globe,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  XCircle,
  Store as StoreIcon,
  Wrench,
  Info,
  PlusCircle,
  ArrowRight,
  Box,
  LayoutDashboard,
  ClipboardList,
  ShoppingCart,
  UserCircle,
  Save,
  Phone,
  ArrowLeft,
  Calendar,
  Edit2,
  Package,
  X,
  Users,
  HelpCircle,
  CheckCircle,
  PartyPopper,
  Mail,
  FileText,
  ShieldCheck,
  Hammer,
  HardHat,
  MessageCircle,
  DollarSign,
  AlertCircle,
  Camera,
  Star,
  Truck,
  Building2,
  FlaskConical,
  Clock,
  PlayCircle,
  Coins,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Search,
  Filter
} from 'lucide-react';
import { User, UserRole, Store as StoreType, Product, Service, CulturalItem, Order, StoreRating } from './types';
import { supabase } from './supabaseClient';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

// Mock Data initialization (Empty for live Supabase)
const INITIAL_STORES: StoreType[] = [];
const INITIAL_SERVICES: Service[] = [];
const INITIAL_CULTURAL: CulturalItem[] = [];
const INITIAL_PRODUCTS: Product[] = [];

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  storeId: string;
}

// Helper function to normalize WhatsApp numbers with +55 prefix
function normalizeWhatsApp(input: string): string {
  if (!input) return '';
  // Remove all non-numeric characters
  const digitsOnly = input.replace(/\D/g, '');
  // If already starts with 55, just add + and return
  if (digitsOnly.startsWith('55')) {
    return '+' + digitsOnly;
  }
  // Otherwise, add +55 prefix
  return '+55' + digitsOnly;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'VITRINE' | 'SERVICOS' | 'CULTURAL' | 'DASHBOARD' | 'CHECKOUT'>('VITRINE');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'SELECTION' | 'LOGIN' | 'REGISTER'>('SELECTION');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [selectedCulturalItem, setSelectedCulturalItem] = useState<CulturalItem | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showEmail, setShowEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Global State
  const [stores, setStores] = useState<StoreType[]>(INITIAL_STORES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [culturalItems, setCulturalItems] = useState<CulturalItem[]>(INITIAL_CULTURAL);
  const [orders, setOrders] = useState<Order[]>([]);
  const [storeRatings, setStoreRatings] = useState<StoreRating[]>([]);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOrderForRating, setSelectedOrderForRating] = useState<Order | null>(null);

  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutDocument, setCheckoutDocument] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'ENTREGA' | 'RETIRADA'>('ENTREGA');
  const [connectionError, setConnectionError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const user = currentUser;

  // Supabase Fetching
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Parallel fetch for core data
        const [
          { data: storesData, error: storesError },
          { data: productsData, error: productsError },
          { data: servicesData, error: servicesError },
          { data: culturalData, error: culturalError },
          { data: ordersData, error: ordersError }
        ] = await Promise.all([
          supabase.from('stores').select('*'),
          supabase.from('products').select('*'),
          supabase.from('services').select('*'),
          supabase.from('cultural_items').select('*'),
          supabase.from('orders').select('*').order('created_at', { ascending: false })
        ]);

        if (storesError) console.error('Erro lojas:', storesError);
        if (productsError) console.error('Erro produtos:', productsError);
        if (servicesError) console.error('Erro serviços:', servicesError);
        if (culturalError) console.error('Erro cultural:', culturalError);
        if (ordersError) console.warn('Erro pedidos (esperado se não logado):', ordersError);

        // Somente erro na busca de lojas é considerado erro de conexão crítico
        if (storesError) {
          setConnectionError(true);
        } else {
          setConnectionError(false);
        }

        if (storesData) {
          console.log(`Lojas carregadas: ${storesData.length}`);
          setStores(storesData.map((s: any) => ({
            ...s,
            ownerId: s.owner_id,
            deliveryFee: s.delivery_fee
          })));
        }

        if (productsData) {
          console.log(`Produtos carregados: ${productsData.length}`);
          setProducts(productsData.map((p: any) => ({
            ...p,
            storeId: p.store_id
          })));
        }

        if (servicesData) {
          console.log(`Serviços carregados: ${servicesData.length}`);
          setServices(servicesData.map((s: any) => ({
            ...s,
            providerId: s.provider_id,
            priceEstimate: s.price_estimate
          })));
        }

        if (culturalData) {
          setCulturalItems(culturalData);
        }

        if (ordersData) {
          setOrders(ordersData.map((o: any) => ({
            ...o,
            storeId: o.store_id,
            clientId: o.client_id,
            customerName: o.customer_name,
            customerPhone: o.customer_phone,
            customerAddress: o.customer_address,
            deliveryMethod: o.delivery_method,
            deliveryFee: o.delivery_fee,
            dispatchedAt: o.dispatched_at,
            createdAt: o.created_at
          })));
        }

        // Fetch Store Ratings (Opcional, não deve travar)
        try {
          const { data: ratingsData } = await supabase.from('store_ratings').select('*');
          if (ratingsData) {
            setStoreRatings(ratingsData.map((r: any) => ({
              ...r,
              storeId: r.store_id,
              orderId: r.order_id,
              clientId: r.client_id,
              createdAt: r.created_at
            })));
          }
        } catch (e) {
          console.error('Erro avaliações:', e);
        }

      } catch (err) {
        console.error('Erro global na busca:', err);
        setConnectionError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Online/Offline Listeners
    const handleOnline = () => { setConnectionError(false); fetchData(); };
    const handleOffline = () => setConnectionError(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      setCheckoutName(currentUser.name || '');
      setCheckoutDocument(currentUser.document || '');
      setCheckoutEmail(currentUser.email || '');
      setCheckoutPhone(currentUser.phone || '');
      setCheckoutAddress(currentUser.address || '');

      if (rememberMe) {
        localStorage.setItem('vitrine_user', JSON.stringify(currentUser));
      }
    }
  }, [currentUser, rememberMe]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

      if (session?.user) {
        const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) {
          // Sync storeId/serviceId if applicable
          const { data: storeMatch } = await supabase.from('stores').select('id').eq('email', session.user.email).maybeSingle();
          const { data: serviceMatch } = await supabase.from('services').select('id').eq('email', session.user.email).maybeSingle();

          const enrichedProfile = {
            ...profile,
            storeId: profile.role === 'LOJISTA' ? storeMatch?.id : undefined,
            serviceId: profile.role === 'PRESTADOR' ? serviceMatch?.id : undefined
          };

          setCurrentUser(enrichedProfile);
          if (rememberMe) {
            localStorage.setItem('vitrine_user', JSON.stringify(enrichedProfile));
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        localStorage.removeItem('vitrine_user');
      }
    });

    return () => subscription.unsubscribe();
  }, [rememberMe]);

  useEffect(() => {
    const savedUser = localStorage.getItem('vitrine_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setRememberMe(true);
      } catch (e) {
        localStorage.removeItem('vitrine_user');
      }
    }
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showSuccess = (msg: string) => setToast({ message: msg, type: 'success' });
  const showError = (msg: string) => setToast({ message: msg, type: 'error' });

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        storeId: product.storeId
      }];
    });
    showSuccess(`${product.name} no carrinho!`);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
    showSuccess('Removido do carrinho.');
  };

  const handleClearCart = () => {
    setCart([]);
    showSuccess('Carrinho esvaziado.');
  };

  const cartItemsTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartStoreId = cart.length > 0 ? cart[0].storeId : null;
  const currentCheckoutStore = stores.find(s => s.id === cartStoreId);
  const activeDeliveryFee = (deliveryMethod === 'ENTREGA' && currentCheckoutStore) ? (currentCheckoutStore.deliveryFee || 0) : 0;
  const cartGrandTotal = cartItemsTotal + activeDeliveryFee;

  const handleFinalizePurchase = () => {
    if (cart.length === 0) return;
    if (!currentUser) {
      showError('Login obrigatório para finalizar compra!');
      setAuthMode('SELECTION');
      setShowAuth(true);
      return;
    }
    if (!checkoutName || !checkoutDocument || !checkoutEmail || !checkoutPhone) {
      showError('Preencha os campos obrigatórios.');
      return;
    }
    if (deliveryMethod === 'ENTREGA' && !checkoutAddress) {
      showError('Preencha o endereço de entrega.');
      return;
    }

    const firstItem = cart[0];
    const store = stores.find(s => s.id === firstItem.storeId);

    const itemsForDB = cart.map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }));

    const newOrderDB = {
      store_id: firstItem.storeId,
      client_id: currentUser.id,
      customer_name: checkoutName,
      customer_phone: checkoutPhone,
      customer_address: deliveryMethod === 'ENTREGA' ? checkoutAddress : null,
      delivery_method: deliveryMethod,
      delivery_fee: activeDeliveryFee,
      total: cartItemsTotal,
      status: 'PENDENTE',
      items: itemsForDB
    };

    const finalize = async () => {
      const { data, error } = await supabase.from('orders').insert([newOrderDB]).select();

      if (error) {
        showError('Erro ao registrar pedido no banco: ' + error.message);
        return;
      }

      if (data && data[0]) {
        const savedOrder = {
          ...data[0],
          storeId: data[0].store_id,
          customerName: data[0].customer_name,
          customerPhone: data[0].customer_phone,
          customerAddress: data[0].customer_address,
          deliveryMethod: data[0].delivery_method,
          deliveryFee: data[0].delivery_fee,
          createdAt: data[0].created_at
        };
        setOrders(prev => [savedOrder, ...prev]);

        // Sync profile storeId if missing
        if (currentUser && !currentUser.storeId && savedOrder.storeId) {
          const updatedUser = { ...currentUser, storeId: savedOrder.storeId };
          setCurrentUser(updatedUser);
          localStorage.setItem('vitrine_user', JSON.stringify(updatedUser));
        }

        // REDUCE STOCK
        for (const item of cart) {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            const newStock = Math.max(0, product.stock - item.quantity);
            await supabase.from('products').update({ stock: newStock }).eq('id', item.productId);
            setProducts((prev: Product[]) => prev.map((p: Product) => p.id === item.productId ? { ...p, stock: newStock } : p));
          }
        }

        if (store) {
          const itemsList = cart.map(i => `• ${i.quantity}x ${i.name} (R$ ${i.price.toFixed(2)})`).join('\n');
          const methodLabel = deliveryMethod === 'ENTREGA' ? 'Entrega em domicílio' : 'Retirada na Loja';
          const addressInfo = deliveryMethod === 'ENTREGA' ? `*Endereço:* ${checkoutAddress}` : `*Retirada pelo cliente na Loja:* ${store.name}`;
          const feeText = deliveryMethod === 'ENTREGA' ? `\n*Taxa de Entrega:* R$ ${activeDeliveryFee.toFixed(2)}` : '';

          const message = `*Novo Pedido #${savedOrder.id.slice(0, 5)} - Vitrine Frutal*\n\n*Cliente:* ${checkoutName}\n*WhatsApp:* ${checkoutPhone}\n*Método:* ${methodLabel}${feeText}\n*Total Final:* R$ ${cartGrandTotal.toFixed(2)}\n\n*Itens:*\n${itemsList}\n\n${addressInfo}`;

          const waUrl = `https://wa.me/${store.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
          window.open(waUrl, '_blank');
        }

        setCart([]);
        setShowOrderSuccess(true);
        showSuccess('Pedido realizado com sucesso!');
      }
    };

    finalize();
  };

  const handleSaveRating = async (rating: number, comment: string) => {
    if (!selectedOrderForRating || !currentUser) return;

    const newRating = {
      store_id: selectedOrderForRating.storeId,
      order_id: selectedOrderForRating.id,
      client_id: currentUser.id,
      rating: rating,
      comment: comment
    };

    const { data, error } = await supabase.from('store_ratings').insert([newRating]).select();

    if (error) {
      showError('Erro ao salvar avaliação: ' + error.message);
      return;
    }

    if (data) {
      setStoreRatings(prev => [...prev, {
        ...data[0],
        storeId: data[0].store_id,
        orderId: data[0].order_id,
        clientId: data[0].client_id,
        createdAt: data[0].created_at
      }]);
      showSuccess('Agradecemos sua avaliação!');
      setShowRatingModal(false);
      setSelectedOrderForRating(null);
    }
  };

  const closeOrderSuccess = () => {
    setShowOrderSuccess(false);
    setActiveTab('VITRINE');
  };

  const handleTabChange = (tab: 'VITRINE' | 'SERVICOS' | 'CULTURAL' | 'DASHBOARD' | 'CHECKOUT') => {
    setActiveTab(tab);
    setSelectedStore(null);
    setSelectedCulturalItem(null);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string).trim().toLowerCase();
    const password = (formData.get('password') as string).trim();
    const name = formData.get('name') as string || 'Usuário';

    const isAuthorizedDev = email === 'devvitrinefrutal@gmail.com';

    if (authMode === 'LOGIN') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          showError('E-mail ou senha incorretos. Verifique seus dados.');
        } else {
          showError(`Erro no login: ${error.message}`);
        }
        return;
      }

      let { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();

      if (isAuthorizedDev) {
        if (!profile) {
          const newDev: User = {
            id: data.user.id,
            name: 'Desenvolvedor Master',
            email,
            role: 'DEV',
            phone: '',
            document: '',
            address: ''
          };
          const { error: devInsertError } = await supabase.from('profiles').insert([newDev]);
          if (devInsertError) console.error("Erro ao criar perfil DEV:", devInsertError);
          profile = newDev;
        } else if (profile.role !== 'DEV') {
          await supabase.from('profiles').update({ role: 'DEV' }).eq('id', data.user.id);
          profile.role = 'DEV';
        }
      }

      if (profile) {
        if (profile.role === 'DEV' && !isAuthorizedDev) {
          showError('Acesso Negado: Este e-mail não é autorizado como Desenvolvedor.');
          await supabase.auth.signOut();
          return;
        }

        // AUTO-LINK & AUTO-UPGRADE: Verificar se o email dele agora está em uma loja/serviço master sem dono
        const { data: storeMatch } = await supabase.from('stores').select('id, owner_id').eq('email', email).maybeSingle();
        const { data: serviceMatch } = await supabase.from('services').select('id, provider_id').eq('email', email).maybeSingle();

        if (storeMatch && !storeMatch.owner_id) {
          // Se encontrou loja e não tem dono, vincula e garante cargo LOJISTA
          await supabase.from('profiles').update({ role: 'LOJISTA' }).eq('id', profile.id);
          await supabase.from('stores').update({ owner_id: profile.id }).eq('id', storeMatch.id);
          profile.role = 'LOJISTA';
          profile.storeId = storeMatch.id;
          setStores(prev => prev.map(s => s.id === storeMatch.id ? { ...s, ownerId: profile.id } : s));
          showSuccess('Sua loja foi vinculada com sucesso!');
        } else if (serviceMatch && !serviceMatch.provider_id) {
          // Se encontrou serviço e não tem dono, vincula e garante cargo PRESTADOR
          await supabase.from('profiles').update({ role: 'PRESTADOR' }).eq('id', profile.id);
          await supabase.from('services').update({ provider_id: profile.id }).eq('id', serviceMatch.id);
          profile.role = 'PRESTADOR';
          profile.serviceId = serviceMatch.id;
          setServices(prev => prev.map(s => s.id === serviceMatch.id ? { ...s, providerId: profile.id } : s));
          showSuccess('Seu perfil profissional foi vinculado!');
        } else if (profile.role === 'LOJISTA' && storeMatch && storeMatch.owner_id === profile.id) {
          // Garantir que o storeId está no objeto local se já estiver vinculado no banco
          profile.storeId = storeMatch.id;
        } else if (profile.role === 'PRESTADOR' && serviceMatch && serviceMatch.provider_id === profile.id) {
          profile.serviceId = serviceMatch.id;
        }

        setCurrentUser(profile);
      } else {
        // Se o login funcionou mas não tem perfil, cria um perfil básico de CLIENTE
        const newUser: User = {
          id: data.user.id,
          name: name || 'Usuário',
          email: email,
          role: 'CLIENTE',
          phone: '',
          document: '',
          address: ''
        };
        const { error: insertError } = await supabase.from('profiles').insert([newUser]);
        if (insertError) {
          showError(`Erro ao criar perfil: ${insertError.message}`);
          await supabase.auth.signOut();
        } else {
          setCurrentUser(newUser);
          showSuccess('Login realizado (novo perfil criado)');
        }
      }
    } else if (authMode === 'REGISTER') {
      let finalRole: UserRole = selectedRole || 'CLIENTE';

      // Verificar se o e-mail já existe nas tabelas master para AUTO-DETECTAR o cargo
      const { data: storeMatch } = await supabase.from('stores').select('id, owner_id').eq('email', email).maybeSingle();
      const { data: serviceMatch } = await supabase.from('services').select('id, provider_id').eq('email', email).maybeSingle();

      if (storeMatch) {
        if (storeMatch.owner_id) {
          showError('Este e-mail já está vinculado a uma loja existente.');
          return;
        }
        finalRole = 'LOJISTA';
      } else if (serviceMatch) {
        if (serviceMatch.provider_id) {
          showError('Este e-mail já está vinculado a um perfil de serviço prestado.');
          return;
        }
        finalRole = 'PRESTADOR';
      } else if (selectedRole === 'LOJISTA' || selectedRole === 'PRESTADOR') {
        // Se tentou se cadastrar como lojista mas o email não está na lista
        showError(`Este e-mail não está pré-autorizado como ${selectedRole}. Entre em contato com o suporte.`);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, role: finalRole },
          emailRedirectTo: window.location.origin.includes('localhost')
            ? window.location.origin
            : window.location.origin // No Vercel, o origin já será o domínio correto
        }
      });

      if (error) {
        showError(`Erro no cadastro: ${error.message}`);
        return;
      }

      if (data.user) {
        const userId = data.user.id;
        const newUser: User = {
          id: userId,
          name,
          email,
          role: isAuthorizedDev ? 'DEV' : finalRole,
          phone: '',
          document: '',
          address: ''
        };

        if (finalRole === 'LOJISTA') {
          const { data: updatedStore } = await supabase
            .from('stores')
            .update({ owner_id: userId })
            .eq('email', email)
            .select()
            .single();

          if (updatedStore) {
            newUser.storeId = updatedStore.id;
            setStores(prev => prev.map(s => s.id === updatedStore.id ? { ...s, ownerId: userId } : s));
          }
        } else if (finalRole === 'PRESTADOR') {
          const { data: updatedService } = await supabase
            .from('services')
            .update({ provider_id: userId })
            .eq('email', email)
            .select()
            .single();

          if (updatedService) {
            newUser.serviceId = updatedService.id;
            setServices(prev => prev.map(s => s.id === updatedService.id ? { ...s, providerId: userId } : s));
          }
        }

        // Remover propriedades que não existem na tabela 'profiles' do banco antes de inserir
        const { storeId, serviceId, ...dbProfile } = newUser as any;
        await supabase.from('profiles').insert([dbProfile]);
        setCurrentUser(newUser);
      }
    }

    setShowAuth(false);
    showSuccess(authMode === 'REGISTER' ? 'Conta criada! Verifique seu e-mail.' : 'Login realizado!');
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vitrine_user');
    setRememberMe(false);
    setActiveTab('VITRINE');
    showSuccess('Você saiu.');
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 text-slate-900">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top duration-300">
          <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md border ${toast.type === 'success' ? 'bg-green-600/90 border-green-400' : 'bg-red-600/90 border-red-400'} text-white`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            <span className="font-bold text-sm tracking-tight">{toast.message}</span>
          </div>
        </div>
      )}
      <SpeedInsights />
      <Analytics />

      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-6 animate-in fade-in duration-500">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">Sincronizando com Frutal...</p>
        </div>
      ) : (
        <>
          {connectionError && (
            <div className="fixed top-0 left-0 right-0 z-[200] bg-red-600 text-white px-4 py-3 text-center font-bold text-xs uppercase tracking-widest shadow-xl flex justify-center items-center gap-3">
              <AlertCircle size={18} />
              <span>Sem conexão com o servidor. Verifique sua internet.</span>
              <button onClick={() => window.location.reload()} className="bg-white text-red-600 px-3 py-1 rounded-lg text-[10px] hover:bg-gray-100 transition-colors">Tentar Reconectar</button>
            </div>
          )}

          <header className="glass-effect sticky top-0 z-50 px-4 md:px-8 py-3 flex justify-between items-center border-b border-gray-100">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleTabChange('VITRINE')}>
                <Logo />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-800 hidden sm:inline uppercase">
                Vitrine<span className="text-orange-500">Frutal</span>
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              <HeaderNavButton active={activeTab === 'VITRINE'} onClick={() => handleTabChange('VITRINE')} icon={<ShoppingBag size={18} />} label="Vitrine" />
              <HeaderNavButton active={activeTab === 'SERVICOS'} onClick={() => handleTabChange('SERVICOS')} icon={<Briefcase size={18} />} label="Serviços" />
              <HeaderNavButton active={activeTab === 'CULTURAL'} onClick={() => handleTabChange('CULTURAL')} icon={<Globe size={18} />} label="Giro Cultural" />
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTabChange('CHECKOUT')}
                className={`relative p-2.5 mr-1 sm:mr-2 bg-white border rounded-xl transition-all ${activeTab === 'CHECKOUT' ? 'border-orange-500 text-orange-500 shadow-lg shadow-orange-50' : 'border-gray-100 text-gray-600 hover:bg-gray-50'}`}
              >
                <ShoppingCart size={20} />
                {cart.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">{cart.length}</span>}
              </button>

              {currentUser ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <button onClick={() => handleTabChange('DASHBOARD')} className={`flex items-center gap-2 p-2 px-3 rounded-xl transition-colors ${activeTab === 'DASHBOARD' ? 'bg-green-100 text-green-700 font-bold' : 'text-gray-500 hover:bg-gray-100'}`}>
                    <UserIcon size={20} />
                    <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest">Painel</span>
                  </button>
                  <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><LogOut size={20} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => { setAuthMode('REGISTER'); setSelectedRole('CLIENTE'); setShowAuth(true); }}
                    className="px-3 sm:px-5 py-2.5 text-green-600 font-black hover:bg-green-50 rounded-xl transition-all text-[9px] sm:text-[10px] uppercase tracking-widest"
                  >
                    Cadastre-se
                  </button>
                  <button
                    onClick={() => { setAuthMode('SELECTION'); setShowAuth(true); }}
                    className="px-4 sm:px-5 py-2.5 bg-orange-500 text-white font-black rounded-xl hover:bg-orange-600 shadow-md text-[9px] sm:text-[10px] uppercase tracking-widest transition-all"
                  >
                    Entrar
                  </button>
                </div>
              )}
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
            {!selectedStore && activeTab === 'VITRINE' && (
              <VitrineView
                stores={stores}
                products={products}
                allRatings={storeRatings}
                onSelectStore={setSelectedStore}
                onAddToCart={handleAddToCart}
              />
            )}
            {selectedStore && (
              <StoreDetailView
                store={selectedStore}
                products={products.filter(p => p.storeId === selectedStore.id)}
                allRatings={storeRatings}
                onBack={() => setSelectedStore(null)}
                onAddToCart={handleAddToCart}
              />
            )}
            {!selectedService && activeTab === 'SERVICOS' && <ServicosView services={services} onSelectService={setSelectedService} />}
            {selectedService && <ServiceDetailView service={selectedService} onBack={() => setSelectedService(null)} onRequestQuote={(s) => {
              const msg = `Olá ${s.name}, vi seu perfil no Vitrine Frutal e gostaria de solicitar um orçamento para o serviço de ${s.type}.`;
              window.open(`https://wa.me/${s.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
            }} />}
            {!selectedCulturalItem && activeTab === 'CULTURAL' && <GiroCulturalView items={culturalItems} onSelectItem={setSelectedCulturalItem} />}
            {selectedCulturalItem && <CulturalDetailView item={selectedCulturalItem} onBack={() => setSelectedCulturalItem(null)} />}

            {activeTab === 'DASHBOARD' && currentUser && (
              <DashboardView
                user={currentUser}
                setCurrentUser={setCurrentUser}
                stores={stores} setStores={setStores}
                products={products} setProducts={setProducts}
                orders={orders} setOrders={setOrders}
                services={services} setServices={setServices}
                culturalItems={culturalItems} setCulturalItems={setCulturalItems}
                showSuccess={showSuccess}
                showError={showError}
                logout={logout}
                storeRatings={storeRatings}
                setSelectedOrderForRating={setSelectedOrderForRating}
                setShowRatingModal={setShowRatingModal}
              />
            )}

            {activeTab === 'DASHBOARD' && !currentUser && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-in fade-in">
                <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-300">
                  <UserIcon size={48} />
                </div>
                <div className="max-w-xs px-4">
                  <h3 className="text-2xl font-black text-black uppercase tracking-tighter">Acesso Restrito</h3>
                  <p className="text-gray-500 mt-2 font-medium">Faça login ou cadastre-se para gerenciar seus pedidos, sua loja ou prestação de serviços.</p>
                </div>
                <div className="flex flex-col w-full max-w-xs gap-3 px-6">
                  <button
                    onClick={() => { setAuthMode('SELECTION'); setShowAuth(true); }}
                    className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl shadow-xl hover:bg-orange-600 transition-all uppercase tracking-widest text-[10px]"
                  >
                    Entrar agora
                  </button>
                  <button
                    onClick={() => { setAuthMode('REGISTER'); setSelectedRole('CLIENTE'); setShowAuth(true); }}
                    className="w-full py-4 bg-white text-green-600 border-2 border-green-100 hover:border-green-200 font-black rounded-2xl transition-all uppercase tracking-widest text-[10px]"
                  >
                    Criar Nova Conta
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'CHECKOUT' && (
              <CheckoutView
                currentUser={currentUser} cart={cart} cartTotal={cartItemsTotal} stores={stores}
                handleUpdateCartQuantity={handleUpdateCartQuantity}
                handleRemoveFromCart={handleRemoveFromCart}
                handleClearCart={handleClearCart}
                checkoutName={checkoutName} setCheckoutName={setCheckoutName}
                checkoutDocument={checkoutDocument} setCheckoutDocument={setCheckoutDocument}
                checkoutEmail={checkoutEmail} setCheckoutEmail={setCheckoutEmail}
                checkoutPhone={checkoutPhone} setCheckoutPhone={setCheckoutPhone}
                checkoutAddress={checkoutAddress} setCheckoutAddress={setCheckoutAddress}
                deliveryMethod={deliveryMethod} setDeliveryMethod={setDeliveryMethod}
                handleFinalizePurchase={handleFinalizePurchase}
                onBack={() => handleTabChange('VITRINE')}
                activeDeliveryFee={activeDeliveryFee}
                grandTotal={cartGrandTotal}
              />
            )}
          </main>

          <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-effect border-t border-gray-100 flex justify-around p-3 z-40 shadow-2xl">
            <MobileNavBtn active={activeTab === 'VITRINE'} icon={<ShoppingBag size={22} />} onClick={() => handleTabChange('VITRINE')} />
            <MobileNavBtn active={activeTab === 'SERVICOS'} icon={<Briefcase size={22} />} onClick={() => handleTabChange('SERVICOS')} />
            <MobileNavBtn active={activeTab === 'CULTURAL'} icon={<Globe size={22} />} onClick={() => handleTabChange('CULTURAL')} />
            <MobileNavBtn active={activeTab === 'DASHBOARD'} icon={<UserIcon size={22} />} onClick={() => handleTabChange('DASHBOARD')} />
          </nav>

          {showAuth && (
            <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in duration-300">
                <button onClick={() => setShowAuth(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-transform hover:rotate-90">✕</button>
                {authMode === 'SELECTION' && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter uppercase tracking-widest text-sm">Entrar no Sistema</h2>
                      <p className="text-gray-500 font-medium">Selecione seu perfil de acesso</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <RoleCard icon={<UserCircle className="text-green-500" size={24} />} title="Cliente" onClick={() => { setSelectedRole('CLIENTE'); setAuthMode('LOGIN'); }} />
                      <RoleCard icon={<StoreIcon className="text-orange-500" size={24} />} title="Lojista" onClick={() => { setSelectedRole('LOJISTA'); setAuthMode('LOGIN'); }} />
                      <RoleCard icon={<ShieldCheck className="text-purple-500" size={24} />} title="DEV" onClick={() => { setSelectedRole('DEV'); setAuthMode('LOGIN'); }} />
                    </div>
                    <div className="pt-4 text-center border-t border-gray-100">
                      <button
                        onClick={() => { setAuthMode('REGISTER'); setSelectedRole('CLIENTE'); }}
                        className="text-green-600 font-black uppercase tracking-widest text-[10px] hover:underline"
                      >
                        Novo por aqui? Criar conta de Cliente
                      </button>
                    </div>
                  </div>
                )}
                {authMode === 'LOGIN' && (
                  <div className="space-y-6">
                    <button onClick={() => setAuthMode('SELECTION')} className="text-orange-600 font-bold text-sm">← Voltar</button>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><UserIcon size={20} /></div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase tracking-widest text-sm">Acesso {selectedRole}</h2>
                    </div>
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                      <div className="relative group">
                        <input required name="email" type={showEmail ? "text" : "email"} placeholder="E-mail" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none font-semibold text-black focus:ring-2 focus:ring-orange-200 transition-all pr-12" />
                        <button type="button" onClick={() => setShowEmail(!showEmail)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors">
                          {showEmail ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      <div className="relative group">
                        <input required name="password" type={showPassword ? "text" : "password"} placeholder="Senha" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none font-semibold text-black focus:ring-2 focus:ring-orange-200 transition-all pr-12" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      <label className="flex items-center gap-3 px-2 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="peer hidden"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                          />
                          <div className="w-5 h-5 border-2 border-gray-200 rounded-lg transition-all peer-checked:bg-orange-500 peer-checked:border-orange-500 group-hover:border-orange-300"></div>
                          <div className="absolute inset-0 flex items-center justify-center text-white scale-0 transition-transform peer-checked:scale-100">
                            <CheckCircle2 size={14} />
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-700 transition-colors">Manter conectado neste dispositivo</span>
                      </label>

                      <button type="submit" className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 shadow-xl transition-all uppercase tracking-widest text-xs">Entrar agora</button>
                    </form>
                    <div className="pt-4 text-center border-t border-gray-100">
                      <button
                        onClick={() => setAuthMode('REGISTER')}
                        className="text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-orange-600"
                      >
                        Não tem uma conta? <span className="text-orange-500 underline">Cadastre-se aqui</span>
                      </button>
                    </div>
                  </div>
                )}
                {authMode === 'REGISTER' && (
                  <div className="space-y-6">
                    <button onClick={() => setAuthMode('SELECTION')} className="text-green-600 font-bold text-sm hover:underline">← Voltar</button>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg text-green-600"><Plus size={20} /></div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase tracking-widest text-sm">Novo Cadastro</h2>
                    </div>
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                      <input required name="name" type="text" placeholder="Seu nome completo" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none font-semibold text-black focus:ring-2 focus:ring-green-200 transition-all" />

                      <div className="relative group">
                        <input required name="email" type={showEmail ? "text" : "email"} placeholder="Seu melhor e-mail" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none font-semibold text-black focus:ring-2 focus:ring-green-200 transition-all pr-12" />
                        <button type="button" onClick={() => setShowEmail(!showEmail)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors">
                          {showEmail ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      <div className="relative group">
                        <input required name="password" type={showPassword ? "text" : "password"} placeholder="Crie uma senha segura" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none font-semibold text-black focus:ring-2 focus:ring-green-200 transition-all pr-12" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium px-2 uppercase tracking-widest">Cadastro exclusivo para clientes e usuários da plataforma.</p>
                      <button type="submit" className="w-full py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-xl transition-all mt-4 uppercase tracking-widest text-xs">Concluir Registro</button>
                    </form>
                    <div className="pt-4 text-center border-t border-gray-100">
                      <button
                        onClick={() => setAuthMode('LOGIN')}
                        className="text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-green-600"
                      >
                        Já possui conta? <span className="text-green-500 underline">Faça login aqui</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {showOrderSuccess && (
            <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white w-full max-md rounded-[3rem] p-10 text-center shadow-2xl animate-in zoom-in duration-300 relative">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                  <PartyPopper size={48} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Compra Realizada!</h2>
                <p className="text-gray-500 font-medium mb-8">
                  Obrigado por apoiar o comércio local de Frutal. O pedido foi enviado via WhatsApp para a loja parceira.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={closeOrderSuccess}
                    className="w-full py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                  >
                    <CheckCircle size={20} /> Concluído
                  </button>
                  <button
                    onClick={() => { setShowOrderSuccess(false); setActiveTab('VITRINE'); }}
                    className="w-full py-4 bg-gray-50 text-gray-600 font-black rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-widest text-xs"
                  >
                    Ver Outras Lojas
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Logo() {
  return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-lg relative shrink-0 transition-all hover:rotate-6 hover:scale-110">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4L12 20L20 4" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.5 9.5H19" stroke="orange" strokeWidth="3" strokeLinecap="round" />
        <path d="M14 13.5H17.5" stroke="orange" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

interface MobileNavBtnProps {
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}

function MobileNavBtn({ active, icon, onClick }: MobileNavBtnProps) {
  return (
    <button onClick={onClick} className={`p-4 rounded-2xl transition-all active:scale-90 ${active ? 'bg-orange-500 text-white shadow-xl -translate-y-2' : 'text-gray-400 hover:text-gray-600'}`}>{icon}</button>
  );
}

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

function RoleCard({ icon, title, onClick }: RoleCardProps) {
  return (
    <button onClick={onClick} className="flex flex-col items-center text-center p-4 bg-gray-50 hover:bg-orange-50 border border-transparent hover:border-orange-100 rounded-2xl transition-all group active:scale-95">
      <div className="mb-2 p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="font-black text-gray-900 text-[10px] uppercase tracking-tighter">{title}</h3>
    </button>
  );
}

interface HeaderNavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function HeaderNavButton({ active, onClick, icon, label }: HeaderNavButtonProps) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${active ? 'text-green-700 bg-green-50 font-black' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
      {icon}<span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}



interface VitrineViewProps {
  stores: StoreType[];
  products: Product[]; // Now receives products for search
  allRatings: StoreRating[];
  onSelectStore: (store: StoreType) => void;
  onAddToCart: (product: Product) => void;
}

function VitrineView({ stores, products, allRatings, onSelectStore, onAddToCart }: VitrineViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<{ min: string, max: string }>({ min: '', max: '' });

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMinPrice = priceRange.min ? p.price >= parseFloat(priceRange.min) : true;
    const matchesMaxPrice = priceRange.max ? p.price <= parseFloat(priceRange.max) : true;
    return matchesSearch && matchesMinPrice && matchesMaxPrice;
  });

  const hasActiveFilters = searchQuery.length > 0 || priceRange.min !== '' || priceRange.max !== '';

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Hero Header with Search */}
      <div className="relative w-full py-12 px-6 md:py-20 overflow-hidden rounded-[3rem] shadow-2xl group border-4 border-white bg-green-800">
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-60 mix-blend-luminosity"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1594833211511-0985f957017c?w=1600&q=80")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-900/40 to-green-800/60"></div>

        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="text-center space-y-2">
            <div className="inline-block p-3 bg-white/10 backdrop-blur-2xl rounded-[2rem] border border-white/20 shadow-2xl mb-4">
              <Logo />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase drop-shadow-2xl">
              Vitrine<span className="text-orange-400">Frutal</span>
            </h1>
            <p className="text-sm md:text-lg font-black text-white/80 tracking-widest uppercase">
              "Se tem em Frutal, está na vitrine"
            </p>
          </div>

          <div className="w-full max-w-2xl bg-white p-2 rounded-2xl flex shadow-2xl shadow-green-900/50 relative z-20">
            <div className="flex-1 flex items-center px-4 gap-3">
              <Search className="text-gray-400" size={20} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="O que você procura hoje?"
                className="w-full py-3 bg-transparent outline-none font-bold text-gray-700 placeholder-gray-400"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all ${hasActiveFilters ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              <Filter size={16} /> Filtros
            </button>
          </div>

          {showFilters && (
            <div className="w-full max-w-2xl bg-white p-6 rounded-3xl shadow-xl animate-in slide-in-from-top-4 flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1 w-full grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-2">Preço Mín.</label>
                  <input type="number" value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl outline-none font-bold text-sm" placeholder="R$ 0,00" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-2">Preço Máx.</label>
                  <input type="number" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl outline-none font-bold text-sm" placeholder="R$ Máximo" />
                </div>
              </div>
              <button onClick={() => { setSearchQuery(''); setPriceRange({ min: '', max: '' }); setShowFilters(false); }} className="w-full md:w-auto px-6 py-4 bg-red-50 text-red-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 transition-colors">
                Limpar
              </button>
            </div>
          )}
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-black tracking-tighter uppercase tracking-widest">
              Resultados da Busca <span className="text-gray-400 text-sm ml-2">({filteredProducts.length} itens)</span>
            </h2>
          </div>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(p => {
                const store = stores.find(s => s.id === p.storeId);
                return (
                  <div key={p.id} className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col group hover:shadow-xl transition-all">
                    <div className="relative overflow-hidden rounded-2xl mb-4 aspect-square">
                      <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {store && (
                        <div className="absolute bottom-2 left-2 px-3 py-1 bg-white/90 backdrop-blur rounded-lg shadow-sm text-[8px] font-black uppercase tracking-widest text-black/70">
                          {store.name}
                        </div>
                      )}
                    </div>
                    <h4 className="font-black text-black text-sm leading-tight uppercase tracking-tighter mb-1 line-clamp-2 min-h-[2.5em]">{p.name}</h4>
                    <div className="flex justify-between items-end mt-auto">
                      <span className="text-lg font-black text-green-600">R$ {p.price.toFixed(2)}</span>
                      <button onClick={() => onAddToCart(p)} className="p-2 bg-gray-900 text-white rounded-xl hover:bg-orange-500 transition-colors shadow-lg shadow-gray-200">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-[3rem]">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-black tracking-tighter uppercase tracking-widest text-[10px]">Estabelecimentos Parceiros</h2>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-orange-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Frutal • MG</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            {stores.map((store: StoreType) => {
              const storeRatings = allRatings.filter(r => r.storeId === store.id);
              const avgRating = storeRatings.length > 0 ? storeRatings.reduce((s, r) => s + r.rating, 0) / storeRatings.length : 0;

              return (
                <div key={store.id} onClick={() => onSelectStore(store)} className="group cursor-pointer bg-white rounded-[3rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col sm:flex-row h-full active:scale-[0.98] transition-all hover:shadow-2xl">
                  <div className="w-full sm:w-1/2 aspect-video sm:aspect-square overflow-hidden relative">
                    <img src={store.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    {avgRating > 0 && (
                      <div className="absolute top-4 left-4 px-4 py-2 bg-white/90 backdrop-blur rounded-2xl shadow-xl flex items-center gap-2 border border-white">
                        <Star size={14} className="text-orange-500" fill="currentColor" />
                        <span className="text-[11px] font-black text-black">{avgRating.toFixed(1)}</span>
                        <span className="text-[9px] text-gray-400 font-bold">({storeRatings.length})</span>
                      </div>
                    )}
                  </div>
                  <div className="p-10 flex flex-col justify-center flex-1">
                    <h3 className="font-black text-3xl text-black group-hover:text-green-600 transition-colors uppercase tracking-tighter leading-none mb-2">{store.name}</h3>
                    <p className="text-gray-400 text-[10px] mb-6 font-black uppercase tracking-[0.2em]">{store.category}</p>
                    <div className="mt-auto font-black text-green-600 text-[10px] flex items-center gap-2 group-hover:gap-4 transition-all uppercase tracking-[0.2em]">Ver Coleção Completa <ChevronRight size={18} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface StoreDetailViewProps {
  store: StoreType;
  products: Product[];
  allRatings: StoreRating[];
  onBack: () => void;
  onAddToCart: (product: Product) => void;
}

function StoreDetailView({ store, products, allRatings, onBack, onAddToCart }: StoreDetailViewProps) {
  const storeRatings = allRatings.filter(r => r.storeId === store.id);
  const avgRating = storeRatings.length > 0 ? storeRatings.reduce((s, r) => s + r.rating, 0) / storeRatings.length : 0;
  return (
    <div className="space-y-10 animate-in fade-in">
      <button onClick={onBack} className="text-green-600 font-black flex items-center gap-2 group uppercase tracking-widest text-[10px]"><ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} /> Explorar Outras Lojas</button>
      <div className="flex items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <img src={store.image} className="w-24 h-24 rounded-[2rem] object-cover shadow-lg" />
        <div>
          <h2 className="text-4xl font-black text-black tracking-tighter uppercase">{store.name}</h2>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1.5 text-orange-500 font-black text-[10px] uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">
              <Star size={12} fill="currentColor" /> {avgRating > 0 ? avgRating.toFixed(1) : 'Sem avaliações'}
            </div>
            <div className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest">
              <StoreIcon size={16} className="text-orange-500" /> {store.category}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product: Product) => (
          <div key={product.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex flex-col group hover:shadow-xl transition-all">
            <div className="relative overflow-hidden aspect-square">
              <img src={product.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h4 className="font-black text-black mb-1 truncate text-xs uppercase tracking-tighter">{product.name}</h4>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-lg font-black text-green-600">R$ {product.price.toFixed(2)}</span>
                <button onClick={() => onAddToCart(product)} className="p-2.5 bg-orange-500 text-white rounded-xl active:scale-90 hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"><Plus size={20} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ServicosViewProps {
  services: Service[];
  onSelectService: (service: Service) => void;
}

function ServicosView({ services, onSelectService }: ServicosViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in">
      <h2 className="text-3xl font-black text-black tracking-tighter uppercase tracking-widest text-sm">Prestadores em Frutal</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service: Service) => (
          <div key={service.id} onClick={() => onSelectService(service)} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-8 hover:shadow-xl transition-all group cursor-pointer active:scale-[0.98]">
            <img src={service.image} className="w-40 h-40 rounded-[2.5rem] object-cover shadow-xl group-hover:rotate-2 transition-transform" />
            <div className="flex-1 flex flex-col">
              <div className="mb-4">
                <h3 className="text-2xl font-black text-black leading-none mb-1 uppercase tracking-tighter">{service.name}</h3>
                <p className="text-[10px] text-orange-500 font-black uppercase mb-2 tracking-widest">{service.type}</p>
              </div>
              <p className="text-xs text-gray-500 mb-6 line-clamp-3 font-medium leading-relaxed">{service.description}</p>
              <div className="mt-auto space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase">
                  <DollarSign size={12} className="text-green-500" /> {service.priceEstimate}
                </div>
                <div className="font-black text-blue-600 text-[10px] flex items-center gap-2 group-hover:gap-4 transition-all uppercase tracking-[0.2em]">Ver Detalhes <ChevronRight size={18} /></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface GiroCulturalViewProps {
  items: CulturalItem[];
  onSelectItem: (item: CulturalItem) => void;
}

function GiroCulturalView({ items, onSelectItem }: GiroCulturalViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in">
      <h2 className="text-3xl font-black text-black tracking-tighter uppercase tracking-widest text-sm">O Giro da Cidade</h2>
      <div className="grid grid-cols-1 gap-10">
        {items.map((item: CulturalItem) => (
          <div key={item.id} onClick={() => onSelectItem(item)} className="bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-sm flex flex-col md:flex-row cursor-pointer transition-all hover:shadow-xl group">
            <div className="md:w-1/2 overflow-hidden aspect-video">
              <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="p-10 md:w-1/2 flex flex-col justify-center">
              <span className="text-purple-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{item.type}</span>
              <h3 className="text-4xl font-black text-black mb-6 leading-none tracking-tighter uppercase">{item.title}</h3>
              <p className="text-gray-500 mb-8 line-clamp-2 font-medium leading-relaxed">{item.description}</p>
              <div className="flex items-center gap-2 font-black text-purple-600 text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">Ver Detalhes do Evento <ArrowRight size={16} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CulturalDetailViewProps {
  item: CulturalItem;
  onBack: () => void;
}

function CulturalDetailView({ item, onBack }: CulturalDetailViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in max-w-4xl mx-auto">
      <button onClick={onBack} className="text-purple-600 font-black flex items-center gap-2 group uppercase tracking-widest text-[10px]"><ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} /> Voltar ao Giro</button>
      <div className="bg-white rounded-[4rem] overflow-hidden border border-gray-100 shadow-sm">
        <img src={item.image} className="w-full aspect-video object-cover" />
        <div className="p-10 md:p-20 space-y-10">
          <div className="flex items-center gap-6">
            <span className="px-6 py-2 bg-purple-100 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest">{item.type}</span>
            <span className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest"><Calendar size={14} className="text-purple-500" /> {item.date}</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-black leading-[0.9] tracking-tighter uppercase">{item.title}</h2>
          <p className="text-xl text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">{item.description}</p>
          {item.images && item.images.length > 0 && (
            <div className="pt-10 border-t border-gray-100">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Galeria de Fotos</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {item.images.map((img: string, idx: number) => (
                  <img key={idx} src={img} className="w-full aspect-square object-cover rounded-3xl shadow-sm hover:scale-105 transition-transform" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ServiceDetailViewProps {
  service: Service;
  onBack: () => void;
  onRequestQuote: (service: Service) => void;
}

function ServiceDetailView({ service, onBack, onRequestQuote }: ServiceDetailViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in max-w-4xl mx-auto">
      <button onClick={onBack} className="text-blue-600 font-black flex items-center gap-2 group uppercase tracking-widest text-[10px]"><ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} /> Voltar aos Serviços</button>
      <div className="bg-white rounded-[4rem] overflow-hidden border border-gray-100 shadow-sm">
        <img src={service.image} className="w-full aspect-video object-cover" />
        <div className="p-10 md:p-20 space-y-10">
          <div className="flex items-center gap-6">
            <span className="px-6 py-2 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">{service.type}</span>
            <span className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest"><DollarSign size={14} className="text-green-500" /> {service.priceEstimate}</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-black leading-[0.9] tracking-tighter uppercase">{service.name}</h2>
          <p className="text-xl text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">{service.description}</p>

          <button
            onClick={() => onRequestQuote(service)}
            className="w-full md:w-auto px-8 py-4 bg-green-600 text-white text-sm font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-green-50 hover:bg-green-700 transition-all uppercase tracking-[0.2em]"
          >
            <MessageCircle size={20} /> Solicitar Orçamento via WhatsApp
          </button>

          {service.images && service.images.length > 0 && (
            <div className="pt-10 border-t border-gray-100">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Galeria de Fotos</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {service.images.map((img: string, idx: number) => (
                  <img key={idx} src={img} className="w-full aspect-square object-cover rounded-3xl shadow-sm hover:scale-105 transition-transform cursor-pointer" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CheckoutViewProps {
  currentUser: User | null;
  cart: CartItem[];
  cartTotal: number;
  stores: StoreType[];
  handleUpdateCartQuantity: (productId: string, delta: number) => void;
  handleRemoveFromCart: (productId: string) => void;
  handleClearCart: () => void;
  checkoutName: string;
  setCheckoutName: (val: string) => void;
  checkoutDocument: string;
  setCheckoutDocument: (val: string) => void;
  checkoutEmail: string;
  setCheckoutEmail: (val: string) => void;
  checkoutPhone: string;
  setCheckoutPhone: (val: string) => void;
  checkoutAddress: string;
  setCheckoutAddress: (val: string) => void;
  deliveryMethod: 'ENTREGA' | 'RETIRADA';
  setDeliveryMethod: (val: 'ENTREGA' | 'RETIRADA') => void;
  handleFinalizePurchase: () => void;
  onBack: () => void;
  activeDeliveryFee: number;
  grandTotal: number;
}

function CheckoutView({
  currentUser, cart, cartTotal, stores, handleUpdateCartQuantity, handleRemoveFromCart, handleClearCart,
  checkoutName, setCheckoutName, checkoutDocument, setCheckoutDocument,
  checkoutEmail, setCheckoutEmail, checkoutPhone, setCheckoutPhone,
  checkoutAddress, setCheckoutAddress, deliveryMethod, setDeliveryMethod,
  handleFinalizePurchase, onBack, activeDeliveryFee, grandTotal
}: CheckoutViewProps) {
  const store = cart.length > 0 ? stores.find((s: StoreType) => s.id === cart[0].storeId) : null;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in max-w-4xl mx-auto pb-24 lg:pb-0">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><ArrowLeft size={20} /></button>
        <h2 className="text-xl md:text-3xl font-black text-black tracking-tighter uppercase tracking-widest text-sm">Resumo da Sacola</h2>
      </div>
      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
          <div className="lg:col-span-3 space-y-6 md:space-y-8">
            <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-base md:text-xl font-black text-black tracking-tight uppercase tracking-widest text-xs">Como deseja receber?</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <button
                  onClick={() => setDeliveryMethod('ENTREGA')}
                  className={`flex flex-col items-center gap-2 md:gap-3 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border-2 transition-all ${deliveryMethod === 'ENTREGA' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 bg-gray-50 text-gray-400 hover:bg-white'}`}
                >
                  <Truck size={20} className="md:w-6 md:h-6" />
                  <span className="font-black text-[9px] md:text-[10px] uppercase tracking-widest">Entrega</span>
                  {store?.deliveryFee && <span className="text-[8px] md:text-[9px] font-black text-green-600">R$ {store.deliveryFee.toFixed(2)}</span>}
                </button>
                <button
                  onClick={() => setDeliveryMethod('RETIRADA')}
                  className={`flex flex-col items-center gap-2 md:gap-3 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border-2 transition-all ${deliveryMethod === 'RETIRADA' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 bg-gray-50 text-gray-400 hover:bg-white'}`}
                >
                  <Building2 size={20} className="md:w-6 md:h-6" />
                  <span className="font-black text-[9px] md:text-[10px] uppercase tracking-widest">Retirada</span>
                  <span className="text-[8px] md:text-[9px] font-black text-green-600">Grátis</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-gray-100 shadow-sm space-y-6 md:space-y-8">
              <h3 className="text-base md:text-xl font-black text-black tracking-tight uppercase tracking-widest text-xs">Dados do Destinatário</h3>
              <div className="space-y-4 md:space-y-5">
                <input required placeholder="Nome do Destinatário" value={checkoutName} onChange={(e) => setCheckoutName(e.target.value)} className="w-full p-4 md:p-5 bg-gray-50 rounded-xl md:rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-orange-50 border-2 border-transparent transition-all text-sm" />
                <input required placeholder="Documento Identificador" value={checkoutDocument} onChange={(e) => setCheckoutDocument(e.target.value)} className="w-full p-4 md:p-5 bg-gray-50 rounded-xl md:rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-orange-100 border-2 border-transparent transition-all text-sm" />
                <input required placeholder="WhatsApp Principal" value={checkoutPhone} onChange={(e) => setCheckoutPhone(e.target.value)} className="w-full p-4 md:p-5 bg-gray-50 rounded-xl md:rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-orange-100 border-2 border-transparent transition-all text-sm" />

                {deliveryMethod === 'ENTREGA' ? (
                  <div className="space-y-2 md:space-y-3 animate-in fade-in">
                    <label className="text-[9px] md:text-[10px] font-black text-orange-500 uppercase ml-2 md:ml-4 tracking-[0.2em]">Endereço para Entrega em Frutal</label>
                    <textarea required placeholder="Endereço de Entrega Detalhado" value={checkoutAddress} onChange={(e) => setCheckoutAddress(e.target.value)} className="w-full p-4 md:p-5 bg-gray-50 rounded-xl md:rounded-2xl outline-none font-semibold text-black h-24 resize-none focus:ring-4 focus:ring-orange-100 border-2 border-transparent transition-all text-sm" />
                  </div>
                ) : (
                  <div className="p-4 md:p-6 bg-blue-50 rounded-2xl md:rounded-[2rem] border border-blue-100 flex items-start gap-3 md:gap-4 animate-in slide-in-from-top duration-300">
                    <div className="p-2 md:p-3 bg-blue-600 text-white rounded-xl md:rounded-2xl shrink-0"><MapPin size={18} md:size={20} /></div>
                    <div>
                      <p className="text-[9px] md:text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1">Endereço para Retirada</p>
                      <p className="text-xs text-blue-600 font-bold leading-relaxed">{store?.name}</p>
                      <p className="text-[10px] md:text-[11px] text-blue-500/80 font-medium leading-relaxed">{store?.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6 bg-white p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-gray-100 shadow-sm h-fit sticky lg:top-24">
            <h3 className="text-base md:text-lg font-black text-black tracking-tight uppercase tracking-widest text-xs">Produtos</h3>
            <div className="space-y-3 md:space-y-4 max-h-[300px] md:max-h-[350px] overflow-y-auto pr-1 md:pr-2 no-scrollbar">
              {cart.map((item: CartItem) => (
                <div key={item.productId} className="flex gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 transition-all hover:bg-white group">
                  <img src={item.image} className="w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                  <div className="flex-1">
                    <h4 className="font-black text-[9px] md:text-[10px] text-black leading-tight uppercase tracking-tighter">{item.name}</h4>
                    <div className="flex justify-between items-center mt-2 md:mt-3">
                      <span className="text-[10px] md:text-xs font-black text-green-600">R$ {item.price.toFixed(2)}</span>
                      <div className="flex items-center gap-2 md:gap-3 bg-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg md:rounded-xl shadow-sm border border-gray-100">
                        <button onClick={() => handleUpdateCartQuantity(item.productId, -1)} className="p-1 hover:text-orange-500 transition-colors"><Minus size={8} md:size={10} /></button>
                        <span className="text-[10px] md:text-xs font-black text-black w-3 md:w-4 text-center">{item.quantity}</span>
                        <button onClick={() => handleUpdateCartQuantity(item.productId, 1)} className="p-1 hover:text-orange-500 transition-colors"><Plus size={8} md:size={10} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-6 md:pt-8 border-t border-gray-100 space-y-3 md:space-y-4">
              <div className="flex justify-between items-center text-[9px] md:text-[10px]">
                <span className="font-black text-gray-400 uppercase tracking-widest">Subtotal</span>
                <span className="font-bold text-slate-900">R$ {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[9px] md:text-[10px]">
                <span className="font-black text-gray-400 uppercase tracking-widest">Entrega</span>
                <span className="font-bold text-green-600">R$ {activeDeliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-xl md:text-3xl pt-2 text-black tracking-tighter uppercase">
                <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.3em] self-center">Total</span>
                <span>R$ {grandTotal.toFixed(2)}</span>
              </div>
              <button onClick={handleFinalizePurchase} className="w-full py-4 md:py-6 bg-orange-500 text-white font-black rounded-2xl md:rounded-3xl shadow-2xl shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95 uppercase tracking-[0.4em] text-[9px] md:text-[10px]">Realizar Pedido</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[4rem] border border-gray-100 shadow-sm flex flex-col items-center gap-10">
          <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-200"><ShoppingBag size={48} /></div>
          <div>
            <h3 className="text-3xl font-black text-black tracking-tighter uppercase tracking-widest">Sua Sacola está vazia</h3>
            <p className="text-gray-400 font-medium mt-2">Explore as ofertas locais e adicione itens para continuar.</p>
          </div>
          <button onClick={onBack} className="px-12 py-5 bg-green-600 text-white font-black rounded-2xl shadow-2xl shadow-green-50 hover:bg-green-700 transition-all uppercase tracking-[0.4em] text-[10px]">Ver Lojas Agora</button>
        </div>
      )}
    </div>
  );
}

interface DashboardViewProps {
  user: User;
  setCurrentUser: (user: User | null) => void;
  stores: StoreType[];
  setStores: React.Dispatch<React.SetStateAction<StoreType[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  culturalItems: CulturalItem[];
  setCulturalItems: React.Dispatch<React.SetStateAction<CulturalItem[]>>;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  logout: () => void;
  storeRatings: StoreRating[];
  setSelectedOrderForRating: (order: Order | null) => void;
  setShowRatingModal: (show: boolean) => void;
}

function DashboardView({ user, setCurrentUser, stores, setStores, products, setProducts, orders, setOrders, services, setServices, culturalItems, setCulturalItems, showSuccess, showError, logout, storeRatings, setSelectedOrderForRating, setShowRatingModal }: DashboardViewProps) {
  // Fix for potential null user crash during state init
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'HISTORY' | 'MY_ORDERS' | 'PRODUCTS' | 'STOCK' | 'MY_SERVICE' | 'MANAGE_STORES' | 'MANAGE_SERVICES' | 'MANAGE_CULTURAL' | 'PANEL'>(() => {
    if (!user) return 'PANEL';
    if (user.role === 'DEV') return 'MANAGE_STORES';
    if (user.role === 'LOJISTA') return 'ORDERS';
    if (user.role === 'PRESTADOR') return 'MY_SERVICE';
    if (user.role === 'CLIENTE') return 'MY_ORDERS';
    return 'PANEL';
  });

  const [showFormModal, setShowFormModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCulturalModal, setShowCulturalModal] = useState(false);
  const [showOrderManager, setShowOrderManager] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingStore, setEditingStore] = useState<StoreType | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingCulturalItem, setEditingCulturalItem] = useState<CulturalItem | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedStoreLogo, setUploadedStoreLogo] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  const [currentManagerDeliveryFee, setCurrentManagerDeliveryFee] = useState<number>(0);

  useEffect(() => {
    if (selectedOrder) {
      setCurrentManagerDeliveryFee(selectedOrder.deliveryFee || 0);
    }
  }, [selectedOrder]);

  const currentStore = stores.find((s: StoreType) => s.ownerId === user?.id || s.id === user?.storeId);
  const currentService = services.find((s: Service) => s.providerId === user?.id || s.id === user?.serviceId);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    if (isUpdatingOrder) return;

    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    // Prevent double cancellation processing
    if (newStatus === 'CANCELADO' && orderToUpdate.status === 'CANCELADO') {
      return;
    }

    setIsUpdatingOrder(true);

    try {
      // UPDATE LOCAL STATE
      setOrders((prev: Order[]) => prev.map((o: Order) => {
        if (o.id === orderId) {
          const updated: Order = { ...o, status: newStatus, deliveryFee: currentManagerDeliveryFee };
          if (newStatus === 'EM_ROTA') {
            updated.dispatchedAt = new Date().toISOString();
          }
          return updated;
        }
        return o;
      }));

      // RESTORE STOCK IF TRANSITIONING TO CANCELLED
      if (newStatus === 'CANCELADO' && orderToUpdate.status !== 'CANCELADO') {
        for (const item of orderToUpdate.items) {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            const restoredStock = product.stock + item.quantity;
            await supabase.from('products').update({ stock: restoredStock }).eq('id', item.productId);
            setProducts((prev: Product[]) => prev.map((p: Product) => p.id === item.productId ? { ...p, stock: restoredStock } : p));
          }
        }
      }

      // PERSIST ORDER STATUS TO SUPABASE
      const updateData: any = {
        status: newStatus,
        delivery_fee: currentManagerDeliveryFee
      };

      if (newStatus === 'EM_ROTA') {
        updateData.dispatched_at = new Date().toISOString();
      }

      const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);

      if (error) {
        showError('Erro ao salvar status: ' + error.message);
      } else {
        showSuccess(`Pedido atualizado para: ${newStatus}`);
      }

      setShowOrderManager(false);
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const handleSaveManagerDeliveryFee = () => {
    if (!selectedOrder) return;
    setOrders((prev: Order[]) => prev.map((o: Order) =>
      o.id === selectedOrder.id ? { ...o, deliveryFee: currentManagerDeliveryFee } : o
    ));
    showSuccess('Taxa de entrega do pedido atualizada!');
  };

  const handleSimulateOrder = () => {
    if (user?.role !== 'LOJISTA' || !currentStore?.id) return;

    const storeProducts = products.filter((p: Product) => p.storeId === currentStore.id);
    if (storeProducts.length === 0) {
      alert("Adicione produtos primeiro para receber pedidos!");
      return;
    }

    const testOrder: Order = {
      id: `TEST-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      clientId: 'u_teste_demo',
      storeId: currentStore.id,
      customerName: 'Cliente Teste Frutal',
      customerPhone: '(34) 99999-0000',
      customerAddress: 'Rua das Jabuticabas, 789, Bairro Ipê - Frutal/MG',
      deliveryMethod: 'ENTREGA',
      deliveryFee: currentStore?.deliveryFee || 0,
      status: 'PENDENTE',
      total: storeProducts[0].price * 2,
      createdAt: new Date().toISOString(),
      items: [
        {
          productId: storeProducts[0].id,
          name: storeProducts[0].name,
          quantity: 2,
          price: storeProducts[0].price
        }
      ],
    };

    setOrders((prev: Order[]) => [testOrder, ...prev]);
    showSuccess("Pedido de Teste Simulado com Sucesso!");
  };

  const handleSaveStoreByDev = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const storeEmail = (fd.get('email') as string || '').trim().toLowerCase();
    const data: any = {
      name: fd.get('name') as string,
      category: fd.get('category') as string,
      whatsapp: normalizeWhatsApp(fd.get('whatsapp') as string),
      address: fd.get('address') as string,
      cnpj: fd.get('cnpj') as string,
      email: storeEmail,
      delivery_fee: parseFloat(fd.get('deliveryFee') as string) || 0,
      image: uploadedImages[0] || editingStore?.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    };

    if (editingStore) {
      const { error } = await supabase.from('stores').update(data).eq('id', editingStore.id);
      if (error) { showError('Erro ao atualizar: ' + error.message); return; }
      setStores((prev: StoreType[]) => prev.map((s: StoreType) => s.id === editingStore.id ? { ...s, ...data, deliveryFee: data.delivery_fee } : s));
      showSuccess('Loja atualizada no sistema!');
    } else {
      // Quando o DEV adiciona um lojista, ele define o e-mail que o lojista cadastrará futuramente
      // ou vincula a um ownerId se o lojista já existir. Por enquanto, criamos sem ownerId fixo.
      const { data: saved, error } = await supabase.from('stores').insert([data]).select();
      if (error) { showError('Erro ao salvar: ' + error.message); return; }
      if (saved) setStores((prev: StoreType[]) => [...prev, { ...saved[0], deliveryFee: saved[0].delivery_fee }]);
      showSuccess('Nova loja master registrada pelo administrador!');
    }
    setShowStoreModal(false);
    setEditingStore(null);
    setUploadedImages([]);
  };

  const handleSaveService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const emailStr = (fd.get('email') as string || '').trim().toLowerCase();

    const data: any = {
      name: fd.get('name') as string,
      type: fd.get('type') as string,
      whatsapp: normalizeWhatsApp(fd.get('whatsapp') as string),
      address: fd.get('address') as string,
      email: emailStr,
      description: fd.get('description') as string,
      price_estimate: fd.get('priceEstimate') as string,
      image: uploadedImages[0] || (user?.role === 'PRESTADOR' ? currentService?.image : editingService?.image) || 'https://images.unsplash.com/photo-1581578731522-745d05ad9a2d?w=400&h=300&fit=crop',
      images: uploadedImages.length > 0 ? uploadedImages : (editingService?.images || [])
    };

    if (user?.role === 'PRESTADOR') {
      const activeServiceId = currentService?.id || user.serviceId;
      if (activeServiceId) {
        const { error } = await supabase.from('services').update(data).eq('id', activeServiceId);
        if (error) { showError('Erro ao atualizar: ' + error.message); return; }

        setServices((prev: Service[]) => prev.map((s: Service) => s.id === activeServiceId ? { ...s, ...data, priceEstimate: data.price_estimate, images: data.images } : s));
        showSuccess('Seu perfil profissional foi atualizado!');
      } else {
        const { data: saved, error } = await supabase.from('services').insert([{ ...data, provider_id: user.id }]).select();
        if (error) { showError('Erro ao salvar: ' + error.message); return; }

        if (saved) {
          const newService = { ...saved[0], priceEstimate: saved[0].price_estimate, images: saved[0].images || [] };
          setServices((prev: Service[]) => [...prev, newService]);
          setCurrentUser({ ...user, serviceId: newService.id });
        }
        showSuccess('Serviço cadastrado com sucesso!');
      }
    } else if (user?.role === 'DEV') {
      if (editingService) {
        const { error } = await supabase.from('services').update(data).eq('id', editingService.id);
        if (error) { showError('Erro ao atualizar: ' + error.message); return; }

        setServices((prev: Service[]) => prev.map((s: Service) => s.id === editingService.id ? { ...s, ...data, priceEstimate: data.price_estimate, images: data.images } : s));
        showSuccess('Prestador atualizado pelo administrador!');
      } else {
        // For new services by DEV, provider_id is null initially
        const { data: saved, error } = await supabase.from('services').insert([data]).select();
        if (error) { showError('Erro ao salvar: ' + error.message); return; }

        if (saved) {
          setServices((prev: Service[]) => [...prev, { ...saved[0], priceEstimate: saved[0].price_estimate, providerId: 'manual', images: saved[0].images || [] }]);
        }
        showSuccess('Novo prestador adicionado pela administração!');
      }
      setShowServiceModal(false);
      setEditingService(null);
    }
    setUploadedImages([]);
  };

  const handleSaveCulturalItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: any = {
      title: fd.get('title') as string,
      type: fd.get('type') as string,
      date: fd.get('date') as string,
      description: fd.get('description') as string,
      image: uploadedImages[0] || editingCulturalItem?.image || 'https://images.unsplash.com/photo-1514525253361-bee8718a340b?w=800',
      images: uploadedImages.length > 0 ? uploadedImages : (editingCulturalItem?.images || []),
    };

    if (editingCulturalItem) {
      const { error } = await supabase.from('cultural_items').update(data).eq('id', editingCulturalItem.id);
      if (error) { showError('Erro ao atualizar Giro Cultural: ' + error.message); return; }
      setCulturalItems((prev: CulturalItem[]) => prev.map((c: CulturalItem) => c.id === editingCulturalItem.id ? { ...c, ...data } : c));
      showSuccess('Giro Cultural atualizado!');
    } else {
      const { data: saved, error } = await supabase.from('cultural_items').insert([data]).select();
      if (error) { showError('Erro ao salvar Giro Cultural: ' + error.message); return; }
      if (saved) setCulturalItems((prev: CulturalItem[]) => [...prev, saved[0]]);
      showSuccess('Giro Cultural registrado com sucesso!');
    }
    setShowCulturalModal(false);
    setEditingCulturalItem(null);
    setUploadedImages([]);
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const deliveryFee = parseFloat(fd.get('deliveryFee') as string) || 0;

    const updatedUser: User = {
      ...user!,
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      phone: fd.get('phone') as string,
      document: fd.get('document') as string,
      address: fd.get('address') as string,
    };

    if (user?.role === 'LOJISTA') {
      if (currentStore?.id) {
        const { error } = await supabase.from('stores').update({ name: updatedUser.name, delivery_fee: deliveryFee, image: uploadedStoreLogo || undefined }).eq('id', currentStore.id);
        if (error) {
          showError('Erro ao atualizar loja: ' + error.message);
          return;
        }
        setStores((prev: StoreType[]) => prev.map((s: StoreType) =>
          s.id === currentStore.id
            ? { ...s, deliveryFee, image: uploadedStoreLogo || s.image }
            : s
        ));
      } else {
        const newStoreId = 's_' + user.id;
        const newStore: any = {
          owner_id: user.id,
          name: updatedUser.name,
          category: 'Geral',
          image: uploadedStoreLogo || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
          address: updatedUser.address || 'Frutal, MG',
          whatsapp: updatedUser.phone || '34988888888',
          email: updatedUser.email,
          cnpj: updatedUser.document || '00.000.000/0001-00',
          delivery_fee: deliveryFee
        };
        const { data, error } = await supabase.from('stores').insert([newStore]).select();
        if (error) {
          showError('Erro ao criar loja: ' + error.message);
          return;
        }
        if (data && data[0]) {
          const savedStore = data[0];
          setStores(prev => [...prev, savedStore]);
          updatedUser.storeId = savedStore.id;
        }
      }
    }

    setCurrentUser(updatedUser);
    setIsEditingProfile(false);
    setUploadedStoreLogo(null);
    showSuccess('Perfil e configurações da loja atualizados!');
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentStore?.id) {
      showError('Sua loja não foi identificada. Certifique-se de que sua conta está vinculada corretamente.');
      return;
    }
    const fd = new FormData(e.currentTarget);
    const data: any = {
      name: fd.get('name') as string,
      price: parseFloat(fd.get('price') as string),
      stock: parseInt(fd.get('stock') as string),
      description: fd.get('description') as string,
      image: uploadedImages[0] || editingProduct?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
      images: uploadedImages,
      store_id: currentStore?.id
    };

    if (editingProduct) {
      const { error } = await supabase.from('products').update(data).eq('id', editingProduct.id);
      if (error) { showError('Erro ao atualizar produto: ' + error.message); return; }
      setProducts((prev: Product[]) => prev.map((p: Product) => p.id === editingProduct.id ? { ...p, ...data, storeId: data.store_id } : p));
    } else {
      const { data: saved, error } = await supabase.from('products').insert([data]).select();
      if (error) { showError('Erro ao salvar produto: ' + error.message); return; }
      if (saved) {
        setProducts((prev: Product[]) => [...prev, {
          ...saved[0],
          storeId: saved[0].store_id
        }]);
      }
    }

    setShowFormModal(false);
    setEditingProduct(null);
    setUploadedImages([]);
    showSuccess('Item da vitrine salvo!');
  };

  const handleDeleteStore = async (id: string) => {
    if (window.confirm("Deseja realmente excluir esta loja? Todos os dados vinculados serão removidos do sistema.")) {
      const { error } = await supabase.from('stores').delete().eq('id', id);
      if (error) { showError('Erro ao excluir loja: ' + error.message); return; }
      setStores((prev: any) => prev.filter((s: any) => s.id !== id));
      setProducts((prev: any) => prev.filter((p: any) => p.storeId !== id));
      showSuccess("Estabelecimento excluído.");
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm("Remover este prestador de serviços da base de dados?")) {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) { showError('Erro ao excluir serviço: ' + error.message); return; }
      setServices((prev: any) => prev.filter((s: any) => s.id !== id));
      showSuccess("Prestador removido.");
    }
  };

  const handleDeleteCultural = async (id: string) => {
    if (window.confirm("Excluir este item do Giro Cultural? Esta ação não pode ser desfeita.")) {
      const { error } = await supabase.from('cultural_items').delete().eq('id', id);
      if (error) { showError('Erro ao excluir item cultural: ' + error.message); return; }
      setCulturalItems((prev: any) => prev.filter((c: any) => c.id !== id));
      showSuccess("Item cultural removido.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Deseja remover este item da sua vitrine?")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) { showError('Erro ao excluir produto: ' + error.message); return; }
      setProducts((prev: any) => prev.filter((p: any) => p.id !== id));
      showSuccess("Item excluído.");
    }
  };

  const storeOrders = orders.filter((o: Order) => o.storeId === currentStore?.id);

  // Local Time Logic for accurate Daily/Monthly reset
  const now = new Date();
  const localToday = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
  const localMonth = localToday.slice(0, 7); // YYYY-MM

  const dailySales = storeOrders
    .filter((o: Order) => {
      if (!o.createdAt || o.status === 'CANCELADO') return false;
      const orderDateLocal = new Date(o.createdAt).toLocaleDateString('en-CA');
      return orderDateLocal === localToday;
    })
    .reduce((sum: number, o: Order) => sum + (o.total + (o.deliveryFee || 0)), 0);

  const monthlySales = storeOrders
    .filter((o: Order) => {
      if (!o.createdAt || o.status === 'CANCELADO') return false;
      const orderMonthLocal = new Date(o.createdAt).toLocaleDateString('en-CA').slice(0, 7);
      return orderMonthLocal === localMonth;
    })
    .reduce((sum: number, o: Order) => sum + (o.total + (o.deliveryFee || 0)), 0);

  return (
    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-xl md:text-3xl font-black text-black tracking-tighter uppercase tracking-widest leading-none">Portal de Gestão</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{currentStore?.name || 'Administração'}</p>
        </div>

        {user?.role === 'LOJISTA' && (
          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
            <div className="bg-green-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-lg shadow-green-100 min-w-[140px]">
              <div className="p-2 bg-white/20 rounded-xl"><DollarSign size={16} /></div>
              <div>
                <p className="text-[8px] font-black uppercase opacity-80 leading-none mb-1">Venda Diária</p>
                <p className="text-sm font-black tracking-tight leading-none">R$ {dailySales.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-orange-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-lg shadow-orange-100 min-w-[140px]">
              <div className="p-2 bg-white/20 rounded-xl"><Calendar size={16} /></div>
              <div>
                <p className="text-[8px] font-black uppercase opacity-80 leading-none mb-1">Venda Mensal</p>
                <p className="text-sm font-black tracking-tight leading-none">R$ {monthlySales.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="w-full lg:w-auto flex bg-gray-100 p-1.5 rounded-2xl gap-1 overflow-x-auto no-scrollbar border border-gray-200 shadow-inner">
          {user?.role === 'DEV' && (
            <>
              <TabBtn active={activeTab === 'MANAGE_STORES'} icon={<ShieldCheck size={16} />} label="Estabelecimentos" onClick={() => setActiveTab('MANAGE_STORES')} />
              <TabBtn active={activeTab === 'MANAGE_SERVICES'} icon={<HardHat size={16} />} label="Base Serviços" onClick={() => setActiveTab('MANAGE_SERVICES')} />
              <TabBtn active={activeTab === 'MANAGE_CULTURAL'} icon={<Globe size={16} />} label="Cultura Local" onClick={() => setActiveTab('MANAGE_CULTURAL')} />
            </>
          )}
          {user?.role === 'LOJISTA' && (
            <>
              <TabBtn active={activeTab === 'ORDERS'} icon={<ClipboardList size={16} />} label="Vendas Ativas" onClick={() => setActiveTab('ORDERS')} />
              <TabBtn active={activeTab === 'HISTORY'} icon={<Clock size={16} />} label="Histórico" onClick={() => setActiveTab('HISTORY')} />
              <TabBtn active={activeTab === 'PRODUCTS'} icon={<LayoutDashboard size={16} />} label="Minha Vitrine" onClick={() => setActiveTab('PRODUCTS')} />
              <TabBtn active={activeTab === 'STOCK'} icon={<Package size={16} />} label="Inventário" onClick={() => setActiveTab('STOCK')} />
            </>
          )}
          {user?.role === 'CLIENTE' && (
            <TabBtn active={activeTab === 'MY_ORDERS'} icon={<ShoppingBag size={16} />} label="Meus Pedidos" onClick={() => setActiveTab('MY_ORDERS')} />
          )}
          {user?.role === 'PRESTADOR' && (
            <TabBtn active={activeTab === 'MY_SERVICE'} icon={<Hammer size={16} />} label="Cadastro de Serviço" onClick={() => setActiveTab('MY_SERVICE')} />
          )}
          <TabBtn active={activeTab === 'PANEL'} icon={<UserCircle size={16} />} label="Conta" onClick={() => setActiveTab('PANEL')} />
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === 'MANAGE_CULTURAL' && user?.role === 'DEV' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-xl font-black text-black tracking-tight uppercase tracking-widest text-xs">Giro Cultural Frutal</h3>
                <p className="text-[10px] text-purple-500 font-black uppercase tracking-widest">Eventos e Locais Históricos</p>
              </div>
              <button onClick={() => { setEditingCulturalItem(null); setUploadedImages([]); setShowCulturalModal(true); }} className="w-full sm:w-auto bg-purple-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 shadow-2xl hover:bg-purple-700 transition-all uppercase tracking-[0.2em]"><PlusCircle size={18} /> Novo Giro Cultural</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {culturalItems.map((c: any) => (
                <div key={c.id} className="bg-white p-6 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col hover:shadow-xl transition-all group">
                  <img src={c.image} className="w-full aspect-video object-cover rounded-[2rem] mb-6 shadow-md" />
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-[9px] font-black text-purple-600 uppercase tracking-widest mb-2">
                      <span className="px-3 py-1 bg-purple-50 rounded-full">{c.type}</span>
                      <span>{c.date}</span>
                    </div>
                    <h4 className="font-black text-black text-2xl tracking-tighter uppercase mb-4 leading-none">{c.title}</h4>
                    <p className="text-xs text-gray-500 font-medium mb-8 line-clamp-2">{c.description}</p>
                    <div className="flex gap-3 mt-auto">
                      <button onClick={() => { setEditingCulturalItem(c); setUploadedImages(c.images || []); setShowCulturalModal(true); }} className="flex-1 py-4 bg-gray-50 text-orange-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-100 transition-all flex items-center justify-center gap-2"><Edit2 size={14} /> Editar</button>
                      <button onClick={() => handleDeleteCultural(c.id)} className="flex-1 py-4 bg-gray-50 text-red-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"><Trash2 size={14} /> Excluir</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'MANAGE_STORES' && user?.role === 'DEV' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-xl font-black text-black tracking-tight uppercase tracking-widest text-xs">Estabelecimentos Master</h3>
                <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest">Controle Administrativo de Lojas</p>
              </div>
              <button onClick={() => { setEditingStore(null); setUploadedImages([]); setShowStoreModal(true); }} className="w-full sm:w-auto bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 shadow-2xl hover:bg-orange-600 transition-all uppercase tracking-[0.2em]"><PlusCircle size={18} /> Cadastrar Loja</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stores.map((s: any) => (
                <div key={s.id} className="bg-white p-6 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col group hover:shadow-xl transition-all">
                  <div className="relative overflow-hidden rounded-[2rem] mb-6 shadow-md aspect-video">
                    <img src={s.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${s.ownerId ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {s.ownerId ? 'Vinculada' : 'Aguardando Lojista'}
                    </div>
                  </div>
                  <h4 className="font-black text-black text-xl leading-none mb-1 uppercase tracking-tighter">{s.name}</h4>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2">{s.category}</p>
                  <div className="flex items-center gap-2 mb-6 text-[9px] font-medium text-gray-500 bg-gray-50 p-2 rounded-lg truncate">
                    <Mail size={12} className="shrink-0" /> {s.email}
                  </div>
                  <div className="flex gap-3 mt-auto">
                    <button onClick={() => { setEditingStore(s); setUploadedImages(s.images || []); setShowStoreModal(true); }} className="flex-1 py-4 bg-gray-50 text-orange-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-100 transition-all flex items-center justify-center gap-2"><Edit2 size={14} /> Editar</button>
                    <button onClick={() => handleDeleteStore(s.id)} className="flex-1 py-4 bg-gray-50 text-red-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"><Trash2 size={14} /> Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'MANAGE_SERVICES' && user?.role === 'DEV' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-xl font-black text-black tracking-tight uppercase tracking-widest text-xs">Base Regional de Serviços</h3>
                <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Gestão Master de Profissionais</p>
              </div>
              <button onClick={() => { setEditingService(null); setUploadedImages([]); setShowServiceModal(true); }} className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 shadow-2xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em]"><PlusCircle size={18} /> Novo Prestador</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((ser: any) => (
                <div key={ser.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-8 hover:shadow-xl transition-all group">
                  <img src={ser.image} className="w-32 h-32 rounded-[2rem] object-cover shadow-md shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-black text-black text-xl leading-none mb-1 uppercase tracking-tighter">{ser.name}</h4>
                    <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest mb-4">{ser.type}</p>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingService(ser); setUploadedImages(ser.images || []); setShowServiceModal(true); }} className="flex-1 sm:flex-none px-5 py-4 bg-gray-50 text-orange-600 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-50"><Edit2 size={14} /> Editar</button>
                      <button onClick={() => handleDeleteService(ser.id)} className="flex-1 sm:flex-none px-5 py-4 bg-gray-50 text-red-600 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-50"><Trash2 size={14} /> Excluir</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ORDERS' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <FlaskConical size={24} className="text-orange-500" />
                <div>
                  <h4 className="font-black text-xs uppercase tracking-tighter">Fluxo de Vendas</h4>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Acompanhe seus pedidos em tempo real</p>
                </div>
              </div>
              <button
                onClick={handleSimulateOrder}
                className="px-6 py-3 bg-gray-900 text-white font-black rounded-xl text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-100"
              >
                <ShoppingCart size={16} /> Simular Pedido de Teste
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <OrderCol
                title="Pendentes"
                list={orders.filter((o: any) => o.status === 'PENDENTE' && o.storeId === currentStore?.id)}
                color="orange"
                onSelectOrder={(o: Order) => { setSelectedOrder(o); setShowOrderManager(true); }}
              />
              <OrderCol
                title="Preparando"
                list={orders.filter((o: any) => o.status === 'PREPARANDO' && o.storeId === currentStore?.id)}
                color="blue"
                onSelectOrder={(o: Order) => { setSelectedOrder(o); setShowOrderManager(true); }}
              />
            </div>
          </div>
        )}

        {activeTab === 'HISTORY' && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-black tracking-tight uppercase tracking-widest text-xs mb-1">Arquivo de Vendas</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Registros de pedidos concluídos ou cancelados</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <OrderCol
                title="Entregues"
                list={orders.filter((o: any) => o.status === 'ENTREGUE' && o.storeId === currentStore?.id)}
                color="green"
                onSelectOrder={(o: Order) => { setSelectedOrder(o); setShowOrderManager(true); }}
              />
              <OrderCol
                title="Cancelados"
                list={orders.filter((o: any) => o.status === 'CANCELADO' && o.storeId === currentStore?.id)}
                color="red"
                onSelectOrder={(o: Order) => { setSelectedOrder(o); setShowOrderManager(true); }}
              />
            </div>
          </div>
        )}

        {activeTab === 'PRODUCTS' && user?.role === 'LOJISTA' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-black tracking-tight uppercase tracking-widest text-xs">Meu Acervo de Vendas</h3>
              <button onClick={() => { setEditingProduct(null); setUploadedImages([]); setShowFormModal(true); }} className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] flex items-center gap-2 shadow-2xl hover:bg-orange-600 transition-all uppercase tracking-[0.2em]"><Plus size={18} /> Novo Item</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.filter((p: any) => p.storeId === currentStore?.id).map((p: any) => (
                <div key={p.id} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-xl flex flex-col group">
                  <div className="overflow-hidden rounded-3xl mb-5 shadow-inner">
                    <img src={p.image} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h4 className="font-black text-black truncate mb-1 text-[11px] uppercase tracking-tighter">{p.name}</h4>
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-sm font-black text-green-600">R$ {p.price.toFixed(2)}</span>
                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Estoque: {p.stock}</span>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button onClick={() => { setEditingProduct(p); setUploadedImages(p.images || []); setShowFormModal(true); }} className="flex-1 py-3 bg-gray-50 text-orange-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-50 flex items-center justify-center gap-2 transition-all"><Edit2 size={12} /> Editar</button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="flex-1 py-3 bg-gray-50 text-red-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-50 flex items-center justify-center gap-2 transition-all"><Trash2 size={12} /> Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'STOCK' && (
          <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden">
            <h3 className="text-lg md:text-xl font-black text-black mb-6 md:mb-10 tracking-tight uppercase tracking-widest text-xs">Métrica de Inventário</h3>
            <div className="overflow-x-auto no-scrollbar -mx-6 px-6">
              <table className="w-full text-left min-w-[600px]">
                <thead className="border-b border-gray-100">
                  <tr>
                    <th className="pb-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Item em Vitrine</th>
                    <th className="pb-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] text-center">Precificação</th>
                    <th className="pb-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] text-center">Qtd. Real</th>
                    <th className="pb-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.filter((p: any) => p.storeId === currentStore?.id).map((p: any) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-6 font-black text-xs text-black uppercase tracking-tighter">{p.name}</td>
                      <td className="py-6 text-xs font-black text-black text-center">R$ {p.price.toFixed(2)}</td>
                      <td className="py-6 text-sm font-black text-black text-center">{p.stock}</td>
                      <td className="py-6 text-right">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase ${p.stock < 5 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                          {p.stock < 5 ? 'Reposição Urgente' : 'Nível Adequado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'MY_ORDERS' && user?.role === 'CLIENTE' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-black tracking-tight uppercase tracking-widest text-xs mb-1">Meus Pedidos em Frutal</h3>
              <p className="text-[9px] text-green-500 font-bold uppercase tracking-widest">Acompanhe suas compras em tempo real</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.filter(o => o.clientId === user.id).length === 0 ? (
                <div className="md:col-span-2 py-20 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                  <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Você ainda não fez nenhum pedido</p>
                </div>
              ) : (
                orders.filter(o => o.clientId === user.id).map(o => {
                  const store = stores.find(s => s.id === o.storeId);
                  const step = o.status === 'PENDENTE' ? 1 : o.status === 'PREPARANDO' ? 2 : o.status === 'EM_ROTA' ? 3 : 4;

                  return (
                    <div key={o.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">{store?.name || 'Loja'}</p>
                          <h4 className="font-black text-black text-lg tracking-tighter uppercase">Pedido #{o.id.slice(0, 5)}</h4>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${o.status === 'ENTREGUE' ? 'bg-green-50 text-green-600' : o.status === 'CANCELADO' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                          {o.status}
                        </div>
                      </div>

                      {/* Status Timeline */}
                      {o.status !== 'CANCELADO' && (
                        <div className="relative flex justify-between mb-8 px-2">
                          <div className="absolute top-[18px] left-0 w-full h-0.5 bg-gray-100 z-0"></div>
                          <div className={`absolute top-[18px] left-0 h-0.5 bg-green-500 z-0 transition-all`} style={{ width: `${((step - 1) / 3) * 100}%` }}></div>

                          {[
                            { icon: <ClipboardList size={14} />, label: 'Pedido' },
                            { icon: <PlayCircle size={14} />, label: 'Preparo' },
                            { icon: <Truck size={14} />, label: 'Rota' },
                            { icon: <CheckCircle size={14} />, label: 'Entrega' }
                          ].map((s, idx) => (
                            <div key={idx} className="relative z-10 flex flex-col items-center">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all ${idx < step ? 'bg-green-500 text-white' : idx === step - 1 ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                                {s.icon}
                              </div>
                              <span className={`text-[8px] mt-2 font-black uppercase tracking-widest ${idx < step ? 'text-green-600' : 'text-gray-400'}`}>{s.label}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2 mb-6 bg-gray-50 p-4 rounded-2xl">
                        {o.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                            <span>{item.quantity}x {item.name}</span>
                            <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-gray-200 flex justify-between text-[10px] font-black text-black uppercase tracking-widest">
                          <span>Total Pago</span>
                          <span>R$ {(o.total + (o.deliveryFee || 0)).toFixed(2)}</span>
                        </div>
                      </div>

                      {o.status === 'EM_ROTA' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'ENTREGUE')}
                          className="w-full py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl hover:bg-green-700 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={18} /> Confirmar Recebimento
                        </button>
                      )}

                      {o.status === 'ENTREGUE' && (
                        <button
                          onClick={() => {
                            const alreadyRated = storeRatings.some(r => r.orderId === o.id);
                            if (alreadyRated) {
                              showError('Você já avaliou este pedido!');
                            } else {
                              setSelectedOrderForRating(o);
                              setShowRatingModal(true);
                            }
                          }}
                          className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl shadow-xl hover:bg-orange-600 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                        >
                          <Star size={18} /> Avaliar Loja
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'PANEL' && (
          <div className="max-w-2xl mx-auto bg-white p-16 rounded-[4rem] border border-gray-100 shadow-sm animate-in zoom-in duration-500">
            {!isEditingProfile ? (
              <div className="text-center">
                <div className="relative inline-block mb-10">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-[3.5rem] flex items-center justify-center text-white mx-auto shadow-2xl overflow-hidden">
                    {user?.role === 'LOJISTA' && currentStore?.image ? (
                      <img src={currentStore.image} className="w-full h-full object-cover" alt="Logo da Loja" />
                    ) : (
                      <UserIcon size={48} />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-3 bg-white text-orange-500 rounded-2xl shadow-xl"><ShieldCheck size={20} /></div>
                </div>
                <h3 className="text-4xl font-black text-black mb-1 tracking-tighter uppercase leading-none">{user?.name}</h3>
                <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] mb-12">{user?.email}</p>
                <div className="text-left space-y-5 bg-gray-50 p-10 rounded-[3rem] border border-gray-100 shadow-inner">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] border-b border-gray-200 pb-5 mb-3">Especificações da Conta</p>
                  <ProfileItem icon={<Mail size={14} className="text-orange-500" />} label="Endereço Digital" value={user?.email} />
                  <ProfileItem icon={<Phone size={14} className="text-orange-500" />} label="Canal WhatsApp" value={user?.phone || 'Pendente'} />
                  <ProfileItem icon={<FileText size={14} className="text-orange-500" />} label="ID Legal" value={user?.document || 'Pendente'} />
                  <ProfileItem icon={<MapPin size={14} className="text-orange-500" />} label="Sede Frutal" value={user?.address || 'Pendente'} />
                  {user?.role === 'LOJISTA' && (
                    <ProfileItem icon={<Coins size={14} className="text-orange-500" />} label="Taxa de Entrega" value={`R$ ${currentStore?.deliveryFee?.toFixed(2) || '0.00'}`} />
                  )}
                  <div className="flex justify-between items-center pt-6 mt-2 border-t border-gray-200">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Privilégio de Acesso</span>
                    <span className="px-5 py-2 bg-green-600 text-white text-[9px] font-black rounded-xl uppercase tracking-[0.3em] shadow-lg shadow-green-100">{user?.role}</span>
                  </div>
                </div>
                <div className="flex gap-5 mt-12">
                  <button onClick={() => { setIsEditingProfile(true); setUploadedStoreLogo(currentStore?.image || null); }} className="flex-1 py-6 bg-orange-500 text-white font-black rounded-3xl shadow-2xl shadow-orange-100 hover:bg-orange-600 transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest text-[10px]">
                    <Edit2 size={20} /> Atualizar Perfil
                  </button>
                  <button onClick={logout} className="p-6 bg-red-50 text-red-600 rounded-3xl hover:bg-red-100 transition-all active:scale-90 border border-red-100">
                    <LogOut size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-10 animate-in slide-in-from-top duration-500">
                <div className="flex items-center gap-6 mb-4">
                  <button onClick={() => setIsEditingProfile(false)} className="p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all"><ArrowLeft size={24} /></button>
                  <h3 className="text-3xl font-black text-black tracking-tighter uppercase">Editar Cadastro</h3>
                </div>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-[0.3em]">Nome Completo</label>
                    <input required name="name" defaultValue={user?.name} className="w-full p-6 bg-gray-50 rounded-[2rem] outline-none font-semibold text-black focus:ring-4 focus:ring-orange-100 border-2 border-transparent transition-all shadow-inner" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-[0.3em]">E-mail Principal</label>
                    <input required name="email" type="email" defaultValue={user?.email} className="w-full p-6 bg-gray-50 rounded-[2rem] outline-none font-semibold text-black focus:ring-4 focus:ring-orange-100 border-2 border-transparent transition-all shadow-inner" />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-[0.3em]">WhatsApp</label>
                      <input name="phone" defaultValue={user?.phone} className="w-full p-6 bg-gray-50 rounded-[2rem] outline-none font-semibold text-black focus:ring-4 focus:ring-orange-100 border-2 border-transparent transition-all shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-[0.3em]">Documento ID</label>
                      <input name="document" defaultValue={user?.document} className="w-full p-6 bg-gray-50 rounded-[2rem] outline-none font-semibold text-black focus:ring-4 focus:ring-orange-100 border-2 border-transparent transition-all shadow-inner" />
                    </div>
                  </div>
                  {user?.role === 'LOJISTA' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-orange-500 uppercase ml-4 tracking-[0.3em]">Taxa de Entrega Padrão (R$)</label>
                        <input name="deliveryFee" type="number" step="0.50" defaultValue={currentStore?.deliveryFee || 0} className="w-full p-6 bg-gray-50 rounded-[2rem] outline-none font-semibold text-black focus:ring-4 focus:ring-orange-100 border-2 border-transparent transition-all shadow-inner" />
                      </div>
                      <div className="space-y-2 pt-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-[0.3em] flex items-center gap-2"><ImageIcon size={14} className="text-orange-500" /> Logo do Estabelecimento</label>
                        <ImageInput onImage={setUploadedStoreLogo} initial={currentStore?.image} />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-[0.3em]">Endereço em Frutal</label>
                    <textarea name="address" defaultValue={user?.address} className="w-full p-6 bg-gray-50 rounded-[2rem] outline-none font-semibold text-black h-32 resize-none focus:ring-4 focus:ring-orange-100 border-2 border-transparent transition-all shadow-inner" />
                  </div>
                  <button type="submit" className="w-full py-6 bg-green-600 text-white font-black rounded-[2.5rem] shadow-2xl shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center gap-3 mt-8 uppercase tracking-[0.4em] text-[10px]">
                    <Save size={20} /> Salvar Dados Cadastrais
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Gerenciador de Pedido */}
      {showOrderManager && selectedOrder && (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in duration-500 overflow-y-auto max-h-[95vh] no-scrollbar">
            <button onClick={() => setShowOrderManager(false)} className="absolute top-10 right-10 p-4 bg-gray-50 text-gray-400 hover:text-red-500 rounded-[1.5rem] transition-all">
              <X size={24} />
            </button>
            <div className="mb-8">
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border mb-4 inline-block ${selectedOrder.status === 'PENDENTE' ? 'bg-orange-50 text-orange-600 border-orange-100' : selectedOrder.status === 'PREPARANDO' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                Pedido {selectedOrder.status}
              </span>
              <h3 className="text-3xl font-black text-black tracking-tighter uppercase leading-none">Informações do Pedido</h3>
              <p className="text-[10px] text-gray-400 font-black uppercase mt-1 tracking-widest">ID: {selectedOrder.id}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-3">Informações do Cliente</p>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Nome</p>
                  <p className="text-sm font-bold text-slate-900">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">WhatsApp / Telefone</p>
                  <p className="text-sm font-bold text-green-600 flex items-center gap-2">
                    <MessageCircle size={16} /> {selectedOrder.customerPhone}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Método</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {selectedOrder.deliveryMethod === 'ENTREGA' ? <Truck size={16} className="text-orange-500" /> : <Building2 size={16} className="text-blue-500" />}
                    {selectedOrder.deliveryMethod === 'ENTREGA' ? 'Entrega em domicílio' : 'Retirada na Loja'}
                  </p>
                </div>
                {selectedOrder.deliveryMethod === 'ENTREGA' && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Endereço de Entrega</p>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed italic">{selectedOrder.customerAddress}</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-3 mb-6">Custos e Taxas</p>

                <div className="space-y-4 flex-1">
                  <div>
                    <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2 block">Taxa de Entrega (R$)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.50"
                        value={currentManagerDeliveryFee}
                        onChange={(e) => setCurrentManagerDeliveryFee(parseFloat(e.target.value) || 0)}
                        className="flex-1 p-4 bg-white rounded-xl border border-slate-200 outline-none font-bold text-slate-900 focus:ring-2 focus:ring-orange-200"
                      />
                      <button
                        onClick={handleSaveManagerDeliveryFee}
                        className="p-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                      >
                        <Save size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <span>Subtotal Itens</span>
                      <span>R$ {selectedOrder.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <span>Taxa de Entrega</span>
                      <span>R$ {currentManagerDeliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs font-black uppercase text-slate-900 tracking-[0.2em]">Total Final</span>
                      <span className="text-2xl font-black text-green-600 leading-none">R$ {(selectedOrder.total + currentManagerDeliveryFee).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 mb-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Produtos no Pedido</p>
              <div className="space-y-4">
                {selectedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm font-bold border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-xs text-orange-500">{item.quantity}x</span>
                      <span className="text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-slate-900">R$ {item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedOrder.status === 'PENDENTE' && (
                <button
                  disabled={isUpdatingOrder}
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'PREPARANDO')}
                  className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all uppercase tracking-widest text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlayCircle size={20} /> {isUpdatingOrder ? 'Processando...' : 'Iniciar Preparo'}
                </button>
              )}
              {selectedOrder.status === 'PREPARANDO' && (
                <button
                  disabled={isUpdatingOrder}
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'EM_ROTA')}
                  className="w-full py-5 bg-orange-600 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-orange-700 transition-all uppercase tracking-widest text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Truck size={20} /> {isUpdatingOrder ? 'Processando...' : 'Saiu para Entrega'}
                </button>
              )}
              {selectedOrder.status === 'EM_ROTA' && (() => {
                const dispatchTime = selectedOrder.dispatchedAt ? new Date(selectedOrder.dispatchedAt).getTime() : 0;
                const now = Date.now();
                const oneHour = 3600000;
                const isWaitOver = now - dispatchTime > oneHour;
                const minutesLeft = Math.ceil((oneHour - (now - dispatchTime)) / 60000);

                return (
                  <button
                    disabled={isUpdatingOrder || !isWaitOver}
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'ENTREGUE')}
                    className={`w-full py-5 ${isWaitOver ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'} text-white font-black rounded-2xl shadow-xl flex flex-col items-center justify-center transition-all uppercase tracking-widest text-[10px] disabled:opacity-80`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle size={20} /> {isUpdatingOrder ? 'Processando...' : 'Confirmar Entrega'}
                    </div>
                    {!isWaitOver && <span className="text-[8px] opacity-70 mt-1">Liberado em {minutesLeft} min</span>}
                  </button>
                );
              })()}
              <button
                disabled={isUpdatingOrder}
                onClick={() => {
                  if (confirm("Deseja realmente cancelar este pedido?")) {
                    handleUpdateOrderStatus(selectedOrder.id, 'CANCELADO');
                  }
                }}
                className="w-full py-5 bg-gray-50 text-red-500 font-black rounded-2xl hover:bg-red-50 transition-all uppercase tracking-widest text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingOrder ? 'Processando...' : 'Cancelar Pedido'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Giro Cultural (DEV) */}
      {showCulturalModal && user?.role === 'DEV' && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setShowCulturalModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-red-500 transition-transform hover:rotate-90">✕</button>
            <h3 className="text-2xl font-black mb-10 text-black flex items-center gap-3 tracking-tighter uppercase">
              <Globe className="text-purple-500" /> {editingCulturalItem ? 'Ajustar Cultura' : 'Novo Giro Cultural'}
            </h3>
            <form onSubmit={handleSaveCulturalItem} className="space-y-5 pb-4">
              <input required name="title" defaultValue={editingCulturalItem?.title} placeholder="Título do Evento ou Local" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-purple-100 border-2 border-transparent transition-all shadow-inner" />
              <div className="grid grid-cols-2 gap-5">
                <input required name="type" defaultValue={editingCulturalItem?.type} placeholder="Tipo (ex: Evento, Local)" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-purple-100 border-2 border-transparent transition-all shadow-inner" />
                <input required name="date" defaultValue={editingCulturalItem?.date} placeholder="Data ou Horário" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-purple-100 border-2 border-transparent transition-all shadow-inner" />
              </div>
              <textarea required name="description" defaultValue={editingCulturalItem?.description} placeholder="Descreva a importância ou detalhes..." className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black h-32 resize-none focus:ring-4 focus:ring-purple-100 border-2 border-transparent transition-all shadow-inner" />

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-[0.3em] flex items-center gap-2">
                  <ImageIcon size={14} className="text-purple-500" /> Galeria de Imagens (Máx 10)
                </label>
                <MultiImageInput key={editingCulturalItem?.id || 'new-cult'} max={10} onImagesChange={setUploadedImages} initialImages={editingCulturalItem?.images || []} showError={showError} />
              </div>

              <button type="submit" className="w-full py-6 bg-purple-600 text-white font-black rounded-3xl shadow-2xl mt-6 hover:bg-purple-700 transition-all uppercase tracking-[0.4em] text-[10px]">Efetivar Registro Cultural</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Produto */}
      {showFormModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in duration-500 overflow-y-auto max-h-[90vh] no-scrollbar">
            <button onClick={() => setShowFormModal(false)} className="absolute top-10 right-10 p-4 bg-gray-50 text-gray-400 hover:text-red-500 rounded-[1.5rem] transition-all shadow-sm">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black mb-10 text-black flex items-center gap-3 tracking-tighter uppercase">
              <PlusCircle className="text-orange-500" /> {editingProduct ? 'Editar Oferta' : 'Novo Item na Vitrine'}
            </h3>
            <form key={editingProduct?.id || 'new'} onSubmit={handleSaveProduct} className="space-y-5">
              <input required name="name" defaultValue={editingProduct?.name} placeholder="Nome do Produto Local" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-orange-50 border-2 border-transparent transition-all" />
              <div className="grid grid-cols-2 gap-5">
                <input required name="price" type="number" step="0.01" defaultValue={editingProduct?.price} placeholder="Preço em R$" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-orange-50 border-2 border-transparent transition-all" />
                <input required name="stock" type="number" defaultValue={editingProduct?.stock} placeholder="Quantidade" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-orange-50 border-2 border-transparent transition-all" />
              </div>
              <textarea required name="description" defaultValue={editingProduct?.description} placeholder="Descreva as características principais..." className="w-full p-5 bg-gray-50 rounded-2xl outline-none h-24 font-semibold resize-none text-black focus:ring-4 focus:ring-orange-50 border-2 border-transparent transition-all" />

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-[0.3em] flex items-center gap-2">
                  <ImageIcon size={14} className="text-orange-500" /> Fotos do Produto (Máx 5)
                </label>
                <MultiImageInput key={editingProduct?.id || 'new-prod'} max={5} onImagesChange={setUploadedImages} initialImages={editingProduct?.images || []} showError={showError} />
              </div>

              <button type="submit" className="w-full py-6 bg-orange-500 text-white font-black rounded-3xl shadow-2xl mt-6 active:scale-95 uppercase tracking-[0.4em] text-[10px]">Concluir Cadastro</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Loja (Exclusivo DEV) */}
      {showStoreModal && user?.role === 'DEV' && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in duration-500 overflow-y-auto max-h-[90vh] no-scrollbar">
            <button onClick={() => setShowStoreModal(false)} className="absolute top-10 right-10 p-4 bg-gray-50 text-gray-400 hover:text-red-500 rounded-[1.5rem] transition-all">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black mb-10 text-black flex items-center gap-3 tracking-tighter uppercase">
              <StoreIcon className="text-orange-500" /> {editingStore ? 'Ajustar Cadastro Master' : 'Novo Estabelecimento Master'}
            </h3>
            <form onSubmit={handleSaveStoreByDev} className="space-y-5 pb-4">
              <input required name="name" defaultValue={editingStore?.name} placeholder="Nome Fantasia Local" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-orange-100 border-2 border-transparent transition-all" />
              <input required name="category" defaultValue={editingStore?.category} placeholder="Nicho de Atuação" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-orange-100 border-2 border-transparent transition-all" />
              <div className="grid grid-cols-2 gap-5">
                <input required name="whatsapp" defaultValue={editingStore?.whatsapp} placeholder="WhatsApp Comercial" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-orange-100 border-2 border-transparent transition-all" />
                <input name="cnpj" defaultValue={editingStore?.cnpj} placeholder="Registro Fiscal (CNPJ)" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-orange-100 border-2 border-transparent transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-orange-500 uppercase ml-4 tracking-[0.3em]">Taxa de Entrega Padrão (R$)</label>
                <input name="deliveryFee" type="number" step="0.50" defaultValue={editingStore?.deliveryFee || 0} className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-orange-100 border-2 border-transparent transition-all shadow-inner" />
              </div>
              <input required name="email" type="email" defaultValue={editingStore?.email} placeholder="E-mail de Suporte" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-orange-100 border-2 border-transparent transition-all" />
              <textarea required name="address" defaultValue={editingStore?.address} placeholder="Localização Geográfica em Frutal" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black h-20 resize-none focus:ring-4 focus:ring-orange-100 border-2 border-transparent transition-all" />

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-[0.3em] flex items-center gap-2">
                  <ImageIcon size={14} className="text-orange-500" /> Fotos do Estabelecimento (Máx 5)
                </label>
                <MultiImageInput key={editingStore?.id || 'new-store-dev'} max={5} onImagesChange={setUploadedImages} initialImages={editingStore?.images || []} showError={showError} />
              </div>

              <button type="submit" className="w-full py-6 bg-green-600 text-white font-black rounded-3xl shadow-2xl mt-6 hover:bg-green-700 transition-all uppercase tracking-[0.4em] text-[10px]">Efetivar Registro</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Serviço (DEV) */}
      {showServiceModal && user?.role === 'DEV' && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in duration-500 overflow-y-auto max-h-[90vh] no-scrollbar">
            <button onClick={() => setShowServiceModal(false)} className="absolute top-10 right-10 p-4 bg-gray-50 text-gray-400 hover:text-red-500 rounded-[1.5rem] transition-all">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black mb-10 text-black flex items-center gap-3 tracking-tighter uppercase">
              <Hammer className="text-blue-500" /> {editingService ? 'Ajustar Prestador Master' : 'Novo Prestador de Frutal'}
            </h3>
            <form onSubmit={handleSaveService} className="space-y-5 pb-4">
              <input required name="name" defaultValue={editingService?.name} placeholder="Nome do Especialista / Equipe" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-blue-100 border-2 border-transparent transition-all shadow-inner" />
              <input required name="type" defaultValue={editingService?.type} placeholder="Tipo de Serviço Prestado" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-blue-100 border-2 border-transparent transition-all shadow-inner" />
              <input required name="whatsapp" defaultValue={editingService?.whatsapp} placeholder="WhatsApp para Orçamentos" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-blue-100 border-2 border-transparent transition-all shadow-inner" />
              <input required name="email" type="email" defaultValue={editingService?.email} placeholder="E-mail de Login do Prestador" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-blue-100 border-2 border-transparent transition-all shadow-inner" />
              <textarea required name="description" defaultValue={editingService?.description} placeholder="Apresentação e especialidades..." className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black h-24 resize-none focus:ring-4 focus:ring-blue-100 border-2 border-transparent transition-all shadow-inner" />
              <input name="priceEstimate" defaultValue={editingService?.priceEstimate} placeholder="Estimativa de Custo Base" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-blue-100 border-2 border-transparent transition-all shadow-inner" />
              <input name="address" defaultValue={editingService?.address} placeholder="Região Atendida" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-blue-100 border-2 border-transparent transition-all shadow-inner" />

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-[0.3em] flex items-center gap-2">
                  <ImageIcon size={14} className="text-orange-500" /> Fotos do Serviço (Máx 5)
                </label>
                <MultiImageInput key={editingService?.id || 'new-service-dev'} max={5} onImagesChange={setUploadedImages} initialImages={editingService?.images || []} showError={showError} />
              </div>

              <button type="submit" className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl shadow-2xl mt-6 hover:bg-blue-700 transition-all uppercase tracking-[0.4em] text-[10px]">Incluir na Base</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Support components for image handling
function ProfileItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3 text-gray-500 text-[10px] font-black uppercase tracking-widest">
        {icon} <span>{label}:</span>
      </div>
      <span className="font-bold text-xs text-black truncate max-w-[200px]">{value}</span>
    </div>
  );
}

interface TabBtnProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function TabBtn({ active, icon, label, onClick }: TabBtnProps) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${active ? 'bg-white shadow-xl shadow-gray-200 text-green-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>{icon} {label}</button>
  );
}

interface OrderColProps {
  title: string;
  list: Order[];
  color: string;
  onSelectOrder: (o: Order) => void;
}

function OrderCol({ title, list, color, onSelectOrder }: OrderColProps) {
  return (
    <div className="space-y-6">
      <div className={`px-6 py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] text-${color}-600 bg-${color}-50 border border-${color}-100 shadow-sm`}>
        {title} ({list.length})
      </div>
      <div className="space-y-4">
        {list.map((o: Order) => (
          <div
            key={o.id}
            onClick={() => onSelectOrder(o)}
            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer active:scale-95"
          >
            <div className="flex justify-between items-start mb-4">
              <h5 className="font-black text-sm text-slate-900 leading-tight uppercase tracking-tighter group-hover:text-blue-600 transition-colors">{o.customerName}</h5>
              <Clock size={14} className="text-slate-300" />
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mb-2">
                {o.deliveryMethod === 'ENTREGA' ? <Truck size={12} /> : <Building2 size={12} />}
                <span className="uppercase tracking-widest">{o.deliveryMethod}</span>
              </div>
              {o.items.map((item: { name: string; quantity: number }, i: number) => (
                <div key={i} className="text-[10px] text-slate-400 font-medium">
                  {item.quantity}x {item.name}
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">R$ {(o.total + (o.deliveryFee || 0)).toFixed(2)}</span>
              <div className="px-3 py-1.5 bg-gray-50 rounded-xl text-[9px] font-black text-blue-500 uppercase tracking-widest group-hover:bg-blue-50">Visualizar</div>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="py-16 text-center text-gray-300 text-[10px] font-black uppercase tracking-[0.4em] border-2 border-dashed rounded-[3rem] border-gray-100 opacity-60">Sem pedidos</div>}
      </div>
    </div>
  );
}

interface ImageInputProps {
  onImage: (img: string) => void;
  initial: string | null | undefined;
  showError?: (msg: string) => void;
}

function ImageInput({ onImage, initial, showError }: ImageInputProps) {
  const [prev, setPrev] = useState(initial);

  useEffect(() => {
    setPrev(initial);
  }, [initial]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (2MB = 2 * 1024 * 1024 bytes)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        showError?.(`Imagem muito grande! Tamanho máximo: 2MB. Sua imagem: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        e.target.value = ''; // Clear input
        return;
      }

      // Validate file format
      const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedFormats.includes(file.type)) {
        showError?.('Formato inválido! Use apenas JPG, PNG ou WebP.');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result as string;
        setPrev(b64);
        onImage(b64);
      };
      reader.readAsDataURL(file as Blob);
    }
  };
  return (
    <div className="flex gap-6 items-center bg-blue-50/30 p-6 rounded-[2.5rem] border-2 border-dashed border-blue-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group shadow-sm">
      {prev && <img src={prev} className="w-20 h-20 rounded-3xl object-cover shadow-2xl border-4 border-white group-hover:rotate-3 transition-transform shrink-0" />}
      <label className="flex-1 cursor-pointer">
        <div className="w-full py-5 text-blue-600/70 text-[10px] font-black uppercase tracking-[0.3em] flex flex-col items-center justify-center group-hover:text-blue-600 transition-all">
          <PlusCircle size={32} className="mb-3 text-blue-500 group-hover:scale-110 transition-transform" /> {prev ? 'Alterar Imagem da Loja' : 'Adicionar Foto da Loja'}
        </div>
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
    </div>
  );
}

function MultiImageInput({ max, onImagesChange, initialImages, key, showError }: { max: number, onImagesChange: (imgs: string[]) => void, initialImages: string[], key?: any, showError?: (msg: string) => void }) {
  const [images, setImages] = useState<string[]>(initialImages);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const remaining = max - images.length;
    const toProcess = files.slice(0, remaining);

    // Validate each file
    for (const file of toProcess) {
      // Validate file size (2MB max)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        showError?.(`Imagem "${file.name}" muito grande! M\u00e1ximo: 2MB. Tamanho: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        e.target.value = '';
        return;
      }

      // Validate file format
      const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedFormats.includes(file.type)) {
        showError?.(`Formato inv\u00e1lido em "${file.name}"! Use apenas JPG, PNG ou WebP.`);
        e.target.value = '';
        return;
      }
    }

    toProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result as string;
        setImages(prev => {
          const updated = [...prev, b64];
          onImagesChange(updated);
          return updated;
        });
      };
      reader.readAsDataURL(file as Blob);
    });
    e.target.value = ''; // Clear input after processing
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onImagesChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        {images.map((img, idx) => (
          <div key={idx} className="relative group aspect-square">
            <img src={img} className="w-full h-full object-cover rounded-xl border border-gray-200" />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {images.length < max && (
          <label className="aspect-square bg-orange-50 border-2 border-dashed border-orange-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-100/50 transition-all group">
            <Plus size={28} className="text-orange-400 group-hover:scale-110 transition-transform" />
            <span className="text-[8px] font-black text-orange-400 uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Incluir</span>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        )}
      </div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">
        {images.length} de {max} fotos adicionadas
      </p>
    </div>
  );
}
