import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // Generated apps library
  apps: [],
  
  // Current generation state
  isGenerating: false,
  generationProgress: [],
  currentPrompt: '',
  error: null,

  // Inference config
  inferenceProvider: 'on_device',
  modelName: 'gemma4:e2b',
  ollamaBaseUrl: 'http://localhost:11434',

  // Actions
  setPrompt: (prompt) => set({ currentPrompt: prompt }),

  setInferenceProvider: (provider) => set({ inferenceProvider: provider }),
  setModelName: (modelName) => set({ modelName }),
  setOllamaBaseUrl: (ollamaBaseUrl) => set({ ollamaBaseUrl }),
  
  setGenerating: (status) => set({ 
    isGenerating: status,
    error: null,
    generationProgress: []
  }),

  addProgress: (message) => set((state) => ({
    generationProgress: [...state.generationProgress, message]
  })),

  setError: (error) => set({ 
    error, 
    isGenerating: false 
  }),

  addApp: (schema, html) => {
    const newApp = {
      id: Date.now().toString(),
      name: schema.app_name,
      type: schema.app_type,
      icon: schema.theme?.icon || '⚡',
      color: schema.theme?.primary_color || '#6366F1',
      description: schema.description || '',
      schema,
      html,
      createdAt: new Date().toISOString()
    };
    set((state) => ({ 
      apps: [newApp, ...state.apps],
      isGenerating: false,
      error: null
    }));
    return newApp;
  },

  deleteApp: (id) => set((state) => ({
    apps: state.apps.filter(app => app.id !== id)
  })),

  clearError: () => set({ error: null })
}));

export default useAppStore;
