const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_PREFIX = '/api/v1'

export type ContractType =
  | 'FREELANCER'
  | 'EMPLOYMENT'
  | 'PART_TIME'
  | 'LEASE'
  | 'NDA'
  | 'OTHER'

export type UserProfile =
  | 'STUDENT'
  | 'ENTRY_LEVEL'
  | 'FREELANCER'
  | 'INDIVIDUAL_BUSINESS'
  | 'GENERAL_CONSUMER'

export interface Document {
  id: string
  documentId: string
  filename: string
  originalFileName?: string
  uploadedAt: string
  status: 'uploaded' | 'processing' | 'completed' | 'failed'
  contentType?: string
  sizeBytes?: number
  createdAt?: string
  extractedText?: string
  textLength?: number
  textSha256?: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface OverallSummary {
  warningCount: number
  checkCount: number
  okCount: number
  keyPoints: string[]
}

export interface AnalysisItem {
  clauseId: string
  title: string
  label: 'WARNING' | 'CHECK' | 'OK'
  riskReason: string
  whatToConfirm: string[]
  softSuggestion: string[]
  triggers: string[]
}

export interface AnalysisResponse {
  analysisId: string
  overallSummary: OverallSummary
  items: AnalysisItem[]
  negotiationSuggestions: string[]
  disclaimer: string
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  DOCUMENT_NOT_FOUND: '문서를 찾을 수 없습니다.',
  UNSUPPORTED_FILE_TYPE: '지원하지 않는 파일 형식입니다. PDF 파일만 업로드 가능합니다.',
  OCR_NOT_IMPLEMENTED: '이미지 OCR은 아직 지원하지 않습니다. PDF 파일만 업로드 가능합니다.',
  FILE_TOO_LARGE: '파일 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해주세요.',
  EXTRACTION_FAILED: '텍스트 추출에 실패했습니다. 파일을 확인해주세요.',
  LLM_UPSTREAM_ERROR: '분석 엔진 응답이 불안정합니다. 잠시 후 다시 시도해주세요.',
  JSON_REPAIR_FAILED: '분석 결과 형식 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  RATE_LIMITED: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
  VALIDATION_ERROR: '요청 값 검증에 실패했습니다.',
  INTERNAL_ERROR: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다. 연결을 확인해주세요.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
}

export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR
}

