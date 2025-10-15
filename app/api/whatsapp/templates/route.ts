
/**
 * API Route: Message Templates (CRUD)
 * 
 * GET    /api/whatsapp/templates - Get all templates for tenant
 * POST   /api/whatsapp/templates - Create new template
 * PUT    /api/whatsapp/templates - Update template
 * DELETE /api/whatsapp/templates - Delete template
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * GET - Get all message templates for tenant
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
    const type = searchParams.get("type");
    
    const where: any = { tenantId };
    
    if (branchId) {
      where.branchId = branchId;
    }
    
    if (type) {
      where.type = type;
    }
    
    const templates = await prisma.messageTemplate.findMany({
      where,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });
    
    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error: any) {
    console.error("[API] Error fetching templates:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener plantillas" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new message template
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
      name,
      type,
      content,
      variables,
      isActive = true,
      isDefault = false,
      branchId,
    } = body;
    
    // Validation
    if (!name || !type || !content) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }
    
    // If setting as default, unset other defaults for this type
    if (isDefault) {
      await prisma.messageTemplate.updateMany({
        where: {
          tenantId,
          type,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }
    
    const template = await prisma.messageTemplate.create({
      data: {
        tenantId,
        branchId,
        name,
        type,
        content,
        variables,
        isActive,
        isDefault,
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
      message: "Plantilla creada exitosamente",
      data: template,
    });
  } catch (error: any) {
    console.error("[API] Error creating template:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear plantilla" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update message template
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
    
    const { id, name, type, content, variables, isActive, isDefault } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: "ID de plantilla requerido" },
        { status: 400 }
      );
    }
    
    // Verify template belongs to tenant
    const existingTemplate = await prisma.messageTemplate.findFirst({
      where: {
        id,
        tenantId,
      },
    });
    
    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      );
    }
    
    // If setting as default, unset other defaults for this type
    if (isDefault) {
      await prisma.messageTemplate.updateMany({
        where: {
          tenantId,
          type: type || existingTemplate.type,
          isDefault: true,
          id: { not: id },
        },
        data: {
          isDefault: false,
        },
      });
    }
    
    const template = await prisma.messageTemplate.update({
      where: { id },
      data: {
        name,
        type,
        content,
        variables,
        isActive,
        isDefault,
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
      message: "Plantilla actualizada exitosamente",
      data: template,
    });
  } catch (error: any) {
    console.error("[API] Error updating template:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar plantilla" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete message template
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
        { error: "ID de plantilla requerido" },
        { status: 400 }
      );
    }
    
    // Verify template belongs to tenant
    const existingTemplate = await prisma.messageTemplate.findFirst({
      where: {
        id,
        tenantId,
      },
    });
    
    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      );
    }
    
    await prisma.messageTemplate.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: "Plantilla eliminada exitosamente",
    });
  } catch (error: any) {
    console.error("[API] Error deleting template:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar plantilla" },
      { status: 500 }
    );
  }
}
