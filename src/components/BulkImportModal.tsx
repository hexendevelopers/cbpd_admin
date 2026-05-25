import React, { useState } from 'react';
import { Modal, Select, Button, Upload, Table, notification, message } from 'antd';
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const { Dragger } = Upload;
const { Option } = Select;

interface BulkImportModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  institutions: Array<{ _id: string; orgName: string }>;
}

export default function BulkImportModal({ visible, onCancel, onSuccess, institutions }: BulkImportModalProps) {
  const [institutionId, setInstitutionId] = useState<string>('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const downloadTemplate = () => {
    const headers = [
      'Full Name', 'Gender', 'Phone Number', 'Date of Birth (YYYY-MM-DD)', 
      'Joining Date (YYYY-MM-DD)', 'State', 'District', 'Course', 
      'Department', 'Semester', 'Admission Number'
    ];
    
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students Template");
    XLSX.writeFile(wb, "students_import_template.xlsx");
  };

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      
      const mappedData = json.map((row: any) => ({
        fullName: row['Full Name'],
        gender: row['Gender'],
        phoneNumber: row['Phone Number']?.toString(),
        dateOfBirth: row['Date of Birth (YYYY-MM-DD)'],
        joiningDate: row['Joining Date (YYYY-MM-DD)'],
        state: row['State'],
        district: row['District'],
        currentCourse: row['Course'],
        department: row['Department'],
        semester: row['Semester']?.toString(),
        admissionNumber: row['Admission Number']?.toString(),
      }));

      setPreviewData(mappedData);
    };
    reader.readAsArrayBuffer(file);
    return false; // Prevent auto upload
  };

  const submitImport = async () => {
    if (!institutionId) {
      notification.error({ message: 'Error', description: 'Please select an institution' });
      return;
    }

    if (previewData.length === 0) {
      notification.error({ message: 'Error', description: 'Please upload a valid excel file with data' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/students/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: previewData, institutionId })
      });

      const data = await response.json();

      if (response.ok) {
        notification.success({ message: 'Success', description: data.message });
        setPreviewData([]);
        setInstitutionId('');
        onSuccess();
      } else {
        notification.error({ 
          message: 'Import Failed', 
          description: data.error || 'Failed to import students',
          duration: 10
        });
      }
    } catch (error) {
      notification.error({ message: 'Network Error', description: 'Failed to connect to the server' });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Full Name', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Admission No', dataIndex: 'admissionNumber', key: 'admissionNumber' },
    { title: 'Course', dataIndex: 'currentCourse', key: 'currentCourse' },
    { title: 'Phone', dataIndex: 'phoneNumber', key: 'phoneNumber' },
  ];

  return (
    <Modal
      title="Bulk Import Learners"
      open={visible}
      onCancel={() => {
        setPreviewData([]);
        setInstitutionId('');
        onCancel();
      }}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>Cancel</Button>,
        <Button key="submit" type="primary" loading={loading} onClick={submitImport} disabled={previewData.length === 0 || !institutionId}>
          Import {previewData.length > 0 ? `${previewData.length} Students` : ''}
        </Button>
      ]}
    >
      <div style={{ marginBottom: 20 }}>
        <h4>1. Select Institution</h4>
        <Select
          showSearch
          style={{ width: '100%' }}
          placeholder="Select an institution"
          optionFilterProp="children"
          onChange={setInstitutionId}
          value={institutionId || undefined}
        >
          {institutions.map(inst => (
            <Option key={inst._id} value={inst._id}>{inst.orgName}</Option>
          ))}
        </Select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h4>2. Download Template</h4>
        <p style={{ color: '#666', fontSize: '13px' }}>Download the required excel template, fill in the student details, and save it.</p>
        <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>
          Download Excel Template
        </Button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h4>3. Upload Data</h4>
        <Dragger 
          accept=".xlsx,.xls,.csv"
          beforeUpload={handleUpload}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p className="ant-upload-text">Click or drag Excel file to this area to upload</p>
        </Dragger>
      </div>

      {previewData.length > 0 && (
        <div>
          <h4>Preview ({previewData.length} records found)</h4>
          <Table 
            dataSource={previewData.slice(0, 5)} 
            columns={columns} 
            pagination={false} 
            size="small" 
            rowKey={(r, i) => i?.toString() || Math.random().toString()}
          />
          {previewData.length > 5 && (
            <p style={{ textAlign: 'center', marginTop: 10, color: '#666', fontSize: 12 }}>
              Showing 5 of {previewData.length} records
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
