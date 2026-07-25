import React, { useEffect, useRef } from 'react';
import { usePPTStore } from './store/pptStore';
import { LeftSidebar } from './components/LeftSidebar';
import { PPTStageViewer } from './components/PPTStageViewer';
import { TaskPaneFrame } from './components/TaskPaneFrame';
import { UploadShareModal } from './components/UploadShareModal';
import { ImportExportModal } from './components/ImportExportModal';
import { OfficeJsDocModal } from './components/OfficeJsDocModal';
import { UploadPortal } from './components/UploadPortal';

export default function App() {
  const taskPaneViewMode = usePPTStore((s) => s.taskPaneViewMode);
  const isTaskPaneCollapsed = usePPTStore((s) => s.isTaskPaneCollapsed);
  const isDarkMode = usePPTStore((s) => s.isDarkMode);
  const hasOpenedPPT = usePPTStore((s) => s.hasOpenedPPT);
  const initSharedLinkIfPresent = usePPTStore((s) => s.initSharedLinkIfPresent);

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      initSharedLinkIfPresent();
    }
  }, [initSharedLinkIfPresent]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initial screen fallback if user resets
  if (!hasOpenedPPT) {
    return <UploadPortal />;
  }

  return (
    <div className={`w-screen h-screen overflow-hidden flex flex-row transition-colors duration-200 ${
      isDarkMode ? 'bg-[#181818] text-[#f3f2f1]' : 'bg-[#F3F2F1] text-[#323130]'
    }`}>
      {/* 1. Leftmost Column: ChatGPT style Task Management & File Import Sidebar */}
      <LeftSidebar />

      {/* 2. Middle Column: PPT Presentation Display Stage */}
      {taskPaneViewMode === 'split' && (
        <div className="flex-1 h-full min-w-0 overflow-hidden flex flex-col relative">
          <PPTStageViewer />
        </div>
      )}

      {/* 3. Rightmost Column: Office TaskPane Add-in Revision Plugin */}
      <div
        className={`h-full flex flex-col transition-all duration-300 ease-in-out shrink-0 z-10 ${
          taskPaneViewMode === 'fullscreen'
            ? 'w-full max-w-lg mx-auto shadow-2xl'
            : isTaskPaneCollapsed
            ? 'w-12 md:w-[52px]'
            : 'w-full md:w-[380px] lg:w-[400px]'
        }`}
      >
        <TaskPaneFrame />
      </div>

      {/* Modals */}
      <UploadShareModal />
      <ImportExportModal />
      <OfficeJsDocModal />
    </div>
  );
}
