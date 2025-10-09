
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { inventoryService } from '@/lib/services/inventoryService';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    const { productId, newStock, reason } = await request.json();

    const movement = await inventoryService.createAdjustment(
      tenantId,
      productId,
      newStock,
      reason,
      userId
    );

    return NextResponse.json({ success: true, data: movement }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
