import { useState } from 'react';

/**
 * Client-side hook for current user ID.
 * Default user is 313 (matching the original SPA).
 */
export function useCurrentUser() {
  const [currentUserId, setCurrentUserId] = useState<number>(313);
  return { currentUserId, setCurrentUserId };
}
