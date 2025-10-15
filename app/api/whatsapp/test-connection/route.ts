
/**
 * API Route: Test WhatsApp Connection
 * 
 * POST /api/whatsapp/test-connection - Test Evolution API connection
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { validateConnection, getWhatsAppConfig } from "@/lib/services/whatsappService";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { configId, branchId } = body;
    
    let config;
    
    if (configId) {
      // Test specific config by ID
      const { prisma } = await import("@/lib/prisma");
      const configData = await prisma.whatsAppConfig.findFirst({
        where: {
          id: configId,
          tenantId: session.user.tenantId,
        },
      });
      
      if (!configData) {
        return NextResponse.json(
          { error: "Configuración no encontrada" },
          { status: 404 }
        );
      }
      
      const { decryptApiKey } = await import("@/lib/services/whatsappService");
      config = {
        ...configData,
        apiKey: decryptApiKey(configData.apiKey),
      };
    } else {
      // Test default config for tenant/branch
      config = await getWhatsAppConfig(session.user.tenantId, branchId);
      
      if (!config) {
        return NextResponse.json(
          { error: "No hay configuración de WhatsApp para este tenant/sucursal" },
          { status: 404 }
        );
      }
    }
    
    // Validate connection
    const result = await validateConnection(config);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Conexión validada exitosamente",
        data: result.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Error al validar conexión",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("[API] Error testing WhatsApp connection:", error);
    return NextResponse.json(
      { error: error.message || "Error al probar conexión" },
      { status: 500 }
    );
  }
}
