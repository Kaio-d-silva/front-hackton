import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../http/api';
import {
    ChevronLeft, CheckCircle, AlertCircle, Upload,
    Loader2, User, IdCard, Phone, FileText, Download
} from 'lucide-react';

interface DocumentoEnviado {
    id: number;
    tipo: string;
    arquivo: string;
    originalName: string;
    mimeType: string;
}

interface LoteResponse {
    lote: {
        id: number;
        nome: string;
        cpf: string;
        telefone: string;
        status: 'ABERTO' | 'INCOMPLETO' | 'COMPLETO';
        createdAt: string;
    };
    documentos: DocumentoEnviado[];
    documentosEnviados: string[];
    documentosFaltando: string[];
}

export function DetalhesLote() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<LoteResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const response = await api.get<LoteResponse>(`/lotes/${id}`);
            setData(response.data);
        } catch (error) {
            console.error(error);
            alert("Erro ao carregar dados do lote.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, [id]);

    const handleDownload = async (tipo: string) => {
        try {
            const response = await api.get(`/lotes/${id}/documentos/${tipo}`, {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/octet-stream'
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            link.setAttribute('download', `Lote_${id}_${tipo}.pdf`);

            // Simula o clique para iniciar o download e limpa a memória
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Erro ao baixar arquivo:", error);
            alert("Não foi possível baixar o documento.");
        }
    };
    const handleUploadAdicional = async (e: React.ChangeEvent<HTMLInputElement>, tipo: string) => {
        if (!e.target.files?.[0]) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('arquivo', file);

        try {
            setUploading(tipo);

            await api.post(`/lotes/${id}/documentos/${tipo}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            carregarDados(); 
        } catch (error) {
            console.error(error);
            alert(`Erro ao enviar o documento ${tipo}.`);
        } finally {
            setUploading(null);
        }
    };

    if (loading) return (
        <div className="ml-64 p-8 flex justify-center items-center h-screen">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    if (!data) return <div className="ml-64 p-8">Lote não encontrado.</div>;

    return (
        <div className="ml-64 p-8">
            <button onClick={() => navigate('/consulta')} className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6 font-semibold">
                <ChevronLeft size={20} /> Voltar
            </button>

            {/* CABEÇALHO COM DADOS DO CLIENTE */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="bg-primary text-white p-4 rounded-full"><User size={30} /></div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 uppercase">{data.lote.nome}</h1>
                        <div className="flex gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><IdCard size={14} /> {data.lote.cpf}</span>
                            <span className="flex items-center gap-1"><Phone size={14} /> {data.lote.telefone}</span>
                            <span className="flex items-center gap-1"><FileText size={14} /> Lote #{data.lote.id}</span>
                        </div>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold border ${data.lote.status === 'COMPLETO' ? 'bg-green-100 border-green-200 text-green-700' : 'bg-orange-100 border-orange-200 text-orange-700'
                    }`}>
                    {data.lote.status}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                <div className="space-y-4">
                    <h2 className="font-bold text-gray-700 flex items-center gap-2">
                        <CheckCircle className="text-green-500" size={20} />
                        Documentos Enviados ({data.documentos.length})
                    </h2>

                    {data.documentos.map(doc => (
                        <div key={doc.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-primary transition-all">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-50 p-2 rounded-lg text-green-600">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm uppercase">{doc.tipo}</p>
                                    <p className="text-[10px] text-gray-400 font-mono">{doc.originalName}</p>
                                </div>
                            </div>

                            {/* BOTÃO DE DOWNLOAD REAL */}
                            <button
                                onClick={() => handleDownload(doc.tipo)}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-primary rounded-lg hover:bg-primary hover:text-white transition-all font-bold text-xs"
                                title="Baixar Arquivo"
                            >
                                <Download size={16} />
                                BAIXAR
                            </button>
                        </div>
                    ))}

                    {data.documentos.length === 0 && (
                        <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-lg border border-dashed">
                            Nenhum documento processado até o momento.
                        </p>
                    )}
                </div>

                {/* COLUNA: DOCUMENTOS FALTANTES */}
                <div className="space-y-4">
                    <h2 className="font-bold text-gray-700 flex items-center gap-2">
                        <AlertCircle className="text-orange-500" size={20} />
                        Pendências ({data.documentosFaltando.length})
                    </h2>
                    {data.documentosFaltando.map(tipo => (
                        <div key={tipo} className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex justify-between items-center">
                            <span className="font-bold text-orange-800 text-sm">{tipo.replace('_', ' ')}</span>
                            <label className="cursor-pointer bg-orange-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-orange-700 shadow-sm transition-all">
                                {uploading === tipo ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                                ANEXAR
                                <input type="file" className="hidden" onChange={(e) => handleUploadAdicional(e, tipo)} disabled={!!uploading} />
                            </label>
                        </div>
                    ))}
                    {data.documentosFaltando.length === 0 && (
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-green-700 text-sm font-bold flex items-center gap-2">
                            <CheckCircle size={18} /> Tudo pronto! Nenhuma pendência.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}