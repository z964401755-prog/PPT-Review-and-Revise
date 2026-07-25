import React, { useState } from 'react';
import { usePPTStore } from '../store/pptStore';
import { SlideItem } from './SlideItem';
import { Search, Filter, Plus, Layers, Sparkles } from 'lucide-react';

export const SlideList: React.FC = () => {
  const {
    slides,
    selectedSlideId,
    setSelectedSlide,
    setActiveTab,
    openAddModal,
    currentRole
  } = usePPTStore();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'normal'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSlides = slides.filter((slide) => {
    if (statusFilter !== 'all' && slide.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        slide.title.toLowerCase().includes(q) ||
        slide.pageNumber.toString().includes(q)
      );
    }
    return true;
  });

  const pendingCount = slides.filter((s) => s.status === 'pending').length;
  const completedCount = slides.filter((s) => s.status === 'completed').length;
  const normalCount = slides.filter((s) => s.status === 'normal').length;

  return (
    <div className="flex flex-col h-full bg-[#F3F2F1] dark:bg-[#181818] p-3 space-y-3 font-sans transition-colors">
      {/* Top Header & Search Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers size={16} className="text-[#D83B01] shrink-0" />
            <h3 className="text-xs font-bold text-[#323130] dark:text-[#f3f2f1] uppercase tracking-wider truncate">
              幻灯片列表 ({slides.length})
            </h3>
          </div>

          {currentRole === 'reviewer' && (
            <button
              onClick={() => openAddModal()}
              className="px-2.5 py-1.5 bg-[#D83B01] hover:bg-[#B7472A] text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={12} />
              <span>加批注</span>
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-[#A19F9D] dark:text-[#8a8886]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索页码或标题..."
            className="w-full bg-white dark:bg-[#252526] border border-[#D2D0CE] dark:border-[#383838] rounded pl-8 pr-3 py-1.5 text-xs text-[#323130] dark:text-[#f3f2f1] font-medium placeholder-[#A19F9D] dark:placeholder-[#777] focus:outline-none focus:border-[#D83B01] transition-colors shadow-2xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-bold uppercase tracking-wider no-scrollbar">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#323130] dark:bg-[#3c3c3c] text-white shadow-2xs'
                : 'bg-white dark:bg-[#252526] text-[#605E5C] dark:text-[#a0a0a0] border border-[#EDEBE9] dark:border-[#383838] hover:bg-[#FAF9F8] dark:hover:bg-[#333]'
            }`}
          >
            全部 ({slides.length})
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-2.5 py-1 rounded whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-[#D83B01] text-white shadow-2xs'
                : 'bg-white dark:bg-[#252526] text-[#D83B01] border border-[#EDEBE9] dark:border-[#383838] hover:bg-[#FAF9F8] dark:hover:bg-[#333]'
            }`}
          >
            待修改 ({pendingCount})
          </button>

          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-2.5 py-1 rounded whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-[#107C10] dark:bg-[#38a138] text-white shadow-2xs'
                : 'bg-white dark:bg-[#252526] text-[#107C10] dark:text-[#38a138] border border-[#EDEBE9] dark:border-[#383838] hover:bg-[#FAF9F8] dark:hover:bg-[#333]'
            }`}
          >
            已完成 ({completedCount})
          </button>

          <button
            onClick={() => setStatusFilter('normal')}
            className={`px-2.5 py-1 rounded whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'normal'
                ? 'bg-[#605E5C] text-white shadow-2xs'
                : 'bg-white dark:bg-[#252526] text-[#605E5C] dark:text-[#a0a0a0] border border-[#EDEBE9] dark:border-[#383838] hover:bg-[#FAF9F8] dark:hover:bg-[#333]'
            }`}
          >
            无需修改 ({normalCount})
          </button>
        </div>
      </div>

      {/* Slide List Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
        {filteredSlides.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-[#D2D0CE] dark:border-[#484848] rounded bg-[#FAF9F8] dark:bg-[#252526] text-[#A19F9D] dark:text-[#8a8886] text-xs font-bold uppercase tracking-wider">
            未筛选到符合条件的幻灯片页面
          </div>
        ) : (
          filteredSlides.map((slide) => (
            <SlideItem
              key={slide.id}
              slide={slide}
              isSelected={slide.id === selectedSlideId}
              onSelect={() => {
                setSelectedSlide(slide.id, slide.pageNumber);
                setActiveTab('detail');
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};
