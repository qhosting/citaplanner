
/**
 * Notifications Page
 * 
 * Página para gestionar notificaciones y preferencias
 */

import { Suspense } from 'react';
import { NotificationCenter } from '@/components/realtime-notifications/NotificationCenter';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Notificaciones | CitaPlanner',
  description: 'Gestiona tus notificaciones y preferencias',
};

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notificaciones</h1>
          <p className="text-muted-foreground">
            Revisa y gestiona todas tus notificaciones
          </p>
        </div>
        <Link href="/notifications/preferences">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Preferencias
          </Button>
        </Link>
      </div>

      <Suspense fallback={<NotificationsSkeleton />}>
        <NotificationCenter />
      </Suspense>
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
}

