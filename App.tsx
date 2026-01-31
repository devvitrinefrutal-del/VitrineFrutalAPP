import React, { useState, useEffect } from 'react';
import { User, Store, Service, CulturalItem, Product } from './types';
import { useToast } from './hooks/useToast';
import { useAuth } from './hooks/useAuth';
import { useData } from './hooks/useData';
import { useCart } from './hooks/useCart';
import { useAdminActions } from './hooks/useAdminActions';
import { useCheckout } from './hooks/useCheckout';

// Components
import { Toast } from './components/ui/Toast';
import { Header } from './components/layout/Header';
import { PartyPopper, CheckCircle } from 'lucide-react';

// Pages
import { VitrinePage } from './pages/VitrinePage';
import { StoreDetailsPage } from './pages/StoreDetailsPage';
import { ServicesPage } from './pages/ServicesPage';
import { CulturalPage } from './pages/CulturalPage';
import { CulturalDetailPage } from './pages/CulturalDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';

function App() {
  // --- Hooks & State ---
  const { toast, showSuccess, showError, closeToast } = useToast();
  const {
    currentUser,
    showAuthModal,
    setShowAuthModal,
    login,
    logout,
    register
  } = useAuth(showSuccess, showError);

  const data = useData(showError);
  const {
    cart,
    addToCart: originalAddToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    total: cartTotal
  } = useCart();

  const [activeTab, setActiveTab] = useState('VITRINE');

  // Navigation State
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null); // For future detail view if needed
  const [selectedCulturalItem, setSelectedCulturalItem] = useState<CulturalItem | null>(null);

  // Derived State
  const currentStore = data.stores.find(s => s.ownerId === currentUser?.id) || null;

  // Actions
  const adminActions = useAdminActions(
    {
      setStores: data.setStores,
      setProducts: data.setProducts,
      setServices: data.setServices,
      setCulturalItems: data.setCulturalItems,
      setOrders: data.setOrders,
      setCurrentUser: () => { } // useAuth manages this, but useAdminActions updates profile... which enters useAuth state via listening or optimistic? 
      // Actually useAdminActions updates DB. useAuth listens. But optimistic update on currentUser is useful. 
      // I'll skip purely optimistic currentUser update in adminActions for now or pass a dummy if not critical, 
      // but useAuth handles profile updates well.
      // Wait, useAdminActions expects setCurrentUser. I'll simply reload page or rely on listener?
      // I'll modify useAdminActions signature slightly in my mind or just pass a no-op if I rely on listener.
      // Actually, let's keep it safe. I can't easily pass 'setCurrentUser' from useAuth as it doesn't expose setter.
      // 'useAuth' exposes 'currentUser' but not 'setCurrentUser'.
      // Ideally useAuth should expose a way to refresh or update local state.
      // For now, I'll pass a no-op and rely on Supabase listener in useAuth to pick up changes.
    } as any,
    currentUser,
    showSuccess,
    showError
  );

  const {
    handleFinalizePurchase,
    isFinishing,
    showOrderSuccess,
    setShowOrderSuccess
  } = useCheckout(cart, currentUser, clearCart, data.products, data.setProducts, showSuccess, showError);

  // --- Handlers ---

  const handleAddToCart = (product: Product) => {
    // Check if adding from different store
    if (cart.length > 0 && cart[0].storeId !== product.storeId) {
      if (confirm('Você tem itens de outra loja no carrinho. Deseja limpar a sacola e iniciar uma nova compra nesta loja?')) {
        clearCart();
        originalAddToCart(product);
        showSuccess('Sacola renovada com sucesso!');
      }
    } else {
      originalAddToCart(product);
      showSuccess('Produto adicionado à sacola!');
    }
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo(0, 0);
    // Reset selections when switching main tabs
    if (!['VITRINE'].includes(tab)) setSelectedStore(null);
    if (!['CULTURAL'].includes(tab)) setSelectedCulturalItem(null);
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-gray-900 selection:bg-orange-100 selection:text-orange-900 pb-20 md:pb-0">

      <Header
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        user={currentUser}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        onAuthClick={() => setShowAuthModal(true)}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 pt-28">
        {data.loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-pulse">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Carregando Vitrine...</p>
          </div>
        ) : (
          <>
            {/* VITRINE & STORE DETAILS */}
            {activeTab === 'VITRINE' && (
              selectedStore ? (
                <StoreDetailsPage
                  store={selectedStore}
                  products={data.products.filter(p => p.storeId === selectedStore.id)}
                  allRatings={data.ratings}
                  onBack={() => setSelectedStore(null)}
                  onAddToCart={handleAddToCart}
                />
              ) : (
                <VitrinePage
                  stores={data.stores}
                  products={data.products}
                  allRatings={data.ratings}
                  onSelectStore={(store) => { setSelectedStore(store); window.scrollTo(0, 0); }}
                  onAddToCart={handleAddToCart}
                />
              )
            )}

            {/* SERVICES */}
            {activeTab === 'SERVICOS' && (
              <ServicesPage
                services={data.services}
                onSelectService={(s) => setSelectedService(s)} // Just keeping state, maybe open modal? Details view not implemented yet in Pages, but ServiceCard expands?
              // Original App said "Ver Detalhes". Maybe just expand card or show modal?
              // For now, ServicesPage just lists. I'll leave it as list.
              />
            )}

            {/* CULTURAL */}
            {activeTab === 'CULTURAL' && (
              selectedCulturalItem ? (
                <CulturalDetailPage
                  item={selectedCulturalItem}
                  onBack={() => setSelectedCulturalItem(null)}
                />
              ) : (
                <CulturalPage
                  items={data.culturalItems}
                  onSelectItem={(item) => { setSelectedCulturalItem(item); window.scrollTo(0, 0); }}
                />
              )
            )}

            {/* CHECKOUT */}
            {activeTab === 'CHECKOUT' && (
              <CheckoutPage
                cart={cart}
                user={currentUser}
                store={cart.length > 0 ? data.stores.find(s => s.id === cart[0].storeId) || null : null}
                onUpdateQuantity={updateQuantity}
                onRemoveFromCart={removeFromCart}
                onBack={() => handleNavigate('VITRINE')}
                onFinalize={handleFinalizePurchase as any}
                isFinishing={isFinishing}
              />
            )}

            {/* DASHBOARD (Includes MY_ORDERS, PRODUCTS, STOCK via sub-routing logic in component) */}
            {['DASHBOARD', 'MY_ORDERS', 'PRODUCTS', 'STOCK'].includes(activeTab) && currentUser && (
              <DashboardPage
                user={currentUser}
                currentStore={currentStore}
                products={data.products}
                services={data.services}
                culturalItems={data.culturalItems}
                orders={data.orders}
                activeTab={activeTab}
                onLogout={logout}
                actions={adminActions}
                showError={showError}
                stores={data.stores}
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}

      {showAuthModal && (
        <AuthPage
          onLogin={login}
          onRegister={register}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {showOrderSuccess && (
        <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 text-center shadow-2xl animate-in zoom-in duration-300 relative">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
              <PartyPopper size={48} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Compra Realizada!</h2>
            <p className="text-gray-500 font-medium mb-8">
              Obrigado por apoiar o comércio local de Frutal. O pedido foi enviado via WhatsApp para a loja parceira.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowOrderSuccess(false)}
                className="w-full py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
              >
                <CheckCircle size={20} /> Concluído
              </button>
              <button
                onClick={() => { setShowOrderSuccess(false); handleNavigate('VITRINE'); }}
                className="w-full py-4 bg-gray-50 text-gray-600 font-black rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-widest text-xs"
              >
                Ver Outras Lojas
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
}

export default App;
