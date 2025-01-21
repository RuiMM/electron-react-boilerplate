import { Card, Col, message, Row } from 'antd';
import { Link, Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import LaoGan from './laogan';
// import './App.css';

function Hello() {
  const downloadTemplate = () => {
    // Send a request to the main process to download the file
    window.electron?.ipcRenderer.sendMessage('download-file', 'laoganTmp.xlsx');

    // Listen for the response from the main process
    window.electron?.ipcRenderer.on('download-file-response', (response) => {
      if (response.success) {
        message.success(`File downloaded to: ${response.path}`);
      } else {
        message.error(`Download failed: ${response.error}`);
      }
    });
  };

  return (
    <div>
      <Row justify="start" gutter={[16, 16]}>
        <Col span={8}>
          <Card
            title="老干模块"
            extra={<Link to="laogan">前往</Link>}
            style={{ width: '100%' }}
          >
            <p>step1：上传文件</p>
            <p>step2：计算完毕点击下载即可</p>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="其他功能" style={{ width: '100%' }}>
            <p>尽请期待</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
        <Route path="/laogan" element={<LaoGan />} />
      </Routes>
    </Router>
  );
}
