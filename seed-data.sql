-- ============================================
-- CitaPlanner - Script SQL para Datos de Prueba
-- ============================================
-- Este script inserta datos de prueba en la base de datos
-- ADVERTENCIA: Elimina todos los usuarios existentes primero
-- ============================================

-- Limpiar datos existentes (en orden inverso por dependencias)
DELETE FROM payments;
DELETE FROM appointments;
DELETE FROM "service_users";
DELETE FROM "working_hours";
DELETE FROM clients;
DELETE FROM services;
DELETE FROM users;
DELETE FROM branches;
DELETE FROM tenants;

-- ============================================
-- 1. CREAR TENANT (EMPRESA)
-- ============================================

INSERT INTO tenants (
    id, 
    name, 
    email, 
    phone, 
    address, 
    city, 
    country,
    timezone,
    currency,
    "primaryColor",
    "secondaryColor",
    "isActive",
    "allowOnlineBooking",
    "requireClientPhone",
    "requireClientEmail",
    "bookingAdvanceDays",
    "createdAt",
    "updatedAt"
) VALUES (
    'tenant_demo_001',
    'Bella Vita Spa & Wellness',
    'contacto@bellavita.com',
    '+52 55 1234 5678',
    'Avenida Reforma 123, Col. Centro',
    'Ciudad de México',
    'México',
    'America/Mexico_City',
    'MXN',
    '#3B82F6',
    '#EF4444',
    true,
    true,
    true,
    false,
    30,
    NOW(),
    NOW()
);

-- ============================================
-- 2. CREAR SUCURSAL
-- ============================================

INSERT INTO branches (
    id,
    name,
    address,
    phone,
    email,
    "isActive",
    "tenantId",
    "createdAt",
    "updatedAt"
) VALUES (
    'branch_demo_001',
    'Sucursal Centro',
    'Avenida Reforma 123, Col. Centro',
    '+52 55 1234 5678',
    'centro@bellavita.com',
    true,
    'tenant_demo_001',
    NOW(),
    NOW()
);

-- ============================================
-- 3. CREAR USUARIOS
-- ============================================
-- Contraseñas hasheadas con bcrypt (10 rounds):
-- admin123 -> $2b$10$YQx8rqEKGXW5L5fZJ5fZJ5fZJ5fZJ5fZJ5fZJ5fZJ5fZJ5fZJ5fZJ
-- manager123 -> $2b$10$YQx8rqEKGXW5L5fZJ5fZJ5fZJ5fZJ5fZJ5fZJ5fZJ5fZJ5fZJ5fZJ
-- prof123 -> $2b$10$YQx8rqEKGXW5L5fZJ5fZJ5fZJ5fZJ5fZJ5fZJ5fZJ5fZJ5fZJ5fZJ

-- Admin
INSERT INTO users (
    id,
    email,
    password,
    "firstName",
    "lastName",
    phone,
    role,
    "isActive",
    "tenantId",
    "branchId",
    "createdAt",
    "updatedAt"
) VALUES (
    'user_admin_001',
    'admin@citaplanner.com',
    '$2b$10$rQx8rqEKGXW5L5fZJ5fZJOYQx8rqEKGXW5L5fZJ5fZJ5fZJ5fZJO',
    'Administrador',
    'Principal',
    '+52 55 1111 1111',
    'ADMIN',
    true,
    'tenant_demo_001',
    'branch_demo_001',
    NOW(),
    NOW()
);

-- Manager
INSERT INTO users (
    id,
    email,
    password,
    "firstName",
    "lastName",
    phone,
    role,
    "isActive",
    "tenantId",
    "branchId",
    "createdAt",
    "updatedAt"
) VALUES (
    'user_manager_001',
    'manager@citaplanner.com',
    '$2b$10$rQx8rqEKGXW5L5fZJ5fZJOYQx8rqEKGXW5L5fZJ5fZJ5fZJ5fZJO',
    'Gerente',
    'de Sucursal',
    '+52 55 2222 2222',
    'MANAGER',
    true,
    'tenant_demo_001',
    'branch_demo_001',
    NOW(),
    NOW()
);

-- Profesional 1 (Estilista)
INSERT INTO users (
    id,
    email,
    password,
    "firstName",
    "lastName",
    phone,
    role,
    "isActive",
    "tenantId",
    "branchId",
    "createdAt",
    "updatedAt"
) VALUES (
    'user_pro1_001',
    'pro1@citaplanner.com',
    '$2b$10$rQx8rqEKGXW5L5fZJ5fZJOYQx8rqEKGXW5L5fZJ5fZJ5fZJ5fZJO',
    'Estilista',
    'Senior',
    '+52 55 3333 3333',
    'PROFESSIONAL',
    true,
    'tenant_demo_001',
    'branch_demo_001',
    NOW(),
    NOW()
);

