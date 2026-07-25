import React from 'react';
import { usePPTStore } from '../store/pptStore';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Grid,
  Maximize,
  Sparkles,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Plus,
  Eye,
  EyeOff,
  PanelRightOpen
} from 'lucide-react';

export const PPTStageViewer: React.FC = () => {
  const {
    slides,
    selectedSlideId,
    selectedPageNumber,
    setSelectedSlide,
    reviewData,
    currentRole,
    openAddModal,
    showCanvasOverlays,
    toggleCanvasOverlays,
    isTaskPaneCollapsed,
    toggleTaskPaneCollapsed,
    getStatistics,
  } = usePPTStore();

  const currentSlide = slides.find((s) => s.id === selectedSlideId) || slides[0];
  const comments = (reviewData?.comments || []).filter((c) => c.slideId === currentSlide.id);
  const pendingComments = comments.filter((c) => c.status === 'pending');

  const handlePrevPage = () => {
    const currentIndex = slides.findIndex((s) => s.id === selectedSlideId);
    if (currentIndex > 0) {
      const prev = slides[currentIndex - 1];
      setSelectedSlide(prev.id, prev.pageNumber);
    }
  };

  const handleNextPage = () => {
    const currentIndex = slides.findIndex((s) => s.id === selectedSlideId);
    if (currentIndex < slides.length - 1) {
      const next = slides[currentIndex + 1];
      setSelectedSlide(next.id, next.pageNumber);
    }
  };

  return (
    <div className="flex-1 bg-slate-100 dark:bg-[#1F1E1D] text-slate-900 dark:text-white flex flex-col h-full border-r border-slate-300 dark:border-[#EDEBE9]/20 overflow-hidden select-none font-sans">
      {/* PPT Window Top Bar */}
      <div className="bg-slate-200 dark:bg-[#121212] px-3 py-2 border-b border-slate-300 dark:border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#D83B01] text-white font-black text-[10px] flex items-center justify-center">
            P
          </div>
          <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px] truncate max-w-[260px]">
            {reviewData?.pptName || '汇报材料.pptx'} - POWERPOINT [模拟编辑视图]
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-[#A19F9D]">
          <button className="hover:bg-slate-300 dark:hover:bg-white/20 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded bg-slate-300/60 dark:bg-white/10 text-slate-800 dark:text-white flex items-center gap-1 uppercase tracking-wider">
            <Play size={11} className="text-[#D83B01]" />
            <span className="hidden sm:inline">幻灯片放映</span>
          </button>

          <button
            onClick={toggleCanvasOverlays}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 uppercase tracking-wider transition-all cursor-pointer border ${
              showCanvasOverlays
                ? 'bg-[#D83B01] border-[#D83B01] text-white font-bold'
                : 'bg-slate-300/60 dark:bg-white/10 border-slate-300 dark:border-white/20 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white'
            }`}
            title={showCanvasOverlays ? '点击进入纯净PPT观感模式 (隐藏页面上的标注浮层)' : '点击在页面上显示标注贴纸'}
          >
            {showCanvasOverlays ? <Eye size={12} /> : <EyeOff size={12} className="text-emerald-500 dark:text-emerald-400" />}
            <span>{showCanvasOverlays ? '标注图层: 已开启' : '纯净模式 (无遮挡)'}</span>
          </button>

          {isTaskPaneCollapsed && (
            <button
              onClick={toggleTaskPaneCollapsed}
              className="px-2.5 py-1 rounded bg-[#C43E1C] hover:bg-[#a03115] text-white font-bold flex items-center gap-1.5 uppercase tracking-wider transition-all cursor-pointer shadow-md animate-bounce border border-white/30 shrink-0"
              title="点击展开右侧批阅插件面板"
            >
              <PanelRightOpen size={12} />
              <span>展开批阅插件 {getStatistics().pendingComments > 0 && `(${getStatistics().pendingComments})`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Simulated PowerPoint Ribbon Bar */}
      <div className="bg-slate-100 dark:bg-[#1F1E1D] px-3 py-1.5 border-b border-slate-300 dark:border-white/10 text-[10px] font-bold uppercase tracking-wider flex items-center gap-4 text-slate-600 dark:text-[#A19F9D] overflow-x-auto no-scrollbar">
        <span className="text-[#D83B01] font-black border-b-2 border-[#D83B01] pb-0.5">文件</span>
        <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">开始</span>
        <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">插入</span>
        <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">设计</span>
        <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">动画</span>
        <span className="text-slate-900 dark:text-white font-black flex items-center gap-1 bg-[#D83B01]/10 dark:bg-[#D83B01]/20 px-1.5 py-0.5 rounded border border-[#D83B01]/30 dark:border-[#D83B01]/40">
          <Sparkles size={11} className="text-[#D83B01]" />
          审阅 (已挂载助手)
        </span>
        <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">视图</span>
      </div>

      {/* Stage Body (Left Slide Thumbs + Main 16:9 Canvas) */}
      <div className="flex-1 flex overflow-hidden relative bg-slate-300 dark:bg-[#121212]">
        {/* Left Slide Thumbnails Vertical Strip */}
        <div className="w-28 bg-slate-100 dark:bg-[#1F1E1D] border-r border-slate-300 dark:border-white/10 p-2 overflow-y-auto space-y-2 hidden sm:block shrink-0">
          {slides.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedSlide(s.id, s.pageNumber)}
              className={`p-1 rounded border cursor-pointer transition-all ${
                s.id === selectedSlideId
                  ? 'border-[#D83B01] bg-[#D83B01]/15 dark:bg-[#D83B01]/20 ring-1 ring-[#D83B01]'
                  : 'border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 bg-white dark:bg-black/40'
              }`}
            >
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 dark:text-[#A19F9D] mb-0.5 px-0.5">
                <span>P{s.pageNumber < 10 ? `0${s.pageNumber}` : s.pageNumber}</span>
                {s.status === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-[#D83B01]" />}
              </div>
              <div
                className="w-full h-12 rounded border border-slate-200 dark:border-white/10 p-1 flex flex-col justify-end text-[8px] text-white font-bold uppercase overflow-hidden"
                style={{ background: s.thumbnail }}
              >
                <div className="bg-black/70 p-0.5 rounded truncate">{s.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Presentation Stage Preview */}
        <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden bg-slate-300 dark:bg-[#121212]">
          {/* 16:9 Slide Canvas Frame */}
          <div className="w-full max-w-2xl aspect-video rounded-xl shadow-2xl border-2 border-slate-400 dark:border-[#323130] p-6 flex flex-col justify-between relative overflow-hidden text-white transition-all duration-300"
            style={{ background: currentSlide.thumbnail }}
          >
            {/* Slide Header */}
            <div className="space-y-1 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black tracking-widest text-[#FFB900] uppercase bg-black/60 px-2 py-0.5 rounded backdrop-blur-md">
                  第 {currentSlide.pageNumber < 10 ? `0${currentSlide.pageNumber}` : currentSlide.pageNumber} / {slides.length < 10 ? `0${slides.length}` : slides.length} 页
                </span>

                {/* Status Overlay Badge (Only rendered when showCanvasOverlays is true) */}
                {showCanvasOverlays && (
                  currentSlide.status === 'pending' ? (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#D83B01] text-white flex items-center gap-1 shadow-md">
                      <AlertCircle size={11} />
                      <span>{pendingComments.length} 条等待修改</span>
                    </span>
                  ) : currentSlide.status === 'completed' ? (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#107C10] text-white flex items-center gap-1 shadow-md">
                      <CheckCircle2 size={11} />
                      <span>已全部确认</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold text-white bg-black/60 backdrop-blur-md uppercase tracking-wider">
                      常规页面
                    </span>
                  )
                )}
              </div>

              <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-white drop-shadow-md">
                {currentSlide.title}
              </h2>
            </div>

            {/* Slide Body Visual Simulation */}
            <div className="my-auto grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-black/40 backdrop-blur-md p-3 rounded border border-white/10 space-y-1.5">
                <div className="text-[11px] font-bold text-[#FFB900] uppercase tracking-wider">核心指标拆解</div>
                <div className="h-2 bg-white/30 rounded w-full" />
                <div className="h-2 bg-white/30 rounded w-3/4" />
                <div className="h-2 bg-[#D83B01] rounded w-1/2" />
              </div>

              <div className="bg-black/40 backdrop-blur-md p-3 rounded border border-white/10 flex flex-col justify-between">
                <div className="text-[11px] font-bold text-[#107C10] uppercase tracking-wider">趋势分析对比图</div>
                <div className="flex items-end gap-1 h-12 pt-2">
                  <div className="w-1/4 bg-white/40 h-[40%] rounded-t" />
                  <div className="w-1/4 bg-white/60 h-[60%] rounded-t" />
                  <div className="w-1/4 bg-[#FFB900] h-[85%] rounded-t" />
                  <div className="w-1/4 bg-[#D83B01] h-[100%] rounded-t" />
                </div>
              </div>
            </div>

            {/* Interactive Comment Pinned Pins on Slide (Only shown when showCanvasOverlays is true) */}
            {showCanvasOverlays && comments.map((comment, index) => (
              <div
                key={comment.id}
                style={{
                  top: `${20 + (index * 22) % 60}%`,
                  right: `${10 + (index * 15) % 40}%`,
                }}
                className={`absolute z-20 cursor-pointer group flex items-center gap-1.5 p-1.5 rounded border shadow-2xl backdrop-blur-md transition-all hover:scale-105 ${
                  comment.status === 'completed'
                    ? 'bg-[#107C10] border-white text-white'
                    : comment.priority === 'high'
                    ? 'bg-[#D83B01] border-white text-white font-bold'
                    : 'bg-[#FFB900] border-[#323130] text-[#323130] font-bold'
                }`}
              >
                <div className="w-5 h-5 rounded bg-[#323130] text-white font-black text-[10px] flex items-center justify-center shrink-0">
                  #{index + 1}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider max-w-[150px] truncate hidden md:block">
                  {comment.content}
                </div>
              </div>
            ))}

            {/* Slide Footer */}
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-white/70 border-t border-white/10 pt-2 relative z-10">
              <span>Microsoft PowerPoint 模拟原型</span>
              <span>机密文件 • 内部审阅</span>
            </div>
          </div>

          {/* Quick Add Comment Overlay Button for Reviewer */}
          {currentRole === 'reviewer' && (
            <button
              onClick={() => openAddModal(currentSlide.id, currentSlide.pageNumber)}
              className="mt-4 px-3.5 py-2 bg-[#D83B01] hover:bg-[#B7472A] text-white rounded text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
            >
              <Plus size={14} />
              <span>给当前第 {currentSlide.pageNumber} 页加批注</span>
            </button>
          )}
        </div>
      </div>

      {/* Stage Bottom Pagination Controls */}
      <div className="bg-slate-200 dark:bg-[#121212] px-3 py-2 border-t border-slate-300 dark:border-white/10 flex items-center justify-between text-xs text-slate-600 dark:text-[#A19F9D]">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={selectedPageNumber === 1}
            className="p-1 hover:bg-slate-300 dark:hover:bg-white/10 rounded text-slate-800 dark:text-white disabled:opacity-30 disabled:hover:bg-transparent"
            title="上一页"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider">
            第 {selectedPageNumber < 10 ? `0${selectedPageNumber}` : selectedPageNumber} / {slides.length < 10 ? `0${slides.length}` : slides.length} 页
          </span>
          <button
            onClick={handleNextPage}
            disabled={selectedPageNumber === slides.length}
            className="p-1 hover:bg-slate-300 dark:hover:bg-white/10 rounded text-slate-800 dark:text-white disabled:opacity-30 disabled:hover:bg-transparent"
            title="下一页"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="text-[10px] font-bold text-slate-500 dark:text-[#A19F9D] uppercase tracking-wider hidden sm:block">
          可在右侧任务窗格中管理批注与完成状态
        </div>
      </div>
    </div>
  );
};
