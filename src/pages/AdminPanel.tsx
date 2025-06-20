
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductManager from '@/components/ProductManager';
import OrderManager from '@/components/OrderManager';
import UserManager from '@/components/UserManager';
import ReviewManager from '@/components/ReviewManager';
import UpdateManager from '@/components/UpdateManager';
import DiscordManager from '@/components/DiscordManager';
import RootPanel from '@/components/RootPanel';
import TermsEditor from '@/components/TermsEditor';
import AccessControl from '@/components/AccessControl';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import ActionLog from '@/components/ActionLog';
import TicketManager from '@/components/TicketManager';
import EmailComposer from '@/components/EmailComposer';

const AdminPanel = () => {
  const { user, updateUserRole, adminChangePassword, adminChangeUserInfo, banUser, deleteUser, getAllUsers } = useAuth();
  const navigate = useNavigate();
  
  // Access control
  const [isAccessGranted, setIsAccessGranted] = useState(false);
  
  // State variables
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    if (!user || (user.role !== 'owner' && user.role !== 'developer' && user.role !== 'manager' && user.role !== 'root')) {
      navigate('/');
      return;
    }

    // Load data
    const storedProducts = JSON.parse(localStorage.getItem('botforge_products') || '[]');
    const storedOrders = JSON.parse(localStorage.getItem('botforge_orders') || '[]');
    const storedUsers = getAllUsers();
    const storedReviews = JSON.parse(localStorage.getItem('botforge_reviews') || '[]');
    const storedUpdates = JSON.parse(localStorage.getItem('botforge_updates') || '[]');
    
    setProducts(storedProducts);
    setOrders(storedOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
    setUsers(storedUsers);
    setReviews(storedReviews.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
    setUpdates(storedUpdates.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  }, [user, navigate, getAllUsers]);

  if (!user || (user.role !== 'owner' && user.role !== 'developer' && user.role !== 'manager' && user.role !== 'root')) {
    return null;
  }

  if (!isAccessGranted) {
    return <AccessControl onAccessGranted={() => setIsAccessGranted(true)} />;
  }

  const isOwner = user.role === 'owner';
  const isRoot = user.role === 'root';
  const isDeveloper = user.role === 'developer';
  const isManager = user.role === 'manager';

  const tabsConfig = () => {
    if (user.role === 'root') {
      return ["products", "pending-orders", "orders", "users", "reviews", "updates", "tickets", "emails", "discord", "tos", "qr-generator", "action-log", "root-panel"];
    } else if (user.role === 'owner') {
      return ["products", "pending-orders", "orders", "users", "reviews", "updates", "tickets", "emails", "discord", "tos", "qr-generator"];
    } else if (user.role === 'manager') {
      return ["products", "orders", "users", "reviews", "tickets", "emails", "qr-generator"];
    } else if (user.role === 'developer') {
      return ["orders", "updates", "tickets"];
    }
    return [];
  };

  const tabs = tabsConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4">
              {isRoot ? 'Root Panel' : isOwner ? 'Admin Panel' : isManager ? 'Manager Panel' : 'Developer Panel'}
            </h1>
            <p className="text-blue-300 text-xl max-w-2xl mx-auto">
              {isRoot ? 'Full system control and management' : 
               isOwner ? 'Manage products, orders, users, reviews, tickets, emails, and updates' : 
               isManager ? 'Manage products, orders, users, reviews, tickets, and emails' :
               'Manage orders, updates, and tickets'}
            </p>
          </div>

          <Tabs defaultValue={tabs[0]} className="space-y-8">
            <TabsList className="grid w-full grid-cols-12 bg-gray-800/50 backdrop-blur-sm border border-blue-500/20 shadow-xl p-1">
              {tabs.includes("products") && <TabsTrigger value="products" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">Products</TabsTrigger>}
              {tabs.includes("pending-orders") && <TabsTrigger value="pending-orders" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">Pending</TabsTrigger>}
              {tabs.includes("orders") && <TabsTrigger value="orders" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">Orders</TabsTrigger>}
              {tabs.includes("users") && <TabsTrigger value="users" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">Users</TabsTrigger>}
              {tabs.includes("reviews") && <TabsTrigger value="reviews" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">Reviews</TabsTrigger>}
              {tabs.includes("updates") && <TabsTrigger value="updates" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">Updates</TabsTrigger>}
              {tabs.includes("tickets") && <TabsTrigger value="tickets" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">Tickets</TabsTrigger>}
              {tabs.includes("emails") && <TabsTrigger value="emails" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">Emails</TabsTrigger>}
              {tabs.includes("discord") && <TabsTrigger value="discord" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">Discord</TabsTrigger>}
              {tabs.includes("tos") && <TabsTrigger value="tos" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">ToS</TabsTrigger>}
              {tabs.includes("qr-generator") && <TabsTrigger value="qr-generator" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">QR</TabsTrigger>}
              {tabs.includes("action-log") && <TabsTrigger value="action-log" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">Logs</TabsTrigger>}
              {tabs.includes("root-panel") && <TabsTrigger value="root-panel" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">Root</TabsTrigger>}
            </TabsList>

            {tabs.includes("products") && (
              <TabsContent value="products">
                <ProductManager 
                  products={products} 
                  setProducts={setProducts} 
                  userRole={user.role}
                />
              </TabsContent>
            )}

            {tabs.includes("pending-orders") && (
              <TabsContent value="pending-orders">
                <OrderManager 
                  orders={orders} 
                  setOrders={setOrders} 
                  user={user}
                  showPending={true}
                />
              </TabsContent>
            )}

            {tabs.includes("orders") && (
              <TabsContent value="orders">
                <OrderManager 
                  orders={orders} 
                  setOrders={setOrders} 
                  user={user}
                  showPending={false}
                />
              </TabsContent>
            )}

            {tabs.includes("users") && (
              <TabsContent value="users">
                <UserManager 
                  users={users}
                  setUsers={setUsers}
                  user={user}
                  updateUserRole={updateUserRole}
                  adminChangeUserInfo={adminChangeUserInfo}
                  adminChangePassword={adminChangePassword}
                  getAllUsers={getAllUsers}
                />
              </TabsContent>
            )}

            {tabs.includes("reviews") && (
              <TabsContent value="reviews">
                <ReviewManager 
                  reviews={reviews} 
                  setReviews={setReviews} 
                  userRole={user.role}
                />
              </TabsContent>
            )}

            {tabs.includes("updates") && (
              <TabsContent value="updates">
                <UpdateManager 
                  updates={updates} 
                  setUpdates={setUpdates} 
                  userRole={user.role}
                />
              </TabsContent>
            )}

            {tabs.includes("tickets") && (
              <TabsContent value="tickets">
                <TicketManager />
              </TabsContent>
            )}

            {tabs.includes("emails") && (
              <TabsContent value="emails">
                <EmailComposer />
              </TabsContent>
            )}

            {tabs.includes("discord") && (
              <TabsContent value="discord">
                <DiscordManager />
              </TabsContent>
            )}

            {tabs.includes("tos") && (
              <TabsContent value="tos">
                <TermsEditor />
              </TabsContent>
            )}

            {tabs.includes("qr-generator") && (
              <TabsContent value="qr-generator">
                <QRCodeGenerator />
              </TabsContent>
            )}

            {tabs.includes("action-log") && user.role === 'root' && (
              <TabsContent value="action-log">
                <ActionLog />
              </TabsContent>
            )}

            {tabs.includes("root-panel") && user.role === 'root' && (
              <TabsContent value="root-panel">
                <RootPanel 
                  users={users}
                  setUsers={setUsers}
                  banUser={banUser}
                  deleteUser={deleteUser}
                  getAllUsers={getAllUsers}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
