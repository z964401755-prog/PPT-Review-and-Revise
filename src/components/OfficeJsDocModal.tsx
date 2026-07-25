import React from 'react';
import { usePPTStore } from '../store/pptStore';
import { OFFICE_JS_MIGRATION_DOC } from '../utils/officeJsDoc';
import { X, BookOpen, Code, Terminal, CheckCircle } from 'lucide-react';

export const OfficeJsDocModal: React.FC = () => {
  const { showOfficeDocModal, setShowOfficeDocModal } = usePPTStore();

  if (!showOfficeDocModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#323130]/70 backdrop-blur-xs flex items-center justify-center p-3 font-sans">
      <div className="bg-[#323130] text-white rounded-xl border-2 border-[#D83B01] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#1F1E1D] px-4 py-3.5 border-b border-[#EDEBE9]/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#D83B01] text-white flex items-center justify-center font-black">
              <Code size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                {OFFICE_JS_MIGRATION_DOC.title}
              </h3>
              <p className="text-[10px] text-[#A19F9D] font-bold uppercase tracking-wider">
                从 MVP 模拟器无缝升级到真实 PowerPoint 插件
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowOfficeDocModal(false)}
            className="p-1 text-[#A19F9D] hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto text-xs flex-1">
          <div className="bg-[#FAF9F8] text-[#323130] border-l-4 border-[#107C10] rounded-r-lg p-3.5 leading-relaxed text-[11px]">
            <p className="font-bold text-[#323130] mb-1 flex items-center gap-1 uppercase tracking-wider">
              <CheckCircle size={13} className="text-[#107C10]" />
              <span>零后端方案的生产落地原理</span>
            </p>
            {OFFICE_JS_MIGRATION_DOC.description}
          </div>

          <div className="space-y-3">
            {OFFICE_JS_MIGRATION_DOC.steps.map((item) => (
              <div
                key={item.step}
                className="bg-[#1F1E1D] rounded-lg border border-white/10 p-3.5 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#D83B01] text-white text-[10px] font-black flex items-center justify-center">
                    {item.step}
                  </span>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">{item.title}</h4>
                </div>

                <pre className="bg-black/50 p-3 rounded text-[10px] font-mono text-[#FFB900] border border-white/10 overflow-x-auto leading-relaxed">
                  {item.code}
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#1F1E1D] px-4 py-3 border-t border-white/10 flex justify-end shrink-0">
          <button
            onClick={() => setShowOfficeDocModal(false)}
            className="px-4 py-1.5 bg-[#D83B01] hover:bg-[#B7472A] text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors shadow-xs"
          >
            我已知晓，返回 MVP 交互
          </button>
        </div>
      </div>
    </div>
  );
};
