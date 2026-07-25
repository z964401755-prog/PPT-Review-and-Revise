import { create } from 'zustand';
import { PPTFile, Slide, ReviewData, Comment, Priority, SlideStatus, UserRole, Statistics } from '../types/ppt';
import { INITIAL_MOCK_PPTS, INITIAL_MOCK_REVIEW_DATA } from '../mock/pptData';
import { mockOfficeStorage } from '../utils/storage';
import { parsePPTXFile, generateShareUrl, parseShareUrl } from '../utils/pptxParser';

export type MainTab = 'dashboard' | 'slides' | 'detail' | 'comments' | 'doc';

interface PPTStoreState {
  // Roles & View
  currentRole: UserRole;
  activeTab: MainTab;
  currentPPTId: string;
  selectedSlideId: string;
  selectedPageNumber: number;

  // Filters & Search
  filterPriority: 'all' | Priority;
  filterStatus: 'all' | 'pending' | 'completed';
  searchQuery: string;

  // PPTs & Active Review Data
  ppts: PPTFile[];
  reviewData: ReviewData | null;
  slides: Slide[];

  // Notification Toast state
  toastMessage: string | null;

  // Web Link Sharing & Session state
  isSharedSession: boolean;
  sharedBannerText: string | null;
  hasOpenedPPT: boolean; // 是否已上传/打开 PPT 从而进入批阅界面

  // UI state
  isDarkMode: boolean;
  showCanvasOverlays: boolean; // 是否在 PPT 幻灯片画布上直接叠加批注浮层
  showAddModal: boolean;
  editingComment: Comment | null;
  showImportExportModal: boolean;
  showOfficeDocModal: boolean;
  showUploadShareModal: boolean;
  taskPaneViewMode: 'split' | 'fullscreen'; // split side-by-side vs task pane full width
  isTaskPaneCollapsed: boolean; // 是否折叠/收缩右侧任务窗格插件
  isLeftSidebarCollapsed: boolean; // 是否折叠/收缩左侧任务栏列表

  // Actions
  toggleDarkMode: () => void;
  toggleCanvasOverlays: () => void;
  toggleTaskPaneCollapsed: () => void;
  setTaskPaneCollapsed: (collapsed: boolean) => void;
  toggleLeftSidebarCollapsed: () => void;
  setLeftSidebarCollapsed: (collapsed: boolean) => void;
  deletePPTTask: (pptId: string) => void;
  renamePPTTask: (pptId: string, newName: string) => void;
  setCurrentRole: (role: UserRole) => void;
  setActiveTab: (tab: MainTab) => void;
  setCurrentPPTId: (pptId: string) => void;
  setSelectedSlide: (slideId: string, pageNumber: number) => void;
  setFilterPriority: (priority: 'all' | Priority) => void;
  setFilterStatus: (status: 'all' | 'pending' | 'completed') => void;
  setSearchQuery: (query: string) => void;
  setTaskPaneViewMode: (mode: 'split' | 'fullscreen') => void;

  // Modals
  openAddModal: (slideId?: string, pageNumber?: number) => void;
  closeAddModal: () => void;
  openEditModal: (comment: Comment) => void;
  closeEditModal: () => void;
  setShowImportExportModal: (show: boolean) => void;
  setShowOfficeDocModal: (show: boolean) => void;
  setShowUploadShareModal: (show: boolean) => void;
  showToast: (msg: string) => void;

  // Web Upload & Link Sharing Core Actions
  uploadPPTFile: (file: File) => Promise<void>;
  openPPT: (pptId?: string) => void;
  returnToUploadScreen: () => void;
  getShareableLink: () => string;
  copyShareableLink: () => string;
  initSharedLinkIfPresent: () => boolean;

  // Core Data Actions
  loadReviewData: (pptId?: string) => void;
  saveReviewData: () => void;
  addComment: (params: {
    slideId: string;
    pageNumber: number;
    content: string;
    priority: Priority;
    category?: 'content' | 'design' | 'data' | 'typo';
    imageUrl?: string;
    imageUrls?: string[];
  }) => void;
  updateComment: (id: string, updates: Partial<Comment>) => void;
  deleteComment: (id: string) => void;
  toggleCommentStatus: (commentId: string) => void;
  importReviewDataJson: (jsonString: string) => boolean;
  exportReviewDataJson: () => void;
  resetAllDemoData: () => void;

  // Computed helper
  getStatistics: () => Statistics;
  getCommentsForSelectedSlide: () => Comment[];
}

