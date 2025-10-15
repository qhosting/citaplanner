
/**
 * API Route: Automated Reminders Cron Job
 * 
 * GET /api/cron/send-reminders - Send automated appointment reminders
 * 
 * This endpoint should be called by a cron job (e.g., every 15 minutes)
 * Protected by API key in Authorization header
 */

import { NextRequest, NextResponse } from "next/server";
import { sendAllReminders } from "@/lib/services/reminderService";

export async function GET(req: NextRequest) {
  try {
    // Verify authorization
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "citaplanner-cron-secret";
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }
    
    console.log("[Cron] Starting reminder job...");
    const startTime = Date.now();
    
    // Send all reminders
    const result = await sendAllReminders();
    
    const duration = Date.now() - startTime;
    
    console.log(`[Cron] Reminder job completed in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      message: "Reminders sent successfully",
      data: {
        reminders24h: result.reminders24h,
        reminders1h: result.reminders1h,
        duration,
      },
    });
  } catch (error: any) {
    console.error("[Cron] Error in reminder job:", error);
    return NextResponse.json(
      { error: error.message || "Error al enviar recordatorios" },
      { status: 500 }
    );
  }
}

// Also support POST for easier testing
export async function POST(req: NextRequest) {
  return GET(req);
}
