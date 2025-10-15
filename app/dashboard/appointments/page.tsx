/**
 * Appointments Redirect Page
 * 
 * This page provides a permanent redirect from /dashboard/appointments to /dashboard/calendar
 * to maintain backward compatibility with existing navigation links and bookmarks.
 * 
 * Reason: The appointments functionality is now located at /dashboard/calendar,
 * but dashboard-nav.tsx and potentially other components/links reference the old route.
 * 
 * Sprint 1 - Fase 2: Link roto fix identificado en auditoría de navegación
 */

import { redirect } from 'next/navigation'

export default function AppointmentsPage() {
  // Permanent redirect (308) for SEO and browser caching
  redirect('/dashboard/calendar')
}
