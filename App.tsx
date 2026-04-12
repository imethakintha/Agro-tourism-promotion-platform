import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './src/components/layout/AdminLayout';
import Home from './pages/Home';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import Contact from './src/pages/Contact';
import EmailVerification from './src/pages/EmailVerification';
import Profile from './src/pages/Profile';
import ProtectedRoute from './src/components/ProtectedRoute';
import { AuthProvider } from './src/context/AuthContext';
import { ChatProvider } from './src/context/ChatContext';
import ForgotPassword from './src/pages/ForgotPassword';
import ResetPassword from './src/pages/ResetPassword';

import HowItWorks from './src/pages/static/HowItWorks';
import AboutUs from './src/pages/static/AboutUs';
import TermsOfService from './src/pages/static/TermsOfService';

import FarmRegistration from './src/pages/provider/FarmRegistration';
import GuideRegistration from './src/pages/provider/GuideRegistration';
import TransportRegistration from './src/pages/provider/TransportRegistration';
import ActivityList from './src/pages/farmer/ActivityList';
import ActivityForm from './src/pages/farmer/ActivityForm';
import FarmerBookings from './src/pages/farmer/FarmerBookings';
import GuideDashboard from './src/pages/provider/GuideDashboard';
import TransportDashboard from './src/pages/provider/TransportDashboard';
import EarningsDashboard from './src/pages/provider/EarningsDashboard';
import FarmProfile from './src/pages/tourist/FarmProfile';

import SearchResults from './src/pages/tourist/SearchResults';
import TripWizard from './src/pages/tourist/TripWizard';
import TripResult from './src/pages/tourist/TripResult';
import ActivityDetail from './src/pages/tourist/ActivityDetail';
import FavoritesPage from './src/pages/tourist/FavoritesPage';
import MyBookings from './src/pages/tourist/MyBookings';
import PaymentSuccess from './src/pages/tourist/PaymentSuccess';
import PaymentHistory from './src/pages/tourist/PaymentHistory';
import SupportTickets from './src/pages/tourist/SupportTickets';
import TicketDetail from './src/pages/tourist/TicketDetail';

import PlantIdentifier from './src/pages/ai/PlantIdentifier';
import AgroWisdomHub from './src/pages/ai/AgroWisdomHub';

import AdminDashboard from './src/pages/admin/AdminDashboard';
import VerificationQueue from './src/pages/admin/VerificationQueue';
import CategoryManagement from './src/pages/admin/CategoryManagement';
import PayoutManagement from './src/pages/admin/PayoutManagement';
import ReviewModeration from './src/pages/admin/ReviewModeration';
import FeedbackManagement from './src/pages/admin/FeedbackManagement';
import UserManagement from './src/pages/admin/UserManagement';
import ReportsPage from './src/pages/admin/ReportsPage';
import AuditLogs from './src/pages/admin/AuditLogs';
import SystemHealth from './src/pages/admin/SystemHealth';
import SupportManager from './src/pages/admin/SupportManager';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotFound = () => <div className="p-10 text-center text-red-500 font-bold">404 - Page Not Found</div>;

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="how-it-works" element={<HowItWorks />} />
              <Route path="about" element={<AboutUs />} />
              <Route path="terms" element={<TermsOfService />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="contact" element={<Contact />} />
              <Route path="verify-email/:token" element={<EmailVerification />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password/:token" element={<ResetPassword />} />

              <Route path="activities" element={<SearchResults />} />
              <Route path="activities/:id" element={<ActivityDetail />} />
              <Route path="activities/edit/:id" element={<ActivityForm />} />
              <Route path="farms/:id" element={<FarmProfile />} />

              <Route path="trip-wizard" element={<TripWizard />} />
              <Route path="trip-result" element={<TripResult />} />

              <Route element={<ProtectedRoute />}>
                <Route path="profile" element={<Profile />} />
                <Route path="farm-assistant" element={<PlantIdentifier />} />
                <Route path="wisdom-hub" element={<AgroWisdomHub />} />

                <Route path="favorites" element={<FavoritesPage />} />
                <Route path="my-bookings" element={<MyBookings />} />
                <Route path="payment/success" element={<PaymentSuccess />} />
                <Route path="payment/history" element={<PaymentHistory />} />
                <Route path="support/tickets" element={<SupportTickets />} />
                <Route path="support/ticket/:id" element={<TicketDetail />} />

                <Route path="register/farm" element={<FarmRegistration />} />
                <Route path="register/guide" element={<GuideRegistration />} />
                <Route path="register/transport" element={<TransportRegistration />} />

                <Route path="dashboard" element={<ActivityList />} />
                <Route path="dashboard/bookings" element={<FarmerBookings />} />
                <Route path="farmer/activities/create" element={<ActivityForm />} />
                <Route path="activities/edit/:id" element={<ActivityForm />} />
                <Route path="/farmer/activities" element={<ActivityList />} />

                <Route path="dashboard/guide" element={<GuideDashboard />} />
                <Route path="dashboard/transport" element={<TransportDashboard />} />
                <Route path="earnings" element={<EarningsDashboard />} />

                <Route path="admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="verifications" element={<VerificationQueue />} />
                  <Route path="categories" element={<CategoryManagement />} />
                  <Route path="payouts" element={<PayoutManagement />} />
                  <Route path="reviews" element={<ReviewModeration />} />
                  <Route path="feedback" element={<FeedbackManagement />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="logs" element={<AuditLogs />} />
                  <Route path="health" element={<SystemHealth />} />
                  <Route path="support" element={<SupportManager />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;