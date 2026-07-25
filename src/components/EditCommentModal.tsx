import React, { useState, useEffect, useRef } from 'react';
import { usePPTStore } from '../store/pptStore';
import { Priority } from '../types/ppt';
import { X, Save, Edit2, Image as ImageIcon, Upload, Trash2, Move, RotateCcw } from 'lucide-react';

export const EditCommentModal: React.FC = () => {
  const { editingComment, closeEditModal, updateComment } = usePPTStore();

  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<'content' | 'design' | 'data' | 'typo'>('content');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // 拖动弹窗位置状态
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, posX: 0, posY: 0 });

  // 调整弹窗尺寸状态
  const [size, setSize] = useState<{ width: number; height?: number }>({ width: 480 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ startX: 0, startY: 0, startWidth: 480, startHeight: 520 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const container = e.currentTarget.closest('.modal-container') as HTMLElement;
    const currentWidth = container ? container.offsetWidth : (size.width || 480);
    const currentHeight = container ? container.offsetHeight : (size.height || 520);
    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: currentWidth,
      startHeight: currentHeight,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStartRef.current.startX;
        const dy = e.clientY - dragStartRef.current.startY;
        setPosition({
          x: dragStartRef.current.posX + dx,
          y: dragStartRef.current.posY + dy,
        });
      } else if (isResizing) {
        const dx = e.clientX - resizeStartRef.current.startX;
        const dy = e.clientY - resizeStartRef.current.startY;
        const newWidth = Math.max(380, Math.min(window.innerWidth - 40, resizeStartRef.current.startWidth + dx));
        const newHeight = Math.max(320, Math.min(window.innerHeight - 40, resizeStartRef.current.startHeight + dy));
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing]);

  const resetPositionAndSize = () => {
    setPosition({ x: 0, y: 0 });
    setSize({ width: 480, height: undefined });
  };

  useEffect(() => {
    if (editingComment) {
      setContent(editingComment.content);
      setPriority(editingComment.priority);
      setCategory(editingComment.category || 'content');
      const urls = editingComment.imageUrls && editingComment.imageUrls.length > 0
        ? editingComment.imageUrls
        : (editingComment.imageUrl ? [editingComment.imageUrl] : []);
      setImageUrls(urls);
    }
  }, [editingComment]);

  if (!editingComment) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    files.forEach((file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`图片《${file.name}》超过 5MB，已跳过`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const res = reader.result;
          setImageUrls((prev) => [...prev, res]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeImageAt = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    updateComment(editingComment.id, {
      content: content.trim(),
      priority,
      category,
      imageUrl: imageUrls[0] || undefined,
      imageUrls,
    });
    closeEditModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[0.5px] pointer-events-none flex items-center justify-center p-3 font-sans">
      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: `${size.width}px`,
          ...(size.height ? { height: `${size.height}px` } : { maxHeight: '90vh' }),
        }}
        className={`modal-container relative pointer-events-auto bg-white dark:bg-[#1e1e1e] text-[#323130] dark:text-[#f3f2f1] rounded-xl border-2 border-[#323130] dark:border-[#383838] shadow-2xl flex flex-col overflow-hidden transition-shadow duration-150 ${
          isDragging || isResizing ? 'shadow-black/50 opacity-95' : ''
        }`}
      >
        {/* Modal Header */}
        <div
          onMouseDown={handleMouseDown}
          className="bg-[#323130] dark:bg-[#252526] text-white p-3 flex items-center justify-between border-b border-[#D83B01] cursor-grab active:cursor-grabbing select-none shrink-0"
          title="按住此处可任意拖拽弹窗位置"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#D83B01] text-white flex items-center justify-center font-black shadow-xs shrink-0">
              <Edit2 size={15} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  编辑第 {editingComment.pageNumber < 10 ? `0${editingComment.pageNumber}` : editingComment.pageNumber} 页批注意见
                </h3>
                <span className="text-[9px] bg-white/15 text-amber-300 px-1 py-0.2 rounded font-bold flex items-center gap-0.5 border border-white/10">
                  <Move size={9} />
                  <span>按住可拖动</span>
                </span>
              </div>
              <p className="text-[9px] text-[#A19F9D] font-bold uppercase tracking-wider">提出人: {editingComment.author}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 no-drag">
            {(position.x !== 0 || position.y !== 0 || size.width !== 480 || size.height !== undefined) && (
              <button
                type="button"
                onClick={resetPositionAndSize}
                className="p-1 text-[#A19F9D] hover:text-white hover:bg-white/10 rounded transition-colors text-[9px] font-bold flex items-center gap-0.5"
                title="复位弹窗位置与大小"
              >
                <RotateCcw size={12} />
                <span>复位</span>
              </button>
            )}
            <button
              type="button"
              onClick={closeEditModal}
              className="p-1 text-[#A19F9D] hover:text-white hover:bg-white/10 rounded transition-colors"
              title="关闭"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 flex-1 overflow-y-auto min-h-0">
          <div>
            <label className="block text-[10px] font-bold text-[#605E5C] dark:text-[#a0a0a0] uppercase tracking-wider mb-1">修改优先级</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={`py-1.5 px-2 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center justify-center gap-1 transition-all ${
                  priority === 'high'
                    ? 'bg-[#D83B01] border-[#D83B01] text-white shadow-xs'
                    : 'bg-white dark:bg-[#2d2d2d] border-[#EDEBE9] dark:border-[#383838] text-[#605E5C] dark:text-[#a0a0a0] hover:bg-[#FAF9F8] dark:hover:bg-[#333]'
                }`}
              >
                高优先级 (紧迫)
              </button>

              <button
                type="button"
                onClick={() => setPriority('medium')}
                className={`py-1.5 px-2 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center justify-center gap-1 transition-all ${
                  priority === 'medium'
                    ? 'bg-[#FFB900] border-[#FFB900] text-[#323130] shadow-xs'
                    : 'bg-white dark:bg-[#2d2d2d] border-[#EDEBE9] dark:border-[#383838] text-[#605E5C] dark:text-[#a0a0a0] hover:bg-[#FAF9F8] dark:hover:bg-[#333]'
                }`}
              >
                中优先级 (常规)
              </button>

              <button
                type="button"
                onClick={() => setPriority('low')}
                className={`py-1.5 px-2 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center justify-center gap-1 transition-all ${
                  priority === 'low'
                    ? 'bg-[#323130] dark:bg-[#444] border-[#323130] dark:border-[#444] text-white shadow-xs'
                    : 'bg-white dark:bg-[#2d2d2d] border-[#EDEBE9] dark:border-[#383838] text-[#605E5C] dark:text-[#a0a0a0] hover:bg-[#FAF9F8] dark:hover:bg-[#333]'
                }`}
              >
                低优先级 (细节)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#605E5C] dark:text-[#a0a0a0] uppercase tracking-wider mb-1">批注内容要求</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={3}
              className="w-full bg-[#FAF9F8] dark:bg-[#2d2d2d] border border-[#D2D0CE] dark:border-[#383838] rounded p-2.5 text-xs text-[#323130] dark:text-[#f3f2f1] font-medium focus:outline-none focus:border-[#D83B01] leading-relaxed shadow-xs"
            />
          </div>

          {/* Reference Image Attachment Section */}
          <div className="space-y-2 bg-[#FAF9F8] dark:bg-[#252526] p-2.5 rounded-lg border border-[#EDEBE9] dark:border-[#383838]">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold text-[#323130] uppercase tracking-wider flex items-center gap-1">
                <ImageIcon size={13} className="text-[#D83B01]" />
                <span>参考图 / 修改示意图 (可添加多张)</span>
                {imageUrls.length > 0 && (
                  <span className="text-[9px] text-[#D83B01] font-bold bg-[#D83B01]/10 px-1.5 py-0.2 rounded-full">
                    已存 {imageUrls.length} 张
                  </span>
                )}
              </label>
              {imageUrls.length > 0 && (
                <button
                  type="button"
                  onClick={() => setImageUrls([])}
                  className="text-[9px] text-[#D83B01] font-bold hover:underline flex items-center gap-0.5"
                >
                  <Trash2 size={10} />
                  <span>清空所有图片</span>
                </button>
              )}
            </div>

            {/* Selected Images Grid & Upload Button */}
            <div className="space-y-2">
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 bg-white rounded-lg border border-[#EDEBE9]">
                  {imageUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative rounded overflow-hidden border border-[#D2D0CE] bg-[#FAF9F8] group h-20 flex items-center justify-center p-1"
                    >
                      <img
                        src={url}
                        alt={`示意图 ${idx + 1}`}
                        className="max-h-full max-w-full object-contain rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageAt(idx)}
                        className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="删除此张图片"
                      >
                        <X size={10} />
                      </button>
                      <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-black/60 text-white px-1 py-0.2 rounded font-bold">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex flex-col items-center justify-center h-16 border-2 border-dashed border-[#D2D0CE] hover:border-[#D83B01] bg-white rounded-lg cursor-pointer transition-colors p-1.5">
                <div className="flex items-center gap-1.5 text-center">
                  <Upload size={16} className="text-[#A19F9D]" />
                  <span className="text-[10px] font-bold text-[#605E5C]">
                    {imageUrls.length > 0 ? '+ 补充选择更多示意图' : '点击或拖拽补充上传参考图 (支持多张)'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#EDEBE9]">
            <button
              type="button"
              onClick={closeEditModal}
              className="px-3 py-1.5 rounded border border-[#D2D0CE] text-[10px] font-bold uppercase tracking-wider text-[#605E5C] hover:bg-[#FAF9F8] transition-colors"
            >
              取消
            </button>

            <button
              type="submit"
              disabled={!content.trim()}
              className="px-4 py-1.5 rounded bg-[#D83B01] hover:bg-[#B7472A] disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save size={13} />
              <span>更新批注</span>
            </button>
          </div>
        </form>

        {/* Bottom Right Resize Handle */}
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize flex items-center justify-center text-[#A19F9D] hover:text-[#D83B01] transition-colors select-none z-20"
          title="拖拽右下角可任意调整窗口宽和高"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 2L2 8M8 5L5 8M8 8L8 8" />
          </svg>
        </div>
      </div>
    </div>
  );
};
