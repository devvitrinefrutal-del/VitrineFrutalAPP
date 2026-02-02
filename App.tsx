import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { User, Store, Service, CulturalItem, Product, StoreRating } from './types';
import { useToast } from './src/hooks/useToast';
import { useAuth } from './src/hooks/useAuth';
import { useData } from './src/hooks/useData';
import { useCart } from './src/hooks/useCart';
import { useAdminActions } from './src/hooks/useAdminActions';
import { useCheckout } from './src/hooks/useCheckout';

// Components
import { Toast } from './src/components/ui/Toast';
import { Header } from './src/components/layout/Header';
import { BottomNav } from './src/components/layout/BottomNav';
import { PartyPopper, CheckCircle } from 'lucide-react';

// Pages
import { VitrinePage } from './src/pages/VitrinePage';
import { StoreDetailsPage } from './src/pages/StoreDetailsPage';
import { ServicesPage } from './src/pages/ServicesPage';
import { CulturalPage } from './src/pages/CulturalPage';
import { CulturalDetailPage } from './src/pages/CulturalDetailPage';
import { CheckoutPage } from './src/pages/CheckoutPage';
import { DashboardPage } from './src/pages/DashboardPage';
import { AuthPage } from './src/pages/AuthPage';
import { ServiceDetailsPage } from './src/pages/ServiceDetailsPage';

// --- Route Wrappers ---

