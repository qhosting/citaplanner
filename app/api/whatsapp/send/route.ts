
/**
 * API Route: Send WhatsApp Message (Manual)
 * 
 * POST /api/whatsapp/send - Send manual WhatsApp message
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendWhatsAppMessage, getWhatsAppConfig } from "@/lib/services/whatsappService";

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
    const { recipient, message, configId, branchId, appointmentId } = body;
    
    // Validation
    if (!recipient || !message) {
      return NextResponse.json(
        { error: "Destinatario y mensaje son requeridos" },
        { status: 400 }
      );
    }
    
    let finalConfigId = configId;
    
    // If no configId provided, get default config
    if (!configId) {
      const config = await getWhatsAppConfig(session.user.tenantId, branchId);
      
      if (!config) {
        return NextResponse.json(
          { error: "No hay configuración de WhatsApp disponible" },
          { status: 404 }
        );
      }
      
      finalConfigId = config.id;
    }
    
    // Send message
    const result = await sendWhatsAppMessage({
      recipient,
      message,
      configId: finalConfigId,
      appointmentId,
      messageType: "manual",
    });
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Mensaje enviado exitosamente",
        data: result.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Error al enviar mensaje",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("[API] Error sending WhatsApp message:", error);
    return NextResponse.json(
      { error: error.message || "Error al enviar mensaje" },
      { status: 500 }
    );
  }
}
