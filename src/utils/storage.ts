import { ReviewData } from '../types/ppt';

const STORAGE_PREFIX = 'ppt_custom_xml_part_';

/**
 * 模拟 Office PowerPoint Custom XML Storage 读写
 * 在实际 Office.js 插件中，数据会通过 Office.context.document.customXmlParts 存入 .pptx 压缩包内部的 XML 文件中
 */
export const mockOfficeStorage = {
  /**
   * 从 PPT 内部 Custom XML 提取审阅 JSON 数据
   */
  getItem: (pptId: string): ReviewData | null => {
    try {
      const key = `${STORAGE_PREFIX}${pptId}`;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as ReviewData;
    } catch (e) {
      console.error('[MockOfficeStorage] Failed to read reviewData from PPT Custom XML:', e);
      return null;
    }
  },

  /**
   * 将审阅 JSON 数据写回到 PPT 内部 Custom XML Part
   */
  setItem: (pptId: string, data: ReviewData): boolean => {
    try {
      const key = `${STORAGE_PREFIX}${pptId}`;
      const payload = {
        ...data,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      localStorage.setItem(key, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error('[MockOfficeStorage] Failed to save reviewData into PPT Custom XML:', e);
      return false;
    }
  },

  /**
   * 检查 PPT 是否已经内嵌了审阅数据
   */
  hasItem: (pptId: string): boolean => {
    const key = `${STORAGE_PREFIX}${pptId}`;
    return !!localStorage.getItem(key);
  },

  /**
   * 清除 PPT 嵌入数据
   */
  removeItem: (pptId: string): void => {
    const key = `${STORAGE_PREFIX}${pptId}`;
    localStorage.removeItem(key);
  },

  /**
   * 导出内嵌 JSON 审阅文件
   */
  exportToJsonFile: (data: ReviewData, filename?: string): void => {
    const name = filename || `${data.pptName || 'PPT'}_reviewData_${new Date().toISOString().slice(0, 10)}.json`;
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * 验证并解析外部导入的 ReviewData JSON
   */
  parseImportedJson: (jsonString: string): ReviewData | null => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.comments)) {
        return parsed as ReviewData;
      }
      return null;
    } catch {
      return null;
    }
  }
};
