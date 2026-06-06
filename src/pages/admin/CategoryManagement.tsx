import React, { useState, useEffect } from 'react';
import { createCategory, createTag, getCategoriesAdmin } from '../../services/adminService';
import { Plus, Tag, FolderPlus, Loader2, Layers, Sparkles } from 'lucide-react';

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Forms State
  const [newCategory, setNewCategory] = useState({ categoryName: '', description: '', icon: '' });
  const [newTag, setNewTag] = useState({ categoryId: '', tagName: '', description: '' });
  
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getCategoriesAdmin();
        setCategories(res.data);
        // Auto-select first category for tag creation if not selected
        if (res.data.length > 0 && !newTag.categoryId) {
            setNewTag(prev => ({ ...prev, categoryId: res.data[0]._id }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [refresh]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory(newCategory);
      setNewCategory({ categoryName: '', description: '', icon: '' });
      setRefresh(prev => prev + 1);
      alert('Category created successfully!');
    } catch (error) {
      alert('Failed to create category');
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTag(newTag);
      setNewTag(prev => ({ ...prev, tagName: '', description: '' }));
      setRefresh(prev => prev + 1);
      alert('Tag created successfully!');
    } catch (error) {
      alert('Failed to create tag');
    }
  };

  if (loading) return (
      <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary mb-4" size={32} />
          <p className="text-gray-500 font-medium">Loading Categories...</p>
      </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 font-sans">
      
      {/* Header */}
      <div className="mb-10">
         <h1 className="text-3xl font-serif font-bold text-gray-800 flex items-center gap-3">
            <Layers className="text-primary" /> Activity Category Management
         </h1>
         <p className="text-gray-500 mt-2">Define the structure of activities and farm types.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- Left Column: Creation Tools (40%) --- */}
        <div className="lg:col-span-5 space-y-8">
           
           {/* 1. Create Category Card */}
           <div className="bg-white p-8 rounded-[32px] shadow-lg shadow-green-900/5 border border-green-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-green-400"></div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                 <div className="p-2 bg-green-50 rounded-lg text-green-700"><FolderPlus size={20}/></div>
                 New Category
              </h3>
              
              <form onSubmit={handleCreateCategory} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Name</label>
                    <input 
                        placeholder="e.g. Farm Stays" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-medium" 
                        value={newCategory.categoryName} 
                        onChange={e => setNewCategory({...newCategory, categoryName: e.target.value})} 
                        required 
                    />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Icon</label>
                        <input 
                            placeholder="Emoji 🏡" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary text-center text-xl" 
                            value={newCategory.icon} 
                            onChange={e => setNewCategory({...newCategory, icon: e.target.value})} 
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
                        <input 
                            placeholder="Short description" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary text-sm" 
                            value={newCategory.description} 
                            onChange={e => setNewCategory({...newCategory, description: e.target.value})} 
                        />
                    </div>
                </div>

                <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md active:scale-95 flex justify-center items-center gap-2">
                    <Plus size={18} /> Create Category
                </button>
              </form>
           </div>

           {/* 2. Create Tag Card */}
           <div className="bg-white p-8 rounded-[32px] shadow-lg shadow-amber-900/5 border border-amber-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-amber-400"></div>

              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                 <div className="p-2 bg-amber-50 rounded-lg text-amber-700"><Tag size={20}/></div>
                 New Category Tag
              </h3>

              <form onSubmit={handleCreateTag} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Parent Category</label>
                    <div className="relative">
                        <select 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10 appearance-none font-medium text-gray-700"
                            value={newTag.categoryId} 
                            onChange={e => setNewTag({...newTag, categoryId: e.target.value})}
                        >
                            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.icon} {cat.categoryName}</option>)}
                        </select>
                        <div className="absolute right-4 top-4 pointer-events-none text-gray-400">▼</div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tag Name</label>
                    <input 
                        placeholder="e.g. Organic, Pet Friendly" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all font-medium" 
                        value={newTag.tagName} 
                        onChange={e => setNewTag({...newTag, tagName: e.target.value})} 
                        required 
                    />
                </div>

                <button type="submit" className="w-full bg-secondary text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition-all shadow-md active:scale-95 flex justify-center items-center gap-2">
                    <Plus size={18} /> Create Tag
                </button>
              </form>
           </div>
        </div>

        {/* --- Right Column: Structure List (60%) --- */}
        <div className="lg:col-span-7">
           <div className="bg-white rounded-[32px] shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                 <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <Sparkles size={18} className="text-purple-500" /> Current Structure
                 </h3>
              </div>
              
              <div className="p-6 space-y-6 max-h-[800px] overflow-y-auto custom-scrollbar">
                 {categories.length === 0 && (
                    <p className="text-center text-gray-400 py-10 italic">No categories defined yet.</p>
                 )}

                 {categories.map(cat => (
                    <div key={cat._id} className="group border border-gray-100 rounded-2xl p-5 hover:border-primary/20 hover:bg-primary/5 transition-all">
                       <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                             <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                {cat.icon || '📁'}
                             </div>
                             <div>
                                <h4 className="font-bold text-gray-800 text-lg">{cat.categoryName}</h4>
                                <p className="text-xs text-gray-500">{cat.description || 'No description'}</p>
                             </div>
                          </div>
                          <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                             {cat.tags?.length || 0} Tags
                          </span>
                       </div>

                       {/* Tags Area */}
                       <div className="pl-4 border-l-2 border-gray-200 ml-6">
                          <div className="flex flex-wrap gap-2">
                             {cat.tags && cat.tags.length > 0 ? (
                                cat.tags.map((tag: any) => (
                                   <span 
                                      key={tag._id} 
                                      className="inline-flex items-center px-3 py-1 bg-white border border-gray-200 text-gray-600 text-sm rounded-full shadow-sm hover:border-secondary hover:text-secondary transition-colors cursor-default"
                                   >
                                      <Tag size={12} className="mr-1.5 opacity-50" />
                                      {tag.tagName}
                                   </span>
                                ))
                             ) : (
                                <span className="text-sm text-gray-400 italic pl-2">No tags added yet.</span>
                             )}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default CategoryManagement;