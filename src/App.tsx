import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Landing } from '@/pages/Landing'
import { Upload } from '@/pages/Upload'
import { AnalysisResult } from '@/pages/AnalysisResult'
import { History } from '@/pages/History'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Landing />} />
        <Route path="upload" element={<Upload />} />
        <Route path="analysis/:id" element={<AnalysisResult />} />
        <Route path="history" element={<History />} />
      </Route>
    </Routes>
  )
}

export default App

