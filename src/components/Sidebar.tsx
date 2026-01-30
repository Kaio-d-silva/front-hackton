import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FilePlus, Search, LayoutDashboard } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();

  // Função para ver se o link está ativo e mudar a cor
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 p-4">
      <div className="flex items-center gap-2 mb-10 text-primary font-bold text-xl px-2">
        <LayoutDashboard size={28} />
        <span>DocFlow</span>
      </div>

      <nav className="space-y-2">
        <Link 
          to="/" 
          className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
            isActive('/') ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FilePlus size={20} />
          <span>Criar Lote</span>
        </Link>

        <Link 
          to="/consulta" 
          className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
            isActive('/consulta') ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Search size={20} />
          <span>Consultar Status</span>
        </Link>
      </nav>
    </div>
  );
}