function validateUUID(uuid: string): boolean {
  if (!uuid) {
    return false
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit & { skipContentType?: boolean }
): Promise<T> {
  const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`

  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
  }

  // multipart/form-data 요청이 아닌 경우에만 Content-Type 설정
  if (!options?.skipContentType) {
    defaultHeaders['Content-Type'] = 'application/json'
  }

  const headers = {
    ...defaultHeaders,
    ...(options?.headers as Record<string, string> | undefined),
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')

  if (!isJson && !response.ok) {
    throw new ApiError(
      response.status,
      'HTTP_ERROR',
      `HTTP error! status: ${response.status}`
    )
  }

  const result: ApiResponse<T> = await response.json()

  if (!result.success) {
    throw new ApiError(
      response.status,
      result.error?.code || 'UNKNOWN_ERROR',
      result.error?.message || '알 수 없는 오류가 발생했습니다.',
      result.error?.details
    )
  }

  if (!result.data) {
    throw new ApiError(
      response.status,
      'NO_DATA',
      '응답 데이터가 없습니다.'
    )
  }

  return result.data
}

export const api = {
  async uploadDocument(file: File): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/documents`, {
      method: 'POST',
      body: formData,
    })

    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')

    if (!isJson && !response.ok) {
      throw new ApiError(
        response.status,
        'HTTP_ERROR',
        `HTTP error! status: ${response.status}`
      )
    }

    const result: ApiResponse<{
      documentId: string
      originalFileName: string
      contentType: string
      sizeBytes: number
      createdAt: string
    }> = await response.json()

    if (!result.success) {
      throw new ApiError(
        response.status,
        result.error?.code || 'INTERNAL_ERROR',
        result.error?.message || '파일 업로드에 실패했습니다.',
        result.error?.details
      )
    }

    if (!result.data?.documentId) {
      throw new ApiError(
        response.status,
        'INTERNAL_ERROR',
        '문서 업로드 후 documentId를 받지 못했습니다.'
      )
    }

    return {
      id: result.data.documentId,
      documentId: result.data.documentId,
      filename: result.data.originalFileName,
      originalFileName: result.data.originalFileName,
      uploadedAt: result.data.createdAt,
      createdAt: result.data.createdAt,
      contentType: result.data.contentType,
      sizeBytes: result.data.sizeBytes,
      status: 'uploaded',
    }
  },

  async extractDocument(documentId: string): Promise<{
    documentId: string
    textLength: number
    textSha256: string
  }> {
    if (!documentId) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'documentId가 필요합니다.')
    }

    if (!validateUUID(documentId)) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        `올바른 UUID 형식이 아닙니다: ${documentId}`
      )
    }

    return fetchApi<{
      documentId: string
      textLength: number
      textSha256: string
    }>(`/documents/${documentId}/extract`, {
      method: 'POST',
    })
  },

  async createAnalysis(
    documentId: string,
    contractType: ContractType,
    userProfile: UserProfile,
    language: string = 'ko-KR'
  ): Promise<AnalysisResponse> {
    if (!documentId) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'documentId가 필요합니다.')
    }
    if (!contractType) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'contractType이 필요합니다.')
    }
    if (!userProfile) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'userProfile이 필요합니다.')
    }

    if (!validateUUID(documentId)) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        `올바른 UUID 형식이 아닙니다: ${documentId}`
      )
    }

    const requestBody = {
      documentId,
      contractType,
      userProfile,
      language,
    }

    return fetchApi<AnalysisResponse>(`/analyses`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })
  },

  async getAnalysis(analysisId: string): Promise<AnalysisResponse> {
    if (!analysisId) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'analysisId가 필요합니다.')
    }

    if (!validateUUID(analysisId)) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        `올바른 UUID 형식이 아닙니다: ${analysisId}`
      )
    }

    return fetchApi<AnalysisResponse>(`/analyses/${analysisId}`)
  },

  async getDocument(
    documentId: string,
    includeText: boolean = false
  ): Promise<Document> {
    if (!documentId) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'documentId가 필요합니다.')
    }

    if (!validateUUID(documentId)) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        `올바른 UUID 형식이 아닙니다: ${documentId}`
      )
    }

    const queryParams = includeText ? '?includeText=true' : ''
    const data = await fetchApi<{
      documentId: string
      originalFileName: string
      contentType: string
      sizeBytes: number
      createdAt: string
      extractedText?: string
      textLength?: number
      textSha256?: string
    }>(`/documents/${documentId}${queryParams}`)

    return {
      id: data.documentId,
      documentId: data.documentId,
      filename: data.originalFileName,
      originalFileName: data.originalFileName,
      uploadedAt: data.createdAt,
      createdAt: data.createdAt,
      contentType: data.contentType,
      sizeBytes: data.sizeBytes,
      extractedText: data.extractedText,
      textLength: data.textLength,
      textSha256: data.textSha256,
      status: 'uploaded',
    }
  },

  async getDocumentAnalyses(documentId: string): Promise<AnalysisResponse[]> {
    if (!documentId) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'documentId가 필요합니다.')
    }

    if (!validateUUID(documentId)) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        `올바른 UUID 형식이 아닙니다: ${documentId}`
      )
    }

    return fetchApi<AnalysisResponse[]>(
      `/analyses/documents/${documentId}`
    )
  },

  async getAnalysisHistory(
    page: number = 0,
    size: number = 20
  ): Promise<AnalysisResponse[]> {
    return fetchApi<AnalysisResponse[]>(
      `/analyses/history?page=${page}&size=${size}`
    )
  },
}

