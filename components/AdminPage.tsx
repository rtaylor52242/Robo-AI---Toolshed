import React, { useState, useRef, useCallback } from 'react';
import type { Tool } from '../types';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import HelpButton from './HelpButton';
import HelpModal from './HelpModal';

// SheetJS/xlsx is loaded from a CDN script in index.html
declare var XLSX: any;

interface AdminPageProps {
  tools: Tool[];
  onAddTool: (tool: Omit<Tool, 'id'>) => void;
  onAddMultipleTools: (tools: Omit<Tool, 'id'>[]) => void;
  onUpdateTool: (tool: Tool) => void;
  onDeleteTool: (id: number) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ tools, onAddTool, onAddMultipleTools, onUpdateTool, onDeleteTool }) => {
  // State for single tool form
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // State for file import
  const [file, setFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for inline editing
  const [editingToolId, setEditingToolId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Omit<Tool, 'id'>>({ name: '', url: '', description: '', category: '' });
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');

  // State for help modal
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url || !description) {
      alert('Please fill out all fields.');
      return;
    }
    onAddTool({ name, url, description, category });
    setName('');
    setUrl('');
    setDescription('');
    setCategory('');
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setImportStatus(null);
    }
  };

  const handleImport = () => {
    if (!file) {
      setImportStatus({ message: 'Please select a file first.', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error("Could not read file data.");
        }
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        const newTools: Omit<Tool, 'id'>[] = json
          .map(row => ({
            name: String(row.Name || row.name || ''),
            url: String(row.URL || row.Url || row.url || ''),
            description: String(row.Description || row.description || ''),
            category: row.Category || row.category ? String(row.Category || row.category) : undefined,
          }))
          .filter(tool => tool.name && tool.url && tool.description);

        if (newTools.length === 0) {
          throw new Error("No valid tools found. Ensure columns are named 'Name', 'URL', and 'Description'.");
        }

        onAddMultipleTools(newTools);
        setImportStatus({ message: `Successfully imported ${newTools.length} tools!`, type: 'success' });
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error("Failed to import file:", error);
        setImportStatus({ message: error instanceof Error ? error.message : 'An unexpected error occurred during import.', type: 'error' });
      }
    };
    reader.onerror = () => {
      setImportStatus({ message: 'Failed to read the file.', type: 'error' });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExport = () => {
    if (tools.length === 0) {
      alert("No tools to export.");
      return;
    }

    const exportData = tools.map(({ name, url, description, category }) => ({
      Name: name,
      URL: url,
      Description: description,
      Category: category || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AI Tools");
    XLSX.writeFile(workbook, "robo-ai-toolshed-export.xlsx");
  };

  const handleDelete = useCallback((toolId: number, toolName: string) => {
    if (window.confirm(`Are you sure you want to delete the tool "${toolName}"?`)) {
      onDeleteTool(toolId);
    }
  }, [onDeleteTool]);
  
  const handleEditClick = (tool: Tool) => {
    setEditingToolId(tool.id);
    setEditFormData({ name: tool.name, url: tool.url, description: tool.description, category: tool.category || '' });
  };

  const handleCancelEdit = () => {
    setEditingToolId(null);
  };

  const handleUpdateTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingToolId === null) return;
    onUpdateTool({ id: editingToolId, ...editFormData });
    setEditingToolId(null);
  };
  
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tool.category && tool.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Admin Control Panel
        </h1>
        <p className="mt-2 text-lg text-gray-400">Manage the AI tool collection.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-12">
          {/* Add Tool Form */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Add a New Tool</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="tool-name" className="block text-sm font-medium text-cyan-400 mb-2">
                  Tool Name
                </label>
                <Input
                  id="tool-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Gemini Pro"
                  required
                />
              </div>
              <div>
                <label htmlFor="tool-url" className="block text-sm font-medium text-cyan-400 mb-2">
                  Tool URL
                </label>
                <Input
                  id="tool-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://gemini.google.com"
                  required
                />
              </div>
               <div>
                <label htmlFor="tool-category" className="block text-sm font-medium text-cyan-400 mb-2">
                  Category
                </label>
                <Input
                  id="tool-category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Productivity"
                />
              </div>
              <div>
                <label htmlFor="tool-description" className="block text-sm font-medium text-cyan-400 mb-2">
                  Description
                </label>
                <Textarea
                  id="tool-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the tool and its capabilities..."
                  rows={4}
                  required
                />
              </div>
              <div className="relative">
                <Button type="submit" className="w-full">
                  Add Tool to Shed
                </Button>
                {isSubmitted && (
                  <p className="text-center mt-4 text-green-400 transition-opacity duration-300">Tool added successfully!</p>
                )}
              </div>
            </form>
          </div>

          {/* Import from Excel */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Import from Excel</h2>
              <p className="mt-1 text-gray-400 text-sm">
                Columns: <code className="bg-gray-900 px-1 rounded">Name</code>, <code className="bg-gray-900 px-1 rounded">URL</code>, <code className="bg-gray-900 px-1 rounded">Description</code>, <code className="bg-gray-900 px-1 rounded">Category</code> (optional).
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-cyan-400 mb-2">
                  Excel Worksheet (.xlsx, .xls, .csv)
                </label>
                <input
                  id="file-upload"
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 transition-colors duration-200"
                />
              </div>
              <div className="relative">
                <Button onClick={handleImport} disabled={!file} className="w-full">
                  Import Tools
                </Button>
                {importStatus && (
                  <p className={`text-center mt-4 transition-opacity duration-300 ${importStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {importStatus.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-12">
            {/* Manage Tools */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8">
              <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold">Manage Existing Tools</h2>
                  <p className="mt-1 text-gray-400 text-sm">View, edit, and remove tools from the collection.</p>
              </div>
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Search tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search existing tools"
                />
              </div>
              <div className="max-h-[40rem] overflow-y-auto pr-2">
                {filteredTools.length > 0 ? (
                    <ul className="space-y-4">
                        {filteredTools.map(tool => (
                            <li key={tool.id} className="bg-gray-900/50 p-4 rounded-md border border-gray-700/50">
                              {editingToolId === tool.id ? (
                                <form onSubmit={handleUpdateTool} className="space-y-4">
                                  <div>
                                    <label htmlFor="edit-name" className="text-xs font-medium text-cyan-400">Name</label>
                                    <Input id="edit-name" name="name" value={editFormData.name} onChange={handleEditFormChange} className="text-sm" required/>
                                  </div>
                                  <div>
                                    <label htmlFor="edit-url" className="text-xs font-medium text-cyan-400">URL</label>
                                    <Input id="edit-url" name="url" type="url" value={editFormData.url} onChange={handleEditFormChange} className="text-sm" required/>
                                  </div>
                                  <div>
                                    <label htmlFor="edit-category" className="text-xs font-medium text-cyan-400">Category</label>
                                    <Input id="edit-category" name="category" value={editFormData.category} onChange={handleEditFormChange} className="text-sm"/>
                                  </div>
                                  <div>
                                    <label htmlFor="edit-description" className="text-xs font-medium text-cyan-400">Description</label>
                                    <Textarea id="edit-description" name="description" value={editFormData.description} onChange={handleEditFormChange} rows={3} className="text-sm" required/>
                                  </div>
                                  <div className="flex justify-end items-center gap-2">
                                      <Button type="button" onClick={handleCancelEdit} className="px-4 py-2 text-xs bg-gray-600 hover:bg-gray-500 shadow-none text-white">
                                          Cancel
                                      </Button>
                                      <Button type="submit" className="px-4 py-2 text-xs">
                                          Save Changes
                                      </Button>
                                  </div>
                                </form>
                              ) : (
                                <div className="flex justify-between items-start gap-4">
                                  <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <p className="font-bold text-white truncate" title={tool.name}>{tool.name}</p>
                                        {tool.category && (
                                            <span className="text-xs font-semibold inline-block py-0.5 px-2 uppercase rounded-full text-cyan-300 bg-cyan-800/60 flex-shrink-0">
                                                {tool.category}
                                            </span>
                                        )}
                                      </div>
                                      <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-500 hover:underline truncate block" title={tool.url}>{tool.url}</a>
                                      <p className="text-sm text-gray-400 mt-2">{tool.description}</p>
                                  </div>
                                  <div className="flex-shrink-0 flex items-center gap-2">
                                    <button
                                      onClick={() => handleEditClick(tool)}
                                      title={`Edit ${tool.name}`}
                                      aria-label={`Edit ${tool.name}`}
                                      className="p-2 bg-blue-600/20 text-blue-400 font-semibold rounded-full hover:bg-blue-600/40 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all duration-300"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tool.id, tool.name)}
                                        title={`Delete ${tool.name}`}
                                        aria-label={`Delete ${tool.name}`}
                                        className="p-2 bg-red-600/20 text-red-400 font-semibold rounded-full hover:bg-red-600/40 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 transition-all duration-300"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 py-8">
                      {tools.length > 0 ? "No tools match your search." : "No tools to manage yet. Add one!"}
                    </p>
                )}
              </div>
            </div>

            {/* Export Tools */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8">
                <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Export Tools</h2>
                <p className="mt-1 text-gray-400 text-sm">Download the current tool list as a spreadsheet.</p>
                </div>
                <div className="flex justify-center">
                    <Button onClick={handleExport} disabled={tools.length === 0} className="w-full">
                        Export to Excel
                    </Button>
                </div>
                {tools.length === 0 && (
                    <p className="text-center mt-4 text-sm text-gray-500">
                        There are no tools to export.
                    </p>
                )}
            </div>
        </div>
      </div>
      <HelpButton onClick={() => setIsHelpModalOpen(true)} />
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="Admin Panel Guide"
      >
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg text-white mb-2">📝 Add a New Tool</h3>
            <p>
              Use the form on the left to add a single tool to the directory. All fields are required except for "Category".
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg text-white mb-2">📤 Import from Excel</h3>
            <p>
              You can add multiple tools at once by uploading an Excel file (<code className="bg-gray-900 text-cyan-400 px-1 rounded-sm">.xlsx</code>, <code className="bg-gray-900 text-cyan-400 px-1 rounded-sm">.xls</code>, <code className="bg-gray-900 text-cyan-400 px-1 rounded-sm">.csv</code>).
            </p>
            <p className="mt-2">
              Your spreadsheet must have columns with the following headers:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 mt-2">
              <li><code className="bg-gray-900 text-cyan-400 px-1 rounded-sm">Name</code> (Required)</li>
              <li><code className="bg-gray-900 text-cyan-400 px-1 rounded-sm">URL</code> (Required)</li>
              <li><code className="bg-gray-900 text-cyan-400 px-1 rounded-sm">Description</code> (Required)</li>
              <li><code className="bg-gray-900 text-cyan-400 px-1 rounded-sm">Category</code> (Optional)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg text-white mb-2">🗂️ Manage Existing Tools</h3>
            <p>
              The list on the right shows all current tools. You can:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 mt-2">
              <li><strong className="text-cyan-400">Search:</strong> Use the search bar to quickly find a tool in the list.</li>
              <li><strong className="text-cyan-400">Edit:</strong> Click the pencil icon to edit a tool's details inline.</li>
              <li><strong className="text-cyan-400">Delete:</strong> Click the trash can icon to permanently remove a tool. You will be asked to confirm this action.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg text-white mb-2">📥 Export to Excel</h3>
            <p>
              Click the "Export to Excel" button to download a spreadsheet of the entire tool collection. This is useful for backups or sharing the data.
            </p>
          </div>
        </div>
      </HelpModal>
    </div>
  );
};

export default AdminPage;