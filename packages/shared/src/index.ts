export interface ToolUsage {
  id: string;
  toolCategory: string; // 'pdf' | 'image' | 'audio' | 'video' | 'resume' | 'utilities'
  toolName: string;
  fileSizeBytes?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

export interface ProcessingJob {
  id: string;
  toolUsageId: string;
  inputFileKey: string;
  outputFileKey?: string;
  errorMessage?: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface ResumeDraft {
  id: string;
  sessionId: string;
  templateId: string;
  content: ResumeContent;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeContent {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    summary?: string;
  };
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description?: string;
  }>;
  skills: string[];
  projects: Array<{
    id: string;
    name: string;
    description: string;
    url?: string;
  }>;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  previewImageUrl?: string;
  category: 'modern' | 'classic' | 'creative';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
}
