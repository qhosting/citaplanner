
/**
 * API Route: WhatsApp Logs
 * 
 * GET /api/whatsapp/logs - Get WhatsApp message logs
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getWhatsAppLogs } from "@/lib/services/whatsappService";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const configId = searchParams.get("configId") || undefined;
    const appointmentId = searchParams.get("appointmentId") || undefined;
    const status = searchParams.get("status") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    
    const result = await getWhatsAppLogs({
      tenantId: session.user.tenantId,
      configId,
      appointmentId,
      status,
      limit,
      offset,
    });
    
    return NextResponse.json({
      success: true,
      data: result.logs,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  } catch (error: any) {
    console.error("[API] Error fetching WhatsApp logs:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener logs" },
      { status: 500 }
    );
  }
}
