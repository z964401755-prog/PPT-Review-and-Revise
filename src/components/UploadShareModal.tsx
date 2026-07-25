import React, { useState } from 'react';
import { usePPTStore } from '../store/pptStore';
import {
  X,
  Upload,
  Share2,
  Copy,
  CheckCircle2,
  FileSpreadsheet,
  Globe,
  Sparkles,
  Link2,
  ArrowRight
} from 'lucide-react';

export const UploadShareModal: React.FC = () => {
  const {
    showUploadShareModal,
    setShowUploadShareModal,
    uploadPPTFile,
    copyShareableLink,
    getShareableLink,
    ppts,
    currentPPTId,
    reviewData,
    showToast,
  } = usePPTStore();

  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!showUploadShareModal) return null;

  const currentPPT = ppts.find((p) => p.id === currentPPTId);
  const currentShareUrl = getShareableLink();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    await uploadPPTFile(file);
    setIsUploading(false);
  };

  const handleCopyLink = () => {
    const url = copyShareableLink();
    if (url) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#323130]/60 backdrop-blur-xs flex items-center justify-center p-3 font-sans">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border-2 border-[#323130] dark:border-[#444] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-[#323130] dark:text-[#f3f2f1]">
        {/* Modal Header */}
        <div className="bg-[#D83B01] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-white/20 text-white flex items-center justify-center font-black shadow-xs">
              <Globe size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                网页免安装模式 (Web Review & Share)
              </h3>
              <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">上传 PPT • 零插件依赖 • 一键分享链接</p>
            </div>
          </div>
          <button
            onClick={() => setShowUploadShareModal(false)}
            className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4">
          {/* Section 1: Upload PPT File */}
          <div className="bg-[#FAF9F8] dark:bg-[#252526] border border-[#D2D0CE] dark:border-[#383838] rounded-lg p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-[#323130] dark:text-[#f3f2f1] flex items-center gap-1.5">
                <Upload size={14} className="text-[#D83B01]" />
                1. 上传本地 PPT 文件 (.pptx / .ppt)
              </label>
              <span className="text-[9px] bg-[#EDEBE9] dark:bg-[#333] text-[#605E5C] dark:text-[#a0a0a0] px-1.5 py-0.5 rounded font-bold uppercase">
                实时网页解析
              </span>
            </div>

            <div className="relative border-2 border-dashed border-[#D2D0CE] dark:border-[#444] hover:border-[#D83B01] dark:hover:border-[#D83B01] rounded-lg p-4 text-center transition-colors bg-white dark:bg-[#1a1a1a]">
              <input
                type="file"
                accept=".pptx,.ppt"
                onChange={handleFileChange}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center justify-center space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-[#D83B01]/10 text-[#D83B01] flex items-center justify-center">
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-[#D83B01] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileSpreadsheet size={20} />
                  )}
                </div>
                <p className="text-xs font-bold text-[#323130] dark:text-[#f3f2f1]">
                  {isUploading ? '正在解析上传 PPT ...' : '点击或拖拽上传 PPT 文件'}
                </p>
                <p className="text-[10px] text-[#605E5C] dark:text-[#a0a0a0]">
                  上传后无需任何客户端，自动生成网页版幻灯片和批注工作区
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Link Sharing with Leaders */}
          <div className="bg-[#FAF9F8] dark:bg-[#252526] border border-[#D2D0CE] dark:border-[#383838] rounded-lg p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-[#323130] dark:text-[#f3f2f1] flex items-center gap-1.5">
                <Share2 size={14} className="text-[#107C10]" />
                2. 生成领导免安装协同链接
              </label>
              <span className="text-[9px] bg-[#107C10]/10 text-[#107C10] font-bold px-1.5 py-0.5 rounded uppercase">
                零门槛分享
              </span>
            </div>

            <p className="text-[11px] text-[#605E5C] dark:text-[#a0a0a0]">
              完成修改后，将链接直接发送给领导/同事。点击链接即可在任何手机或电脑浏览器中直接打开本演示文稿并实时添加批注！
            </p>

            {/* Current Active File Card */}
            <div className="bg-white dark:bg-[#1a1a1a] border border-[#EDEBE9] dark:border-[#383838] rounded p-2.5 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-[#605E5C] dark:text-[#a0a0a0] uppercase">当前分享中的 PPT:</p>
                <p className="text-xs font-bold text-[#323130] dark:text-[#f3f2f1] truncate">{currentPPT?.name}</p>
                <p className="text-[10px] text-[#107C10] font-bold mt-0.5">
                  已内嵌 {reviewData?.comments.length || 0} 条审阅意见
                </p>
              </div>

              <button
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  copied
                    ? 'bg-[#107C10] text-white shadow-xs'
                    : 'bg-[#D83B01] hover:bg-[#B7472A] text-white shadow-xs'
                }`}
              >
                {copied ? <CheckCircle2 size={13} /> : <Link2 size={13} />}
                <span>{copied ? '已复制分享链接！' : '复制在线链接'}</span>
              </button>
            </div>

            {/* Link Preview box */}
            <div className="flex items-center gap-2 bg-[#EDEBE9] dark:bg-[#1e1e1e] p-2 rounded border border-[#D2D0CE] dark:border-[#383838]">
              <input
                type="text"
                readOnly
                value={currentShareUrl}
                className="bg-transparent text-[10px] font-mono text-[#323130] dark:text-[#f3f2f1] flex-1 outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="text-[10px] font-bold text-[#D83B01] hover:underline shrink-0"
              >
                复制
              </button>
            </div>
          </div>

          {/* Workflow Advantage Info Box */}
          <div className="bg-[#107C10]/10 border-l-4 border-[#107C10] p-3 rounded-r-lg text-xs space-y-1 text-[#323130] dark:text-[#f3f2f1]">
            <p className="font-bold flex items-center gap-1.5 text-[#107C10]">
              <Sparkles size={14} />
              解决传统插件推广痛点
            </p>
            <p className="text-[11px] text-[#605E5C] dark:text-[#a0a0a0] leading-snug">
              下属和领导无需在本地 PPT 中安装任何 Office 插件，直接在网页上完成浏览、定位页面、批注修改意见，支持手机与桌面浏览器完美开箱即用。
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#FAF9F8] dark:bg-[#252526] border-t border-[#EDEBE9] dark:border-[#383838] flex items-center justify-between">
          <span className="text-[10px] text-[#605E5C] dark:text-[#a0a0a0] font-bold uppercase">
            网页协同版 v2.0
          </span>
          <button
            onClick={() => setShowUploadShareModal(false)}
            className="px-4 py-1.5 bg-[#323130] dark:bg-[#444] hover:bg-black text-white rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