export const usePPTStore = create<PPTStoreState>((set, get) => {
  // Helper to initialize storage if empty
  const initStorageForPPT = (pptId: string): ReviewData => {
    let existing = mockOfficeStorage.getItem(pptId);
    if (!existing) {
      existing = INITIAL_MOCK_REVIEW_DATA[pptId] || {
        pptId,
        pptName: INITIAL_MOCK_PPTS.find((p) => p.id === pptId)?.name || '未命名PPT.pptx',
        reviewer: INITIAL_MOCK_PPTS.find((p) => p.id === pptId)?.reviewerName || '审阅人',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        comments: [],
      };
      mockOfficeStorage.setItem(pptId, existing);
    }
    return existing;
  };

  // Initial setup for default PPT 'ppt001'
  const defaultPPT = INITIAL_MOCK_PPTS[0];
  const initialReviewData = initStorageForPPT(defaultPPT.id);

  // Helper to compute slide statuses based on comments
  const syncSlidesWithComments = (baseSlides: Slide[], comments: Comment[]): Slide[] => {
    const commentsBySlide = new Map<string, Comment[]>();
    comments.forEach((c) => {
      const list = commentsBySlide.get(c.slideId) || [];
      list.push(c);
      commentsBySlide.set(c.slideId, list);
    });

    return baseSlides.map((slide) => {
      const slideComments = commentsBySlide.get(slide.id) || [];
      const pendingCount = slideComments.filter((c) => c.status === 'pending').length;
      const completedCount = slideComments.filter((c) => c.status === 'completed').length;
      const total = slideComments.length;

      let status: SlideStatus = 'normal';
      if (total > 0) {
        status = pendingCount > 0 ? 'pending' : 'completed';
      }

      return {
        ...slide,
        status,
        commentCount: total,
        pendingCount,
        completedCount,
      };
    });
  };

  const initialSlides = syncSlidesWithComments(defaultPPT.slides, initialReviewData.comments);

  return {
    currentRole: 'reviewer',
    activeTab: 'dashboard',
    currentPPTId: defaultPPT.id,
    selectedSlideId: 's8', // Default to slide 8 as requested in scenario
    selectedPageNumber: 8,

    filterPriority: 'all',
    filterStatus: 'all',
    searchQuery: '',

    ppts: INITIAL_MOCK_PPTS,
    reviewData: initialReviewData,
    slides: initialSlides,

    toastMessage: null,
    isSharedSession: false,
    sharedBannerText: null,
    hasOpenedPPT: true, // 默认开启三栏工作区 layout

    isDarkMode: typeof window !== 'undefined' ? localStorage.getItem('ppt_dark_mode') === 'true' : false,
    showCanvasOverlays: false, // 默认隐藏页面遮挡贴纸，保持纯净阅读
    showAddModal: false,
    editingComment: null,
    showImportExportModal: false,
    showOfficeDocModal: false,
    showUploadShareModal: false,
    taskPaneViewMode: 'split',
    isTaskPaneCollapsed: false,
    isLeftSidebarCollapsed: false,

    toggleCanvasOverlays: () => set((state) => ({ showCanvasOverlays: !state.showCanvasOverlays })),
    toggleTaskPaneCollapsed: () => set((state) => ({ isTaskPaneCollapsed: !state.isTaskPaneCollapsed })),
    setTaskPaneCollapsed: (collapsed: boolean) => set({ isTaskPaneCollapsed: collapsed }),
    toggleLeftSidebarCollapsed: () => set((state) => ({ isLeftSidebarCollapsed: !state.isLeftSidebarCollapsed })),
    setLeftSidebarCollapsed: (collapsed: boolean) => set({ isLeftSidebarCollapsed: collapsed }),

    deletePPTTask: (pptId: string) => {
      const { ppts, currentPPTId } = get();
      if (ppts.length <= 1) {
        get().showToast('至少需保留一个 PPT 任务');
        return;
      }
      const updatedPpts = ppts.filter((p) => p.id !== pptId);
      let nextSelectedId = currentPPTId;
      if (currentPPTId === pptId) {
        nextSelectedId = updatedPpts[0].id;
      }
      set({ ppts: updatedPpts });
      get().setCurrentPPTId(nextSelectedId);
      get().showToast('已成功删除该任务');
    },

    renamePPTTask: (pptId: string, newName: string) => {
      if (!newName.trim()) return;
      const { ppts, reviewData } = get();
      const updatedPpts = ppts.map((p) => (p.id === pptId ? { ...p, name: newName } : p));
      let updatedReview = reviewData;
      if (reviewData && reviewData.pptId === pptId) {
        updatedReview = { ...reviewData, pptName: newName };
      }
      set({ ppts: updatedPpts, reviewData: updatedReview });
      get().showToast(`任务已重命名为: ${newName}`);
    },

    toggleDarkMode: () => {
      const nextMode = !get().isDarkMode;
      set({ isDarkMode: nextMode });
      try {
        localStorage.setItem('ppt_dark_mode', String(nextMode));
        if (nextMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {
        console.error(e);
      }
    },

    setCurrentRole: (role) => {
      set({ currentRole: role });
      get().showToast(
        role === 'reviewer'
          ? '已切换为【审阅人模式】：可新建、编辑批注与调整优先级'
          : '已切换为【制作人/修改模式】：可对照批注修图并标记完成'
      );
    },
    setActiveTab: (tab) => set({ activeTab: tab }),

    setCurrentPPTId: (pptId) => {
      const ppt = get().ppts.find((p) => p.id === pptId) || get().ppts[0];
      const reviewData = initStorageForPPT(pptId);
      const slides = syncSlidesWithComments(ppt.slides, reviewData.comments);
      const firstSlide = ppt.slides[0];

      set({
        currentPPTId: pptId,
        reviewData,
        slides,
        selectedSlideId: firstSlide?.id || '',
        selectedPageNumber: firstSlide?.pageNumber || 1,
      });
      get().showToast(`已切换 PPT 文件: ${ppt.name}`);
    },

    setSelectedSlide: (slideId, pageNumber) => {
      set({ selectedSlideId: slideId, selectedPageNumber: pageNumber });
    },

    setFilterPriority: (filterPriority) => set({ filterPriority }),
    setFilterStatus: (filterStatus) => set({ filterStatus }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setTaskPaneViewMode: (taskPaneViewMode) => set({ taskPaneViewMode }),

    openAddModal: (slideId, pageNumber) => {
      if (slideId && pageNumber) {
        set({ selectedSlideId: slideId, selectedPageNumber: pageNumber, showAddModal: true });
      } else {
        set({ showAddModal: true });
      }
    },
    closeAddModal: () => set({ showAddModal: false }),

    openEditModal: (comment) => set({ editingComment: comment }),
    closeEditModal: () => set({ editingComment: null }),

    setShowImportExportModal: (show) => set({ showImportExportModal: show }),
    setShowOfficeDocModal: (show) => set({ showOfficeDocModal: show }),
    setShowUploadShareModal: (show) => set({ showUploadShareModal: show }),

    showToast: (msg) => {
      set({ toastMessage: msg });
      setTimeout(() => set({ toastMessage: null }), 3000);
    },

    uploadPPTFile: async (file: File) => {
      try {
        const { pptFile, initialReviewData } = await parsePPTXFile(file);
        
        // Save to mock storage & store
        mockOfficeStorage.setItem(pptFile.id, initialReviewData);
        
        const existingPpts = get().ppts;
        const updatedPpts = [pptFile, ...existingPpts];
        
        set({
          ppts: updatedPpts,
          currentPPTId: pptFile.id,
          reviewData: initialReviewData,
          slides: pptFile.slides,
          selectedSlideId: pptFile.slides[0]?.id || '',
          selectedPageNumber: 1,
          showUploadShareModal: false,
          hasOpenedPPT: true, // 打开批阅界面
        });

        get().showToast(`成功上传并在网页端打开 PPT: ${file.name}`);
      } catch (err) {
        console.error('Upload failed:', err);
        get().showToast('PPT 解析上传失败，请重试');
      }
    },

    openPPT: (pptId?: string) => {
      if (pptId) {
        get().setCurrentPPTId(pptId);
      }
      set({ hasOpenedPPT: true });
    },

    returnToUploadScreen: () => {
      set({ hasOpenedPPT: false });
    },

    getShareableLink: () => {
      const { ppts, currentPPTId, reviewData } = get();
      const currentPpt = ppts.find((p) => p.id === currentPPTId) || ppts[0];
      if (!currentPpt || !reviewData) return '';
      return generateShareUrl(currentPpt, reviewData);
    },

    copyShareableLink: () => {
      const shareUrl = get().getShareableLink();
      if (!shareUrl) return '';

      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl)
          .then(() => {
            get().showToast('已成功复制网页协同链接到剪贴板！领导/同事点击即可直接查看');
          })
          .catch((e) => {
            console.warn('Clipboard writeText async fallback:', e);
            get().showToast('已生成网页协同链接，可在对话框内直接复制');
          });
      } else {
        get().showToast('已生成网页协同链接，可在对话框内直接复制');
      }
      return shareUrl;
    },

    initSharedLinkIfPresent: () => {
      const parsed = parseShareUrl();
      if (!parsed) return false;

      const { pptFile, reviewData } = parsed;
      mockOfficeStorage.setItem(pptFile.id, reviewData);

      const existingPpts = get().ppts.filter((p) => p.id !== pptFile.id);
      const updatedPpts = [pptFile, ...existingPpts];

      const syncedSlides = syncSlidesWithComments(pptFile.slides, reviewData.comments);

      set({
        ppts: updatedPpts,
        currentPPTId: pptFile.id,
        reviewData,
        slides: syncedSlides,
        selectedSlideId: pptFile.slides[0]?.id || '',
        selectedPageNumber: 1,
        isSharedSession: true,
        hasOpenedPPT: true,
        sharedBannerText: `已从分享链接载入: ${pptFile.name} (含 ${reviewData.comments.length} 条意见)`,
      });

      get().showToast(`已从网页分享链接打开: ${pptFile.name}`);
      return true;
    },

    loadReviewData: (targetPptId) => {
      const id = targetPptId || get().currentPPTId;
      const reviewData = mockOfficeStorage.getItem(id) || initStorageForPPT(id);
      const ppt = get().ppts.find((p) => p.id === id);
      const baseSlides = ppt ? ppt.slides : [];
      const slides = syncSlidesWithComments(baseSlides, reviewData.comments);

      set({ reviewData, slides });
    },

    saveReviewData: () => {
      const { currentPPTId, reviewData } = get();
      if (reviewData) {
        mockOfficeStorage.setItem(currentPPTId, reviewData);
      }
    },

    addComment: ({ slideId, pageNumber, content, priority, category = 'content', imageUrl, imageUrls }) => {
      const { reviewData, currentPPTId, ppts, currentRole } = get();
      if (!reviewData) return;

      const finalUrls = imageUrls && imageUrls.length > 0 ? imageUrls : (imageUrl ? [imageUrl] : []);

      const newComment: Comment = {
        id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        slideId,
        pageNumber,
        content,
        priority,
        status: 'pending',
        author: currentRole === 'reviewer' ? (reviewData.reviewer || '张总 (首席执行官)') : '制作人员 (设计员)',
        createdAt: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        category,
        imageUrl: finalUrls[0] || imageUrl,
        imageUrls: finalUrls,
      };

      const updatedComments = [newComment, ...reviewData.comments];
      const updatedReviewData: ReviewData = {
        ...reviewData,
        comments: updatedComments,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      // Save to mock Custom XML Storage
      mockOfficeStorage.setItem(currentPPTId, updatedReviewData);

      const ppt = ppts.find((p) => p.id === currentPPTId);
      const updatedSlides = syncSlidesWithComments(ppt?.slides || [], updatedComments);

      set({
        reviewData: updatedReviewData,
        slides: updatedSlides,
        showAddModal: false,
      });

      get().showToast(`修改意见已成功嵌入保存到第 ${pageNumber} 页！`);
    },

    updateComment: (id, updates) => {
      const { reviewData, currentPPTId, ppts } = get();
      if (!reviewData) return;

      const updatedComments = reviewData.comments.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      );

      const updatedReviewData: ReviewData = {
        ...reviewData,
        comments: updatedComments,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      mockOfficeStorage.setItem(currentPPTId, updatedReviewData);
      const ppt = ppts.find((p) => p.id === currentPPTId);
      const updatedSlides = syncSlidesWithComments(ppt?.slides || [], updatedComments);

      set({
        reviewData: updatedReviewData,
        slides: updatedSlides,
        editingComment: null,
      });

      get().showToast('意见内容已成功更新');
    },

    deleteComment: (id) => {
      const { reviewData, currentPPTId, ppts } = get();
      if (!reviewData) return;

      const updatedComments = reviewData.comments.filter((c) => c.id !== id);
      const updatedReviewData: ReviewData = {
        ...reviewData,
        comments: updatedComments,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      mockOfficeStorage.setItem(currentPPTId, updatedReviewData);
      const ppt = ppts.find((p) => p.id === currentPPTId);
      const updatedSlides = syncSlidesWithComments(ppt?.slides || [], updatedComments);

      set({
        reviewData: updatedReviewData,
        slides: updatedSlides,
      });

      get().showToast('已删除该条修改意见');
    },

    toggleCommentStatus: (commentId) => {
      const { reviewData, currentPPTId, ppts } = get();
      if (!reviewData) return;

      const target = reviewData.comments.find((c) => c.id === commentId);
      if (!target) return;

      const nextStatus: 'pending' | 'completed' = target.status === 'pending' ? 'completed' : 'pending';
      const nowStr = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

      const updatedComments = reviewData.comments.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            status: nextStatus,
            completedAt: nextStatus === 'completed' ? nowStr : undefined,
          };
        }
        return c;
      });

      const updatedReviewData: ReviewData = {
        ...reviewData,
        comments: updatedComments,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      mockOfficeStorage.setItem(currentPPTId, updatedReviewData);
      const ppt = ppts.find((p) => p.id === currentPPTId);
      const updatedSlides = syncSlidesWithComments(ppt?.slides || [], updatedComments);

      set({
        reviewData: updatedReviewData,
        slides: updatedSlides,
      });

      get().showToast(nextStatus === 'completed' ? '已确认完成修改！' : '修改状态重新设为待处理');
    },

    importReviewDataJson: (jsonString) => {
      const parsed = mockOfficeStorage.parseImportedJson(jsonString);
      if (!parsed) {
        get().showToast('JSON 格式不符合审阅数据模型标准！');
        return false;
      }

      const { currentPPTId, ppts } = get();
      const updatedReviewData: ReviewData = {
        ...parsed,
        pptId: currentPPTId, // Bind to current active PPT
      };

      mockOfficeStorage.setItem(currentPPTId, updatedReviewData);
      const ppt = ppts.find((p) => p.id === currentPPTId);
      const updatedSlides = syncSlidesWithComments(ppt?.slides || [], updatedReviewData.comments);

      set({
        reviewData: updatedReviewData,
        slides: updatedSlides,
        showImportExportModal: false,
      });

      get().showToast(`成功导入审阅记录！共加载 ${updatedReviewData.comments.length} 条修改意见。`);
      return true;
    },

    exportReviewDataJson: () => {
      const { reviewData } = get();
      if (!reviewData) return;
      mockOfficeStorage.exportToJsonFile(reviewData);
      get().showToast('已生成并导出 reviewData.json 文件');
    },

    resetAllDemoData: () => {
      INITIAL_MOCK_PPTS.forEach((p) => {
        if (INITIAL_MOCK_REVIEW_DATA[p.id]) {
          mockOfficeStorage.setItem(p.id, INITIAL_MOCK_REVIEW_DATA[p.id]);
        }
      });
      const defaultPPT = INITIAL_MOCK_PPTS[0];
      const reviewData = mockOfficeStorage.getItem(defaultPPT.id)!;
      const slides = syncSlidesWithComments(defaultPPT.slides, reviewData.comments);

      set({
        ppts: INITIAL_MOCK_PPTS,
        currentPPTId: defaultPPT.id,
        reviewData,
        slides,
        selectedSlideId: 's8',
        selectedPageNumber: 8,
        filterPriority: 'all',
        filterStatus: 'all',
        searchQuery: '',
      });
      get().showToast('已重置所有 PPT 原型演示数据与内嵌存储');
    },

    getStatistics: () => {
      const { slides, reviewData } = get();
      const totalPages = slides.length;
      const comments = reviewData?.comments || [];

      const pagesNeedingReview = slides.filter((s) => (s.commentCount || 0) > 0).length;
      const totalComments = comments.length;
      const pendingComments = comments.filter((c) => c.status === 'pending').length;
      const completedComments = comments.filter((c) => c.status === 'completed').length;

      const completionRate =
        totalComments > 0 ? Math.round((completedComments / totalComments) * 100) : 100;

      return {
        totalPages,
        pagesNeedingReview,
        totalComments,
        pendingComments,
        completedComments,
        completionRate,
      };
    },

    getCommentsForSelectedSlide: () => {
      const { reviewData, selectedSlideId, filterPriority, filterStatus, searchQuery } = get();
      if (!reviewData) return [];

      return reviewData.comments.filter((c) => {
        if (c.slideId !== selectedSlideId) return false;
        if (filterPriority !== 'all' && c.priority !== filterPriority) return false;
        if (filterStatus !== 'all' && c.status !== filterStatus) return false;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          return (
            c.content.toLowerCase().includes(q) ||
            c.author.toLowerCase().includes(q) ||
            c.pageNumber.toString().includes(q)
          );
        }
        return true;
      });
    },
  };
});
