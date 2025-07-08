export const createPageUrl = (pageName) => {
  const routes = {
    'Dashboard': '/dashboard',
    'NovaFicha': '/nova-ficha',
    'VisualizarFicha': '/visualizar-ficha',
    'EditarFicha': '/editar-ficha',
    'Consultas': '/consultas'
  };
  
  return routes[pageName] || '/dashboard';
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('pt-BR');
};

export const formatSimNao = (value) => {
  if (value === true) return 'SIM';
  if (value === false) return 'NÃO';
  return 'Não informado';
};