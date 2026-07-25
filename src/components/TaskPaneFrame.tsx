import React from 'react';
import { usePPTStore, MainTab } from '../store/pptStore';
import { Header } from './Header';
import { ReviewDashboard } from '../pages/ReviewDashboard';
import { SlideList } from './SlideList';
import { ReviewDetail } from '../pages/ReviewDetail';
import { CommentManagementView } from '../pages/CommentManagementView';
import { AddCommentModal } from './AddCommentModal';
import { EditCommentModal } from './EditCommentModal';
import { ImportExportModal } from './ImportExportModal';
import { OfficeJsDocModal } from './OfficeJsDocModal';
import {
  LayoutDashboard,
  Layers,
  FileText,
  MessageSquare,
  CheckCircle2,
  PanelRightOpen,
  UserCheck,
  Palette
} from 'lucide-react';

export const TaskPaneFrame: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    toastMessage,
    getStatistics,
    isTaskPaneCollapsed,
    toggleTaskPaneCollapsed,
    currentRole
  } = usePPTStore();
  const stats = getStatistics();

  const tabs: { id: MainTab; label: string; icon: React.FC<{ size: number; className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: '首页', icon: LayoutDashboard },
    { id: 'slides', label: '页面', icon: Layers, badge: stats.pagesNeedingReview },
    { id: 'detail', label: '详情', icon: FileText },
    { id: 'comments', label: '意见', icon: MessageSquare, badge: stats.pendingComments },
  ];

  if (isTaskPaneCollapsed) {
    return (
      <div className="w-12 md:w-[52px] h-full bg-[#1E1E1E] border-l border-[#383838] flex flex-col items-center py-2 gap-3 shrink-0 shadow-lg font-sans select-none z-10 transition-all duration-300">
        {/* Top Expand Toggle Button */}
        <button
          onClick={toggleTaskPaneCollapsed}
          className="w-8 h-8 rounded-lg bg-[#C43E1C] hover:bg-[#a03115] text-white flex items-center justify-center transition-all cursor-pointer shadow-md group relative"
          title="展开批阅插件侧边栏"
        >
          <PanelRightOpen size={16} />
          <span className="absolute right-full mr-2 px-2 py-1 bg-black text-white text-[10px] rounded font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
            展开批阅插件
          </span>
        </button>

        <div className="w-6 h-[1px] bg-white/15 my-1" />

        {/* Vertical Tab Navigation Icons */}
        <div className="flex flex-col gap-2.5 w-full items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  toggleTaskPaneCollapsed();
                }}
                className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer relative group ${
                  isActive
                    ? 'bg-[#C43E1C] text-white shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title={`切换至【${tab.label}】并展开`}
              >
                <Icon size={16} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 px-1 min-w-[15px] text-center rounded-full text-[9px] font-black bg-amber-400 text-slate-950 shadow-xs border border-slate-900">
                    {tab.badge}
                  </span>
                )}
                <span className="absolute right-full mr-2 px-2 py-1 bg-black text-white text-[10px] rounded font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
                  {tab.label} {tab.badge ? `(${tab.badge})` : ''}
                </span>
              </button>
            );
          })}
        </div>

        {/* Role Badge Indicator */}
        <div className="mt-auto flex flex-col items-center gap-1">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border shadow-xs ${
              currentRole === 'reviewer'
                ? 'bg-[#D83B01]/20 text-[#D83B01] border-[#D83B01]/50'
                : 'bg-amber-400/20 text-amber-300 border-amber-400/50'
            }`}
            title={`当前视角：${currentRole === 'reviewer' ? '审阅人' : '制作人/修改'}`}
          >
            {currentRole === 'reviewer' ? <UserCheck size={14} /> : <Palette size={14} />}
          </div>
        </div>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ReviewDashboard />;
      case 'slides':
        return <SlideList />;
      case 'detail':
        return <ReviewDetail />;
      case 'comments':
        return <CommentManagementView />;
      default:
        return <ReviewDashboard />;
    }
  };

  return (
    <div className="w-full md:w-[400px] h-full bg-[#F3F2F1] dark:bg-[#181818] flex flex-col border-l border-[#D2D0CE] dark:border-[#383838] shadow-[-10px_0_30px_rgba(0,0,0,0.05)] overflow-hidden relative font-sans shrink-0">
      {/* Toast Notification Floating Banner */}
      {toastMessage && (
        <div className="absolute top-12 left-3 right-3 z-50 bg-[#323130] text-white px-3.5 py-2 rounded-lg border border-[#D83B01] shadow-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-[#107C10] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Task Pane Header */}
      <Header />

      {/* Task Pane Tab Navigation Bar */}
      <div className="bg-white dark:bg-[#252526] border-b border-[#EDEBE9] dark:border-[#383838] px-2 py-1 flex items-center justify-around text-xs shrink-0 shadow-2xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 px-2 rounded font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all relative ${
                isActive
                  ? 'bg-[#323130] dark:bg-[#3c3c3c] text-white shadow-2xs'
                  : 'text-[#605E5C] dark:text-[#a0a0a0] hover:text-[#323130] dark:hover:text-white hover:bg-[#FAF9F8] dark:hover:bg-[#333]'
              }`}
            >
              <Icon size={13} className={isActive ? 'text-[#D83B01]' : 'text-[#605E5C] dark:text-[#a0a0a0]'} />
              <span>{tab.label}</span>

              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                    isActive
                      ? 'bg-[#D83B01] text-white'
                      : 'bg-[#D83B01]/10 text-[#D83B01] border border-[#D83B01]/30'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content View Container */}
      <div className="flex-1 overflow-hidden relative">{renderActiveTab()}</div>

      {/* Task Pane Footer status info */}
      <div className="bg-[#FAF9F8] dark:bg-[#252526] px-3 py-1.5 border-t border-[#EDEBE9] dark:border-[#383838] flex items-center justify-between text-[9px] text-[#A19F9D] dark:text-[#8a8886] shrink-0 font-bold uppercase tracking-widest italic">
        <span>PPT 任务窗格 (400px)</span>
        <span>CustomXML 内部存储</span>
      </div>

      {/* Modals */}
      <AddCommentModal />
      <EditCommentModal />
      <ImportExportModal />
      <OfficeJsDocModal />
    </div>
  );
};
