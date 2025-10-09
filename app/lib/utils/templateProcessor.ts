
/**
 * Template Processor
 * 
 * Utilidades para procesar plantillas de notificaciones con variables dinámicas
 */

/**
 * Variables disponibles para plantillas:
 * 
 * Cliente:
 * - {{clientName}} - Nombre del cliente
 * - {{clientEmail}} - Email del cliente
 * - {{clientPhone}} - Teléfono del cliente
 * 
 * Cita:
 * - {{appointmentDate}} - Fecha de la cita (formato: DD/MM/YYYY)
 * - {{appointmentTime}} - Hora de la cita (formato: HH:MM)
 * - {{appointmentDateTime}} - Fecha y hora completa
 * - {{serviceName}} - Nombre del servicio
 * - {{servicePrice}} - Precio del servicio
 * - {{serviceDuration}} - Duración del servicio
 * - {{staffName}} - Nombre del profesional
 * 
 * Negocio:
 * - {{businessName}} - Nombre del negocio
 * - {{businessPhone}} - Teléfono del negocio
 * - {{businessAddress}} - Dirección del negocio
 * - {{businessEmail}} - Email del negocio
 * 
 * Promociones:
 * - {{promotionMessage}} - Mensaje de la promoción
 * - {{promotionDiscount}} - Descuento de la promoción
 * - {{promotionValidUntil}} - Fecha de vencimiento
 * 
 * Pagos:
 * - {{amount}} - Monto a pagar
 * - {{currency}} - Moneda
 * - {{dueDate}} - Fecha de vencimiento
 * - {{invoiceNumber}} - Número de factura
 */

interface TemplateVariables {
  // Cliente
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;

  // Cita
  appointmentDate?: string | Date;
  appointmentTime?: string;
  appointmentDateTime?: string | Date;
  serviceName?: string;
  servicePrice?: number | string;
  serviceDuration?: number | string;
  staffName?: string;

  // Negocio
  businessName?: string;
  businessPhone?: string;
  businessAddress?: string;
  businessEmail?: string;

  // Promociones
  promotionMessage?: string;
  promotionDiscount?: string;
  promotionValidUntil?: string | Date;

  // Pagos
  amount?: number | string;
  currency?: string;
  dueDate?: string | Date;
  invoiceNumber?: string;

  // Otros
  [key: string]: any;
}

/**
 * Procesa una plantilla reemplazando variables dinámicas
 */
export function processTemplate(template: string, variables: TemplateVariables): string {
  let processed = template;

  // Formatear fechas antes de reemplazar
  const formattedVars = formatVariables(variables);

  // Reemplazar cada variable
  Object.keys(formattedVars).forEach(key => {
    const value = formattedVars[key];
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(regex, String(value || ''));
  });

  // Limpiar variables no reemplazadas (opcional)
  // processed = processed.replace(/{{[^}]+}}/g, '');

  return processed;
}

/**
 * Formatea las variables según su tipo
 */
function formatVariables(variables: TemplateVariables): Record<string, any> {
  const formatted: Record<string, any> = { ...variables };

  // Formatear fechas
  if (variables.appointmentDate) {
    formatted.appointmentDate = formatDate(variables.appointmentDate);
  }

  if (variables.appointmentDateTime) {
    formatted.appointmentDateTime = formatDateTime(variables.appointmentDateTime);
  }

  if (variables.promotionValidUntil) {
    formatted.promotionValidUntil = formatDate(variables.promotionValidUntil);
  }

  if (variables.dueDate) {
    formatted.dueDate = formatDate(variables.dueDate);
  }

  // Formatear precios
  if (variables.servicePrice) {
    formatted.servicePrice = formatCurrency(variables.servicePrice, variables.currency);
  }

  if (variables.amount) {
    formatted.amount = formatCurrency(variables.amount, variables.currency);
  }

  // Formatear duración
  if (variables.serviceDuration) {
    formatted.serviceDuration = formatDuration(variables.serviceDuration);
  }

  return formatted;
}

/**
 * Formatea una fecha al formato DD/MM/YYYY
 */
