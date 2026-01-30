import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { CriarLote } from './pages/CriarLote';
import { ConsultarLote } from './pages/ConsultarLote';
import { DetalhesLote } from './pages/DetalhesLote';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Routes>
          <Route path="/" element={<CriarLote />} />
          <Route path="/consulta" element={<ConsultarLote />} />
          <Route path="/lote/:id" element={<DetalhesLote />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;