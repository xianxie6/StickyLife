import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { saveTestDataToStorage, clearTestData, generateTestData } from './utils/testDataGenerator'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// 开发模式：在控制台暴露测试数据工具
if (import.meta.env.DEV) {
  (window as any).StickyLifeTestData = {
    /**
     * 生成并保存测试数据
     * 使用方法：在浏览器控制台输入 StickyLifeTestData.load()
     */
    load: () => {
      saveTestDataToStorage();
      console.log('💡 提示：刷新页面即可看到测试数据');
      return '测试数据已加载，请刷新页面';
    },
    
    /**
     * 清除所有测试数据
     * 使用方法：在浏览器控制台输入 StickyLifeTestData.clear()
     */
    clear: () => {
      clearTestData();
      console.log('💡 提示：刷新页面即可看到空状态');
      return '测试数据已清除，请刷新页面';
    },
    
    /**
     * 查看测试数据结构（不保存）
     * 使用方法：在浏览器控制台输入 StickyLifeTestData.preview()
     */
    preview: () => {
      const data = generateTestData();
      console.log('📊 测试数据预览:', data);
      console.log('📝 周计划数量:', data.weeks.length);
      console.log('📋 任务数量:', data.tasks.length);
      return data;
    },
  };
  
  console.log('🧪 测试数据工具已加载！');
  console.log('📖 使用方法：');
  console.log('  - StickyLifeTestData.load()    // 加载测试数据');
  console.log('  - StickyLifeTestData.clear()   // 清除测试数据');
  console.log('  - StickyLifeTestData.preview() // 预览测试数据');
}


