const PINNED_CLAUSES_KEY = 'clause_pinned_clauses'

export interface PinnedClause {
    analysisId: string
    clauseId: string
}

export const storage = {
    pinClause(analysisId: string, clauseId: string): void {
        const pinned = this.getPinnedClauses()
        const key = `${analysisId}:${clauseId}`
        if (!pinned.find((p) => `${p.analysisId}:${p.clauseId}` === key)) {
            pinned.push({ analysisId, clauseId })
            localStorage.setItem(PINNED_CLAUSES_KEY, JSON.stringify(pinned))
        }
    },

    unpinClause(analysisId: string, clauseId: string): void {
        const pinned = this.getPinnedClauses()
        const filtered = pinned.filter(
            (p) => !(p.analysisId === analysisId && p.clauseId === clauseId)
        )
        localStorage.setItem(PINNED_CLAUSES_KEY, JSON.stringify(filtered))
    },

    getPinnedClauses(): PinnedClause[] {
        try {
            const data = localStorage.getItem(PINNED_CLAUSES_KEY)
            return data ? JSON.parse(data) : []
        } catch {
            return []
        }
    },

    isPinned(analysisId: string, clauseId: string): boolean {
        const pinned = this.getPinnedClauses()
        return pinned.some(
            (p) => p.analysisId === analysisId && p.clauseId === clauseId
        )
    },
}

