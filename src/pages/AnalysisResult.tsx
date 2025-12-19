import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClauseIcon } from '@/components/icons/ClauseIcon'
import { Disclosure } from '@/components/common/Disclosure'
import { Skeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { api, ApiError, getErrorMessage, AnalysisResponse, AnalysisItem } from '@/lib/api'
import { usePinnedClauses } from '@/hooks/usePinnedClauses'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { toast } from 'sonner'
import { Pin, Copy, AlertTriangle, CheckCircle2, FileX, MessageSquare } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const RISK_COLORS = {
  WARNING: '#ef4444',
  CHECK: '#f59e0b',
  OK: '#10b981',
}

const RISK_LABELS = {
  WARNING: '주의 필요',
  CHECK: '확인 권장',
  OK: '양호',
}

function RiskBadge({ level }: { level: AnalysisItem['label'] }) {
  const iconMap = {
    WARNING: 'risk-warning',
    CHECK: 'risk-check',
    OK: 'risk-ok',
  } as const

  return (
    <div className="flex items-center gap-2">
      <ClauseIcon name={iconMap[level]} className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium">{RISK_LABELS[level]}</span>
    </div>
  )
}

function ClauseCard({
  item,
  index,
  isPinned,
  onPinToggle,
}: {
  item: AnalysisItem
  index: number
  isPinned: boolean
  onPinToggle: () => void
}) {
  const { copy } = useCopyToClipboard()

  const copyNegotiationTexts = () => {
    const text = (item.softSuggestion || []).join('\n\n')
    copy(text, '협상 문구가 복사되었습니다')
  }

  const copySingleNegotiationText = (text: string) => {
    copy(text, '협상 문구가 복사되었습니다')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <CardTitle className="text-lg">조항 {index + 1}</CardTitle>
              <RiskBadge level={item.label} />
            </div>
            <CardDescription className="text-base font-medium">
              {item.title}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onPinToggle}
            className={isPinned ? 'text-primary' : ''}
          >
            <Pin className={`h-4 w-4 ${isPinned ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {item.riskReason}
          </p>
        </div>

        {(item.whatToConfirm || []).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
              확인 사항
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {(item.whatToConfirm || []).map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {(item.softSuggestion || []).length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                협상 제안
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={copyNegotiationTexts}
              >
                <Copy className="h-4 w-4 mr-2" />
                전체 복사
              </Button>
            </div>
            <div className="space-y-2">
              {(item.softSuggestion || []).map((text, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-muted rounded-lg text-sm relative group"
                >
                  <p className="text-muted-foreground">{text}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={() => copySingleNegotiationText(text)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SummaryCard({ analysis }: { analysis: AnalysisResponse }) {
  const chartData = [
    { name: '주의 필요', value: analysis.overallSummary.warningCount, color: RISK_COLORS.WARNING },
    { name: '확인 권장', value: analysis.overallSummary.checkCount, color: RISK_COLORS.CHECK },
    { name: '양호', value: analysis.overallSummary.okCount, color: RISK_COLORS.OK },
  ]

  const exportJson = () => {
    const dataStr = JSON.stringify(analysis, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analysis-${analysis.analysisId}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('JSON 파일이 다운로드되었습니다')
  }

  return (
    <Card className="sticky top-20 mb-6 max-md:relative max-md:top-0">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle>분석 요약</CardTitle>
          <Button variant="outline" size="sm" onClick={exportJson}>
            <ClauseIcon name="export-json" className="w-4 h-4 mr-2 flex-shrink-0" />
            JSON 내보내기
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-red-500">
              {analysis.overallSummary.warningCount}
            </div>
            <div className="text-xs text-muted-foreground">주의 필요</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-amber-500">
              {analysis.overallSummary.checkCount}
            </div>
            <div className="text-xs text-muted-foreground">확인 권장</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-green-500">
              {analysis.overallSummary.okCount}
            </div>
            <div className="text-xs text-muted-foreground">양호</div>
          </div>
        </div>
        <div className="h-40 md:h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function AnalysisResult() {
  const { id } = useParams<{ id: string }>()
  const { isPinned, pin, unpin } = usePinnedClauses()
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const { copy } = useCopyToClipboard()

  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ['analysis', id],
    queryFn: () => api.getAnalysis(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-64 w-full mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    const apiError = error as ApiError
    return (
      <div className="container py-8">
        <EmptyState
          icon={AlertTriangle}
          title="분석 결과를 불러올 수 없습니다"
          description={getErrorMessage(apiError.code)}
        />
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="container py-8">
        <EmptyState
          icon={FileX}
          title="분석 결과를 찾을 수 없습니다"
        />
      </div>
    )
  }

  const items = showPinnedOnly
    ? analysis.items.filter((item) => isPinned(analysis.analysisId, item.clauseId))
    : analysis.items

  const handlePinToggle = (clauseId: string) => {
    if (isPinned(analysis.analysisId, clauseId)) {
      unpin(analysis.analysisId, clauseId)
      toast.success('핀 해제되었습니다')
    } else {
      pin(analysis.analysisId, clauseId)
      toast.success('핀되었습니다')
    }
  }

  const copyAllSummary = () => {
    const summaryText = analysis.items
      .map(
        (item, index) =>
          `조항 ${index + 1} ${item.title}\n${(item.whatToConfirm || [])
            .map((p) => `- ${p}`)
            .join('\n')}`
      )
      .join('\n\n')
    navigator.clipboard.writeText(summaryText)
    toast.success('요약이 복사되었습니다')
  }

  const copyAllNegotiationSuggestions = () => {
    const text = (analysis.negotiationSuggestions || []).join('\n\n')
    copy(text, '전체 협상 제안이 복사되었습니다')
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">분석 결과</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={showPinnedOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
          >
            <Pin className="h-4 w-4 mr-2 flex-shrink-0" />
            핀만 보기
          </Button>
          <Button variant="outline" size="sm" onClick={copyAllSummary}>
            <Copy className="h-4 w-4 mr-2 flex-shrink-0" />
            요약 복사
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1 order-2 md:order-1">
          <SummaryCard analysis={analysis} />
        </div>
        <div className="md:col-span-3 space-y-6 order-1 md:order-2">
          {(analysis.negotiationSuggestions || []).length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary flex-shrink-0" />
                    <CardTitle>전체 협상 제안</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAllNegotiationSuggestions}
                  >
                    <Copy className="h-4 w-4 mr-2 flex-shrink-0" />
                    전체 복사
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.negotiationSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm relative group"
                    >
                      <p className="text-foreground pr-8">{suggestion}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={() => {
                          copy(suggestion, '협상 제안이 복사되었습니다')
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {items.length === 0 ? (
            <EmptyState
              icon={Pin}
              title="핀된 조항이 없습니다"
              description="조항 카드의 핀 버튼을 클릭하여 중요 조항을 저장할 수 있습니다."
            />
          ) : (
            items.map((item, index) => (
              <ClauseCard
                key={item.clauseId}
                item={item}
                index={index}
                isPinned={isPinned(analysis.analysisId, item.clauseId)}
                onPinToggle={() => handlePinToggle(item.clauseId)}
              />
            ))
          )}
        </div>
      </div>

      <Disclosure />
      {analysis.disclaimer && (
        <div className="mt-6 md:mt-8 p-4 md:p-6 bg-muted rounded-lg text-sm text-muted-foreground">
          {analysis.disclaimer}
        </div>
      )}
    </div>
  )
}

