import { useState, useEffect } from 'react'
import { storage, PinnedClause } from '@/lib/storage'

export function usePinnedClauses() {
  const [pinned, setPinned] = useState<PinnedClause[]>([])

  useEffect(() => {
    setPinned(storage.getPinnedClauses())
  }, [])

  const pin = (analysisId: string, clauseId: string) => {
    storage.pinClause(analysisId, clauseId)
    setPinned(storage.getPinnedClauses())
  }

  const unpin = (analysisId: string, clauseId: string) => {
    storage.unpinClause(analysisId, clauseId)
    setPinned(storage.getPinnedClauses())
  }

  const isPinned = (analysisId: string, clauseId: string) => {
    return storage.isPinned(analysisId, clauseId)
  }

  return { pinned, pin, unpin, isPinned }
}

