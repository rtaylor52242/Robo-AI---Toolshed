
import React, { useState, useMemo } from 'react';
import type { Tool } from '../types';
import ToolCard from './ToolCard';
import Input from './ui/Input';

interface LandingPageProps {
  tools: Tool[];
}

const LandingPage: React.FC<LandingPageProps> = ({ tools }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    const allCategories = new Set<string>();
    tools.forEach(tool => {
      if (tool.category?.trim()) {
        allCategories.add(tool.category.trim());
      }
    });
    return ['All', ...Array.from(allCategories).sort()];
  }, [tools]);

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        !searchLower ||
        tool.name.toLowerCase().includes(searchLower) ||
        tool.description.toLowerCase().includes(searchLower) ||
        (tool.category && tool.category.toLowerCase().includes(searchLower));
      
      return matchesCategory && matchesSearch;
    });
  }, [tools, searchTerm, selectedCategory]);

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            The Future of AI,
          </span>
          <br />
          Curated for You.
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-400">
          Welcome to the Robo AI Toolshed. Explore our collection of cutting-edge AI tools designed to amplify your creativity and productivity.
        </p>
      </div>

      {/* Search and Filter Controls */}
      {tools.length > 0 && (
        <div className="mb-12 space-y-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3" aria-hidden="true">
                <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <Input
                type="search"
                placeholder="Search tools by name, category, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-label="Search tools"
              />
            </div>
          </div>
          {categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {categories.map(category => {
                const isSelected = category === selectedCategory;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
                      isSelected
                        ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tool Grid */}
      {tools.length > 0 ? (
        filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTools.map((tool, index) => (
              <ToolCard key={tool.id} tool={tool} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-800/20 border border-gray-700 rounded-lg">
            <p className="text-2xl text-gray-500">No tools found.</p>
            <p className="text-gray-400 mt-2">Try adjusting your search or filter criteria.</p>
          </div>
        )
      ) : (
        <div className="text-center py-20 bg-gray-800/20 border border-gray-700 rounded-lg">
          <p className="text-2xl text-gray-500">No tools available yet.</p>
          <p className="text-gray-400 mt-2">Visit the admin page to add the first one!</p>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
