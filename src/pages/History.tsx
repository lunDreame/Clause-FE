import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClauseIcon } from '@/components/icons/ClauseIcon'
import { Skeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { api, ApiError, getErrorMessage, AnalysisResponse } from '@/lib/api'
import { FileText, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'

function HistoryCard({ item }: { item: AnalysisResponse }) {
  return (
    <Link to={`/analysis/${item.analysisId}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                분석 {item.analysisId.slice(0, 8)}
              </CardTitle>
              {item.overallSummary.keyPoints.length > 0 && (
                <CardDescription>
                  {item.overallSummary.keyPoints[0]}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <ClauseIcon name="risk-warning" className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <div className="text-lg font-bold text-red-500">
                  {item.overallSummary.warningCount}
                </div>
                <div className="text-xs text-muted-foreground">주의 필요</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ClauseIcon name="risk-check" className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <div className="text-lg font-bold text-amber-500">
                  {item.overallSummary.checkCount}
                </div>
                <div className="text-xs text-muted-foreground">확인 권장</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ClauseIcon name="risk-ok" className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div>
                <div className="text-lg font-bold text-green-500">
                  {item.overallSummary.okCount}
                </div>
                <div className="text-xs text-muted-foreground">양호</div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              총 {item.items.length}개 조항 분석
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function History() {
  const [page, setPage] = useState(0)
  const pageSize = 20

  const { data: history, isLoading, error } = useQuery({
    queryKey: ['analysis-history', page],
    queryFn: () => api.getAnalysisHistory(page, pageSize),
  })

  const hasMore = history && history.length === pageSize
  const hasPrevious = page > 0

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">분석 히스토리</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    const apiError = error as ApiError
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">분석 히스토리</h1>
        <EmptyState
          icon={AlertTriangle}
          title="히스토리를 불러올 수 없습니다"
          description={getErrorMessage(apiError.code)}
        />
      </div>
    )
  }

  if (!history || history.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">분석 히스토리</h1>
        <EmptyState
          icon={FileText}
          title="분석 히스토리가 없습니다"
          description="계약서를 업로드하여 분석을 시작해보세요."
        />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">분석 히스토리</h1>
      <div className="space-y-4 md:space-y-6">
        {history.map((item) => (
          <HistoryCard key={item.analysisId} item={item} />
        ))}
      </div>
      {(hasMore || hasPrevious) && (
        <div className="flex items-center justify-center gap-4 mt-6 md:mt-8">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={!hasPrevious}
          >
            <ChevronLeft className="h-4 w-4 mr-2 flex-shrink-0" />
            이전
          </Button>
          <span className="text-sm text-muted-foreground">
            페이지 {page + 1}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
          >
            다음
            <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" />
          </Button>
        </div>
      )}
    </div>
  )
}

