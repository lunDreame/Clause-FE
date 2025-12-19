import { cn } from '@/lib/utils'
import RiskWarningIcon from '@/assets/icons/risk-warning.svg?react'
import RiskCheckIcon from '@/assets/icons/risk-check.svg?react'
import RiskOkIcon from '@/assets/icons/risk-ok.svg?react'
import StepUploadIcon from '@/assets/icons/step-upload.svg?react'
import StepExtractIcon from '@/assets/icons/step-extract.svg?react'
import StepRulesIcon from '@/assets/icons/step-rules.svg?react'
import StepAiIcon from '@/assets/icons/step-ai.svg?react'
import StepDoneIcon from '@/assets/icons/step-done.svg?react'
import UploadPdfIcon from '@/assets/icons/upload-pdf.svg?react'
import PinIcon from '@/assets/icons/pin.svg?react'
import CopyIcon from '@/assets/icons/copy.svg?react'
import ExportJsonIcon from '@/assets/icons/export-json.svg?react'

const iconMap = {
  'risk-warning': RiskWarningIcon,
  'risk-check': RiskCheckIcon,
  'risk-ok': RiskOkIcon,
  'step-upload': StepUploadIcon,
  'step-extract': StepExtractIcon,
  'step-rules': StepRulesIcon,
  'step-ai': StepAiIcon,
  'step-done': StepDoneIcon,
  'upload-pdf': UploadPdfIcon,
  pin: PinIcon,
  copy: CopyIcon,
  'export-json': ExportJsonIcon,
} as const

interface ClauseIconProps {
  name: keyof typeof iconMap
  className?: string
  title?: string
}

export function ClauseIcon({ name, className, title }: ClauseIconProps) {
  const IconComponent = iconMap[name]

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }

  return (
    <span className={cn('inline-flex items-center justify-center', className)} title={title}>
      <IconComponent />
    </span>
  )
}

