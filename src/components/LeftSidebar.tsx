import React, { useState, useRef } from 'react';
import { usePPTStore } from '../store/pptStore';
import {
  Plus,
  Search,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
  Edit2,
  Check,
  X,
  Upload,
  UserCheck,
  Palette,
  Clock,
  Sparkles,
  FolderKanban,
  Share2,
  SlidersHorizontal,
  Globe,
  Link2,
} from 'lucide-react';

export const LeftSidebar: React.FC = () => {
  const {
    ppts,
    currentPPTId,
    setCurrentPPTId,
    deletePPTTask,
    renamePPTTask,
    isLeftSidebarCollapsed,
    toggleLeftSidebarCollapsed,
    setShowUploadShareModal,
    uploadPPTFile,
    copyShareableLink,
    currentRole,
    setCurrentRole,
    setShowImportExportModal,
  } = usePPTStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter PPT tasks
  const filteredPPTs = ppts.filter((ppt) =>
    ppt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartRename = (pptId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(pptId);
    setEditName(currentName);
  };

  const handleSaveRename = (pptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editName.trim()) {
      renamePPTTask(pptId, editName.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (pptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个 PPT 批阅任务吗？')) {
      deletePPTTask(pptId);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadPPTFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCopyShareLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyShareableLink();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Hidden native file input for quick task creation
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Collapsed Sidebar View (Narrow 52px Strip)
  if (isLeftSidebarCollapsed) {
    return (
      <aside className="w-12 md:w-[52px] h-full bg-white dark:bg-[#202123] text-slate-800 dark:text-[#ECECF1] border-r border-slate-200 dark:border-[#343541] flex flex-col items-center py-2.5 gap-3 shrink-0 select-none z-20 font-sans transition-all duration-300">
        {/* Expand Button */}
        <button
          onClick={toggleLeftSidebarCollapsed}
          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white flex items-center justify-center transition-colors cursor-pointer group relative"
          title="展开任务侧边栏"
        >
          <PanelLeftOpen size={16} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-[10px] rounded font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
            展开任务栏
          </span>
        </button>

        <div className="w-6 h-[1px] bg-slate-200 dark:bg-white/15 my-0.5" />

        {/* Quick New Task Button */}
        <button
          onClick={triggerFileInput}
          className="w-8 h-8 rounded-lg bg-[#C43E1C] hover:bg-[#a03115] text-white flex items-center justify-center transition-colors cursor-pointer group relative shadow-md"
          title="网页端协同 • 上传 PPT"
        >
          <Plus size={18} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-[10px] rounded font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
            上传 PPT 文件
          </span>
        </button>

        {/* Quick Share Link Button */}
        <button
          onClick={handleCopyShareLink}
          className="w-8 h-8 rounded-lg bg-[#C43E1C]/20 hover:bg-[#C43E1C]/30 text-[#C43E1C] dark:text-amber-300 flex items-center justify-center transition-colors cursor-pointer group relative shadow-xs border border-[#C43E1C]/40"
          title="网页端协同与一键分享"
        >
          <Globe size={16} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-[10px] rounded font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
            复制协同审阅链接
          </span>
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pptx,.ppt"
          className="hidden"
        />

        <div className="w-6 h-[1px] bg-slate-200 dark:bg-white/15 my-0.5" />

        {/* Task Icon List */}
        <div className="flex flex-col gap-2 w-full items-center overflow-y-auto no-scrollbar flex-1">
          {ppts.map((ppt) => {
            const isActive = ppt.id === currentPPTId;
            return (
              <button
                key={ppt.id}
                onClick={() => setCurrentPPTId(ppt.id)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer relative group ${
                  isActive
                    ? 'bg-amber-100 dark:bg-white/20 text-amber-800 dark:text-amber-300 border border-amber-400/50 shadow-xs'
                    : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
                title={ppt.name}
              >
                <FileText size={15} />
                <span className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-[10px] rounded font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50 max-w-[180px] truncate">
                  {ppt.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Role Avatar Indicator */}
        <div className="mt-auto flex flex-col items-center">
          <button
            onClick={() => setCurrentRole(currentRole === 'reviewer' ? 'creator' : 'reviewer')}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border ${
              currentRole === 'reviewer'
                ? 'bg-[#C43E1C]/20 text-[#C43E1C] dark:text-amber-300 border-[#C43E1C]/40 dark:border-amber-400/50'
                : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/50'
            }`}
            title={`当前视角：${currentRole === 'reviewer' ? '审阅人' : '制作人'}（点击切换）`}
          >
            {currentRole === 'reviewer' ? <UserCheck size={14} /> : <Palette size={14} />}
          </button>
        </div>
      </aside>
    );
  }

  // Expanded Sidebar View (Full 260px ChatGPT Layout)
  return (
    <aside className="w-[260px] md:w-[275px] h-full bg-white dark:bg-[#202123] text-slate-800 dark:text-[#ECECF1] border-r border-slate-200 dark:border-[#343541] flex flex-col shrink-0 font-sans select-none z-20 shadow-xl transition-all duration-300">
      {/* Sidebar Header & New Task Button */}
      <div className="p-3 border-b border-slate-200 dark:border-[#343541] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm tracking-wide">
            <FolderKanban size={18} className="text-[#C43E1C]" />
            <span>PPT 任务中心</span>
            <span className="text-[10px] bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/70 px-1.5 py-0.5 rounded-full font-mono">
              {ppts.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowSearchInput(!showSearchInput)}
              className={`p-1.5 rounded-md transition-colors ${
                showSearchInput
                  ? 'bg-slate-200 dark:bg-white/20 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
              title="搜索任务"
            >
              <Search size={15} />
            </button>
            <button
              type="button"
              onClick={toggleLeftSidebarCollapsed}
              className="p-1.5 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-md transition-colors"
              title="折叠任务栏"
            >
              <PanelLeftClose size={15} />
            </button>
          </div>
        </div>

        {/* 网页端协同与一键分享 特色功能卡片 (完全契合用户需求与图片设计) */}
        <div className="bg-[#C43E1C] text-white p-3 rounded-2xl shadow-md border border-[#A03115] flex flex-col gap-2.5 relative overflow-hidden transition-all mt-1">
          {/* Card Header Top Row */}
          <div className="flex items-start justify-between gap-1">
            <div className="flex items-start gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                <Globe size={14} className="text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-xs text-white leading-tight truncate">
                  网页端协同与一键分享
                </span>
                <span className="text-[10px] text-white/85 leading-snug mt-0.5 truncate">
                  免安装 Office 插件 • 支持上传 PPT 并生成链接
                </span>
              </div>
            </div>
            <span className="text-[9px] font-bold text-white border border-white/40 bg-white/10 px-1.5 py-0.5 rounded shrink-0">
              网页极速版
            </span>
          </div>

          {/* Action Buttons Pair */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={triggerFileInput}
              className="bg-white hover:bg-slate-100 text-[#C43E1C] font-black text-xs py-2 px-1.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer truncate"
              title="上传本地 PPT 文件"
            >
              <Globe size={13} className="shrink-0" />
              <span className="truncate">上传 PPT 文件</span>
            </button>

            <button
              type="button"
              onClick={handleCopyShareLink}
              className="bg-[#8C2A10] hover:bg-[#72200B] border border-white/25 text-white font-black text-xs py-2 px-1.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer truncate"
              title="复制在线协同与审阅链接"
            >
              {copiedLink ? <Check size={13} className="text-emerald-300 shrink-0" /> : <Share2 size={13} className="shrink-0" />}
              <span className="truncate">{copiedLink ? '已复制！' : '复制审阅链接'}</span>
            </button>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pptx,.ppt"
          className="hidden"
        />

        {/* Search Input Box */}
        {showSearchInput && (
          <div className="relative mt-1">
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400 dark:text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索任务/PPT文件名..."
              className="w-full bg-slate-100 dark:bg-[#171717] border border-slate-300 dark:border-white/15 rounded-md pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:border-amber-500"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 dark:text-white/40 hover:text-slate-800 dark:hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Nav Shortcuts */}
      <div className="px-3 py-2 border-b border-slate-200 dark:border-[#343541] flex items-center justify-between text-[11px] text-slate-600 dark:text-white/60">
        <button
          onClick={() => setShowUploadShareModal(true)}
          className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <Share2 size={12} className="text-amber-600 dark:text-amber-400" />
          <span>生成协同链接</span>
        </button>
        <button
          onClick={() => setShowImportExportModal(true)}
          className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <SlidersHorizontal size={12} className="text-emerald-600 dark:text-emerald-400" />
          <span>导入/导出数据</span>
        </button>
      </div>

      {/* "最近" Recent PPT Tasks List Section */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 font-sans text-xs no-scrollbar">
        <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-white/40 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            最近处理任务
          </span>
          <span>{filteredPPTs.length} 项</span>
        </div>

        {filteredPPTs.length === 0 ? (
          <div className="p-4 text-center text-slate-400 dark:text-white/40 text-xs flex flex-col items-center gap-2">
            <FileText size={24} className="opacity-30" />
            <span>未找到相关任务</span>
          </div>
        ) : (
          filteredPPTs.map((ppt) => {
            const isActive = ppt.id === currentPPTId;
            const isEditing = editingId === ppt.id;

            return (
              <div
                key={ppt.id}
                onClick={() => !isEditing && setCurrentPPTId(ppt.id)}
                className={`group relative flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-slate-100 dark:bg-[#343541] text-slate-900 dark:text-white border-slate-300 dark:border-white/20 font-medium shadow-xs'
                    : 'text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <FileText
                    size={15}
                    className={`shrink-0 ${isActive ? 'text-amber-600 dark:text-amber-300' : 'text-slate-400 dark:text-white/50 group-hover:text-slate-600 dark:group-hover:text-white/80'}`}
                  />

                  {isEditing ? (
                    <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-white dark:bg-[#1e1f29] border border-amber-500 rounded px-1.5 py-0.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(ppt.id, e as any);
                          if (e.key === 'Escape') handleCancelRename(e as any);
                        }}
                      />
                      <button
                        onClick={(e) => handleSaveRename(ppt.id, e)}
                        className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-slate-200 dark:hover:bg-white/10 rounded"
                        title="保存"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="p-1 text-rose-600 dark:text-rose-400 hover:bg-slate-200 dark:hover:bg-white/10 rounded"
                        title="取消"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-xs tracking-tight">{ppt.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-white/40 flex items-center gap-1 mt-0.5">
                        <span>{ppt.slides.length} 页幻灯片</span>
                        <span>•</span>
                        <span>{ppt.reviewerName || '审阅中'}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Right badges / Action buttons */}
                {!isEditing && (
                  <div className="flex items-center gap-1">
                    {/* Hover actions */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={(e) => handleStartRename(ppt.id, ppt.name, e)}
                        className="p-1 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded transition-colors"
                        title="重命名任务"
                      >
                        <Edit2 size={12} />
                      </button>
                      {ppts.length > 1 && (
                        <button
                          onClick={(e) => handleDelete(ppt.id, e)}
                          className="p-1 text-slate-500 dark:text-white/60 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-white/10 rounded transition-colors"
                          title="删除任务"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Drag & Drop Quick Upload Area */}
      <div className="p-2.5 border-t border-slate-200 dark:border-[#343541] bg-slate-50 dark:bg-[#1a1b1e]">
        <div
          onClick={triggerFileInput}
          className="border border-dashed border-slate-300 dark:border-white/20 hover:border-amber-500 rounded-lg p-2.5 text-center cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-white/5 flex flex-col items-center gap-1 group"
        >
          <Upload size={15} className="text-slate-400 dark:text-white/40 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors" />
          <span className="text-[11px] text-slate-700 dark:text-white/70 group-hover:text-slate-900 dark:group-hover:text-white font-medium">
            点击或拖拽文件添加新任务
          </span>
          <span className="text-[9px] text-slate-400 dark:text-white/40">支持 .pptx / .ppt 格式</span>
        </div>
      </div>

      {/* Bottom Profile / Role Switcher */}
      <div className="p-3 border-t border-slate-200 dark:border-[#343541] flex items-center justify-between text-xs bg-slate-100 dark:bg-[#171717]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#C43E1C] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            PPT
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-900 dark:text-white truncate text-xs">PPT 协同审阅工作台</span>
            <span className="text-[10px] text-slate-500 dark:text-white/50 truncate">当前角色: {currentRole === 'reviewer' ? '审阅人' : '制作修改人'}</span>
          </div>
        </div>

        <button
          onClick={() => setCurrentRole(currentRole === 'reviewer' ? 'creator' : 'reviewer')}
          className={`px-2 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer shrink-0 ${
            currentRole === 'reviewer'
              ? 'bg-[#C43E1C]/10 text-[#C43E1C] dark:text-amber-300 border-[#C43E1C]/30 dark:border-amber-400/40 hover:bg-[#C43E1C]/20'
              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/20'
          }`}
          title="切换身份角色"
        >
          {currentRole === 'reviewer' ? '审阅模式' : '修改模式'}
        </button>
      </div>
    </aside>
  );
};
