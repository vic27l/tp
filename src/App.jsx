import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import NovaFicha from './pages/NovaFicha'
import VisualizarFicha from './pages/VisualizarFicha'
import EditarFicha from './pages/EditarFicha'
import Consultas from './pages/Consultas'

function App() {
  return (
    <div className="min-h-screen">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <Layout currentPageName="Dashboard">
              <Dashboard />
            </Layout>
          } />
          <Route path="/nova-ficha" element={
            <Layout currentPageName="NovaFicha">
              <NovaFicha />
            </Layout>
          } />
          <Route path="/visualizar-ficha" element={
            <Layout currentPageName="VisualizarFicha">
              <VisualizarFicha />
            </Layout>
          } />
          <Route path="/editar-ficha" element={
            <Layout currentPageName="EditarFicha">
              <EditarFicha />
            </Layout>
          } />
          <Route path="/consultas" element={
            <Layout currentPageName="Consultas">
              <Consultas />
            </Layout>
          } />
        </Routes>
      </Router>
    </div>
  )
}

export default App