-- Profesional 2 (Barbero)
INSERT INTO users (
    id,
    email,
    password,
    "firstName",
    "lastName",
    phone,
    role,
    "isActive",
    "tenantId",
    "branchId",
    "createdAt",
    "updatedAt"
) VALUES (
    'user_pro2_001',
    'pro2@citaplanner.com',
    '$2b$10$rQx8rqEKGXW5L5fZJ5fZJOYQx8rqEKGXW5L5fZJ5fZJ5fZJ5fZJO',
    'Barbero',
    'Profesional',
    '+52 55 4444 4444',
    'PROFESSIONAL',
    true,
    'tenant_demo_001',
    'branch_demo_001',
    NOW(),
    NOW()
);

-- Recepcionista
INSERT INTO users (
    id,
    email,
    password,
    "firstName",
    "lastName",
    phone,
    role,
    "isActive",
    "tenantId",
    "branchId",
    "createdAt",
    "updatedAt"
) VALUES (
    'user_recep_001',
    'recepcionista@citaplanner.com',
    '$2b$10$rQx8rqEKGXW5L5fZJ5fZJOYQx8rqEKGXW5L5fZJ5fZJ5fZJ5fZJO',
    'Recepcionista',
    'Principal',
    '+52 55 5555 5555',
    'RECEPTIONIST',
    true,
    'tenant_demo_001',
    'branch_demo_001',
    NOW(),
    NOW()
);

-- ============================================
-- 4. CREAR SERVICIOS
-- ============================================

INSERT INTO services (id, name, description, duration, price, "isActive", color, "tenantId", "createdAt", "updatedAt") VALUES
('service_001', 'Facial Hidratante', 'Facial completo con productos hidratantes y masaje relajante', 60, 850, true, '#3B82F6', 'tenant_demo_001', NOW(), NOW()),
('service_002', 'Masaje Relajante', 'Masaje corporal completo con aceites esenciales', 90, 1200, true, '#10B981', 'tenant_demo_001', NOW(), NOW()),
('service_003', 'Manicure y Pedicure', 'Cuidado completo de manos y pies con esmaltado', 120, 650, true, '#F59E0B', 'tenant_demo_001', NOW(), NOW()),
('service_004', 'Corte de Cabello', 'Corte y peinado profesional', 45, 450, true, '#8B5CF6', 'tenant_demo_001', NOW(), NOW()),
('service_005', 'Limpieza Facial Profunda', 'Limpieza facial con extracción de impurezas', 75, 950, true, '#EF4444', 'tenant_demo_001', NOW(), NOW()),
('service_006', 'Masaje Terapéutico', 'Masaje especializado para dolores musculares', 60, 1000, true, '#06B6D4', 'tenant_demo_001', NOW(), NOW());

-- ============================================
-- 5. ASIGNAR SERVICIOS A PROFESIONALES
-- ============================================

INSERT INTO "service_users" (id, "serviceId", "userId", commission, "createdAt") VALUES
-- Estilista Senior - Especialista en faciales
('su_001', 'service_001', 'user_pro1_001', 40, NOW()),
('su_002', 'service_005', 'user_pro1_001', 45, NOW()),
('su_003', 'service_003', 'user_pro1_001', 30, NOW()),

-- Barbero - Especialista en masajes
('su_004', 'service_002', 'user_pro2_001', 35, NOW()),
('su_005', 'service_006', 'user_pro2_001', 40, NOW()),
('su_006', 'service_004', 'user_pro2_001', 50, NOW());

-- ============================================
-- 6. CREAR CLIENTES
-- ============================================

