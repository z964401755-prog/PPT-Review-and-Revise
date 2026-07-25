import React from 'react';
import { usePPTStore } from '../store/pptStore';
import { CommentList } from '../components/CommentList';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const ReviewDetail: React.FC = () => {
  const {
    slides,
    selectedSlideId,
    selectedPageNumber,
    setSelectedSlide,
    reviewData,
    openAddModal,
    currentRole,
  } = usePPTStore();

  const slide = slides.find((s) => s.id === selectedSlideId) || slides[0];
  const comments = (reviewData?.comments || []).filter((c) => c.slideId === slide.id);
  const pendingComments = comments.filter((c) => c.status === 'pending');

  const currentIndex = slides.findIndex((s) => s.id === selectedSlideId);

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prev = slides[currentIndex - 1];
      setSelectedSlide(prev.id, prev.pageNumber);
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const next = slides[currentIndex + 1];
      setSelectedSlide(next.id, next.pageNumber);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F3F2F1] dark:bg-[#181818] p-3 space-y-3 overflow-y-auto font-sans transition-colors">
      {/* Page Title Navigation Card */}
      <div className="bg-[#FAF9F8] dark:bg-[#252526] p-4 rounded-xl border border-[#EDEBE9] dark:border-[#383838] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-white dark:bg-[#1a1a1a] px-2 py-0.5 rounded text-[10px] font-black border border-[#EDEBE9] dark:border-[#444] text-[#323130] dark:text-[#f3f2f1] uppercase shadow-xs">
              第 {slide.pageNumber < 10 ? `0${slide.pageNumber}` : slide.pageNumber} 页
            </span>
            <span className="text-[10px] text-[#A19F9D] dark:text-[#8a8886] font-bold uppercase tracking-wider">
              ({currentIndex + 1} / {slides.length})
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-1.5 rounded bg-white dark:bg-[#1a1a1a] hover:bg-[#F3F2F1] dark:hover:bg-[#333] border border-[#EDEBE9] dark:border-[#444] disabled:opacity-30 transition-colors text-[#323130] dark:text-[#f3f2f1] cursor-pointer"
              title="前一页"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === slides.length - 1}
              className="p-1.5 rounded bg-white dark:bg-[#1a1a1a] hover:bg-[#F3F2F1] dark:hover:bg-[#333] border border-[#EDEBE9] dark:border-[#444] disabled:opacity-30 transition-colors text-[#323130] dark:text-[#f3f2f1] cursor-pointer"
              title="下一页"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Slide Title */}
        <h3 className="text-sm font-black text-[#323130] dark:text-[#f3f2f1] leading-snug uppercase tracking-tight">{slide.title}</h3>

        {/* Slide Status Indicator */}
        <div className="pt-2 border-t border-[#EDEBE9] dark:border-[#383838] flex items-center justify-between text-xs">
          <span className="text-[10px] font-bold text-[#605E5C] dark:text-[#a0a0a0] uppercase tracking-wider">本页修改状态:</span>
          {pendingComments.length > 0 ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D83B01]/10 text-[#D83B01] border border-[#D83B01]/30 flex items-center gap-1 uppercase tracking-wider">
              <Clock size={11} />
              <span>待修改 ({pendingComments.length})</span>
            </span>
          ) : comments.length > 0 ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#107C10]/10 text-[#107C10] dark:text-[#38a138] border border-[#107C10]/30 flex items-center gap-1 uppercase tracking-wider">
              <CheckCircle2 size={11} />
              <span>已完成</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EDEBE9] dark:bg-[#333] text-[#605E5C] dark:text-[#a0a0a0] border border-[#D2D0CE] dark:border-[#444] uppercase tracking-wider">
              无需修改
            </span>
          )}
        </div>
      </div>

      {/* Slide Comments Detail List */}
      <CommentList slideId={slide.id} />
    </div>
  );
};
