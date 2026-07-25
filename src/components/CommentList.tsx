import React from 'react';
import { usePPTStore } from '../store/pptStore';
import { CommentCard } from './CommentCard';
import { MessageSquare, Plus, Filter, Sparkles, CheckCircle2, Download, Search, UserCheck, Palette } from 'lucide-react';

interface CommentListProps {
  slideId?: string;
  showAllGlobalComments?: boolean;
  showImportExportBtn?: boolean;
  showSearchBar?: boolean;
}

export const CommentList: React.FC<CommentListProps> = ({
  slideId,
  showAllGlobalComments = false,
  showImportExportBtn = false,
  showSearchBar = false,
}) => {
  const {
    reviewData,
    selectedSlideId,
    selectedPageNumber,
    openAddModal,
    setShowImportExportModal,
    filterPriority,
    setFilterPriority,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    currentRole,
    setCurrentRole,
  } = usePPTStore();

  const comments = reviewData?.comments || [];

  const targetSlideId = slideId || selectedSlideId;

  const filteredComments = comments.filter((c) => {
    if (!showAllGlobalComments && c.slideId !== targetSlideId) return false;
    if (filterPriority !== 'all' && c.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.content.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q) ||
        c.pageNumber.toString().includes(q)
      );
    }
    return true;
  });

  const pendingCount = (
    showAllGlobalComments ? comments : comments.filter((c) => c.slideId === targetSlideId)
  ).filter((c) => c.status === 'pending').length;

  return (
    <div className="space-y-3 font-sans">
      {/* Active Role Banner */}
      <div className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between border shadow-2xs ${
        currentRole === 'reviewer'
          ? 'bg-[#D83B01]/10 text-[#D83B01] dark:bg-[#D83B01]/20 dark:text-orange-300 border-[#D83B01]/30'
          : 'bg-amber-500/15 text-amber-900 dark:bg-amber-500/25 dark:text-amber-200 border-amber-500/40'
      }`}>
        <div className="flex items-center gap-1.5">
          {currentRole === 'reviewer' ? <UserCheck size={14} className="shrink-0" /> : <Palette size={14} className="shrink-0" />}
          <span>
            {currentRole === 'reviewer'
              ? '当前视角：审阅人 (添加与发起修改需求)'
              : '当前视角：制作人/修改人员 (对照要求标记完成)'}
          </span>
        </div>
        <button
          onClick={() => setCurrentRole(currentRole === 'reviewer' ? 'creator' : 'reviewer')}
          className="text-[10px] underline font-black cursor-pointer hover:opacity-80 shrink-0 uppercase tracking-wider"
        >
          切至{currentRole === 'reviewer' ? '制作人' : '审阅人'}
        </button>
      </div>

      {/* Merged Controls & Filter Bar */}
      <div className="bg-[#FAF9F8] dark:bg-[#252526] p-3.5 rounded-xl border border-[#EDEBE9] dark:border-[#383838] shadow-xs space-y-3">
        {/* Header Title & Action Buttons */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#323130] dark:text-[#f3f2f1] uppercase tracking-wider">
            <MessageSquare size={15} className="text-[#D83B01] shrink-0" />
            <span>
              {showAllGlobalComments
                ? `全件审阅意见中心 (${filteredComments.length})`
                : `第 ${selectedPageNumber < 10 ? `0${selectedPageNumber}` : selectedPageNumber} 页批注 (${filteredComments.length})`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {showImportExportBtn && (
              <button
                onClick={() => setShowImportExportModal(true)}
                className="px-2.5 py-1.5 bg-white dark:bg-[#1a1a1a] hover:bg-[#F3F2F1] dark:hover:bg-[#333] text-[#323130] dark:text-[#f3f2f1] border border-[#EDEBE9] dark:border-[#444] rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                title="导出/导入 reviewData.json"
              >
                <Download size={12} />
                <span>导入/导出</span>
              </button>
            )}

            <button
              onClick={() => openAddModal(targetSlideId, selectedPageNumber)}
              className="px-2.5 py-1.5 bg-[#D83B01] hover:bg-[#B7472A] text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Plus size={12} />
              <span>新增意见</span>
            </button>
          </div>
        </div>

        {/* Global Search Bar if requested or in global mode */}
        {(showSearchBar || showAllGlobalComments) && (
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-[#A19F9D] dark:text-[#8a8886]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="全文搜索修改意见关键词、提出人或页码..."
              className="w-full bg-white dark:bg-[#1a1a1a] border border-[#D2D0CE] dark:border-[#444] rounded pl-8 pr-3 py-1.5 text-xs text-[#323130] dark:text-[#f3f2f1] font-medium placeholder-[#A19F9D] dark:placeholder-[#777] focus:outline-none focus:border-[#D83B01] transition-colors"
            />
          </div>
        )}

        {/* Priority & Status Filters */}
        <div className="flex flex-col gap-2 text-[10px] pt-2.5 border-t border-[#EDEBE9] dark:border-[#383838]">
          {/* Row 1: Priority Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#605E5C] dark:text-[#a0a0a0] font-bold uppercase tracking-wider min-w-[42px] shrink-0">优先级:</span>
            {(['all', 'high', 'medium', 'low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  filterPriority === p
                    ? 'bg-[#D83B01] text-white shadow-xs'
                    : 'bg-white dark:bg-[#252526] text-[#605E5C] dark:text-[#f3f2f1] border border-[#EDEBE9] dark:border-[#383838] hover:bg-[#F3F2F1] dark:hover:bg-[#333]'
                }`}
              >
                {p === 'all'
                  ? '全部'
                  : p === 'high'
                  ? '高'
                  : p === 'medium'
                  ? '中'
                  : '低'}
              </button>
            ))}
          </div>

          {/* Row 2: Status Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#605E5C] dark:text-[#a0a0a0] font-bold uppercase tracking-wider min-w-[42px] shrink-0">状态:</span>
            {(['all', 'pending', 'completed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  filterStatus === s
                    ? 'bg-[#323130] dark:bg-[#3c3c3c] text-white shadow-xs'
                    : 'bg-white dark:bg-[#252526] text-[#605E5C] dark:text-[#f3f2f1] border border-[#EDEBE9] dark:border-[#383838] hover:bg-[#F3F2F1] dark:hover:bg-[#333]'
                }`}
              >
                {s === 'all' ? '全部' : s === 'pending' ? '待处理' : '已完成'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List of Comment Cards */}
      <div className="space-y-2.5">
        {filteredComments.length === 0 ? (
          <div className="bg-[#FAF9F8] rounded-xl border border-dashed border-[#D2D0CE] p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#D83B01]/10 text-[#D83B01] flex items-center justify-center mx-auto">
              <Sparkles size={18} />
            </div>
            <h4 className="text-xs font-bold text-[#323130] uppercase tracking-wider">暂无符合条件的审阅批注</h4>
            <p className="text-[11px] text-[#605E5C] max-w-[220px] mx-auto">
              点击下方按钮，即可向当前 PPT 页面添加修改意见。
            </p>
            <button
              onClick={() => openAddModal(targetSlideId, selectedPageNumber)}
              className="mt-2 px-3 py-1.5 bg-[#D83B01] hover:bg-[#B7472A] text-white rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 shadow-xs transition-colors"
            >
              <Plus size={13} />
              <span>给第 {selectedPageNumber} 页添加意见</span>
            </button>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              showPageBadge={showAllGlobalComments}
            />
          ))
        )}
      </div>
    </div>
  );
};
