"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Button,
  message,
  Dropdown,
  Modal,
  Space,
  Input,
  Form,
  Select,
} from "antd";
import { DownOutlined, ExclamationCircleOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import AdminLayout from "@/components/AdminLayout";

const { Title, Text } = Typography;
const { confirm } = Modal;
const { TextArea } = Input;

interface CertificateRequest {
  _id: string;
  institutionId: string;
  instituteName: string;
  programmeName: string;
  batchNumber: string;
  numberOfLearners: number;
  examCompletedDate: string;
  message: string;
  adminReply?: string;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  "Pending",
  "Under Review",
  "Under Processing",
  "Approved",
  "Printing in Progress",
  "Ready for Dispatch",
  "Dispatched",
  "Collected",
  "Completed",
  "Rejected",
];

const PREDEFINED_REPLIES: Record<string, string> = {
  "Under Processing": "Your certificates are currently under processing. Final review is ongoing.",
  "Printing in Progress": "Your certificates are currently being printed.",
  "Approved": "Your certificate request has been approved.",
  "Ready for Dispatch": "Certificates are ready for dispatch. Expected dispatch date: [DD/MM/YYYY].",
  "Dispatched": "Your certificates have been dispatched. Please collect from your channel partner office.",
  "Completed": "Your certificate request has been successfully completed.",
  "Collected": "Certificates have been marked as collected.",
  "Rejected": "Unfortunately, your certificate request has been rejected. Please contact support for more details.",
  "Under Review": "Your request is currently under review by our team.",
};

export default function CertificateRequestsPage() {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<CertificateRequest | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/certificate-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setRequests(data.data);
      } else {
        message.error("Failed to load certificate requests");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      message.error("An error occurred while fetching requests");
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (record: CertificateRequest) => {
    setCurrentRequest(record);
    form.setFieldsValue({
      status: record.status,
      adminReply: record.adminReply || "",
    });
    setIsModalVisible(true);
  };

  const handleStatusChange = (newStatus: string) => {
    if (PREDEFINED_REPLIES[newStatus]) {
      form.setFieldsValue({ adminReply: PREDEFINED_REPLIES[newStatus] });
    }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!currentRequest) return;
      
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/certificate-requests/${currentRequest._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          status: values.status,
          adminReply: values.adminReply
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        message.success(`Status updated successfully`);
        setIsModalVisible(false);
        fetchRequests();
      } else {
        message.error(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("An error occurred while updating status");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    confirm({
      title: 'Are you sure you want to delete this request?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("adminToken");
          const response = await fetch(`/api/admin/certificate-requests/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          
          if (data.success) {
            message.success("Request deleted successfully");
            fetchRequests();
          } else {
            message.error(data.error || "Failed to delete request");
          }
        } catch (error) {
          console.error("Error deleting request:", error);
          message.error("An error occurred while deleting the request");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "default";
      case "Under Review": return "orange";
      case "Under Processing": return "blue";
      case "Approved": return "cyan";
      case "Printing in Progress": return "geekblue";
      case "Ready for Dispatch": return "purple";
      case "Dispatched": return "magenta";
      case "Collected": return "green";
      case "Completed": return "success";
      case "Rejected": return "red";
      default: return "default";
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: CertificateRequest, b: CertificateRequest) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Institute",
      dataIndex: "instituteName",
      key: "instituteName",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Programme",
      dataIndex: "programmeName",
      key: "programmeName",
    },
    {
      title: "Batch",
      dataIndex: "batchNumber",
      key: "batchNumber",
    },
    {
      title: "Learners",
      dataIndex: "numberOfLearners",
      key: "numberOfLearners",
    },
    {
      title: "Exam Date",
      dataIndex: "examCompletedDate",
      key: "examCompletedDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
      filters: STATUS_OPTIONS.map(s => ({ text: s, value: s })),
      onFilter: (value: any, record: CertificateRequest) => record.status === value,
    },
    {
      title: "Admin Reply",
      dataIndex: "adminReply",
      key: "adminReply",
      render: (text: string) => text ? <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 200 }}>{text}</Text> : <Text type="secondary">No reply</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: CertificateRequest) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => openStatusModal(record)} 
            size="small"
          >
            Update
          </Button>
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record._id)} 
            size="small"
          />
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div style={{ padding: "0 24px" }}>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Certificate Requests
          </Title>
          <Text type="secondary">
            Manage certificate printing and dispatch requests from institutions.
          </Text>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="_id"
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} requests`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
      
      <Modal
        title={`Update Status - ${currentRequest?.instituteName} (Batch ${currentRequest?.batchNumber})`}
        open={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText="Save Update"
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="status" 
            label="Certificate Request Status"
            rules={[{ required: true, message: "Please select a status" }]}
          >
            <Select 
              placeholder="Select Status" 
              onChange={handleStatusChange}
              options={STATUS_OPTIONS.map(s => ({ label: s, value: s }))}
            />
          </Form.Item>
          
          <Form.Item 
            name="adminReply" 
            label="Admin Reply (Institution will see this)"
          >
            <TextArea 
              rows={4} 
              placeholder="Enter your reply message here..." 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
    </AdminLayout>
  );
}
