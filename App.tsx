import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import type { Tool } from './types';
import LandingPage from './components/LandingPage';
import AdminPage from './components/AdminPage';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedTools = localStorage.getItem('robo-ai-tools');
      if (storedTools) {
        const parsedTools = JSON.parse(storedTools);
        if (Array.isArray(parsedTools)) {
          const validTools = parsedTools.filter((tool): tool is Tool => 
            tool && 
            typeof tool.id === 'number' &&
            typeof tool.name === 'string' &&
            typeof tool.url === 'string' &&
            typeof tool.description === 'string' &&
            (typeof tool.category === 'string' || typeof tool.category === 'undefined')
          );
          setTools(validTools);
        } else {
          setTools([]);
        }
      }
    } catch (error) {
      console.error("Failed to load or parse tools from localStorage", error);
      setTools([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('robo-ai-tools', JSON.stringify(tools));
    } catch (error) {
      console.error("Failed to save tools to localStorage", error);
    }
  }, [tools]);

  const addTool = useCallback((tool: Omit<Tool, 'id'>) => {
    setTools(prevTools => [
      ...prevTools,
      { ...tool, id: Date.now() }
    ]);
  }, []);

  const addMultipleTools = useCallback((newTools: Omit<Tool, 'id'>[]) => {
    const toolsWithIds = newTools.map((tool, index) => ({
      ...tool,
      id: Date.now() + index,
    }));
    setTools(prevTools => [...prevTools, ...toolsWithIds]);
  }, []);

  const updateTool = useCallback((updatedTool: Tool) => {
    setTools(prevTools =>
      prevTools.map(tool =>
        tool.id === updatedTool.id ? updatedTool : tool
      )
    );
  }, []);

  const deleteTool = useCallback((id: number) => {
    setTools(prevTools => prevTools.filter(tool => tool.id !== id));
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/admin');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-black relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage tools={tools} />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AdminPage
                    tools={tools}
                    onAddTool={addTool}
                    onAddMultipleTools={addMultipleTools}
                    onUpdateTool={updateTool}
                    onDeleteTool={deleteTool}
                  />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
