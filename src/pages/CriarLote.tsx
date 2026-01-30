import React, { useState } from 'react';
import api from '../http/api';
import {
  UserPlus, FileText, CheckCircle,
  AlertCircle, Upload, Loader2, User, Phone, IdCard
} from 'lucide-react';

// Tipos de documentos aceitos pelo seu Back-end
const TIPOS_DOCUMENTOS = [
  "CPF",
  "RG",
  "CERTIDAO_NASCIMENTO",
  "HISTORICO_ESCOLAR",
  "COMPROVANTE_RESIDENCIA"
];

export function CriarLote() {

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    userId: 1 
  });

  const [arquivos, setArquivos] = useState<Record<string, File | null>>({
    CPF: null,
    RG: null,
    CERTIDAO_NASCIMENTO: null,
    HISTORICO_ESCOLAR: null,
    COMPROVANTE_RESIDENCIA: null
  });


  const [loading, setLoading] = useState(false);
  const [etapa, setEtapa] = useState(''); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, tipo: string) => {
    if (e.target.files && e.target.files[0]) {
      setArquivos({ ...arquivos, [tipo]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica: conferir se ao menos um arquivo foi selecionado
    const temArquivo = Object.values(arquivos).some(file => file !== null);
    if (!temArquivo) {
      alert("Por favor, selecione ao menos um documento.");
      return;
    }

    setLoading(true);
    setEtapa("Criando registro do lote...");

    try {
      const resLote = await api.post('/lotes', formData);
      const loteId = resLote.data.id; 


      for (const tipo of TIPOS_DOCUMENTOS) {
        const file = arquivos[tipo];

        if (file) {
          setEtapa(`Enviando ${tipo.replace('_', ' ')}...`);

          const fd = new FormData();
          fd.append('arquivo', file);

          await api.post(`/lotes/${loteId}/documentos/${tipo}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      }


   
      setFormData({ nome: '', cpf: '', telefone: '', userId: 1 });
      setArquivos({
        CPF: null, RG: null, CERTIDAO_NASCIMENTO: null,
        HISTORICO_ESCOLAR: null, COMPROVANTE_RESIDENCIA: null
      });
      setEtapa("");

    } catch (error) {
      console.error(error);
      alert("Erro ao processar lote. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-64 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
          <UserPlus className="text-primary" size={32} />
          Cadastrar Novo Lote
        </h1>
        <p className="text-gray-500 mt-2 font-medium">Preencha os dados e anexe os documentos obrigatórios para triagem.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl space-y-8">

        {/* SEÇÃO 1: DADOS PESSOAIS */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
            <User size={16} /> 1. Identificação do Cliente
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Nome Completo</label>
              <div className="relative">
                <input
                  required name="nome" value={formData.nome} onChange={handleChange}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-4 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                  placeholder="Ex: Carlos Silva"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">CPF (Apenas números)</label>
              <div className="relative">
                <input
                  required name="cpf" value={formData.cpf} onChange={handleChange}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Telefone</label>
              <div className="relative">
                <input
                  required name="telefone" value={formData.telefone} onChange={handleChange}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: CHECKLIST DE DOCUMENTOS */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
            <FileText size={16} /> 2. Upload de Documentação
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TIPOS_DOCUMENTOS.map((tipo) => (
              <div
                key={tipo}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${arquivos[tipo] ? 'border-green-200 bg-green-50/50' : 'border-gray-100 bg-gray-50/30'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${arquivos[tipo] ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {arquivos[tipo] ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-800 uppercase leading-tight">
                      {tipo.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold">
                      {arquivos[tipo] ? arquivos[tipo]?.name : 'PENDENTE'}
                    </p>
                  </div>
                </div>

                <label className="cursor-pointer group">
                  <div className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${arquivos[tipo] ? 'bg-white text-green-600 border border-green-200' : 'bg-primary text-white shadow-md hover:bg-blue-800'
                    }`}>
                    <Upload size={14} />
                    {arquivos[tipo] ? 'ALTERAR' : 'ANEXAR'}
                  </div>
                  <input type="file" className="hidden" onChange={(e) => handleFileChange(e, tipo)} />
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex justify-end border-t pt-8">
          <button
            type="submit"
            disabled={loading}
            className={`
      relative min-w-[240px] px-8 py-4 rounded-2xl font-bold text-sm tracking-wide
      transition-all duration-300 flex items-center justify-center gap-3
      ${loading
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95'
              }
    `}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span className="uppercase">{etapa}</span>
              </>
            ) : (
              <>
                <CheckCircle size={18} className="opacity-80" />
                <span className="uppercase">Finalizar e Enviar Lote</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}