import React, { useState } from 'react';
import { usePPTStore } from '../store/pptStore';
import {
  Upload,
  FileText,
  Sparkles,
  Globe,
  Share2,
  CheckCircle2,
  ArrowRight,
  Sun,
  Moon,
  FolderOpen,
  ShieldCheck,
  Layers,
  MessageSquare,
  Play,
  Presentation
} from 'lucide-react';

export const UploadPortal: React.FC = () => {
  const {
    uploadPPTFile,
    openPPT,
    ppts,
    isDarkMode,
    toggleDarkMode,
    toastMessage,
  } = usePPTStore();

  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    await uploadPPTFile(file);
    setIsUploading(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.pptx') || file.name.endsWith('.ppt'))) {
      setIsUploading(true);
      await uploadPPTFile(file);
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="w-screen h-screen overflow-y-auto bg-[#FAF9F8] dark:bg-[#181818] text-[#323130] dark:text-[#f3f2f1] font-sans flex flex-col justify-between transition-colors">
      {/* Top Navigation */}
      <header className="px-6 py-4 border-b border-[#E1DFDD] dark:border-[#2D2D2D] bg-white/80 dark:bg-[#1E1E1E]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#D83B01] text-white flex items-center justify-center font-black text-lg shadow-sm">
            <Presentation size={20} />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight flex items-center gap-2">
              PPT 智能批阅与协同平台
              <span className="text-[10px] bg-[#D83B01]/10 text-[#D83B01] dark:bg-[#D83B01]/20 dark:text-[#FF8C66] px-2 py-0.5 rounded font-bold uppercase">
                网页极速版
              </span>
            </h1>
            <p className="text-xs text-[#605E5C] dark:text-[#a0a0a0]">免安装 Office 插件 • 网页端即传即审 • 一键生成协同链接</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-[#F3F2F1] dark:bg-[#252526] hover:bg-[#EDEBE9] dark:hover:bg-[#333] transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            title={isDarkMode ? '切换浅色' : '切换暗色'}
          >
            {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            <span className="hidden sm:inline">{isDarkMode ? '浅色模式' : '暗色模式'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center gap-8">
        {/* Banner Hero Statement */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D83B01]/10 text-[#D83B01] dark:bg-[#D83B01]/20 dark:text-[#FF8C66] text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>智能 PPT 审阅 & 意见协同流转</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#201F1E] dark:text-white tracking-tight">
            请上传您的 PPT 演示文稿开始批阅
          </h2>
          <p className="text-xs md:text-sm text-[#605E5C] dark:text-[#a0a0a0] max-w-xl mx-auto">
            支持标准 <span className="font-bold text-[#D83B01]">.pptx</span> 文件。上传后系统将自动提取幻灯片内容，您可以逐页标记修改意见、设置优先级并生成分享链接。
          </p>
        </div>

        {/* Upload Dropzone Container */}
        <div className="max-w-2xl w-full mx-auto">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative rounded-2xl border-2 border-dashed p-8 md:p-10 text-center transition-all cursor-pointer shadow-lg ${
              isDragOver
                ? 'border-[#D83B01] bg-[#D83B01]/10 scale-[1.01]'
                : 'border-[#C8C6C4] dark:border-[#404040] bg-white dark:bg-[#202020] hover:border-[#D83B01] hover:bg-[#FAF9F8] dark:hover:bg-[#252526]'
            }`}
          >
            <input
              type="file"
              accept=".pptx,.ppt"
              onChange={handleFileChange}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />

            {isUploading ? (
              <div className="space-y-4 py-4">
                <div className="w-12 h-12 border-4 border-[#D83B01] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-bold text-[#D83B01]">正在解析 PPT 结构与幻灯片元素...</p>
                <p className="text-xs text-[#605E5C] dark:text-[#a0a0a0]">请稍候，系统即刻呈现高保真批阅画布</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#D83B01]/10 dark:bg-[#D83B01]/20 text-[#D83B01] dark:text-[#FF8C66] flex items-center justify-center mx-auto shadow-inner">
                  <Upload size={32} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#201F1E] dark:text-white">
                    拖拽 PPT 文件至此处，或 <span className="text-[#D83B01] underline decoration-2 underline-offset-4">点击浏览选择</span>
                  </h3>
                  <p className="text-xs text-[#8A8886] dark:text-[#808080] mt-1">
                    支持 Microsoft PowerPoint (.pptx) 格式
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-[#605E5C] dark:text-[#a0a0a0] font-medium">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-500" /> 本地安全解析
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers size={14} className="text-[#D83B01]" /> 提取逐页幻灯片
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe size={14} className="text-blue-500" /> 免安装插件
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sample Demo PPT Selector */}
        <div className="max-w-2xl w-full mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#605E5C] dark:text-[#a0a0a0] flex items-center gap-1.5">
              <FolderOpen size={14} className="text-[#D83B01]" />
              暂无文件？或体验内置示例 PPT
            </h3>
            <span className="text-[10px] text-[#8A8886]">无需上传即可一键预览完整批阅功能</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ppts.map((ppt) => (
              <div
                key={ppt.id}
                onClick={() => openPPT(ppt.id)}
                className="group p-3.5 bg-white dark:bg-[#202020] border border-[#E1DFDD] dark:border-[#333] hover:border-[#D83B01] dark:hover:border-[#D83B01] rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#D83B01]/10 text-[#D83B01] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform font-bold">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#201F1E] dark:text-white truncate group-hover:text-[#D83B01] transition-colors">
                      {ppt.name}
                    </h4>
                    <p className="text-[10px] text-[#8A8886] dark:text-[#909090] mt-0.5">
                      {ppt.totalPages} 页幻灯片 • {ppt.reviewerName}
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#FAF9F8] dark:bg-[#2A2A2A] group-hover:bg-[#D83B01] group-hover:text-white text-[#605E5C] flex items-center justify-center shrink-0 transition-colors">
                  <Play size={12} className="ml-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Grid Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#E1DFDD] dark:border-[#2D2D2D] pt-8">
          <div className="p-4 bg-white/60 dark:bg-[#202020]/60 rounded-xl border border-[#EDEBE9] dark:border-[#333] space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-[#D83B01] flex items-center justify-center font-bold">
              <MessageSquare size={16} />
            </div>
            <h4 className="text-xs font-bold">逐页精确批阅标注</h4>
            <p className="text-[11px] text-[#605E5C] dark:text-[#a0a0a0]">
              可在任意幻灯片上标记修改意见，设定字体、排版、数据或错别字分类与处理状态。
            </p>
          </div>

          <div className="p-4 bg-white/60 dark:bg-[#202020]/60 rounded-xl border border-[#EDEBE9] dark:border-[#333] space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Globe size={16} />
            </div>
            <h4 className="text-xs font-bold">一键分发协同链接</h4>
            <p className="text-[11px] text-[#605E5C] dark:text-[#a0a0a0]">
              上传批阅后可直接生成独占协同网址，领导/同事点击链接即可打开完全一致的审阅场景。
            </p>
          </div>

          <div className="p-4 bg-white/60 dark:bg-[#202020]/60 rounded-xl border border-[#EDEBE9] dark:border-[#333] space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck size={16} />
            </div>
            <h4 className="text-xs font-bold">内嵌流转 & 批阅导出</h4>
            <p className="text-[11px] text-[#605E5C] dark:text-[#a0a0a0]">
              审阅记录嵌入在数据底层，同时支持一键导出 reviewData.json 或导入外部批阅意见。
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-[#E1DFDD] dark:border-[#2D2D2D] text-center text-[11px] text-[#8A8886]">
        PPT 智能批阅与修改助手 • Office TaskPane Add-in Web Suite
      </footer>

      {/* Toast Notification Floating Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#323130] text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <Sparkles size={14} className="text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
