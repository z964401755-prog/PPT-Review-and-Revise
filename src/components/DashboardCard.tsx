import React from 'react';
import { usePPTStore } from '../store/pptStore';
import {
  Layers,
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  UserCheck,
  Globe,
  Share2
} from 'lucide-react';

export const DashboardCard: React.FC = () => {
  const {
    slides,
    reviewData,
    setSelectedSlide,
    setActiveTab,
    getStatistics,
    currentRole,
    openAddModal,
    setShowUploadShareModal,
    copyShareableLink,
  } = usePPTStore();

  const stats = getStatistics();
  const comments = reviewData?.comments || [];

  // Get recent modified or pending slides
  const slidesNeedingReview = slides
    .filter((s) => (s.commentCount || 0) > 0)
    .slice(0, 5);

  return (
    <div className="space-y-4 p-4 bg-[#F3F2F1] dark:bg-[#181818] min-h-full font-sans transition-colors">
      {/* Web Direct Review & Sharing Action Card */}
      <div className="bg-gradient-to-r from-[#D83B01] to-[#B7472A] text-white rounded-xl p-3.5 shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-black">
              <Globe size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">网页端协同与一键分享</h4>
              <p className="text-[10px] text-white/80 font-medium">免安装 Office 插件 • 支持上传 PPT 并生成链接</p>
            </div>
          </div>
          <span className="text-[9px] bg-white/20 border border-white/30 px-1.5 py-0.5 rounded font-bold uppercase">
            网页极速版
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setShowUploadShareModal(true)}
            className="px-3 py-2 bg-white text-[#D83B01] hover:bg-white/90 rounded-lg text-xs font-bold uppercase tracking-wider shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Globe size={14} />
            <span>上传 PPT 文件</span>
          </button>
          <button
            onClick={() => copyShareableLink()}
            className="px-3 py-2 bg-black/30 hover:bg-black/40 text-white border border-white/30 rounded-lg text-xs font-bold uppercase tracking-wider shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Share2 size={14} />
            <span>复制审阅链接</span>
          </button>
        </div>
      </div>

      {/* 4 Block Stats Grid with Bold Typography */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Pending Comments */}
        <div
          onClick={() => setActiveTab('comments')}
          className="bg-[#FAF9F8] dark:bg-[#252526] p-4 rounded-xl border border-[#EDEBE9] dark:border-[#383838] shadow-xs hover:border-[#D83B01] cursor-pointer transition-all"
        >
          <p className="text-[10px] font-bold text-[#605E5C] dark:text-[#a0a0a0] uppercase tracking-wider mb-1 truncate">
            待修改批注
          </p>
          <p className="text-3xl sm:text-4xl font-black text-[#D83B01] leading-none">
            {stats.pendingComments}
          </p>
          <p className="text-[10px] text-[#A19F9D] dark:text-[#8a8886] mt-2 font-bold uppercase tracking-wider truncate">
            / 共 {stats.totalComments} 条批注
          </p>
        </div>

        {/* Completion Rate */}
        <div className="bg-[#FAF9F8] dark:bg-[#252526] p-4 rounded-xl border border-[#EDEBE9] dark:border-[#383838] shadow-xs">
          <p className="text-[10px] font-bold text-[#605E5C] dark:text-[#a0a0a0] uppercase tracking-wider mb-1 truncate">
            修改完成率
          </p>
          <p className="text-3xl sm:text-4xl font-black text-[#107C10] dark:text-[#38a138] leading-none">
            {stats.completionRate}%
          </p>
          {/* Progress Bar */}
          <div className="w-full bg-[#EDEBE9] dark:bg-[#383838] rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-[#107C10] dark:bg-[#38a138] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        {/* Slides Needing Review */}
        <div
          onClick={() => setActiveTab('slides')}
          className="bg-[#FAF9F8] dark:bg-[#252526] p-4 rounded-xl border border-[#EDEBE9] dark:border-[#383838] shadow-xs hover:border-[#D83B01] cursor-pointer transition-all"
        >
          <p className="text-[10px] font-bold text-[#605E5C] dark:text-[#a0a0a0] uppercase tracking-wider mb-1 truncate">
            待修改幻灯片
          </p>
          <p className="text-3xl sm:text-4xl font-black text-[#323130] dark:text-[#f3f2f1] leading-none">
            {stats.pagesNeedingReview}
          </p>
          <p className="text-[10px] text-[#D83B01] mt-2 font-bold uppercase tracking-wider flex items-center gap-0.5 truncate">
            <span>查看页面列表</span>
            <ArrowRight size={10} className="shrink-0" />
          </p>
        </div>

        {/* PPT Total Pages */}
        <div className="bg-[#FAF9F8] dark:bg-[#252526] p-4 rounded-xl border border-[#EDEBE9] dark:border-[#383838] shadow-xs">
          <p className="text-[10px] font-bold text-[#605E5C] dark:text-[#a0a0a0] uppercase tracking-wider mb-1 truncate">
            幻灯片总页数
          </p>
          <p className="text-3xl sm:text-4xl font-black text-[#323130] dark:text-[#f3f2f1] leading-none">
            {stats.totalPages}
          </p>
          <p className="text-[10px] text-[#A19F9D] dark:text-[#8a8886] mt-2 font-bold uppercase tracking-wider truncate">
            全部演示页面
          </p>
        </div>
      </div>

      {/* Recent Slide Review Modifications Section */}
      <div className="bg-white dark:bg-[#202020] rounded-xl border border-[#EDEBE9] dark:border-[#383838] p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={15} className="text-[#323130] dark:text-[#f3f2f1] shrink-0" />
            <h4 className="text-xs font-black text-[#323130] dark:text-[#f3f2f1] uppercase tracking-wider">
              重点待修改页面
            </h4>
          </div>
          <button
            onClick={() => setActiveTab('slides')}
            className="text-[10px] text-[#D83B01] hover:text-[#B7472A] font-bold uppercase tracking-wider flex items-center gap-0.5 shrink-0 cursor-pointer"
          >
            <span>全部 ({stats.pagesNeedingReview})</span>
            <ArrowRight size={11} />
          </button>
        </div>

        {slidesNeedingReview.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-[#D2D0CE] dark:border-[#484848] rounded text-[#A19F9D] dark:text-[#8a8886] text-xs font-bold uppercase tracking-wider">
            暂无需要修改的页面
          </div>
        ) : (
          <div className="space-y-2">
            {slidesNeedingReview.map((slide) => {
              const slideComments = comments.filter((c) => c.slideId === slide.id);
              const pendingCount = slideComments.filter((c) => c.status === 'pending').length;
              const firstComment = slideComments[0];

              return (
                <div
                  key={slide.id}
                  onClick={() => {
                    setSelectedSlide(slide.id, slide.pageNumber);
                    setActiveTab('detail');
                  }}
                  className="bg-[#FAF9F8] dark:bg-[#282828] border-l-4 border-[#D83B01] border-t border-r border-b border-[#EDEBE9] dark:border-[#383838] p-3 rounded-r-lg hover:bg-white dark:hover:bg-[#333] cursor-pointer transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="bg-white dark:bg-[#1a1a1a] px-2 py-1 rounded text-[10px] font-black shadow-xs border border-[#EDEBE9] dark:border-[#444] text-[#323130] dark:text-[#f3f2f1]">
                      P{slide.pageNumber < 10 ? `0${slide.pageNumber}` : slide.pageNumber}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#323130] dark:text-[#f3f2f1] truncate group-hover:text-[#D83B01]">
                        {slide.title}
                      </div>
                      <p className="text-[11px] text-[#605E5C] dark:text-[#a0a0a0] truncate max-w-[200px]">
                        {firstComment ? firstComment.content : '尚无具体意见内容'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {pendingCount > 0 ? (
                      <span className="text-[10px] font-bold text-[#D83B01] uppercase tracking-wider">
                        {pendingCount} 待改
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#107C10] dark:text-[#38a138] uppercase tracking-wider">
                        已完成
                      </span>
                    )}
                    <ArrowRight size={12} className="text-[#A19F9D] dark:text-[#8a8886] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Embedded XML File Transmission Concept Card */}
      <div className="bg-[#FAF9F8] dark:bg-[#252526] border border-[#EDEBE9] dark:border-[#383838] p-4 rounded-xl space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-[#323130] dark:text-[#f3f2f1] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#D83B01]" />
            <span>CustomXML 零服务端机制</span>
          </span>
          <span className="text-[9px] text-[#A19F9D] dark:text-[#8a8886] font-bold uppercase tracking-widest">内部存储</span>
        </div>
        <p className="text-[11px] text-[#605E5C] dark:text-[#a0a0a0] leading-relaxed">
          批注数据直接打包进 <code className="text-[#D83B01] bg-white dark:bg-[#1a1a1a] px-1 py-0.5 rounded border border-[#EDEBE9] dark:border-[#444] font-bold">reviewData.json</code> 并嵌入 .pptx 文件 CustomXML 中。随文档分发，无需额外后端！
        </p>
      </div>
    </div>
  );
};