const StoreDetailsRoute = ({
  stores,
  products,
  allRatings,
  onAddToCart,
  fetchStoreProducts
}: {
  stores: Store[],
  products: Product[],
  allRatings: StoreRating[],
  onAddToCart: (p: Product) => void,
  fetchStoreProducts: (id: string) => void
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = stores.find(s => s.id === id);

  useEffect(() => {
    if (id) fetchStoreProducts(id);
  }, [id, fetchStoreProducts]);

  if (!store && stores.length > 0) return <Navigate to="/" replace />;
  if (!store) return null;

  return (
    <StoreDetailsPage
      store={store}
      products={products.filter(p => p.storeId === store.id)}
      allRatings={allRatings}
      onBack={() => navigate('/')}
      onAddToCart={onAddToCart}
    />
  );
};

const CulturalDetailRoute = ({
  items
}: {
  items: CulturalItem[]
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = items.find(i => i.id === id);

  if (!item && items.length > 0) return <Navigate to="/cultural" replace />;
  if (!item) return null;

  return (
    <CulturalDetailPage
      item={item}
      onBack={() => navigate('/cultural')}
    />
  );
};

const ServiceDetailsRoute = ({
  services
}: {
  services: Service[]
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const service = services.find(s => s.id === id);

  if (!service && services.length > 0) return <Navigate to="/servicos" replace />;
  if (!service) return null;

  return (
    <ServiceDetailsPage
      service={service}
      onBack={() => navigate('/servicos')}
    />
  );
};

// --- Main App ---

function App() {
  const navigate = useNavigate();
  const location = useLocation();

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

  // Derived State
  const currentStore = data.stores.find(s => s.ownerId === currentUser?.id) || null;

  // Determine Active Tab for Header
  const getActiveTab = (path: string) => {
    if (path === '/') return 'VITRINE';
    if (path.startsWith('/loja/')) return 'VITRINE';
    if (path.startsWith('/servicos')) return 'SERVICOS';
    if (path.startsWith('/cultural')) return 'CULTURAL';
    if (path === '/checkout') return 'CHECKOUT';
    if (path.startsWith('/dashboard')) return 'DASHBOARD';
    return 'VITRINE';
  };

  const activeTab = getActiveTab(location.pathname);

  // Actions
  const adminActions = useAdminActions(
    {
      setStores: data.setStores,
      setProducts: data.setProducts,
      setServices: data.setServices,
      setCulturalItems: data.setCulturalItems,
      setOrders: data.setOrders,
      setCurrentUser: () => { }
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

  const handleHeaderNavigate = (tab: string) => {
    switch (tab) {
      case 'VITRINE': navigate('/'); break;
      case 'SERVICOS': navigate('/servicos'); break;
      case 'CULTURAL': navigate('/cultural'); break;
      case 'CHECKOUT': navigate('/checkout'); break;
      case 'DASHBOARD': navigate('/dashboard'); break;
      case 'MY_ORDERS': navigate('/dashboard/meus-pedidos'); break;
      default: navigate('/');
    }
    window.scrollTo(0, 0);
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-gray-900 selection:bg-orange-100 selection:text-orange-900 pb-24 md:pb-8">

      <Header
        activeTab={activeTab}
        onTabChange={handleHeaderNavigate}
        user={currentUser}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        onAuth={(mode) => setShowAuthModal(true)}
        onLogout={logout}
        connectionError={data.connectionError}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 pt-28">
        {data.loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-pulse">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Carregando Vitrine...</p>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={
              <VitrinePage
                stores={data.stores}
                products={data.products}
                allRatings={data.ratings}
                onSelectStore={(store) => { navigate(`/loja/${store.id}`); window.scrollTo(0, 0); }}
                onAddToCart={handleAddToCart}
                searchGlobal={data.searchGlobal}
              />
            } />

            <Route path="/loja/:id" element={
              <StoreDetailsRoute
                stores={data.stores}
                products={data.products}
                allRatings={data.ratings}
                onAddToCart={handleAddToCart}
                fetchStoreProducts={data.fetchStoreProducts}
              />
            } />

            <Route path="/servicos" element={
              <ServicesPage
                services={data.services}
                onSelectService={(service) => { navigate(`/servicos/${service.id}`); window.scrollTo(0, 0); }}
              />
            } />

            <Route path="/servicos/:id" element={
              <ServiceDetailsRoute services={data.services} />
            } />

            <Route path="/cultural" element={
              <CulturalPage
                items={data.culturalItems}
                onSelectItem={(item) => { navigate(`/cultural/${item.id}`); window.scrollTo(0, 0); }}
              />
            } />

            <Route path="/cultural/:id" element={
              <CulturalDetailRoute items={data.culturalItems} />
            } />

            <Route path="/checkout" element={
              <CheckoutPage
                cart={cart}
                user={currentUser}
                store={cart.length > 0 ? data.stores.find(s => s.id === cart[0].storeId) || null : null}
                onUpdateQuantity={updateQuantity}
                onRemoveFromCart={removeFromCart}
                onClearCart={clearCart}
                onBack={() => navigate('/')}
                onFinalize={handleFinalizePurchase as any}
                isFinishing={isFinishing}
              />
            } />

            <Route path="/dashboard" element={
              currentUser ? (
                <DashboardPage
                  user={currentUser}
                  currentStore={currentStore}
                  products={data.products}
                  services={data.services}
                  culturalItems={data.culturalItems}
                  orders={data.orders}
                  activeTab="DASHBOARD"
                  onLogout={logout}
                  actions={adminActions}
                  showError={showError}
                  stores={data.stores}
                  fetchStoreProducts={data.fetchStoreProducts}
                />
              ) : <Navigate to="/" />
            } />

            <Route path="/dashboard/produtos" element={
              currentUser ? <DashboardPage user={currentUser} currentStore={currentStore} products={data.products} services={data.services} culturalItems={data.culturalItems} orders={data.orders} activeTab="PRODUCTS" onLogout={logout} actions={adminActions} showError={showError} stores={data.stores} fetchStoreProducts={data.fetchStoreProducts} /> : <Navigate to="/" />
            } />

            <Route path="/dashboard/meus-pedidos" element={
              currentUser ? <DashboardPage user={currentUser} currentStore={currentStore} products={data.products} services={data.services} culturalItems={data.culturalItems} orders={data.orders} activeTab="MY_ORDERS" onLogout={logout} actions={adminActions} showError={showError} stores={data.stores} fetchStoreProducts={data.fetchStoreProducts} /> : <Navigate to="/" />
            } />

            <Route path="*" element={<Navigate to="/" />} />

          </Routes>
        )}
      </main>

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
                onClick={() => { setShowOrderSuccess(false); navigate('/'); }}
                className="w-full py-4 bg-gray-50 text-gray-600 font-black rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-widest text-xs"
              >
                Ver Outras Lojas
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      <BottomNav
        activeTab={activeTab}
        onTabChange={handleHeaderNavigate}
        user={currentUser}
      />
    </div>
  );
}

export default App;
