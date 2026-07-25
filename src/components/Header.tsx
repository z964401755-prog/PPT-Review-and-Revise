import React from 'react';
import { usePPTStore } from '../store/pptStore';
import {
  FileText,
  UserCheck,
  Palette,
  Maximize2,
  Minimize2,
  ChevronDown,
  Sun,
  Moon,
  Eye,
  EyeOff,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    ppts,
    currentPPTId,
    setCurrentPPTId,
    reviewData,
    taskPaneViewMode,
    setTaskPaneViewMode,
    isDarkMode,
    toggleDarkMode,
    showCanvasOverlays,
    toggleCanvasOverlays,
    isTaskPaneCollapsed,
    toggleTaskPaneCollapsed,
    isSharedSession,
  } = usePPTStore();

  const activePPT = ppts.find((p) => p.id === currentPPTId);

  return (
    <header className="bg-[#C43E1C] dark:bg-[#1E1E1E] text-white border-b border-[#A03A20] dark:border-[#2D2D2D] sticky top-0 z-20 shadow-xs font-sans overflow-hidden w-full">
      <div className="px-2 py-1 flex items-center justify-between gap-1 sm:gap-1.5 w-full overflow-hidden">
        {/* Left: Right Plugin Toggle + Theme Switcher + File Switcher */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 min-w-0">
          {/* Fold / Expand Task Pane Button */}
          <button
            type="button"
            onClick={toggleTaskPaneCollapsed}
            className="w-6 h-6 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center text-white shadow-xs border border-white/30 shrink-0 transition-colors cursor-pointer"
            title={isTaskPaneCollapsed ? '展开右侧批阅插件' : '收起右侧批阅插件'}
          >
            {isTaskPaneCollapsed ? <PanelRightOpen size={13} /> : <PanelRightClose size={13} />}
          </button>

          {/* Theme Mode Switcher placed directly after fold button */}
          <div className="flex items-center bg-black/30 p-0.5 rounded-md border border-white/25 shrink-0" title="切换浅色 / 暗色主题">
            <button
              type="button"
              onClick={() => isDarkMode && toggleDarkMode()}
              className={`p-1 rounded transition-all cursor-pointer ${
                !isDarkMode
                  ? 'bg-amber-300 text-slate-950 shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
              title="切换为浅色模式"
            >
              <Sun size={11} />
            </button>
            <button
              type="button"
              onClick={() => !isDarkMode && toggleDarkMode()}
              className={`p-1 rounded transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
              title="切换为暗色模式"
            >
              <Moon size={11} />
            </button>
          </div>

          {/* PPT Dropdown Selector */}
          <div className="relative shrink-0">
            <div className="flex items-center gap-1 bg-black/25 hover:bg-black/35 border border-white/25 rounded px-1.5 py-0.5 text-white cursor-pointer transition-colors max-w-[105px] sm:max-w-[140px]">
              <FileText size={11} className="text-amber-300 shrink-0" />
              <select
                value={currentPPTId}
                onChange={(e) => setCurrentPPTId(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-white focus:outline-none cursor-pointer w-full pr-3 appearance-none truncate"
              >
                {ppts.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white text-slate-900 dark:bg-[#2D2D2D] dark:text-white font-normal">
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={10} className="text-white/70 absolute right-1 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right: Role Switch & Compact Action Bar */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Role Toggle Pill */}
          <div className="flex items-center bg-black/30 p-0.5 rounded-md border border-white/25 shrink-0">
            <button
              type="button"
              onClick={() => setCurrentRole('reviewer')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                currentRole === 'reviewer'
                  ? 'bg-white text-[#C43E1C] shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title="审阅人模式：新建与管理修改批注"
            >
              <UserCheck size={11} />
              <span>审阅</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentRole('creator')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                currentRole === 'creator'
                  ? 'bg-amber-400 text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title="制作人/修改模式：查看意见并标记完成"
            >
              <Palette size={11} />
              <span>修改</span>
            </button>
          </div>

          {/* Canvas Pure View Toggle */}
          <button
            onClick={toggleCanvasOverlays}
            className={`p-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 shrink-0 ${
              !showCanvasOverlays
                ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
            title={showCanvasOverlays ? '开启纯净阅读模式 (隐藏画板图层)' : '显示批注图层'}
          >
            {!showCanvasOverlays ? <EyeOff size={13} className="text-emerald-300" /> : <Eye size={13} />}
          </button>
        </div>
      </div>

      {/* Shared Session Mini Ribbon if active */}
      {isSharedSession && (
        <div className="bg-amber-500 text-slate-900 px-3 py-1 text-[11px] font-bold flex items-center justify-between">
          <span>🔗 当前处于协同审阅模式（审阅数据随链接直接加载）</span>
          <span className="text-[10px] opacity-80">含 {reviewData?.comments.length || 0} 条意见</span>
        </div>
      )}
    </header>
  );
};

