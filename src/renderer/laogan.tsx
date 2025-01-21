import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, Card, message, Upload } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';

const { Dragger } = Upload;

function getCurrentTime() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function processExcelData(data: any[][]): any[][] {
  const rows = data;

  console.log('data', data);

  const updateRows = rows.map((row) => {
    return {
      name: row[0],
      value: row[1],
    };
  });

  const originRows = rows.map((row) => {
    return {
      name: row[4],
      value: row[5],
    };
  });

  const matchRows = updateRows.map((row) => {
    const matchRow = originRows.find(
      (r) => r.name?.trim() === row.name?.trim(),
    );
    if (matchRow) {
      row.value = matchRow.value;
    }
    return row;
  });

  const execRows = originRows.filter((row) => {
    const matchRow = updateRows.find(
      (r) => r.name?.trim() === row.name?.trim(),
    );
    return !matchRow;
  });

  const buildRows = matchRows.map((row, index) => {
    return [
      row.name,
      row.value,
      '', // Placeholder for any additional columns
      '',
      originRows[index] ? originRows[index].name : '',
      originRows[index] ? originRows[index].value : '',
      '',
      '',
      execRows[index] ? execRows[index].name : '',
      execRows[index] ? execRows[index].value : '',
    ];
  });

  return [...buildRows];
}

function exportToXlsx(data: any[][], filename: string) {
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, filename);
}

function LaoGan() {
  const [processedData, setProcessedData] = useState<any[][] | null>(null);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload(file) {
      const isXlsx =
        file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (!isXlsx) {
        message.error('只能上传 XLSX 文件!');
      }
      return isXlsx || Upload.LIST_IGNORE;
    },
    onChange(info) {
      const { status, originFileObj } = info.file;
      if (status === 'done' || status === 'uploading') {
        if (originFileObj) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Process the data
            const updatedData = processExcelData(jsonData);
            setProcessedData(updatedData);
            console.log(updatedData);
          };
          reader.readAsArrayBuffer(originFileObj);
        }
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <div>
      <Card title="老干" extra={<Link to="/">返回首页</Link>}>
        <Dragger
          name={uploadProps.name}
          multiple={uploadProps.multiple}
          beforeUpload={uploadProps.beforeUpload}
          onChange={uploadProps.onChange}
          onDrop={uploadProps.onDrop}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">选择或拖拽文件到此区域上传</p>
        </Dragger>
        {processedData && (
          <Button
            type="primary"
            onClick={() =>
              exportToXlsx(processedData, `老干_${getCurrentTime()}.xlsx`)
            }
            style={{ marginTop: 16 }}
          >
            下载处理后的文件
          </Button>
        )}
      </Card>
    </div>
  );
}

export default LaoGan;
