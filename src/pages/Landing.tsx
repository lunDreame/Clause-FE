import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Disclosure } from '@/components/common/Disclosure'

export function Landing() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-3xl text-center mb-8 md:mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4 md:text-5xl">
          계약서, 꼼꼼히 확인하세요
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          중요한 조항과 주의할 포인트를 정리해드립니다.
          <br />
          협상에 필요한 핵심 사항을 한눈에 확인하세요.
        </p>
        <Link to="/upload">
          <Button size="lg" className="text-lg px-8">
            <Upload className="mr-2 h-5 w-5 flex-shrink-0" />
            계약서 업로드하기
          </Button>
        </Link>
      </div>

      <Disclosure />

      <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
        <Card>
          <CardHeader>
            <FileText className="h-8 w-8 text-primary mb-2" />
            <CardTitle>문서 업로드</CardTitle>
            <CardDescription>
              PDF 계약서를 업로드하면 자동으로 분석을 시작합니다.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <AlertTriangle className="h-8 w-8 text-primary mb-2" />
            <CardTitle>조항 분석</CardTitle>
            <CardDescription>
              확인이 필요한 조항을 찾아 주의 포인트를 제공합니다.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CheckCircle2 className="h-8 w-8 text-primary mb-2" />
            <CardTitle>협상 지원</CardTitle>
            <CardDescription>
              각 조항에 대한 확인 질문과 협상 문구를 제공합니다.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

