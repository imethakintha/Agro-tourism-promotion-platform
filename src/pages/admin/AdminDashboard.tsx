import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
   Users, FileCheck, Activity, DollarSign, Loader2,
   ArrowUpRight, ShieldAlert, BarChart3, Settings, User, Tractor, Map, Bus
} from 'lucide-react';
import { getDashboardStats } from '../../services/adminService';

const AdminDashboard: React.FC = () => {
   const [stats, setStats] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      getDashboardStats().then(res => {
         setStats(res.data);
         setLoading(false);
      }).catch(console.error);
   }, []);

   if (loading) return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
         <Loader2 className="animate-spin text-primary h-12 w-12 mb-4" />
         <p className="text-gray-500 font-medium">Loading system metrics...</p>
      </div>
   );

   return (
      <div className="max-w-7xl mx-auto px-6 py-8 font-sans">

         {/* Header */}
         <div className="mb-10">
            <h1 className="text-3xl font-serif font-bold text-gray-800">System Overview</h1>
            <p className="text-gray-500 mt-1">Welcome back, Administrator. Here is what's happening today.</p>
         </div>

         {/* --- Stats Grid --- */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

            {/* Total Users */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm group hover:shadow-md transition-all">
               {/* Top Section: Title & Icon */}
               <div className="flex items-start justify-between mb-4">
                  <div>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Users</p>
                     <h3 className="text-3xl font-bold text-gray-800">{stats?.totalUsers || 0}</h3>
                     <Link to="/admin/users" className="text-xs font-bold text-blue-600 mt-3 inline-flex items-center gap-1 hover:underline">
                        Manage Users <ArrowUpRight size={12} />
                     </Link>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                     <Users size={24} />
                  </div>
               </div>

               {/* Breakdown Section */}
               <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">

                  {/* Tourists */}
                  <div className="flex items-center gap-2">
                     <div className="p-1.5 bg-green-50 rounded-lg text-green-600">
                        <User size={14} />
                     </div>
                     <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Tourists</p>
                        <p className="text-sm font-bold text-gray-700">{stats?.userBreakdown?.tourist || 0}</p>
                     </div>
                  </div>

                  {/* Farmers */}
                  <div className="flex items-center gap-2">
                     <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                        <Tractor size={14} />
                     </div>
                     <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Farmers</p>
                        <p className="text-sm font-bold text-gray-700">{stats?.userBreakdown?.farmer || 0}</p>
                     </div>
                  </div>

                  {/* Guides */}
                  <div className="flex items-center gap-2">
                     <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600">
                        <Map size={14} />
                     </div>
                     <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Guides</p>
                        <p className="text-sm font-bold text-gray-700">{stats?.userBreakdown?.guide || 0}</p>
                     </div>
                  </div>

                  {/* Transport */}
                  <div className="flex items-center gap-2">
                     <div className="p-1.5 bg-orange-50 rounded-lg text-orange-600">
                        <Bus size={14} />
                     </div>
                     <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Drivers</p>
                        <p className="text-sm font-bold text-gray-700">{stats?.userBreakdown?.transport || 0}</p>
                     </div>
                  </div>

               </div>
            </div>

            {/* Pending Verifications (Actionable) */}
            <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm flex items-start justify-between group hover:shadow-md transition-all relative overflow-hidden">
               {stats?.pendingVerifications > 0 && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
               )}
               <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Pending Approval</p>
                  <h3 className="text-3xl font-bold text-gray-800">{stats?.pendingVerifications || 0}</h3>
                  <Link to="/admin/verifications" className="text-xs font-bold text-amber-700 mt-3 inline-flex items-center gap-1 hover:underline">
                     Review Queue <ArrowUpRight size={12} />
                  </Link>
               </div>
               <div className="p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <FileCheck size={24} />
               </div>
            </div>

            {/* Revenue */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between group hover:shadow-md transition-all">
               <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</p>
                  <h3 className="text-3xl font-bold text-gray-800">LKR {stats?.totalRevenue?.toLocaleString() || 0}</h3>
                  <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold mt-3 inline-block">
                     +12% vs last month
                  </span>
               </div>
               <div className="p-3 bg-green-50 rounded-xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <DollarSign size={24} />
               </div>
            </div>

            {/* Active Activities */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between group hover:shadow-md transition-all">
               <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Live Activities</p>
                  <h3 className="text-3xl font-bold text-gray-800">{stats?.activeActivities || 0}</h3>
                  <Link to="/admin/categories" className="text-xs font-bold text-gray-500 mt-3 inline-flex items-center gap-1 hover:text-gray-800">
                     View Categories <ArrowUpRight size={12} />
                  </Link>
               </div>
               <div className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Activity size={24} />
               </div>
            </div>
         </div>

         {/* --- Action Center --- */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Quick Actions Panel */}
            <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
               <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Settings size={20} className="text-gray-400" /> Management Console
               </h2>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link to="/admin/verifications" className="group flex items-center p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all">
                     <div className="p-3 rounded-lg bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <ShieldAlert size={20} />
                     </div>
                     <div className="ml-4">
                        <h4 className="font-bold text-gray-800 group-hover:text-primary">Verify Providers</h4>
                        <p className="text-xs text-gray-500">Review submitted documents</p>
                     </div>
                     <ArrowUpRight className="ml-auto text-gray-300 group-hover:text-primary" size={18} />
                  </Link>

                  <Link to="/admin/users" className="group flex items-center p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all">
                     <div className="p-3 rounded-lg bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Users size={20} />
                     </div>
                     <div className="ml-4">
                        <h4 className="font-bold text-gray-800 group-hover:text-blue-700">User Management</h4>
                        <p className="text-xs text-gray-500">Edit roles & permissions</p>
                     </div>
                  </Link>

                  <Link to="/admin/reports" className="group flex items-center p-4 rounded-xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-all">
                     <div className="p-3 rounded-lg bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <BarChart3 size={20} />
                     </div>
                     <div className="ml-4">
                        <h4 className="font-bold text-gray-800 group-hover:text-purple-700">System Reports</h4>
                        <p className="text-xs text-gray-500">Download analytics & logs</p>
                     </div>
                  </Link>
               </div>
            </div>

            {/* Sidebar / Notifications Placeholder */}
            <div className="bg-primary/5 p-8 rounded-[32px] border border-primary/10">
               <h3 className="text-lg font-bold text-primary mb-4">System Status</h3>
               <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                     <span className="text-gray-600 font-medium">Server Online</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                     <span className="w-2 h-2 rounded-full bg-green-500"></span>
                     <span className="text-gray-600 font-medium">Database Connected</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                     <span className="w-2 h-2 rounded-full bg-green-500"></span>
                     <span className="text-gray-600 font-medium">AI Services Active</span>
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t border-primary/10">
                  <p className="text-xs text-gray-500 mb-2">Platform Version</p>
                  <p className="text-sm font-mono font-bold text-gray-700">AgroLK v1.0.2 (Beta)</p>
               </div>
            </div>

         </div>
      </div>
   );
};

export default AdminDashboard;