INSERT INTO clients (id, "firstName", "lastName", email, phone, address, notes, "isActive", "tenantId", "createdAt", "updatedAt") VALUES
('client_001', 'Isabella', 'Torres', 'isabella.torres@email.com', '+52 55 1111 0001', 'Calle Madero 456, Col. Roma', 'Cliente VIP, prefiere tratamientos relajantes', true, 'tenant_demo_001', NOW(), NOW()),
('client_002', 'Diego', 'Hernández', 'diego.hernandez@email.com', '+52 55 1111 0002', 'Avenida Insurgentes 789, Col. Condesa', NULL, true, 'tenant_demo_001', NOW(), NOW()),
('client_003', 'Sofía', 'Ramírez', 'sofia.ramirez@email.com', '+52 55 1111 0003', 'Boulevard Ávila Camacho 321, Col. Polanco', 'Alérgica a productos con fragancia', true, 'tenant_demo_001', NOW(), NOW()),
('client_004', 'Alejandro', 'Morales', 'alejandro.morales@email.com', '+52 55 1111 0004', 'Calle Álvaro Obregón 654, Col. Coyoacán', NULL, true, 'tenant_demo_001', NOW(), NOW()),
('client_005', 'Camila', 'Vega', 'camila.vega@email.com', '+52 55 1111 0005', 'Paseo de la Reforma 987, Col. Juárez', NULL, true, 'tenant_demo_001', NOW(), NOW()),
('client_006', 'Fernando', 'Castro', 'fernando.castro@email.com', '+52 55 1111 0006', 'Avenida Chapultepec 147, Col. Doctores', NULL, true, 'tenant_demo_001', NOW(), NOW());

-- ============================================
-- 7. CREAR HORARIOS DE TRABAJO
-- ============================================

-- Lunes a Viernes (1-5): 9:00 - 18:00
INSERT INTO "working_hours" (id, "dayOfWeek", "startTime", "endTime", "isActive", "branchId", "createdAt", "updatedAt") VALUES
('wh_001', 1, '09:00', '18:00', true, 'branch_demo_001', NOW(), NOW()),
('wh_002', 2, '09:00', '18:00', true, 'branch_demo_001', NOW(), NOW()),
('wh_003', 3, '09:00', '18:00', true, 'branch_demo_001', NOW(), NOW()),
('wh_004', 4, '09:00', '18:00', true, 'branch_demo_001', NOW(), NOW()),
('wh_005', 5, '09:00', '18:00', true, 'branch_demo_001', NOW(), NOW()),
-- Sábado (6): 10:00 - 16:00
('wh_006', 6, '10:00', '16:00', true, 'branch_demo_001', NOW(), NOW());

-- ============================================
-- 8. CREAR CITAS DE EJEMPLO
-- ============================================

-- Cita de hoy a las 10:00 AM (CONFIRMED)
INSERT INTO appointments (
    id, "startTime", "endTime", status, notes, "isOnline",
    "tenantId", "branchId", "clientId", "serviceId", "userId",
    "createdAt", "updatedAt"
) VALUES (
    'apt_001',
    CURRENT_DATE + INTERVAL '10 hours',
    CURRENT_DATE + INTERVAL '11 hours',
    'CONFIRMED',
    'Primera sesión del tratamiento',
    false,
    'tenant_demo_001',
    'branch_demo_001',
    'client_001',
    'service_001',
    'user_pro1_001',
    NOW(),
    NOW()
);

-- Cita de hoy a las 2:00 PM (PENDING)
INSERT INTO appointments (
    id, "startTime", "endTime", status, notes, "isOnline",
    "tenantId", "branchId", "clientId", "serviceId", "userId",
    "createdAt", "updatedAt"
) VALUES (
    'apt_002',
    CURRENT_DATE + INTERVAL '14 hours',
    CURRENT_DATE + INTERVAL '15 hours 30 minutes',
    'PENDING',
    NULL,
    false,
    'tenant_demo_001',
    'branch_demo_001',
    'client_002',
    'service_002',
    'user_pro2_001',
    NOW(),
    NOW()
);

-- Cita de mañana a las 11:00 AM (CONFIRMED)
INSERT INTO appointments (
    id, "startTime", "endTime", status, notes, "isOnline",
    "tenantId", "branchId", "clientId", "serviceId", "userId",
    "createdAt", "updatedAt"
) VALUES (
    'apt_003',
    CURRENT_DATE + INTERVAL '1 day 11 hours',
    CURRENT_DATE + INTERVAL '1 day 12 hours 15 minutes',
    'CONFIRMED',
    NULL,
    false,
    'tenant_demo_001',
    'branch_demo_001',
    'client_003',
    'service_005',
    'user_pro1_001',
    NOW(),
    NOW()
);

-- Cita hace 3 días (COMPLETED)
INSERT INTO appointments (
    id, "startTime", "endTime", status, notes, "isOnline",
    "tenantId", "branchId", "clientId", "serviceId", "userId",
    "createdAt", "updatedAt"
) VALUES (
    'apt_004',
    CURRENT_DATE - INTERVAL '3 days' + INTERVAL '10 hours',
    CURRENT_DATE - INTERVAL '3 days' + INTERVAL '12 hours',
    'COMPLETED',
    'Cliente muy satisfecha con el resultado',
    false,
    'tenant_demo_001',
    'branch_demo_001',
    'client_004',
    'service_003',
    'user_pro1_001',
    NOW(),
    NOW()
);

