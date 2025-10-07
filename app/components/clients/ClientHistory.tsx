
'use client';

import React from 'react';

interface ClientHistoryProps {
  clientProfileId: string;
}

/**
 * Client History Component
 * Phase 2: Placeholder component for displaying appointment and service history
 */
export default function ClientHistory({ clientProfileId }: ClientHistoryProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Client History</h2>
      <p className="text-gray-600">
        Phase 2 Client Module - History component placeholder
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Client Profile ID: {clientProfileId}
      </p>
      <p className="text-sm text-gray-500 mt-2">
        This component will display appointment history and service usage statistics
        for the client.
      </p>
    </div>
  );
}
