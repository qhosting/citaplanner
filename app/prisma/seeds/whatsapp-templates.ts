/**
 * Seed script: WhatsApp Default Templates
 * 
 * Creates default message templates in Spanish for all WhatsApp notification types
 * 
 * Run with: npx ts-node -r tsconfig-paths/register prisma/seeds/whatsapp-templates.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_TEMPLATES = [
  {
    name: "Confirmación de Cita - Por Defecto",
    type: "APPOINTMENT_CREATED",
    content: `¡Hola {cliente}! ✨

Tu cita ha sido confirmada exitosamente:

📅 Fecha: {fecha}
🕐 Hora: {hora}
💆 Servicio: {servicio}
👤 Profesional: {profesional}
📍 Sucursal: {sucursal}
💰 Precio: {precio}

Dirección: {direccion}
Teléfono: {telefono}

¡Te esperamos! Si necesitas hacer algún cambio, por favor contáctanos con anticipación.`,
    variables: ["cliente", "fecha", "hora", "servicio", "profesional", "sucursal", "precio", "direccion", "telefono"],
    isDefault: true,
  },
  {
    name: "Modificación de Cita - Por Defecto",
    type: "APPOINTMENT_UPDATED",
    content: `Hola {cliente} 📝

Tu cita ha sido modificada:

📅 Nueva Fecha: {fecha}
🕐 Nueva Hora: {hora}
💆 Servicio: {servicio}
👤 Profesional: {profesional}
📍 Sucursal: {sucursal}

Dirección: {direccion}
Teléfono: {telefono}

Si tienes alguna pregunta, no dudes en contactarnos.`,
    variables: ["cliente", "fecha", "hora", "servicio", "profesional", "sucursal", "direccion", "telefono"],
    isDefault: true,
  },
  {
    name: "Cancelación de Cita - Por Defecto",
    type: "APPOINTMENT_CANCELLED",
    content: `Hola {cliente} ❌

Tu cita del {fecha} a las {hora} ha sido cancelada.

Si deseas reagendar, por favor contáctanos:
📍 Sucursal: {sucursal}
📞 Teléfono: {telefono}

¡Esperamos verte pronto!`,
    variables: ["cliente", "fecha", "hora", "sucursal", "telefono"],
    isDefault: true,
  },
  {
    name: "Recordatorio 24 Horas - Por Defecto",
    type: "REMINDER_24H",
    content: `¡Hola {cliente}! 🔔

Te recordamos que mañana tienes una cita:

📅 Fecha: {fecha}
🕐 Hora: {hora}
💆 Servicio: {servicio}
👤 Profesional: {profesional}
📍 Sucursal: {sucursal}
🏠 Dirección: {direccion}

¡Te esperamos! 😊`,
    variables: ["cliente", "fecha", "hora", "servicio", "profesional", "sucursal", "direccion"],
    isDefault: true,
  },
  {
    name: "Recordatorio 1 Hora - Por Defecto",
    type: "REMINDER_1H",
    content: `¡Hola {cliente}! ⏰

Tu cita con {profesional} es en 1 hora:

🕐 Hora: {hora}
📍 Sucursal: {sucursal}
🏠 Dirección: {direccion}

¡Nos vemos pronto! 👋`,
    variables: ["cliente", "hora", "profesional", "sucursal", "direccion"],
    isDefault: true,
  },
];

async function seedWhatsAppTemplates() {
  console.log("🌱 Starting WhatsApp templates seed...");
  
  try {
    // Get all tenants
    const tenants = await prisma.tenant.findMany({
      where: {
        isActive: true,
      },
    });
    
    if (tenants.length === 0) {
      console.log("⚠️ No active tenants found. Skipping seed.");
      return;
    }
    
    console.log(`📊 Found ${tenants.length} active tenant(s)`);
    
    for (const tenant of tenants) {
      console.log(`\n👤 Creating templates for tenant: ${tenant.name}`);
      
      for (const template of DEFAULT_TEMPLATES) {
        // Check if template already exists
        const existing = await prisma.messageTemplate.findFirst({
          where: {
            tenantId: tenant.id,
            type: template.type as any,
            isDefault: true,
          },
        });
        
        if (existing) {
          console.log(`  ⏭️  Skipping ${template.type} (already exists)`);
          continue;
        }
        
        // Create template
        await prisma.messageTemplate.create({
          data: {
            tenantId: tenant.id,
            name: template.name,
            type: template.type as any,
            content: template.content,
            variables: template.variables,
            isActive: true,
            isDefault: template.isDefault,
          },
        });
        
        console.log(`  ✅ Created ${template.type}`);
      }
    }
    
    console.log("\n✨ WhatsApp templates seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding WhatsApp templates:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed if called directly
if (require.main === module) {
  seedWhatsAppTemplates()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedWhatsAppTemplates, DEFAULT_TEMPLATES };
