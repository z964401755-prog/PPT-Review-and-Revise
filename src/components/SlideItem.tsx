import React from 'react';
import { Slide } from '../types/ppt';
import { usePPTStore } from '../store/pptStore';
import { CheckCircle2, Clock, MinusCircle, MessageSquare } from 'lucide-react';

interface SlideItemProps {
  slide: Slide;
  isSelected: boolean;
  onSelect: () => void;
}

export const SlideItem: React.FC<SlideItemProps> = ({ slide, isSelected, onSelect }) => {
  const { reviewData } = usePPTStore();

  const slideComments = (reviewData?.comments || []).filter((c) => c.slideId === slide.id);
  const pendingComments = slideComments.filter((c) => c.status === 'pending');
  const hasHighPriority = pendingComments.some((c) => c.priority === 'high');

  const getStatusBadge = () => {
    if (slide.status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#D83B01]/10 text-[#D83B01] border border-[#D83B01]/30 uppercase tracking-wider shrink-0">
          <Clock size={10} />
          <span>待修改 ({pendingComments.length})</span>
        </span>
      );
    }
    if (slide.status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#107C10]/10 text-[#107C10] dark:text-[#38a138] border border-[#107C10]/30 uppercase tracking-wider shrink-0">
          <CheckCircle2 size={10} />
          <span>已完成</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EDEBE9] dark:bg-[#333] text-[#605E5C] dark:text-[#a0a0a0] border border-[#D2D0CE] dark:border-[#444] uppercase tracking-wider shrink-0">
        <MinusCircle size={10} />
        <span>无需修改</span>
      </span>
    );
  };

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center gap-3 relative ${
        isSelected
          ? 'bg-white dark:bg-[#2c2c2c] border-2 border-[#D83B01] shadow-xs'
          : 'bg-[#FAF9F8] dark:bg-[#252526] border-[#EDEBE9] dark:border-[#383838] hover:border-[#D2D0CE] dark:hover:border-[#555] hover:bg-white dark:hover:bg-[#2d2d2d]'
      }`}
    >
      {/* High Priority Warning indicator dot */}
      {hasHighPriority && (
        <span
          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#D83B01] ring-2 ring-white dark:ring-[#181818]"
          title="包含高优先级待修改项"
        />
      )}

      {/* Slide Thumbnail Preview Box */}
      <div
        className="w-14 h-10 rounded shrink-0 flex flex-col justify-between p-1.5 text-white shadow-xs border border-[#D2D0CE] dark:border-[#444] overflow-hidden relative"
        style={{ background: slide.thumbnail }}
      >
        <div className="text-[9px] font-black bg-black/60 px-1 py-0.2 rounded w-fit uppercase">
          P{slide.pageNumber}
        </div>
        <div className="text-[8px] opacity-90 truncate leading-none font-bold uppercase">{slide.title}</div>
      </div>

      {/* Slide Meta Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-black text-[#323130] dark:text-[#f3f2f1] uppercase tracking-wider truncate">
            第 {slide.pageNumber < 10 ? `0${slide.pageNumber}` : slide.pageNumber} 页
          </span>
          {getStatusBadge()}
        </div>

        <h4 className="text-xs font-bold text-[#323130] dark:text-[#f3f2f1] truncate leading-snug">
          {slide.title}
        </h4>

        {/* Comment count summary */}
        {slideComments.length > 0 && (
          <div className="flex items-center gap-1 mt-1 text-[10px] text-[#605E5C] dark:text-[#a0a0a0] font-bold uppercase tracking-wider">
            <MessageSquare size={11} className="text-[#A19F9D] dark:text-[#8a8886] shrink-0" />
            <span className="truncate">
              {slideComments.length} 条批注
              {pendingComments.length > 0 && (
                <span className="text-[#D83B01] font-black ml-1">
                  ({pendingComments.length} 待处理)
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
