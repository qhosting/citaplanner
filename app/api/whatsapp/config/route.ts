
/**
 * API Route: WhatsApp Configuration (CRUD)
 * 
 * GET    /api/whatsapp/config - Get all configs for tenant
 * POST   /api/whatsapp/config - Create new config
 * PUT    /api/whatsapp/config - Update config
 * DELETE /api/whatsapp/config - Delete config
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { encryptApiKey, decryptApiKey } from "@/lib/services/whatsappService";

/**
 * GET - Get all WhatsApp configurations for tenant
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }
    
    const tenantId = session.user.tenantId;
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId");
    
    const where: any = { tenantId };
    
    if (branchId) {
      where.branchId = branchId;
    }
    
    const configs = await prisma.whatsAppConfig.findMany({
      where,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    // Decrypt API keys before sending
    const configsWithDecryptedKeys = configs.map((config) => ({
      ...config,
      apiKey: decryptApiKey(config.apiKey),
    }));
    
    return NextResponse.json({
      success: true,
      data: configsWithDecryptedKeys,
    });
  } catch (error: any) {
    console.error("[API] Error fetching WhatsApp configs:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener configuraciones" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new WhatsApp configuration
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }
    
    // Check if user is admin or superadmin
    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }
    
    const tenantId = session.user.tenantId;
    const body = await req.json();
    
    const {
      apiUrl,
      apiKey,
      instanceName,
      phoneNumber,
      isActive = true,
      isDefault = false,
      sendOnCreate = true,
      sendOnUpdate = true,
      sendOnCancel = true,
      sendReminder24h = true,
      sendReminder1h = true,
      branchId,
    } = body;
    
    // Validation
    if (!apiUrl || !apiKey || !instanceName || !phoneNumber) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }
    
    // If setting as default, unset other defaults for this tenant
    if (isDefault) {
      await prisma.whatsAppConfig.updateMany({
        where: {
          tenantId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }
    
    // Encrypt API key
    const encryptedApiKey = encryptApiKey(apiKey);
    
    // Create config
    const config = await prisma.whatsAppConfig.create({
      data: {
        tenantId,
        branchId,
        apiUrl,
        apiKey: encryptedApiKey,
        instanceName,
        phoneNumber,
        isActive,
        isDefault,
        sendOnCreate,
        sendOnUpdate,
        sendOnCancel,
        sendReminder24h,
        sendReminder1h,
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      message: "Configuración creada exitosamente",
      data: {
        ...config,
        apiKey: apiKey, // Return decrypted key for immediate use
      },
    });
  } catch (error: any) {
    console.error("[API] Error creating WhatsApp config:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear configuración" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update WhatsApp configuration
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }
    
    // Check if user is admin or superadmin
    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }
    
    const tenantId = session.user.tenantId;
    const body = await req.json();
    
    const {
      id,
      apiUrl,
      apiKey,
      instanceName,
      phoneNumber,
      isActive,
      isDefault,
      sendOnCreate,
      sendOnUpdate,
      sendOnCancel,
      sendReminder24h,
      sendReminder1h,
    } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: "ID de configuración requerido" },
        { status: 400 }
      );
    }
    
    // Verify config belongs to tenant
    const existingConfig = await prisma.whatsAppConfig.findFirst({
      where: {
        id,
        tenantId,
      },
    });
    
    if (!existingConfig) {
      return NextResponse.json(
        { error: "Configuración no encontrada" },
        { status: 404 }
      );
    }
    
    // If setting as default, unset other defaults for this tenant
    if (isDefault) {
      await prisma.whatsAppConfig.updateMany({
        where: {
          tenantId,
          isDefault: true,
          id: { not: id },
        },
        data: {
          isDefault: false,
        },
      });
    }
    
    const updateData: any = {
      apiUrl,
      instanceName,
      phoneNumber,
      isActive,
      isDefault,
      sendOnCreate,
      sendOnUpdate,
      sendOnCancel,
      sendReminder24h,
      sendReminder1h,
    };
    
    // Only encrypt and update API key if it was changed
    if (apiKey) {
      updateData.apiKey = encryptApiKey(apiKey);
    }
    
    const config = await prisma.whatsAppConfig.update({
      where: { id },
      data: updateData,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      message: "Configuración actualizada exitosamente",
      data: {
        ...config,
        apiKey: apiKey || decryptApiKey(config.apiKey),
      },
    });
  } catch (error: any) {
    console.error("[API] Error updating WhatsApp config:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete WhatsApp configuration
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }
    
    // Check if user is admin or superadmin
    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }
    
    const tenantId = session.user.tenantId;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "ID de configuración requerido" },
        { status: 400 }
      );
    }
    
    // Verify config belongs to tenant
    const existingConfig = await prisma.whatsAppConfig.findFirst({
      where: {
        id,
        tenantId,
      },
    });
    
    if (!existingConfig) {
      return NextResponse.json(
        { error: "Configuración no encontrada" },
        { status: 404 }
      );
    }
    
    await prisma.whatsAppConfig.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: "Configuración eliminada exitosamente",
    });
  } catch (error: any) {
    console.error("[API] Error deleting WhatsApp config:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar configuración" },
      { status: 500 }
    );
  }
}
