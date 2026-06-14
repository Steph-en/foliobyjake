import React, { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import ProjectTable from './ProjectTable';
import ProjectEditor from './ProjectEditor';
import MediaManager from './MediaManager';
import CategoryManager from './CategoryManager';
import {
  LayoutDashboard, FolderKanban, Images, Layers,
  LogOut, Globe, Shield, Menu, X, ArrowLeft
} from 'lucide-react';

export default function AdminIndex() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Check local credential token
    const token = localStorage.getItem('admin_token');
    if (token) {
      setAuthToken(token);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setAuthToken(null);
    setActiveTab('dashboard');
  };

  if (!authToken) {
    return <Login onLoginSuccess={(token) => setAuthToken(token)} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'projects', label: 'Works Catalog', icon: <FolderKanban size={16} /> },
    { id: 'media', label: 'Assets Media', icon: <Images size={16} /> },
    { id: 'categories', label: 'Categories', icon: <Layers size={16} /> },
  ];

  const handleEditProject = (id: number) => {
    setEditingProjectId(id);
    setActiveTab('project-editor');
  };

  const handleCreateNewProject = () => {
    setEditingProjectId(null);
    setActiveTab('project-editor');
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex font-sans">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-zinc-950 border-r border-zinc-900 shrink-0">
        
        {/* Upper Brand panel */}
        <div className="p-6 border-b border-zinc-900 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-white text-black flex items-center justify-center font-bold">
            <Shield size={16} />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Jake Amponsah</span>
            <h1 className="text-sm font-display tracking-tight font-bold text-white uppercase">Portfol CMS</h1>
          </div>
        </div>

        {/* Navigation list selection */}
        <nav className="flex-grow p-4 space-y-1.5 pt-6">
          {navItems.map((item) => {
            const isAct = activeTab === item.id || (item.id === 'projects' && activeTab === 'project-editor');
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setEditingProjectId(null);
                }}
                className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  isAct
                    ? 'bg-white text-black font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60 cursor-pointer'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer anchors list */}
        <div className="p-4 border-t border-zinc-900 space-y-1">
          <a
            href="/"
            className="w-full flex items-center gap-3 py-3 px-4 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded-xl transition-all"
          >
            <Globe size={16} />
            View Site
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 py-3 px-4 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-all cursor-pointer"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>

      </aside>

      {/* Mobile drawer header */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-900 h-16 px-6 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-white" />
          <span className="text-xs font-bold tracking-widest uppercase text-white font-mono">CMS Panel</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-zinc-400 hover:text-white"
          aria-label="Toggle Navigation drawer"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer drawer structure */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-zinc-950 flex flex-col pt-20">
          <nav className="flex-grow p-6 space-y-3">
            {navItems.map((item) => {
              const isAct = activeTab === item.id || (item.id === 'projects' && activeTab === 'project-editor');
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setEditingProjectId(null);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 py-4 px-6 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    isAct ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
            <a
              href="/"
              className="w-full flex items-center gap-3 py-4 px-6 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white"
            >
              <Globe size={16} />
              View Site
            </a>
            <button
              onClick={() => {
                handleLogout();
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 py-4 px-6 text-xs font-bold tracking-widest uppercase text-zinc-500 hover:text-red-400 cursor-pointer text-left"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </nav>
        </div>
      )}

      {/* Primary body component area */}
      <main className="flex-grow min-h-screen pt-20 lg:pt-0 p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard onNavigateToTab={setActiveTab} />}
          {activeTab === 'projects' && (
            <ProjectTable
              onEditProject={handleEditProject}
              onAddNewProject={handleCreateNewProject}
            />
          )}
          {activeTab === 'project-editor' && (
            <ProjectEditor
              projectId={editingProjectId}
              onBack={() => setActiveTab('projects')}
              onSaved={() => {
                setActiveTab('projects');
                setEditingProjectId(null);
              }}
            />
          )}
          {activeTab === 'media' && <MediaManager />}
          {activeTab === 'categories' && <CategoryManager />}
        </div>
      </main>

    </div>
  );
}
