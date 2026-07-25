import React from 'react';
import { CommentList } from '../components/CommentList';

export const CommentManagementView: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#F3F2F1] dark:bg-[#181818] p-3 space-y-3 overflow-y-auto font-sans transition-colors">
      <CommentList
        showAllGlobalComments={true}
        showImportExportBtn={true}
        showSearchBar={true}
      />
    </div>
  );
};

