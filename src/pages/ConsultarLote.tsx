import React, { useState, useEffect } from 'react';
import api from '../http/api';
import { Search, Download, FileWarning, CheckCircle, Clock, Phone, Calendar, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Lote {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  status: 'ABERTO' | 'INCOMPLETO' | 'COMPLETO';
  caminho: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  data: string;
  total: number;
  lotes: Lote[];
}

export function ConsultarLote() {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);

  // Começar com a data de hoje
  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split('T')[0]);

  const fetchLotes = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse>(`/lotes?data=${dataFiltro}`);

      setLotes(response.data.lotes);
    } catch (error) {
      console.error("Erro ao carregar lotes:", error);
      setLotes([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLotes();
  }, [dataFiltro]);

  // Cores de Status
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETO': return 'bg-green-100 text-green-700 border-green-200';
      case 'INCOMPLETO': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ABERTO': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const lotesExibidos = lotes.filter(l =>
    l.nome.toLowerCase().includes(busca.toLowerCase()) || l.cpf.includes(busca)
  );

  return (
    <div className="ml-64 p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Consulta de Lotes</h1>
          <p className="text-gray-500 font-medium">Listando lotes do dia selecionado.</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border shadow-sm">
          <Calendar size={20} className="text-primary ml-2" />
          <input
            type="date"
            value={dataFiltro}
            onChange={(e) => setDataFiltro(e.target.value)}
            className="outline-none font-semibold text-gray-700 p-1 cursor-pointer"
          />
        </div>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm outline-none focus:ring-2 focus:ring-primary"
          placeholder="Filtrar por nome ou CPF na lista de hoje..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-primary">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p className="font-medium">Consultando API...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {lotesExibidos.map((lote) => (
            <div key={lote.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">ID #{lote.id}</span>
                  <h3 className="text-lg font-bold text-gray-800 capitalize">{lote.nome}</h3>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black ${getStatusStyle(lote.status)}`}>
                    {lote.status === 'COMPLETO' ? <CheckCircle size={14} /> : lote.status === 'INCOMPLETO' ? <FileWarning size={14} /> : <Clock size={14} />}
                    {lote.status}
                  </span>
                </div>

                <div className="flex gap-6 text-sm text-gray-500 font-medium">
                  <span className="flex items-center gap-1"><span className="text-gray-400">CPF:</span> {lote.cpf}</span>
                  <span className="flex items-center gap-1"><Phone size={14} className="text-gray-400" /> {lote.telefone}</span>
                  <span className="flex items-center gap-1"><Clock size={14} className="text-gray-400" /> {new Date(lote.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>

              <Link
                to={`/lote/${lote.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-800 font-semibold text-sm transition-colors shadow-md"
              >
                <ExternalLink size={18} />
                Detalhes
              </Link>
            </div>
          ))}

          {lotesExibidos.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">Nenhum lote encontrado para esta data ou busca.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}