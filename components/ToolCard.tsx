import React, { useState } from 'react';
import type { Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
  index: number;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, index }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(tool.url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Failed to copy link to clipboard.');
    }
  };

  return (
    <div
      className="group relative flex flex-col p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
    >
      <div className="absolute -top-12 -left-12 text-8xl font-black text-gray-700/75 group-hover:text-cyan-500/50 transition-colors duration-300 select-none z-0">
        {String(index + 1).padStart(2, '0')}
      </div>
      <div className="relative z-10 flex flex-col h-full flex-grow">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-cyan-400 truncate" title={tool.name}>{tool.name}</h3>
          {tool.category && (
            <div className="mt-2">
              <span className="text-xs inline-block font-semibold whitespace-nowrap py-1 px-2.5 uppercase rounded-full text-cyan-300 bg-cyan-800/60">
                {tool.category}
              </span>
            </div>
          )}
        </div>
        <p className="text-gray-300 text-sm overflow-hidden text-ellipsis flex-grow">{tool.description}</p>
      </div>
      <div className="relative z-10 mt-4 pt-4 border-t border-gray-700/50 flex items-center justify-between">
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-cyan-600 hover:text-cyan-400 transition-colors duration-300 flex items-center"
        >
          Visit Tool
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
        <button
          onClick={handleShare}
          title="Share tool link"
          aria-label="Share tool link"
          className={`relative p-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
            isCopied 
              ? 'bg-green-600/30 text-green-400' 
              : 'bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/40 hover:text-cyan-300'
          }`}
        >
          {isCopied ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          )}
          <span className={`absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900/80 px-2 py-1 text-xs font-semibold text-white shadow-lg transition-all duration-200 ${isCopied ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            Copied!
          </span>
        </button>
      </div>
    </div>
  );
};

export default ToolCard;