import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 1. Font Awesome
import 'font-awesome/css/font-awesome.min.css'; 

// 2. Froala Editor 메인 CSS (필수)
import 'froala-editor/css/froala_editor.min.css';
import 'froala-editor/css/froala_style.min.css'; 

// 3. 플러그인 JS (순서는 상관없음)
import 'froala-editor/js/plugins/table.min.js';

// 4. 툴바의 아이콘이 표시되도록 해주는 필수 JS 파일
import 'froala-editor/js/froala_editor.min.js';

// 정렬 (Align) 기능
import 'froala-editor/js/plugins/align.min.js';

// color
import 'froala-editor/css/plugins/colors.min.css';
import 'froala-editor/js/plugins/colors.min.js';

import 'froala-editor/js/plugins/font_size.min.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();