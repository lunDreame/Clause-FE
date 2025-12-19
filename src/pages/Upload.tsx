import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ClauseIcon } from '@/components/icons/ClauseIcon'
import { Disclosure } from '@/components/common/Disclosure'
import {
  api,
  ApiError,
  getErrorMessage,
  ContractType,
  UserProfile,
} from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, FileText } from 'lucide-react'

export function Upload() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [contractType, setContractType] = useState<ContractType | ''>('')
  const [userProfile, setUserProfile] = useState<UserProfile | ''>('')

  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      contractType,
      userProfile,
    }: {
      file: File
      contractType: ContractType
      userProfile: UserProfile
    }) => {
      const document = await api.uploadDocument(file)

      const documentId = document.documentId || document.id
      if (!documentId) {
        throw new ApiError(
          500,
          'INVALID_RESPONSE',
          '문서 업로드 후 documentId를 받지 못했습니다.'
        )
      }

      await api.extractDocument(documentId)

      const analysis = await api.createAnalysis(
        documentId,
        contractType,
        userProfile,
        'ko-KR'
      )
      return analysis
    },
    onSuccess: (analysis) => {
      toast.success('분석이 완료되었습니다')
      navigate(`/analysis/${analysis.analysisId}`)
    },
    onError: (error: ApiError) => {
      if (error.details && typeof error.details === 'object') {
        const errorMessages = Object.values(error.details).join(', ')
        toast.error(errorMessages || getErrorMessage(error.code))
      } else {
        toast.error(error.message || getErrorMessage(error.code))
      }
    },
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0])
      }
    },
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0]
      if (rejection.errors.some((e) => e.code === 'file-too-large')) {
        toast.error('파일 크기가 10MB를 초과합니다')
      } else if (rejection.errors.some((e) => e.code === 'file-invalid-type')) {
        toast.error('PDF 파일만 업로드 가능합니다')
      } else {
        toast.error('파일 업로드에 실패했습니다')
      }
    },
  })

  const handleUpload = () => {
    if (!file) {
      toast.error('파일을 선택해주세요.')
      return
    }
    if (!contractType) {
      toast.error('계약서 유형을 선택해주세요.')
      return
    }
    if (!userProfile) {
      toast.error('사용자 프로필을 선택해주세요.')
      return
    }

    uploadMutation.mutate({
      file,
      contractType: contractType as ContractType,
      userProfile: userProfile as UserProfile,
    })
  }

  return (
    <div className="container py-8 pb-24 md:pb-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">계약서 업로드</h1>
        <p className="text-muted-foreground mb-6 md:mb-8">
          분석할 PDF 계약서를 업로드해주세요.
        </p>

        <Card className="mb-6">
          <CardContent className="p-6 md:p-8">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 md:p-12 text-center cursor-pointer
                transition-colors
                ${isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
                }
              `}
            >
              <input {...getInputProps()} />
              {file ? (
                <div>
                  <FileText className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <p className="font-medium mb-2">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <ClauseIcon
                    name="upload-pdf"
                    className="w-16 h-16 mx-auto mb-4 text-muted-foreground"
                  />
                  <p className="text-lg font-medium mb-2">
                    {isDragActive
                      ? '파일을 여기에 놓아주세요'
                      : '파일을 드래그하거나 클릭하여 업로드'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PDF 파일만 업로드 가능 (최대 10MB)
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {file && (
          <>
            <Card className="mb-6">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="contractType">계약서 유형 *</Label>
                  <Select
                    value={contractType}
                    onValueChange={(value) =>
                      setContractType(value as ContractType)
                    }
                  >
                    <SelectTrigger id="contractType">
                      <SelectValue placeholder="계약서 유형을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FREELANCER">프리랜서</SelectItem>
                      <SelectItem value="EMPLOYMENT">정규직</SelectItem>
                      <SelectItem value="PART_TIME">파트타임</SelectItem>
                      <SelectItem value="LEASE">임대차</SelectItem>
                      <SelectItem value="NDA">비밀유지계약</SelectItem>
                      <SelectItem value="OTHER">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userProfile">사용자 프로필 *</Label>
                  <Select
                    value={userProfile}
                    onValueChange={(value) =>
                      setUserProfile(value as UserProfile)
                    }
                  >
                    <SelectTrigger id="userProfile">
                      <SelectValue placeholder="사용자 프로필을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">학생</SelectItem>
                      <SelectItem value="ENTRY_LEVEL">신입</SelectItem>
                      <SelectItem value="FREELANCER">프리랜서</SelectItem>
                      <SelectItem value="INDIVIDUAL_BUSINESS">개인사업자</SelectItem>
                      <SelectItem value="GENERAL_CONSUMER">일반 소비자</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="sticky bottom-0 left-0 right-0 bg-background border-t p-4 -mx-4 md:mx-0 md:rounded-lg md:border md:shadow-lg z-10 md:relative md:mt-6 mb-6">
              <Button
                onClick={handleUpload}
                disabled={
                  !file ||
                  !contractType ||
                  !userProfile ||
                  uploadMutation.isPending
                }
                className="w-full"
                size="lg"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin flex-shrink-0" />
                    분석 중...
                  </>
                ) : (
                  '분석 시작하기'
                )}
              </Button>
            </div>
          </>
        )}

        <Disclosure />
      </div>
    </div>
  )
}

