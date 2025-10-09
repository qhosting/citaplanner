
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { productService } from '@/lib/services/productService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      type: searchParams.get('type') as any,
      categoryId: searchParams.get('categoryId') || undefined,
      supplierId: searchParams.get('supplierId') || undefined,
      isActive: searchParams.get('isActive') === 'true',
      lowStock: searchParams.get('lowStock') === 'true',
    };

    const products = await productService.getProducts(tenantId, filters);
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const data = await request.json();

    const product = await productService.createProduct({
      ...data,
      tenantId,
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
