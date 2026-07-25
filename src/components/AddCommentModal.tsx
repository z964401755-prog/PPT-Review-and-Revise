import React, { useState, useEffect, useRef } from 'react';
import { usePPTStore } from '../store/pptStore';
import { Priority } from '../types/ppt';
import { X, Sparkles, Send, Plus, Trash2, MessageSquare, Image as ImageIcon, Upload, GripHorizontal, Move, RotateCcw } from 'lucide-react';

export const AddCommentModal: React.FC = () => {
  const {
    showAddModal,
    closeAddModal,
    slides,
    selectedSlideId,
    addComment,
  } = usePPTStore();

  const [targetSlideId, setTargetSlideId] = useState(selectedSlideId);
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Priority>('high');
  const [category, setCategory] = useState<'content' | 'design' | 'data' | 'typo'>('content');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // 拖动弹窗位置状态
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, posX: 0, posY: 0 });

  // 调整弹窗尺寸状态
  const [size, setSize] = useState<{ width: number; height?: number }>({ width: 480 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ startX: 0, startY: 0, startWidth: 480, startHeight: 580 });

  const handleMouseDown = (e: React.MouseEvent) => {
    // 如果点击了 no-drag 元素（如关闭按钮、复位按钮），不触发拖拽
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
    const currentHeight = container ? container.offsetHeight : (size.height || 580);
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

  // 辅助函数：将选中的快捷意见追加到当前文本后面而非覆盖
  const appendPresetToContent = (preset: string) => {
    setContent((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return preset;
      if (trimmed.includes(preset)) return prev;
      return `${trimmed}；${preset}`;
    });
  };

  // 自定义灵感输入框与列表（从 localStorage 读取）
  const [customPresets, setCustomPresets] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('custom_ppt_presets');
      return saved ? JSON.parse(saved) : ['标题字号统一为 24pt', '增加数据来源权威脚注'];
    } catch {
      return ['标题字号统一为 24pt', '增加数据来源权威脚注'];
    }
  });

  const [newPresetInput, setNewPresetInput] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  // 保存自定义灵感至 localStorage
  useEffect(() => {
    try {
      localStorage.setItem('custom_ppt_presets', JSON.stringify(customPresets));
    } catch (e) {
      console.error(e);
    }
  }, [customPresets]);

  useEffect(() => {
    setTargetSlideId(selectedSlideId);
  }, [selectedSlideId]);

  if (!showAddModal) return null;

  const handleSlideChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slideId = e.target.value;
    setTargetSlideId(slideId);
  };

  const selectedSlide = slides.find((s) => s.id === targetSlideId) || slides[0];

  // 处理多张图片选择与追加
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

    // reset input
    e.target.value = '';
  };

  // 移除指定索引的图片
  const removeImageAt = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // 添加示例图片
  const addSampleImage = (url: string) => {
    if (!imageUrls.includes(url)) {
      setImageUrls((prev) => [...prev, url]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addComment({
      slideId: selectedSlide.id,
      pageNumber: selectedSlide.pageNumber,
      content: content.trim(),
      priority,
      category,
      imageUrl: imageUrls[0] || undefined,
      imageUrls: imageUrls,
    });

    closeAddModal();
    setContent('');
    setImageUrls([]);
  };

  // 辅助 SVG 生成器，用于精准匹配常用排版示范图
  const createLayoutSvgUrl = (title: string, svgBody: string) => {
    const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="400" height="250"><rect width="400" height="250" rx="12" fill="#FAF9F8" stroke="#E1DFDD" stroke-width="2"/><text x="20" y="32" font-family="sans-serif" font-size="13" font-weight="bold" fill="#323130">${title}</text>${svgBody}</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(fullSvg)}`;
  };

  // 精准匹配的经典 PPT 常用排版示范图
  const sampleReferenceImages = [
    {
      name: '两栏对比排版参考',
      url: createLayoutSvgUrl(
        '两栏对比排版方案 (Comparison Layout)',
        `<rect x="20" y="48" width="170" height="180" rx="8" fill="#FFFFFF" stroke="#D83B01" stroke-width="2"/>
         <rect x="20" y="48" width="170" height="32" rx="8" fill="#D83B01"/>
         <text x="105" y="69" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF">方案 A (优劣势)</text>
         <rect x="35" y="95" width="140" height="10" rx="3" fill="#323130"/>
         <rect x="35" y="115" width="120" height="8" rx="2" fill="#A19F9D"/>
         <rect x="35" y="130" width="130" height="8" rx="2" fill="#A19F9D"/>
         <rect x="35" y="145" width="100" height="8" rx="2" fill="#A19F9D"/>
         <rect x="35" y="170" width="140" height="28" rx="4" fill="#F3F2F1"/>
         <text x="105" y="188" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#D83B01">核心结论 / KPI A</text>

         <rect x="210" y="48" width="170" height="180" rx="8" fill="#FFFFFF" stroke="#D2D0CE" stroke-width="2"/>
         <rect x="210" y="48" width="170" height="32" rx="8" fill="#323130"/>
         <text x="295" y="69" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF">方案 B (备选项)</text>
         <rect x="225" y="95" width="140" height="10" rx="3" fill="#323130"/>
         <rect x="225" y="115" width="120" height="8" rx="2" fill="#A19F9D"/>
         <rect x="225" y="130" width="130" height="8" rx="2" fill="#A19F9D"/>
         <rect x="225" y="145" width="100" height="8" rx="2" fill="#A19F9D"/>
         <rect x="225" y="170" width="140" height="28" rx="4" fill="#F3F2F1"/>
         <text x="295" y="188" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#605E5C">核心结论 / KPI B</text>`
      ),
    },
    {
      name: '视觉多栏对齐范例',
      url: createLayoutSvgUrl(
        '三栏核心业务并列对齐布局 (3-Card Grid)',
        `<rect x="20" y="48" width="110" height="180" rx="8" fill="#FFFFFF" stroke="#D83B01" stroke-width="2"/>
         <circle cx="75" cy="80" r="18" fill="#D83B01"/>
         <text x="75" y="85" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF">01</text>
         <text x="75" y="118" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#323130">核心板块一</text>
         <rect x="32" y="132" width="86" height="6" rx="2" fill="#A19F9D"/>
         <rect x="32" y="144" width="76" height="6" rx="2" fill="#A19F9D"/>
         <rect x="32" y="156" width="80" height="6" rx="2" fill="#A19F9D"/>
         <rect x="30" y="180" width="90" height="22" rx="4" fill="#D83B01" fill-opacity="0.1"/>
         <text x="75" y="195" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#D83B01">重点推荐</text>

         <rect x="145" y="48" width="110" height="180" rx="8" fill="#FFFFFF" stroke="#D2D0CE" stroke-width="1.5"/>
         <circle cx="200" cy="80" r="18" fill="#323130"/>
         <text x="200" y="85" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF">02</text>
         <text x="200" y="118" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#323130">核心板块二</text>
         <rect x="157" y="132" width="86" height="6" rx="2" fill="#A19F9D"/>
         <rect x="157" y="144" width="76" height="6" rx="2" fill="#A19F9D"/>
         <rect x="157" y="156" width="80" height="6" rx="2" fill="#A19F9D"/>

         <rect x="270" y="48" width="110" height="180" rx="8" fill="#FFFFFF" stroke="#D2D0CE" stroke-width="1.5"/>
         <circle cx="325" cy="80" r="18" fill="#323130"/>
         <text x="325" y="85" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF">03</text>
         <text x="325" y="118" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#323130">核心板块三</text>
         <rect x="282" y="132" width="86" height="6" rx="2" fill="#A19F9D"/>
         <rect x="282" y="144" width="76" height="6" rx="2" fill="#A19F9D"/>
         <rect x="282" y="156" width="80" height="6" rx="2" fill="#A19F9D"/>`
      ),
    },
    {
      name: '数据看板排版模板',
      url: createLayoutSvgUrl(
        '核心指标与趋势数据看板 (KPI Dashboard)',
        `<rect x="20" y="48" width="115" height="75" rx="8" fill="#FFFFFF" stroke="#D83B01" stroke-width="2"/>
         <text x="30" y="68" font-family="sans-serif" font-size="10" font-weight="bold" fill="#605E5C">年度总营收</text>
         <text x="30" y="96" font-family="sans-serif" font-size="18" font-weight="black" fill="#D83B01">¥1.28 亿</text>
         <text x="30" y="112" font-family="sans-serif" font-size="8" font-weight="bold" fill="#107C10">↑ 同比增长 +24.8%</text>

         <rect x="145" y="48" width="115" height="75" rx="8" fill="#FFFFFF" stroke="#D2D0CE" stroke-width="1.5"/>
         <text x="155" y="68" font-family="sans-serif" font-size="10" font-weight="bold" fill="#605E5C">活跃用户 MAU</text>
         <text x="155" y="96" font-family="sans-serif" font-size="18" font-weight="black" fill="#323130">3,420 万</text>
         <text x="155" y="112" font-family="sans-serif" font-size="8" font-weight="bold" fill="#107C10">↑ 环比增长 +12.3%</text>

         <rect x="270" y="48" width="110" height="75" rx="8" fill="#FFFFFF" stroke="#D2D0CE" stroke-width="1.5"/>
         <text x="280" y="68" font-family="sans-serif" font-size="10" font-weight="bold" fill="#605E5C">客户满意度</text>
         <text x="280" y="96" font-family="sans-serif" font-size="18" font-weight="black" fill="#323130">98.5%</text>

         <rect x="20" y="132" width="360" height="96" rx="8" fill="#FFFFFF" stroke="#D2D0CE" stroke-width="1.5"/>
         <text x="32" y="152" font-family="sans-serif" font-size="10" font-weight="bold" fill="#323130">近四年季度增长走势对比</text>
         <rect x="60" y="180" width="16" height="36" rx="2" fill="#D2D0CE"/>
         <rect x="80" y="165" width="16" height="51" rx="2" fill="#D83B01"/>
         <rect x="140" y="175" width="16" height="41" rx="2" fill="#D2D0CE"/>
         <rect x="160" y="160" width="16" height="56" rx="2" fill="#D83B01"/>
         <rect x="220" y="170" width="16" height="46" rx="2" fill="#D2D0CE"/>
         <rect x="240" y="150" width="16" height="66" rx="2" fill="#D83B01"/>
         <rect x="300" y="165" width="16" height="51" rx="2" fill="#D2D0CE"/>
         <rect x="320" y="142" width="16" height="74" rx="2" fill="#D83B01"/>`
      ),
    },
    {
      name: '四步时间轴流程参考',
      url: createLayoutSvgUrl(
        '四阶段项目演进流程 (Timeline Flow)',
        `<line x1="50" y1="120" x2="350" y2="120" stroke="#D83B01" stroke-width="4" stroke-dasharray="8,4"/>
         <circle cx="65" cy="120" r="20" fill="#D83B01"/>
         <text x="65" y="125" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF">01</text>
         <rect x="20" y="52" width="90" height="42" rx="6" fill="#FFFFFF" stroke="#D83B01" stroke-width="1.5"/>
         <text x="65" y="70" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#D83B01">调研诊断</text>
         <text x="65" y="84" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#605E5C">第 1 周</text>

         <circle cx="155" cy="120" r="20" fill="#323130"/>
         <text x="155" y="125" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF">02</text>
         <rect x="110" y="152" width="90" height="42" rx="6" fill="#FFFFFF" stroke="#D2D0CE" stroke-width="1.5"/>
         <text x="155" y="170" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#323130">方案设计</text>
         <text x="155" y="184" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#605E5C">第 2-3 周</text>

         <circle cx="245" cy="120" r="20" fill="#323130"/>
         <text x="245" y="125" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF">03</text>
         <rect x="200" y="52" width="90" height="42" rx="6" fill="#FFFFFF" stroke="#D2D0CE" stroke-width="1.5"/>
         <text x="245" y="70" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#323130">开发实施</text>
         <text x="245" y="84" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#605E5C">第 4-6 周</text>

         <circle cx="335" cy="120" r="20" fill="#107C10"/>
         <text x="335" y="125" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF">04</text>
         <rect x="290" y="152" width="90" height="42" rx="6" fill="#FFFFFF" stroke="#107C10" stroke-width="1.5"/>
         <text x="335" y="170" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#107C10">上线评估</text>
         <text x="335" y="184" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#605E5C">第 7 周</text>`
      ),
    },
    {
      name: 'SWOT 四象限矩阵范例',
      url: createLayoutSvgUrl(
        'SWOT 战略四象限矩阵 (2x2 Matrix)',
        `<rect x="20" y="48" width="175" height="85" rx="6" fill="#FFFFFF" stroke="#D83B01" stroke-width="2"/>
         <rect x="20" y="48" width="175" height="22" rx="6" fill="#D83B01"/>
         <text x="107" y="63" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#FFFFFF">S - 内部优势 (Strengths)</text>
         <text x="30" y="88" font-family="sans-serif" font-size="9" fill="#323130">• 自研核心技术专利壁垒</text>
         <text x="30" y="104" font-family="sans-serif" font-size="9" fill="#323130">• 高粘性 B 端客户群体</text>

         <rect x="205" y="48" width="175" height="85" rx="6" fill="#FFFFFF" stroke="#323130" stroke-width="1.5"/>
         <rect x="205" y="48" width="175" height="22" rx="6" fill="#323130"/>
         <text x="292" y="63" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#FFFFFF">W - 内部劣势 (Weaknesses)</text>
         <text x="215" y="88" font-family="sans-serif" font-size="9" fill="#323130">• 品牌声量与营销渠道较窄</text>
         <text x="215" y="104" font-family="sans-serif" font-size="9" fill="#323130">• 交付服务人员人手偏紧</text>

         <rect x="20" y="142" width="175" height="85" rx="6" fill="#FFFFFF" stroke="#107C10" stroke-width="1.5"/>
         <rect x="20" y="142" width="175" height="22" rx="6" fill="#107C10"/>
         <text x="107" y="157" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#FFFFFF">O - 外部机遇 (Opportunities)</text>
         <text x="30" y="182" font-family="sans-serif" font-size="9" fill="#323130">• 行业信创替代政策红利</text>
         <text x="30" y="198" font-family="sans-serif" font-size="9" fill="#323130">• 海外新兴市场需求大增</text>

         <rect x="205" y="142" width="175" height="85" rx="6" fill="#FFFFFF" stroke="#605E5C" stroke-width="1.5"/>
         <rect x="205" y="142" width="175" height="22" rx="6" fill="#605E5C"/>
         <text x="292" y="157" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#FFFFFF">T - 外部威胁 (Threats)</text>
         <text x="215" y="182" font-family="sans-serif" font-size="9" fill="#323130">• 传统巨头降价打价格战</text>
         <text x="215" y="198" font-family="sans-serif" font-size="9" fill="#323130">• 供应链原材料成本波动</text>`
      ),
    },
    {
      name: '金字塔层级架构范例',
      url: createLayoutSvgUrl(
        '战略金字塔与分层架构 (Pyramid Hierarchy)',
        `<polygon points="200,48 140,95 260,95" fill="#D83B01"/>
         <text x="200" y="78" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF">顶层愿景与使命</text>

         <polygon points="135,100 265,100 295,150 105,150" fill="#323130"/>
         <text x="200" y="130" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF">中层核心战略方向 (Strategic Pillars)</text>

         <polygon points="100,155 300,155 330,215 70,215" fill="#605E5C"/>
         <text x="200" y="190" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF">底层组织支撑与基础设施 (Foundation)</text>`
      ),
    },
  ];

  // 快速读取选中的 Slide 文本，智能推演关联快捷修改意见
  const generateContextualIdeas = (title: string): string[] => {
    const t = title.toLowerCase();
    const ideas: string[] = [];

    if (t.includes('新品') || t.includes('发布') || t.includes('全案') || t.includes('营销') || t.includes('品牌')) {
      ideas.push('补充目标受众画像与渠道分布');
      ideas.push('替换此页产品截图为高清无水印渲染图');
      ideas.push('建议增加竞品差异化卖点对比表');
    } else if (t.includes('数据') || t.includes('营收') || t.includes('财务') || t.includes('复盘') || t.includes('增长') || t.includes('指标') || t.includes('q1') || t.includes('q2') || t.includes('q3') || t.includes('q4')) {
      ideas.push('增加近三年实际营收与预算偏差对比折线图');
      ideas.push('图表字体调大并加粗核心增长指标');
      ideas.push('核实并补充留存率与转化率数据来源脚注');
    } else if (t.includes('架构') || t.includes('流程') || t.includes('组织') || t.includes('团队') || t.includes('战略')) {
      ideas.push('简化架构图逻辑并突出核心汇报流向');
      ideas.push('补充各个关键流程节点的时间与责任人标注');
      ideas.push('突出显示战略攻坚项目的落地重点');
    } else if (t.includes('对比') || t.includes('格局') || t.includes('竞争') || t.includes('分析')) {
      ideas.push('补充与行业 Top3 竞品的功能维度对比');
      ideas.push('增加市场份额占有率的柱状图数据');
      ideas.push('高亮强化我方技术壁垒与服务优势');
    } else {
      ideas.push('针对此页内容补充关键案例与数据佐证');
      ideas.push('优化此页图文排版，避免文字过于密集');
      ideas.push('调整标题与正文对齐，增强视觉层级');
    }

    // 通用常用意见补充
    ideas.push('修正个别标点符号与专业词汇错别字');
    return ideas;
  };

  const contextualIdeas = generateContextualIdeas(selectedSlide?.title || '演示文件');

  // 新增自定义快捷意见
  const handleAddCustomPreset = () => {
    const trimmed = newPresetInput.trim();
    if (trimmed && !customPresets.includes(trimmed)) {
      setCustomPresets([...customPresets, trimmed]);
      setNewPresetInput('');
      setShowAddCustom(false);
    }
  };

  // 删除自定义快捷意见
  const handleDeleteCustomPreset = (presetToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomPresets(customPresets.filter((p) => p !== presetToDelete));
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
        {/* Modal Header (Draggable Handle) */}
        <div
          onMouseDown={handleMouseDown}
          className="bg-[#323130] dark:bg-[#252526] text-white p-3 flex items-center justify-between border-b border-[#D83B01] cursor-grab active:cursor-grabbing select-none shrink-0"
          title="按住此处可任意拖拽弹窗位置"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#D83B01] text-white flex items-center justify-center font-black shadow-xs shrink-0">
              <Sparkles size={15} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-white">新增 PPT 页面修改意见</h3>
                <span className="text-[9px] bg-white/15 text-amber-300 px-1 py-0.2 rounded font-bold flex items-center gap-0.5 border border-white/10">
                  <Move size={9} />
                  <span>按住可拖动</span>
                </span>
              </div>
              <p className="text-[9px] text-[#A19F9D] font-bold uppercase tracking-wider">写入 PPT CustomXML Storage</p>
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
              onClick={closeAddModal}
              className="p-1 text-[#A19F9D] hover:text-white hover:bg-white/10 rounded transition-colors"
              title="关闭"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 flex-1 overflow-y-auto min-h-0">
          {/* Target Slide Selector */}
          <div>
            <label className="block text-[10px] font-bold text-[#605E5C] dark:text-[#a0a0a0] uppercase tracking-wider mb-1">
              修改目标幻灯片页面
            </label>
            <select
              value={targetSlideId}
              onChange={handleSlideChange}
              className="w-full bg-[#FAF9F8] dark:bg-[#2d2d2d] border border-[#D2D0CE] dark:border-[#383838] rounded p-2 text-xs font-bold text-[#323130] dark:text-[#f3f2f1] focus:outline-none focus:border-[#D83B01] cursor-pointer shadow-xs"
            >
              {slides.map((s) => (
                <option key={s.id} value={s.id} className="bg-white dark:bg-[#252526] text-[#323130] dark:text-[#f3f2f1]">
                  第 {s.pageNumber < 10 ? `0${s.pageNumber}` : s.pageNumber} 页 - {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Choice - All Chinese */}
          <div>
            <label className="block text-[10px] font-bold text-[#605E5C] dark:text-[#a0a0a0] uppercase tracking-wider mb-1">
              修改优先级
            </label>
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
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>高优先级 (紧迫)</span>
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
                <span>中优先级 (常规)</span>
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
                <span>低优先级 (细节)</span>
              </button>
            </div>
          </div>



          {/* Comment Content Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold text-[#605E5C] dark:text-[#a0a0a0] uppercase tracking-wider">
                批注修改要求描述 *
              </label>
              <span className="text-[9px] text-[#A19F9D] font-bold">例如：增加近三年销售趋势</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={3}
              placeholder="请输入清晰明确的批注要求，例如：“增加近三年销售趋势分析”、“补充图表注释”、“修改标题对齐”..."
              className="w-full bg-[#FAF9F8] dark:bg-[#2d2d2d] border border-[#D2D0CE] dark:border-[#383838] rounded p-2.5 text-xs text-[#323130] dark:text-[#f3f2f1] font-medium placeholder-[#A19F9D] focus:outline-none focus:border-[#D83B01] leading-relaxed shadow-xs"
            />
          </div>

          {/* Reference Image Attachment Section */}
          <div className="space-y-2 bg-[#FAF9F8] dark:bg-[#252526] p-2.5 rounded-lg border border-[#EDEBE9] dark:border-[#383838]">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold text-[#323130] uppercase tracking-wider flex items-center gap-1">
                <ImageIcon size={13} className="text-[#D83B01]" />
                <span>补充参考图 / 修改示意图 (支持添加多张)</span>
                {imageUrls.length > 0 && (
                  <span className="text-[9px] text-[#D83B01] font-bold bg-[#D83B01]/10 px-1.5 py-0.2 rounded-full">
                    已选 {imageUrls.length} 张
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

              {/* Upload Drop Zone & Add More Button */}
              <div className="flex gap-2 items-center">
                <label className="flex-1 flex flex-col items-center justify-center h-16 border-2 border-dashed border-[#D2D0CE] hover:border-[#D83B01] bg-white rounded-lg cursor-pointer transition-colors p-1.5">
                  <div className="flex items-center gap-1.5 text-center">
                    <Upload size={16} className="text-[#A19F9D]" />
                    <span className="text-[10px] font-bold text-[#605E5C]">
                      {imageUrls.length > 0 ? '+ 继续添加更多示意图' : '点击或拖拽上传修改示意图 (支持多选)'}
                    </span>
                  </div>
                  <span className="text-[8px] text-[#A19F9D] mt-0.5">支持 PNG, JPG, WEBP (可一次选择多张)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Sample Preset Images for Quick Testing */}
              <div className="space-y-1 pt-1">
                <span className="text-[9px] text-[#A19F9D] font-bold uppercase tracking-wider block">
                  或点击加入常用排版示范图:
                </span>
                <div className="flex flex-wrap gap-1">
                  {sampleReferenceImages.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addSampleImage(sample.url)}
                      className="text-[9px] font-bold bg-white hover:bg-[#D83B01]/10 text-[#605E5C] hover:text-[#D83B01] px-2 py-0.5 rounded border border-[#EDEBE9] transition-colors flex items-center gap-1"
                    >
                      <ImageIcon size={9} />
                      <span>+ {sample.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Smart Text Context Ideas */}
          <div className="space-y-2 bg-[#FAF9F8] p-2.5 rounded-lg border border-[#EDEBE9]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Sparkles size={12} className="text-[#D83B01]" />
                <span className="text-[10px] font-bold text-[#323130] dark:text-[#f3f2f1] uppercase tracking-wider">
                  智能解析当前第 {selectedSlide?.pageNumber < 10 ? `0${selectedSlide?.pageNumber}` : selectedSlide?.pageNumber} 页相关灵感:
                </span>
              </div>
              <span className="text-[8px] text-[#A19F9D]">点击可追加到现有意见末尾</span>
            </div>

            {/* Slide Context Ideas List */}
            <div className="flex flex-wrap gap-1">
              {contextualIdeas.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => appendPresetToContent(preset)}
                  className="text-[9px] font-bold bg-white hover:bg-[#D83B01]/10 text-[#605E5C] hover:text-[#D83B01] px-2 py-1 rounded border border-[#EDEBE9] transition-colors text-left max-w-full leading-tight"
                >
                  + {preset}
                </button>
              ))}
            </div>

            {/* Custom Presets Library */}
            <div className="pt-2 border-t border-[#EDEBE9] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#605E5C] uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare size={11} className="text-[#605E5C]" />
                  自定义常用批注库:
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddCustom(!showAddCustom)}
                  className="text-[9px] font-bold text-[#D83B01] hover:underline flex items-center gap-0.5"
                >
                  <Plus size={10} />
                  <span>{showAddCustom ? '收起' : '新增自定义意见'}</span>
                </button>
              </div>

              {/* Add Custom Preset Input */}
              {showAddCustom && (
                <div className="flex items-center gap-1.5 my-1">
                  <input
                    type="text"
                    value={newPresetInput}
                    onChange={(e) => setNewPresetInput(e.target.value)}
                    placeholder="输入常用自定义意见，例如：统一标题字体..."
                    className="flex-1 bg-white border border-[#D2D0CE] rounded px-2 py-1 text-[10px] font-medium text-[#323130] focus:outline-none focus:border-[#D83B01]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomPreset}
                    disabled={!newPresetInput.trim()}
                    className="px-2 py-1 bg-[#323130] hover:bg-black text-white rounded text-[10px] font-bold disabled:opacity-50 cursor-pointer"
                  >
                    添加保存
                  </button>
                </div>
              )}

              {/* Custom Presets Chips */}
              <div className="flex flex-wrap gap-1">
                {customPresets.map((customPreset, idx) => (
                  <div
                    key={idx}
                    onClick={() => appendPresetToContent(customPreset)}
                    className="group cursor-pointer text-[9px] font-bold bg-[#FAF9F8] hover:bg-[#D83B01]/10 text-[#323130] hover:text-[#D83B01] px-2 py-0.5 rounded border border-[#D2D0CE] flex items-center gap-1 transition-colors"
                  >
                    <span>+ {customPreset}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustomPreset(customPreset, e)}
                      className="text-[#A19F9D] hover:text-red-600 p-0.5 rounded"
                      title="删除此常用灵感"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#EDEBE9]">
            <button
              type="button"
              onClick={closeAddModal}
              className="px-3 py-1.5 rounded border border-[#D2D0CE] text-[10px] font-bold uppercase tracking-wider text-[#605E5C] hover:bg-[#FAF9F8] transition-colors"
            >
              取消
            </button>

            <button
              type="submit"
              disabled={!content.trim()}
              className="px-4 py-1.5 rounded bg-[#D83B01] hover:bg-[#B7472A] disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Send size={13} />
              <span>保存批注至 PPT 内部</span>
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

