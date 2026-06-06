import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, Activity, Shield, Settings, 
  FileCheck, MessageSquare, DollarSign, BarChart3, HeartPulse 
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const location = useLocation();

  // Menu Items කාණ්ඩ වලට වෙන් කළා User Experience (UX) එක වැඩි කරන්න
  const menuGroups = [
    {
      title: 'Overview',
      items: [
        { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      ]
    },
    {
      title: 'Management',
      items: [
        { path: '/admin/users', label: 'User Management', icon: <Users size={20} /> },
        { path: '/admin/verifications', label: 'Verifications', icon: <FileCheck size={20} /> },
        { path: '/admin/payouts', label: 'Finance & Payouts', icon: <DollarSign size={20} /> },
        { path: '/admin/reviews', label: 'Moderation Center', icon: <Shield size={20} /> },
      ]
    },
    {
      title: 'Platform',
      items: [
        { path: '/admin/categories', label: 'Categories', icon: <Settings size={20} /> },
        { path: '/admin/reports', label: 'Reports', icon: <BarChart3 size={20} /> },
        { path: '/admin/feedback', label: 'User Feedback', icon: <MessageSquare size={20} /> },
      ]
    },
    {
      title: 'System',
      items: [
        { path: '/admin/logs', label: 'Audit Logs', icon: <FileText size={20} /> },
        { path: '/admin/health', label: 'System Health', icon: <HeartPulse size={20} />, highlight: true },
      ]
    }
  ];

  return (
    // bg-bg-white: Linen White Background
    <div className="flex h-screen bg-bg-white font-sans overflow-hidden">
      
      {/* --- Sidebar --- */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
        
        {/* Sidebar Header */}
        <div className="p-8 pb-4">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <Shield size={18} />
             </div>
             <h2 className="text-xl font-serif font-bold text-gray-800 tracking-tight">AgroLK Admin</h2>
          </div>
          <p className="text-xs text-gray-400 font-medium pl-10">Control Panel</p>
        </div>

        {/* Navigation Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar space-y-8">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              <h3 className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                {group.title}
              </h3>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative
                        ${isActive 
                          ? 'bg-primary text-white shadow-[0_4px_12px_rgba(45,106,79,0.25)]' 
                          : 'text-gray-500 hover:bg-primary/5 hover:text-primary'
                        }
                      `}
                    >
                      {/* Active Indicator Line (Optional Design Element) */}
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-r-full"></div>}
                      
                      <span className={`mr-3 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {item.icon}
                      </span>
                      
                      {item.label}

                      {/* Special Highlight for System Health */}
                      {item.highlight && (
                        <span className="ml-auto flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Footer (Admin User Profile) */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                AD
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">Admin User</p>
                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                </p>
             </div>
          </div>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 overflow-y-auto relative">
         {/* Top Decoration */}
         <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
         
         {/* Outlet Container */}
         <div className="relative z-10 p-8 lg:p-12 max-w-[1600px] mx-auto min-h-full">
            <Outlet />
         </div>
      </main>

    </div>
  );
};

export default AdminLayout;