function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return String(date);
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formatea una fecha y hora al formato DD/MM/YYYY HH:MM
 */
function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return String(date);
  }

  const dateStr = formatDate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${dateStr} ${hours}:${minutes}`;
}

/**
 * Formatea un monto como moneda
 */
function formatCurrency(amount: number | string, currency: string = 'MXN'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) {
    return String(amount);
  }

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
  }).format(num);
}

/**
 * Formatea duración en minutos a formato legible
 */
function formatDuration(minutes: number | string): string {
  const mins = typeof minutes === 'string' ? parseInt(minutes) : minutes;
  
  if (isNaN(mins)) {
    return String(minutes);
  }

  if (mins < 60) {
    return `${mins} minutos`;
  }

  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (remainingMins === 0) {
    return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }

  return `${hours} ${hours === 1 ? 'hora' : 'horas'} y ${remainingMins} minutos`;
}

/**
 * Valida que una plantilla tenga sintaxis correcta
 */
export function validateTemplate(template: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Verificar que las llaves estén balanceadas
  const openBraces = (template.match(/{{/g) || []).length;
  const closeBraces = (template.match(/}}/g) || []).length;

  if (openBraces !== closeBraces) {
    errors.push('Las llaves {{ }} no están balanceadas');
  }

  // Verificar que no haya llaves anidadas
  if (/{{[^}]*{{/.test(template)) {
    errors.push('No se permiten llaves anidadas');
  }

  // Verificar que las variables tengan nombres válidos
  const variables = template.match(/{{([^}]+)}}/g) || [];
  variables.forEach(variable => {
    const name = variable.replace(/[{}]/g, '');
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
      errors.push(`Variable inválida: ${variable}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Extrae las variables usadas en una plantilla
 */
export function extractVariables(template: string): string[] {
  const matches = template.match(/{{([^}]+)}}/g) || [];
  return matches.map(match => match.replace(/[{}]/g, ''));
}

/**
 * Obtiene una lista de todas las variables disponibles
 */
export function getAvailableVariables(): { name: string; description: string; category: string }[] {
  return [
    // Cliente
    { name: 'clientName', description: 'Nombre del cliente', category: 'Cliente' },
    { name: 'clientEmail', description: 'Email del cliente', category: 'Cliente' },
    { name: 'clientPhone', description: 'Teléfono del cliente', category: 'Cliente' },

    // Cita
    { name: 'appointmentDate', description: 'Fecha de la cita (DD/MM/YYYY)', category: 'Cita' },
    { name: 'appointmentTime', description: 'Hora de la cita (HH:MM)', category: 'Cita' },
    { name: 'appointmentDateTime', description: 'Fecha y hora completa', category: 'Cita' },
    { name: 'serviceName', description: 'Nombre del servicio', category: 'Cita' },
    { name: 'servicePrice', description: 'Precio del servicio', category: 'Cita' },
    { name: 'serviceDuration', description: 'Duración del servicio', category: 'Cita' },
    { name: 'staffName', description: 'Nombre del profesional', category: 'Cita' },

    // Negocio
    { name: 'businessName', description: 'Nombre del negocio', category: 'Negocio' },
    { name: 'businessPhone', description: 'Teléfono del negocio', category: 'Negocio' },
    { name: 'businessAddress', description: 'Dirección del negocio', category: 'Negocio' },
    { name: 'businessEmail', description: 'Email del negocio', category: 'Negocio' },

    // Promociones
    { name: 'promotionMessage', description: 'Mensaje de la promoción', category: 'Promociones' },
    { name: 'promotionDiscount', description: 'Descuento de la promoción', category: 'Promociones' },
    { name: 'promotionValidUntil', description: 'Fecha de vencimiento', category: 'Promociones' },

    // Pagos
    { name: 'amount', description: 'Monto a pagar', category: 'Pagos' },
    { name: 'currency', description: 'Moneda', category: 'Pagos' },
    { name: 'dueDate', description: 'Fecha de vencimiento', category: 'Pagos' },
    { name: 'invoiceNumber', description: 'Número de factura', category: 'Pagos' },
  ];
}
