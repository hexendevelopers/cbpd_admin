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
} from "antd";
import { DownOutlined, ExclamationCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import AdminLayout from "@/components/AdminLayout";

const { Title, Text } = Typography;
const { confirm } = Modal;

interface CertificateRequest {
  _id: string;
  institutionId: string;
  instituteName: string;
  programmeName: string;
  batchNumber: string;
  numberOfLearners: number;
  examCompletedDate: string;
  message: string;
  status: "Pending" | "Processing" | "Completed" | "Rejected";
  createdAt: string;
}

export default function CertificateRequestsPage() {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);

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

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/certificate-requests/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      
      if (data.success) {
        message.success(`Status updated to ${newStatus}`);
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
      case "Pending": return "orange";
      case "Processing": return "blue";
      case "Completed": return "green";
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
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (text: string) => <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 200 }}>{text}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
      filters: [
        { text: 'Pending', value: 'Pending' },
        { text: 'Processing', value: 'Processing' },
        { text: 'Completed', value: 'Completed' },
        { text: 'Rejected', value: 'Rejected' },
      ],
      onFilter: (value: any, record: CertificateRequest) => record.status === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: CertificateRequest) => {
        const items = [
          {
            key: 'Pending',
            label: 'Mark as Pending',
            onClick: () => updateStatus(record._id, "Pending"),
            disabled: record.status === "Pending"
          },
          {
            key: 'Processing',
            label: 'Mark as Processing',
            onClick: () => updateStatus(record._id, "Processing"),
            disabled: record.status === "Processing"
          },
          {
            key: 'Completed',
            label: 'Mark as Completed',
            onClick: () => updateStatus(record._id, "Completed"),
            disabled: record.status === "Completed"
          },
          {
            key: 'Rejected',
            label: 'Mark as Rejected',
            onClick: () => updateStatus(record._id, "Rejected"),
            disabled: record.status === "Rejected"
          },
        ];

        return (
          <Space>
            <Dropdown menu={{ items }} trigger={['click']}>
              <Button size="small">
                Update Status <DownOutlined />
              </Button>
            </Dropdown>
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record._id)} 
              size="small"
            />
          </Space>
        );
      },
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
    </div>
    </AdminLayout>
  );
}
