import { create } from 'zustand'
import { Project, Vignette } from '@/lib/supabase'

interface PreviewData {
  transcribedText: string
  analysis: {
    title: string
    summary: string
    tone: string
    structure: {
      parte_1: string
      parte_2: string
      parte_3: string
    }
  }
  audioUrl: string
}

interface AppState {
  // Preview data (localStorage)
  previewData: PreviewData | null
  setPreviewData: (data: PreviewData | null) => void
  
  // User projects
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  
  // Vignettes
  vignettes: Vignette[]
  setVignettes: (vignettes: Vignette[]) => void
  addVignette: (vignette: Vignette) => void
  
  // UI state
  isRecording: boolean
  setIsRecording: (recording: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  // Preview data
  previewData: null,
  setPreviewData: (data) => set({ previewData: data }),
  
  // Projects
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),
  
  // Vignettes
  vignettes: [],
  setVignettes: (vignettes) => set({ vignettes }),
  addVignette: (vignette) => set((state) => ({ 
    vignettes: [...state.vignettes, vignette] 
  })),
  
  // UI state
  isRecording: false,
  setIsRecording: (recording) => set({ isRecording: recording }),
}))