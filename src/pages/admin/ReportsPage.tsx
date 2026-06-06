import React, { useEffect, useState, useRef } from 'react';
import { getRevenueReports, getUserGrowth, getActivityRevenueDistribution, getBookingStats, getProviderLeaderboard, getGeographicStats, getFinancialStats, getRevenueForecast } from '../../services/adminService';
import {
   AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
   BarChart, Bar, TooltipProps, PieChart, Pie, Cell, Legend, ComposedChart, Line
} from 'recharts';
import { Loader2, Download, TrendingUp, Users, PieChart as PieChartIcon, CalendarCheck, Trophy, Star, MapPin, Wallet, ArrowUpRight, ArrowDownRight, DollarSign, LineChart, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2', '#D8F3DC', '#1B4332'];

const getStatusColor = (status: string) => {
   switch (status) {
      case 'Completed': return '#10B981'; // Green
      case 'Confirmed': return '#3B82F6'; // Blue
      case 'Pending': return '#F59E0B';   // Orange
      case 'Cancelled': return '#EF4444'; // Red
      case 'Declined': return '#B91C1C';  // Dark Red
      case 'Refunded': return '#8B5CF6';  // Purple
      default: return '#9CA3AF';          // Gray
   }
};

const ReportsPage: React.FC = () => {
   const [revenueData, setRevenueData] = useState<any[]>([]);
   const [userData, setUserData] = useState<any[]>([]);
   const [categoryData, setCategoryData] = useState<any[]>([]);
   const [bookingData, setBookingData] = useState<any[]>([]);
   const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
   const [geoData, setGeoData] = useState<any[]>([]);
   const [financialData, setFinancialData] = useState<any>(null);
   const [forecastData, setForecastData] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   const [showExportMenu, setShowExportMenu] = useState(false);
   const exportMenuRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const loadData = async () => {
         try {
            const [revRes, userRes, catRes, bookRes, leadRes, geoRes, finRes, foreRes] = await Promise.all([getRevenueReports(), getUserGrowth(), getActivityRevenueDistribution(), getBookingStats(), getProviderLeaderboard(), getGeographicStats(), getFinancialStats(), getRevenueForecast()]);
            setRevenueData(revRes.data);
            setUserData(userRes.data);
            setCategoryData(catRes.data);
            setBookingData(bookRes.data);
            setLeaderboardData(leadRes.data);
            setGeoData(geoRes.data);
            setFinancialData(finRes.data);
            setForecastData(foreRes.data);
         } catch (error) {
            console.error(error);
         } finally {
            setLoading(false);
         }
      };
      loadData();
      const handleClickOutside = (event: MouseEvent) => {
         if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setShowExportMenu(false);
         }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   const exportToCSV = () => {
      // 1. Prepare CSV Content
      let csvContent = "data:text/csv;charset=utf-8,";
      const date = new Date().toISOString().split('T')[0];

      // Section 1: Financial Summary
      csvContent += "--- FINANCIAL OVERVIEW ---\n";
      csvContent += `Total Revenue,LKR ${financialData?.totalRevenue || 0}\n`;
      csvContent += `Pending Payouts,LKR ${financialData?.totalPending || 0}\n`;
      csvContent += `Net Profit,LKR ${financialData?.netProfit || 0}\n\n`;

      // Section 2: Revenue Data
      csvContent += "--- MONTHLY REVENUE HISTORY ---\n";
      csvContent += "Month,Revenue (LKR)\n";
      revenueData.forEach(row => {
         csvContent += `${row._id},${row.revenue}\n`;
      });
      csvContent += "\n";

      // Section 3: Top Farmers
      csvContent += "--- TOP FARMERS ---\n";
      csvContent += "Farm Name,Provider,Rating,Bookings\n";
      leaderboardData.forEach(row => {
         csvContent += `${row.farmName},${row.providerName},${row.avgRating},${row.totalBookings}\n`;
      });
      csvContent += "\n";

      // Section 4: Booking Stats
      csvContent += "--- BOOKING STATISTICS ---\n";
      csvContent += "Status,Count\n";
      bookingData.forEach(row => {
         csvContent += `${row.status},${row.count}\n`;
      });

      // 2. Trigger Download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `AgroLK_Report_${date}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowExportMenu(false);
   };

   const exportToPDF = () => {
      const doc = new jsPDF();
      const date = new Date().toLocaleDateString();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(45, 106, 79); // Primary Green Color
      doc.text("AgroLK Platform Report", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${date}`, 14, 26);
      doc.text("Confidential Admin Report", 14, 30);

      // Financial Summary Box
      doc.setDrawColor(200);
      doc.setFillColor(245, 255, 250); // Light Green bg
      doc.rect(14, 35, 180, 25, 'F');

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("Financial Overview", 20, 45);

      doc.setFontSize(10);
      doc.text(`Total Revenue: LKR ${(financialData?.totalRevenue || 0).toLocaleString()}`, 20, 53);
      doc.text(`Net Profit: LKR ${(financialData?.netProfit || 0).toLocaleString()}`, 90, 53);
      doc.text(`Pending Payouts: LKR ${(financialData?.totalPending || 0).toLocaleString()}`, 150, 53);

      // Table 1: Top Performing Farmers
      doc.setFontSize(14);
      doc.setTextColor(45, 106, 79);
      doc.text("Top Performing Farmers", 14, 75);

      const farmerTableData = leaderboardData.map(item => [
         item.farmName,
         item.providerName,
         item.avgRating,
         item.totalBookings
      ]);

      autoTable(doc, {
         startY: 80,
         head: [['Farm Name', 'Provider', 'Rating', 'Bookings']],
         body: farmerTableData,
         theme: 'grid',
         headStyles: { fillColor: [45, 106, 79] },
      });

      // Table 2: Monthly Revenue
      const finalY = (doc as any).lastAutoTable.finalY || 80;
      doc.text("Revenue History (Last 12 Months)", 14, finalY + 15);

      const revenueTableData = revenueData.map(item => [
         item._id,
         `LKR ${item.revenue.toLocaleString()}`
      ]);

      autoTable(doc, {
         startY: finalY + 20,
         head: [['Month', 'Revenue']],
         body: revenueTableData,
         theme: 'striped',
         headStyles: { fillColor: [64, 145, 108] },
      });

      // Save
      doc.save(`AgroLK_Report_${date.replace(/\//g, '-')}.pdf`);
      setShowExportMenu(false);
   };

   // Custom Tooltip Component for Recharts
   const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
      if (active && payload && payload.length) {
         return (
            <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100">
               <p className="text-xs text-gray-400 uppercase font-bold mb-1">{label}</p>
               <p className="text-lg font-bold text-gray-800">
                  {payload[0].value?.toLocaleString()}
                  <span className="text-xs font-normal text-gray-500 ml-1">
                     {payload[0].name === 'revenue' ? 'LKR' : 'Users'}
                  </span>
               </p>
            </div>
         );
      }
      return null;
   };

   const CustomPieTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
         return (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
               <p className="font-bold text-gray-800">{payload[0].name}</p>
               <p className="text-sm text-primary">
                  LKR {payload[0].value.toLocaleString()}
               </p>
            </div>
         );
      }
      return null;
   };

   const CustomBookingTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
         return (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
               <p className="font-bold text-gray-800 mb-1">{label}</p>
               <p className="text-sm font-medium" style={{ color: payload[0].fill }}>
                  {payload[0].value} Bookings
               </p>
            </div>
         );
      }
      return null;
   };

   const CustomGeoTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
         return (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
               <p className="font-bold text-gray-800 mb-1">{payload[0].payload.district}</p>
               <p className="text-sm font-medium text-emerald-600">
                  {payload[0].value} Active Farms
               </p>
            </div>
         );
      }
      return null;
   };

   const CustomForecastTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
         const isForecast = payload[0].dataKey === 'forecastRevenue';
         return (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
               <p className="font-bold text-gray-800 mb-1">{label} {isForecast ? '(Proj.)' : ''}</p>
               <p className={`text-sm font-bold ${isForecast ? 'text-blue-600' : 'text-emerald-700'}`}>
                  LKR {payload[0].value.toLocaleString()}
               </p>
               {isForecast && <p className="text-[10px] text-gray-400 italic">Estimated Value</p>}
            </div>
         );
      }
      return null;
   };

   if (loading) return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
         <Loader2 className="animate-spin text-primary h-10 w-10 mb-4" />
         <p className="text-gray-500 font-medium">Generating analytics...</p>
      </div>
   );

   return (
      <div className="max-w-7xl mx-auto px-6 py-8 font-sans">

         {/* Header */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
         <div>
            <h1 className="text-3xl font-serif font-bold text-gray-800">Platform Analytics</h1>
            <p className="text-gray-500 mt-1">Financial overview, community growth, and system performance.</p>
         </div>
         
         <div className="mt-4 md:mt-0 relative" ref={exportMenuRef}>
            <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm"
            >
                <Download size={18} /> 
                Export Report
                <ChevronDown size={16} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showExportMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-1">
                        <button 
                            onClick={exportToPDF}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors text-left"
                        >
                            <FileText size={18} />
                            <div>
                                <span className="block font-bold">Download PDF</span>
                                <span className="text-xs text-gray-400 font-normal">Visual summary report</span>
                            </div>
                        </button>
                        <button 
                            onClick={exportToCSV}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors text-left"
                        >
                            <FileSpreadsheet size={18} />
                            <div>
                                <span className="block font-bold">Download CSV</span>
                                <span className="text-xs text-gray-400 font-normal">Raw data for Excel</span>
                            </div>
                        </button>
                    </div>
                </div>
            )}
         </div>
      </div>

         {financialData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

               {/* Total Revenue Card */}
               <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between h-40 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <Wallet size={80} className="text-emerald-500" />
                  </div>
                  <div>
                     <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Revenue</p>
                     <h2 className="text-3xl font-bold text-gray-800 mt-1">
                        LKR {(financialData.totalRevenue / 1000).toFixed(1)}k
                     </h2>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full text-xs font-bold mt-2">
                     <ArrowUpRight size={14} />
                     <span>Gross Income</span>
                  </div>
               </div>

               {/* Pending Payouts Card */}
               <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between h-40 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <DollarSign size={80} className="text-orange-500" />
                  </div>
                  <div>
                     <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Payouts</p>
                     <h2 className="text-3xl font-bold text-gray-800 mt-1">
                        LKR {(financialData.totalPending / 1000).toFixed(1)}k
                     </h2>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                     <div className="flex items-center gap-2 text-orange-600 bg-orange-50 w-fit px-3 py-1 rounded-full text-xs font-bold">
                        <ArrowDownRight size={14} />
                        <span>To be paid</span>
                     </div>
                     <div className="text-[10px] text-gray-400 font-medium text-right">
                        Farmers: {((financialData.breakdown?.farmer || 0) / 1000).toFixed(0)}k <br />
                        Others: {(((financialData.breakdown?.guide || 0) + (financialData.breakdown?.transport || 0)) / 1000).toFixed(0)}k
                     </div>
                  </div>
               </div>

               {/* Net Profit Card */}
               <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between h-40 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <TrendingUp size={80} className="text-blue-500" />
                  </div>
                  <div>
                     <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Net Profit (Est.)</p>
                     <h2 className="text-3xl font-bold text-gray-800 mt-1">
                        LKR {(financialData.netProfit / 1000).toFixed(1)}k
                     </h2>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full text-xs font-bold mt-2">
                     <Trophy size={14} />
                     <span>Platform Earnings</span>
                  </div>
               </div>

            </div>
         )}

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

            {/* --- Revenue Chart (Area) --- */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-[450px]">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 bg-green-50 rounded-xl text-green-700">
                        <TrendingUp size={24} />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-gray-800">Revenue Trend</h3>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Last 12 Months</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-2xl font-bold text-primary">
                        LKR {revenueData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}
                     </p>
                     <p className="text-xs text-gray-400">Total Revenue</p>
                  </div>
               </div>

               <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                           <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                           dataKey="_id"
                           axisLine={false}
                           tickLine={false}
                           tick={{ fill: '#9ca3af', fontSize: 12 }}
                           dy={10}
                        />
                        <YAxis
                           axisLine={false}
                           tickLine={false}
                           tick={{ fill: '#9ca3af', fontSize: 12 }}
                           tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2D6A4F', strokeWidth: 1, strokeDasharray: '5 5' }} />
                        <Area
                           type="monotone"
                           dataKey="revenue"
                           stroke="#2D6A4F"
                           strokeWidth={3}
                           fillOpacity={1}
                           fill="url(#colorRevenue)"
                        />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-[450px]">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                        <PieChartIcon size={24} />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-gray-800">Revenue by Category</h3>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Top Performing Activities</p>
                     </div>
                  </div>
               </div>

               <div className="flex-1 w-full min-h-0 relative">
                  {categoryData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={80}
                              outerRadius={120}
                              paddingAngle={5}
                              dataKey="value"
                           >
                              {categoryData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Pie>
                           <Tooltip content={<CustomPieTooltip />} />
                           <Legend
                              layout="vertical"
                              verticalAlign="middle"
                              align="right"
                              iconType="circle"
                              wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}
                           />
                        </PieChart>
                     </ResponsiveContainer>
                  ) : (
                     <div className="flex items-center justify-center h-full text-gray-400">
                        No revenue data available yet.
                     </div>
                  )}
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="lg:col-span-1 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-[450px]">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 bg-yellow-50 rounded-xl text-yellow-600">
                        <Trophy size={24} />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-gray-800">Top Farmers</h3>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Performance</p>
                     </div>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {leaderboardData.length > 0 ? (
                     <div className="space-y-4">
                        {leaderboardData.map((provider, index) => (
                           <div key={index} className="flex items-center p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                              <div className={`
                                      flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3
                                      ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                    index === 1 ? 'bg-gray-100 text-gray-700' :
                                       index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}
                                  `}>
                                 #{index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-sm font-bold text-gray-800 truncate">{provider.farmName}</p>
                                 <p className="text-xs text-gray-500 truncate">{provider.providerName}</p>
                              </div>
                              <div className="text-right">
                                 <div className="flex items-center justify-end gap-1 text-amber-500 mb-0.5">
                                    <Star size={12} fill="currentColor" />
                                    <span className="text-sm font-bold">{provider.avgRating}</span>
                                 </div>
                                 <p className="text-[10px] text-gray-400 font-medium">
                                    {provider.totalBookings} Bookings
                                 </p>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        No performance data yet.
                     </div>
                  )}
               </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-[450px]">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                        <MapPin size={24} />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-gray-800">Regional Distribution</h3>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Farms by District</p>
                     </div>
                  </div>
               </div>

               <div className="flex-1 w-full min-h-0">
                  {geoData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={geoData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="horizontal">
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                           <XAxis
                              dataKey="district"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }}
                              dy={10}
                           />
                           <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#9ca3af', fontSize: 12 }}
                           />
                           <Tooltip content={<CustomGeoTooltip />} cursor={{ fill: '#ECFDF5' }} />
                           <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} barSize={50} />
                        </BarChart>
                     </ResponsiveContainer>
                  ) : (
                     <div className="flex items-center justify-center h-full text-gray-400">
                        No geographic data available yet.
                     </div>
                  )}
               </div>
            </div>

         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* --- User Growth Chart (Bar) --- */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-[450px]">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                        <Users size={24} />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-gray-800">User Growth</h3>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">New Registrations</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-2xl font-bold text-secondary">
                        {userData.reduce((acc, curr) => acc + curr.users, 0).toLocaleString()}
                     </p>
                     <p className="text-xs text-gray-400">Total New Users</p>
                  </div>
               </div>

               <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={userData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                           dataKey="_id"
                           axisLine={false}
                           tickLine={false}
                           tick={{ fill: '#9ca3af', fontSize: 12 }}
                           dy={10}
                        />
                        <YAxis
                           axisLine={false}
                           tickLine={false}
                           tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FFFBEB' }} />
                        <Bar
                           dataKey="users"
                           fill="#D97706"
                           radius={[6, 6, 0, 0]}
                           barSize={40}
                        />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-[450px]">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                        <CalendarCheck size={24} />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-gray-800">Booking Status</h3>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Success & Cancellations</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-2xl font-bold text-gray-800">
                        {bookingData.reduce((acc, curr) => acc + curr.count, 0).toLocaleString()}
                     </p>
                     <p className="text-xs text-gray-400">Total Bookings</p>
                  </div>
               </div>

               <div className="flex-1 w-full min-h-0">
                  {bookingData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={bookingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} layout="vertical">
                           <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                           <XAxis type="number" hide />
                           <YAxis
                              dataKey="status"
                              type="category"
                              axisLine={false}
                              tickLine={false}
                              width={100}
                              tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }}
                           />
                           <Tooltip content={<CustomBookingTooltip />} cursor={{ fill: '#F3F4F6' }} />
                           <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={30}>
                              {bookingData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                              ))}
                           </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  ) : (
                     <div className="flex items-center justify-center h-full text-gray-400">
                        No booking data available yet.
                     </div>
                  )}
               </div>
            </div>

         </div>

         <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-8">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-[450px]">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                        <LineChart size={24} />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-gray-800">Growth Forecast</h3>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Next 3 Months Projection</p>
                     </div>
                  </div>
               </div>

               <div className="flex-1 w-full min-h-0">
                  {forecastData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                           <XAxis
                              dataKey="name"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#9ca3af', fontSize: 12 }}
                              dy={10}
                           />
                           <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#9ca3af', fontSize: 12 }}
                              tickFormatter={(value) => `${value / 1000}k`}
                           />
                           <Tooltip content={<CustomForecastTooltip />} cursor={{ fill: '#EEF2FF' }} />
                           <Legend verticalAlign="top" height={36} />

                           {/* Actual Data Area */}
                           <Area
                              type="monotone"
                              dataKey="actualRevenue"
                              name="Actual Revenue"
                              fill="#2D6A4F"
                              stroke="#2D6A4F"
                              fillOpacity={0.3}
                           />

                           {/* Forecast Line */}
                           <Line
                              type="monotone"
                              dataKey="forecastRevenue"
                              name="Projected"
                              stroke="#2563EB"
                              strokeWidth={3}
                              strokeDasharray="5 5"
                              dot={{ r: 4, fill: '#2563EB' }}
                           />
                        </ComposedChart>
                     </ResponsiveContainer>
                  ) : (
                     <div className="flex items-center justify-center h-full text-gray-400">
                        Insufficient data for forecast.
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default ReportsPage;