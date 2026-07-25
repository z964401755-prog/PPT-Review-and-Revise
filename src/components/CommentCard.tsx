import React, { useState } from 'react';
import { Comment, Priority } from '../types/ppt';
import { usePPTStore } from '../store/pptStore';
import {
  CheckCircle2,
  Clock,
  Calendar,
  MoreVertical,
  Trash2,
  Edit2,
  AlertCircle,
  Tag,
  Image as ImageIcon,
  X,
  Maximize2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Helper to extract surname or first character from author name
const getAuthorSurname = (authorStr: string): string => {
  if (!authorStr) return '审';
  const clean = authorStr.split(/[\(\（\|]/)[0].trim();
  return clean.charAt(0) || '审';
};

// Helper to format date string to MM/DD (月/日) only
const formatDateMMDD = (dateStr: string): string => {
  if (!dateStr) return '';
  const match = dateStr.match(/(?:(\d{4})[/-])?(\d{1,2})[/-](\d{1,2})/);
  if (match) {
    const month = match[2].padStart(2, '0');
    const day = match[3].padStart(2, '0');
    return `${month}/${day}`;
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  }
  return dateStr;
};

interface CommentCardProps {
  comment: Comment;
  showPageBadge?: boolean;
}

export const CommentCard: React.FC<CommentCardProps> = ({ comment, showPageBadge = false }) => {
  const { currentRole, toggleCommentStatus, deleteComment, openEditModal, setSelectedSlide, setActiveTab } =
    usePPTStore();

  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const allImages: string[] = comment.imageUrls && comment.imageUrls.length > 0
    ? comment.imageUrls
    : (comment.imageUrl ? [comment.imageUrl] : []);

  const openLightboxAt = (index: number) => {
    setActiveImageIndex(index);
    setShowImageLightbox(true);
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="text-[10px] font-bold text-[#D83B01] uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D83B01]" />
            高优先级
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] font-bold text-[#FFB900] uppercase tracking-wider">
            中优先级
          </span>
        );
      case 'low':
        return (
          <span className="text-[10px] font-bold text-[#605E5C] uppercase tracking-wider">
            低优先级
          </span>
        );
      default:
        return null;
    }
  };

  const isCompleted = comment.status === 'completed';

  const getBorderColor = () => {
    if (isCompleted) return 'border-l-[#107C10]';
    if (comment.priority === 'high') return 'border-l-[#D83B01]';
    if (comment.priority === 'medium') return 'border-l-[#FFB900]';
    return 'border-l-[#323130]';
  };

  return (
    <>
      <div
        className={`p-4 rounded-r-lg border-l-4 ${getBorderColor()} border-t border-r border-b border-[#EDEBE9] dark:border-[#383838] bg-[#FAF9F8] dark:bg-[#252526] transition-all space-y-3 relative shadow-xs ${
          isCompleted ? 'opacity-85' : ''
        }`}
      >
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {showPageBadge && (
              <button
                onClick={() => {
                  setSelectedSlide(comment.slideId, comment.pageNumber);
                  setActiveTab('detail');
                }}
                className="bg-white dark:bg-[#1a1a1a] px-2 py-0.5 rounded text-[10px] font-bold shadow-xs border border-[#EDEBE9] dark:border-[#444] text-[#323130] dark:text-[#f3f2f1] uppercase hover:bg-[#F3F2F1] dark:hover:bg-[#333] transition-colors cursor-pointer"
              >
                第 {comment.pageNumber < 10 ? `0${comment.pageNumber}` : comment.pageNumber} 页
              </button>
            )}

            {getPriorityBadge(comment.priority)}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => openEditModal(comment)}
              className="p-1 text-[#A19F9D] dark:text-[#8a8886] hover:text-[#323130] dark:hover:text-white hover:bg-[#EDEBE9] dark:hover:bg-[#383838] rounded transition-colors cursor-pointer"
              title="编辑意见"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => deleteComment(comment.id)}
              className="p-1 text-[#A19F9D] dark:text-[#8a8886] hover:text-[#D83B01] hover:bg-[#D83B01]/10 rounded transition-colors cursor-pointer"
              title="删除意见"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Main Comment Content Text */}
        <p
          className={`text-xs font-medium leading-relaxed ${
            isCompleted ? 'text-[#A19F9D] dark:text-[#777] line-through decoration-[#107C10]' : 'text-[#323130] dark:text-[#f3f2f1]'
          }`}
        >
          {comment.content}
        </p>

        {/* Reference Image Attachment Preview if present */}
        {allImages.length > 0 && (
          <div className="bg-white dark:bg-[#1f1f1f] p-2 rounded-lg border border-[#EDEBE9] dark:border-[#383838] space-y-1.5">
            <div className="flex items-center justify-between text-[9px] font-bold text-[#323130] dark:text-[#f3f2f1] uppercase tracking-wider">
              <span className="flex items-center gap-1 text-[#D83B01]">
                <ImageIcon size={11} />
                <span>
                  参考图 / 修改示意图 {allImages.length > 1 ? `(共 ${allImages.length} 张)` : ''}
                </span>
              </span>
              <button
                onClick={() => openLightboxAt(0)}
                className="text-[#605E5C] dark:text-[#a0a0a0] hover:text-[#D83B01] flex items-center gap-0.5 transition-colors cursor-pointer"
              >
                <Maximize2 size={10} />
                <span>点击放大查看</span>
              </button>
            </div>

            {allImages.length === 1 ? (
              <div
                onClick={() => openLightboxAt(0)}
                className="cursor-pointer overflow-hidden rounded border border-[#EDEBE9] dark:border-[#383838] bg-[#FAF9F8] dark:bg-[#282828] relative group max-h-36 flex items-center justify-center"
              >
                <img
                  src={allImages[0]}
                  alt="批注参考示意图"
                  className="max-h-32 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                  <Maximize2 size={16} className="mr-1" />
                  <span>查看原图</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {allImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => openLightboxAt(idx)}
                    className="cursor-pointer overflow-hidden rounded border border-[#EDEBE9] dark:border-[#383838] bg-[#FAF9F8] dark:bg-[#282828] relative group h-20 flex items-center justify-center"
                  >
                    <img
                      src={imgUrl}
                      alt={`示意图 ${idx + 1}`}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition-opacity">
                      <span>#{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Meta & Toggle Status Button */}
        <div className="pt-2 border-t border-[#EDEBE9] dark:border-[#383838] flex items-center justify-between text-[10px] text-[#605E5C] dark:text-[#a0a0a0]">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#605E5C] dark:text-[#a0a0a0]">
            {/* Surname Avatar Circle */}
            <div
              className="w-5 h-5 rounded-full bg-[#D83B01] text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs cursor-help"
              title={`提出人: ${comment.author}`}
            >
              {getAuthorSurname(comment.author)}
            </div>
            <span>•</span>
            <span className="flex items-center gap-1 font-bold">
              <Calendar size={11} className="text-[#A19F9D] dark:text-[#8a8886]" />
              <span>{formatDateMMDD(comment.createdAt)}</span>
            </span>
          </div>

          {/* Toggle Status Confirmation Button */}
          <button
            onClick={() => toggleCommentStatus(comment.id)}
            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all shadow-xs shrink-0 cursor-pointer ${
              isCompleted
                ? 'bg-[#EDEBE9] dark:bg-[#383838] text-[#323130] dark:text-[#f3f2f1] border border-[#D2D0CE] dark:border-[#555] hover:bg-[#E1E1E1] dark:hover:bg-[#444]'
                : currentRole === 'creator'
                  ? 'bg-amber-400 hover:bg-amber-500 text-slate-900 font-black'
                  : 'bg-[#D83B01] text-white hover:bg-[#B7472A]'
            }`}
          >
            <CheckCircle2 size={12} className={isCompleted ? 'text-[#107C10] dark:text-[#38a138]' : currentRole === 'creator' ? 'text-slate-900' : 'text-white'} />
            <span>
              {isCompleted
                ? '重置为未完成'
                : currentRole === 'creator'
                  ? '制作人标记: 已改好'
                  : '确认修改完成'}
            </span>
          </button>
        </div>
      </div>

      {/* Lightbox Modal for Image Inspection */}
      {showImageLightbox && allImages.length > 0 && (
        <div
          onClick={() => setShowImageLightbox(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[90vh] bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/20 p-2 flex flex-col items-center shadow-2xl cursor-default"
          >
            {/* Header Bar */}
            <div className="w-full flex items-center justify-between p-2 text-white text-xs border-b border-white/10">
              <span className="font-bold flex items-center gap-1.5">
                <ImageIcon size={14} className="text-[#D83B01]" />
                <span>
                  第 {comment.pageNumber} 页批注参考图 {allImages.length > 1 ? `(${activeImageIndex + 1} / ${allImages.length})` : ''}
                </span>
              </span>
              <button
                onClick={() => setShowImageLightbox(false)}
                className="p-1 hover:bg-white/10 rounded-full text-white/80 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Image View with Prev/Next Controls */}
            <div className="relative p-4 flex-1 flex items-center justify-center overflow-hidden w-full min-h-[300px]">
              {allImages.length > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                  className="absolute left-3 z-10 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full transition-colors border border-white/20 cursor-pointer"
                  title="上一张"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              <img
                src={allImages[activeImageIndex] || allImages[0]}
                alt={`高清参考图 ${activeImageIndex + 1}`}
                className="max-h-[65vh] max-w-full object-contain rounded shadow-2xl transition-all duration-200"
              />

              {allImages.length > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-3 z-10 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full transition-colors border border-white/20 cursor-pointer"
                  title="下一张"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>

            {/* Bottom Thumbnails Strip for Multi-Image navigation */}
            {allImages.length > 1 && (
              <div className="w-full pt-2 border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-12 w-16 rounded overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      activeImageIndex === idx ? 'border-[#D83B01] scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`缩略图 ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
