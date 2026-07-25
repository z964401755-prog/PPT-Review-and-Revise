export type Priority = 'high' | 'medium' | 'low';
export type SlideStatus = 'normal' | 'pending' | 'completed';
export type UserRole = 'reviewer' | 'creator';

export interface Comment {
  id: string;
  slideId: string;
  pageNumber: number;
  content: string;
  priority: Priority;
  status: 'pending' | 'completed';
  author: string;
  createdAt: string;
  completedAt?: string;
  category?: 'content' | 'design' | 'data' | 'typo';
  imageUrl?: string;
  imageUrls?: string[];
}

export interface ReviewData {
  pptId: string;
  pptName: string;
  reviewer: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

export interface Slide {
  id: string;
  pageNumber: number;
  title: string;
  thumbnail: string;
  status: SlideStatus;
  commentCount?: number;
  pendingCount?: number;
  completedCount?: number;
}

export interface PPTFile {
  id: string;
  name: string;
  totalPages: number;
  reviewerName: string;
  slides: Slide[];
  reviewData?: ReviewData;
  lastSavedAt?: string;
}

export interface Statistics {
  totalPages: number;
  pagesNeedingReview: number;
  totalComments: number;
  pendingComments: number;
  completedComments: number;
  completionRate: number;
}
