import React, { useState } from 'react';
import { usePPTStore } from '../store/pptStore';
import { X, Download, Upload, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';

export const ImportExportModal: React.FC = () => {
  const {
    showImportExportModal,
    setShowImportExportModal,
    reviewData,
    exportReviewDataJson,
    importReviewDataJson,
  } = usePPTStore();

  const [importText, setImportText] = useState('');
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!showImportExportModal) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportText(content);
        setUploadError(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    if (!importText.trim()) return;

    const ok = importReviewDataJson(importText);
    if (!ok) {
      setUploadError('JSON 数据格式校验失败，请确保格式匹配 ReviewData 结构！');
    } else {
      setImportText('');
    }
  };

  const jsonPreview = reviewData ? JSON.stringify(reviewData, null, 2) : '{}';

  return (
    <div className="fixed inset-0 z-50 bg-[#323130]/60 backdrop-blur-xs flex items-center justify-center p-3 font-sans">
      <div className="bg-white rounded-xl border-2 border-[#323130] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-[#323130] text-white p-4 flex items-center justify-between border-b border-[#D83B01]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#D83B01] text-white flex items-center justify-center font-black shadow-xs">
              <FileCode size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                PPT 审阅数据导入 / 导出
              </h3>
              <p className="text-[10px] text-[#A19F9D] font-bold uppercase tracking-wider">嵌入式 reviewData.json 机制</p>
            </div>
          </div>
          <button
            onClick={() => setShowImportExportModal(false)}
            className="p-1 text-[#A19F9D] hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Sub Tabs */}
        <div className="flex border-b border-[#EDEBE9] bg-[#FAF9F8] p-1 gap-1 text-[10px] font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 rounded flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'export'
                ? 'bg-[#323130] text-white shadow-xs'
                : 'text-[#605E5C] hover:text-[#323130]'
            }`}
          >
            <Download size={13} className="text-[#D83B01]" />
            <span>导出 JSON (EXPORT)</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 rounded flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'import'
                ? 'bg-[#323130] text-white shadow-xs'
                : 'text-[#605E5C] hover:text-[#323130]'
            }`}
          >
            <Upload size={13} className="text-[#D83B01]" />
            <span>导入 JSON (IMPORT)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 space-y-4">
          {activeTab === 'export' ? (
            <div className="space-y-4">
              <div className="bg-[#FAF9F8] border-l-4 border-[#107C10] border-t border-r border-b border-[#EDEBE9] rounded-r-lg p-3.5 text-xs text-[#323130] space-y-1">
                <p className="font-bold flex items-center gap-1 uppercase tracking-wider">
                  <CheckCircle2 size={13} className="text-[#107C10]" />
                  内嵌审阅文件准备就绪
                </p>
                <p className="text-[11px] text-[#605E5C]">
                  导出的 <code className="bg-white border border-[#EDEBE9] px-1 rounded font-bold text-[#D83B01]">reviewData.json</code> 包含了所有 {reviewData?.comments.length || 0} 条修改批注及完成状态。
                </p>
              </div>

              {/* JSON Code Viewer */}
              <div>
                <label className="block text-[10px] font-bold text-[#605E5C] uppercase tracking-wider mb-1">
                  JSON 内容预览:
                </label>
                <pre className="bg-[#323130] text-white p-3 rounded-lg text-[10px] font-mono h-40 overflow-y-auto leading-tight border border-[#D83B01]">
                  {jsonPreview}
                </pre>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  onClick={exportReviewDataJson}
                  className="px-4 py-2 bg-[#D83B01] hover:bg-[#B7472A] text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download size={14} />
                  <span>下载导出 reviewData.json</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div className="bg-[#FAF9F8] border-l-4 border-[#323130] border-t border-r border-b border-[#EDEBE9] rounded-r-lg p-3.5 text-xs text-[#323130] space-y-1">
                <p className="font-bold flex items-center gap-1 uppercase tracking-wider">
                  <Upload size={13} className="text-[#323130]" />
                  加载外部审阅记录
                </p>
                <p className="text-[11px] text-[#605E5C]">
                  制作人员收到带审阅数据的 PPT 后，选择导入 .json 即可一键载入所有修改意见。
                </p>
              </div>

              {/* Upload Input Button */}
              <div>
                <label className="block text-[10px] font-bold text-[#605E5C] uppercase tracking-wider mb-1">
                  选择 .json 审阅文件:
                </label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-[#605E5C] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-[#323130] file:text-white hover:file:bg-[#D83B01] cursor-pointer"
                />
              </div>

              {/* Text Area Manual Paste */}
              <div>
                <label className="block text-[10px] font-bold text-[#605E5C] uppercase tracking-wider mb-1">
                  或直接粘贴 reviewData JSON 代码:
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={4}
                  placeholder={`{\n  "pptId": "ppt001",\n  "reviewer": "张总",\n  "comments": [ ... ]\n}`}
                  className="w-full bg-[#FAF9F8] border border-[#D2D0CE] rounded p-2.5 text-[10px] font-mono text-[#323130] placeholder-[#A19F9D] focus:outline-none focus:border-[#D83B01] leading-tight"
                />
              </div>

              {uploadError && (
                <div className="p-2.5 bg-red-50 text-[#D83B01] rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-[#D83B01]/30">
                  <AlertCircle size={14} />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#EDEBE9]">
                <button
                  type="button"
                  onClick={() => setShowImportExportModal(false)}
                  className="px-3 py-1.5 border border-[#D2D0CE] text-[10px] font-bold uppercase tracking-wider text-[#605E5C] hover:bg-[#FAF9F8] rounded"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!importText.trim()}
                  className="px-4 py-2 bg-[#D83B01] hover:bg-[#B7472A] disabled:opacity-50 text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Upload size={14} />
                  <span>校验并载入审阅数据</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
