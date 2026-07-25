/**
 * Office.js Production Migration Guide & Code Snippet
 * 生产环境使用真实 Office.js Custom XML Parts API 替代 MockStorage 的代码示例
 */

export const OFFICE_JS_MIGRATION_DOC = {
  title: '生产环境 Office.js API 替换指南 (V2 升级)',
  description: '当前原型通过 mockOfficeStorage 模拟 Custom XML Parts。发布为真实 Office 插件时，请按照以下步骤替换。',
  steps: [
    {
      step: 1,
      title: '在 index.html 引入 Office.js 脚本',
      code: `<script src="https://appsforoffice.microsoft.com/lib/1/hosted/office.js"></script>`,
    },
    {
      step: 2,
      title: '初始化 Office 环境',
      code: `Office.onReady((info) => {
  if (info.host === Office.HostType.PowerPoint) {
    console.log("运行在真实 PowerPoint 任务窗格中");
    // 加载内嵌数据
    loadReviewDataFromCustomXml();
  }
});`,
    },
    {
      step: 3,
      title: '从 PPT 文件提取 Custom XML Part (读取内嵌数据)',
      code: `async function readReviewDataFromPPT(): Promise<ReviewData | null> {
  return new Promise((resolve, reject) => {
    Office.context.document.customXmlParts.getByNamespaceAsync(
      "http://schemas.ppt-review.com/reviewData",
      (result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded && result.value.length > 0) {
          const xmlPart = result.value[0];
          xmlPart.getXmlAsync((xmlResult) => {
            if (xmlResult.status === Office.AsyncResultStatus.Succeeded) {
              const xmlContent = xmlResult.value;
              // 从 XML 中解析出内嵌 JSON
              const jsonStr = extractJsonFromXml(xmlContent);
              resolve(JSON.parse(jsonStr));
            } else {
              resolve(null);
            }
          });
        } else {
          resolve(null); // 该 PPT 未内嵌审阅数据
        }
      }
    );
  });
}`,
    },
    {
      step: 4,
      title: '写回 Custom XML Part 到 PPT 文件 (保存内嵌数据)',
      code: `async function saveReviewDataToPPT(data: ReviewData): Promise<boolean> {
  const xmlContent = \`<ReviewPart xmlns="http://schemas.ppt-review.com/reviewData">
    <Data><![CDATA[\${JSON.stringify(data)}]]></Data>
  </ReviewPart>\`;

  return new Promise((resolve) => {
    // 先检查是否存在旧的 Custom XML Part
    Office.context.document.customXmlParts.getByNamespaceAsync(
      "http://schemas.ppt-review.com/reviewData",
      (result) => {
        if (result.value && result.value.length > 0) {
          // 删除旧 Part 并添加新 Part
          result.value[0].deleteAsync(() => {
            Office.context.document.customXmlParts.addAsync(xmlContent, () => resolve(true));
          });
        } else {
          Office.context.document.customXmlParts.addAsync(xmlContent, () => resolve(true));
        }
      }
    );
  });
}`,
    },
  ],
};