-- Cita hace 2 días (COMPLETED)
INSERT INTO appointments (
    id, "startTime", "endTime", status, notes, "isOnline",
    "tenantId", "branchId", "clientId", "serviceId", "userId",
    "createdAt", "updatedAt"
) VALUES (
    'apt_005',
    CURRENT_DATE - INTERVAL '2 days' + INTERVAL '15 hours',
    CURRENT_DATE - INTERVAL '2 days' + INTERVAL '16 hours',
    'COMPLETED',
    NULL,
    false,
    'tenant_demo_001',
    'branch_demo_001',
    'client_005',
    'service_006',
    'user_pro2_001',
    NOW(),
    NOW()
);

-- Cita de ayer (COMPLETED)
INSERT INTO appointments (
    id, "startTime", "endTime", status, notes, "isOnline",
    "tenantId", "branchId", "clientId", "serviceId", "userId",
    "createdAt", "updatedAt"
) VALUES (
    'apt_006',
    CURRENT_DATE - INTERVAL '1 day' + INTERVAL '13 hours',
    CURRENT_DATE - INTERVAL '1 day' + INTERVAL '13 hours 45 minutes',
    'COMPLETED',
    NULL,
    false,
    'tenant_demo_001',
    'branch_demo_001',
    'client_006',
    'service_004',
    'user_pro2_001',
    NOW(),
    NOW()
);

-- ============================================
-- 9. CREAR PAGOS PARA CITAS COMPLETADAS
-- ============================================

-- Pago para cita apt_004
INSERT INTO payments (
    id, amount, "paymentMethod", status, notes,
    "tenantId", "branchId", "clientId", "appointmentId", "userId",
    "createdAt", "updatedAt"
) VALUES (
    'pay_001',
    650,
    'CASH',
    'PAID',
    NULL,
    'tenant_demo_001',
    'branch_demo_001',
    'client_004',
    'apt_004',
    'user_recep_001',
    CURRENT_DATE - INTERVAL '3 days' + INTERVAL '12 hours',
    CURRENT_DATE - INTERVAL '3 days' + INTERVAL '12 hours'
);

-- Pago para cita apt_005
INSERT INTO payments (
    id, amount, "paymentMethod", status, notes,
    "tenantId", "branchId", "clientId", "appointmentId", "userId",
    "createdAt", "updatedAt"
) VALUES (
    'pay_002',
    1000,
    'CREDIT_CARD',
    'PAID',
    NULL,
    'tenant_demo_001',
    'branch_demo_001',
    'client_005',
    'apt_005',
    'user_recep_001',
    CURRENT_DATE - INTERVAL '2 days' + INTERVAL '16 hours',
    CURRENT_DATE - INTERVAL '2 days' + INTERVAL '16 hours'
);

-- Pago para cita apt_006
INSERT INTO payments (
    id, amount, "paymentMethod", status, notes,
    "tenantId", "branchId", "clientId", "appointmentId", "userId",
    "createdAt", "updatedAt"
) VALUES (
    'pay_003',
    450,
    'CASH',
    'PAID',
    NULL,
    'tenant_demo_001',
    'branch_demo_001',
    'client_006',
    'apt_006',
    'user_recep_001',
    CURRENT_DATE - INTERVAL '1 day' + INTERVAL '13 hours 45 minutes',
    CURRENT_DATE - INTERVAL '1 day' + INTERVAL '13 hours 45 minutes'
);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Contar registros insertados
SELECT 
    (SELECT COUNT(*) FROM tenants) as tenants,
    (SELECT COUNT(*) FROM branches) as branches,
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM services) as services,
    (SELECT COUNT(*) FROM clients) as clients,
    (SELECT COUNT(*) FROM appointments) as appointments,
    (SELECT COUNT(*) FROM payments) as payments,
    (SELECT COUNT(*) FROM "working_hours") as working_hours;

-- ============================================
-- NOTA IMPORTANTE SOBRE CONTRASEÑAS
-- ============================================
-- Las contraseñas en este script son hashes de ejemplo.
-- Para generar hashes reales de bcrypt, usa el script de Node.js:
-- 
-- const bcrypt = require('bcryptjs');
-- const hash = bcrypt.hashSync('tu_contraseña', 10);
-- console.log(hash);
--
-- Contraseñas de prueba:
-- - admin123
-- - manager123
-- - prof123
-- ============================================
