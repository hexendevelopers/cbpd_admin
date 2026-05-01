"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Typography,
  Spin,
  notification,
  Modal,
  Form,
  Drawer,
  Descriptions,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/AdminLayout";

const { Title, Text } = Typography;

interface StudentCertificate {
  _id: string;
  name: string;
  regNumber: string;
  certNumber: string;
  learnerNumber: string;
  createdAt: string;
}

export default function StudentCertificatesList() {
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortConfig, setSortConfig] = useState({ field: "createdAt", order: "descend" });
  
  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Drawer (View Details)
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<StudentCertificate | null>(null);

  // Modal (Edit)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(searchInput);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  useEffect(() => {
    fetchCertificates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, searchQuery, sortConfig.field, sortConfig.order]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.pageSize.toString(),
        ...(searchQuery && { search: searchQuery }),
        sortBy: sortConfig.field,
        order: sortConfig.order === "ascend" ? "asc" : "desc",
      });

      const response = await fetch(`/api/admin/student-certificates?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setCertificates(data.certificates);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
        }));
      } else if (response.status === 403) {
        router.push("/admin/login");
      } else {
        notification.error({ message: "Failed to fetch certificates" });
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
      notification.error({ message: "Network Error" });
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination: any, filters: any, sorter: any) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
    if (sorter && sorter.field) {
      setSortConfig({ field: sorter.field, order: sorter.order || "descend" });
    }
  };

  const handleView = (record: StudentCertificate) => {
    setSelectedCertificate(record);
    setIsDrawerVisible(true);
  };

  const handleEdit = (record: StudentCertificate) => {
    setSelectedCertificate(record);
    form.setFieldsValue({
      name: record.name,
      regNumber: record.regNumber,
      certNumber: record.certNumber,
      learnerNumber: record.learnerNumber,
    });
    setIsEditModalVisible(true);
  };

  const submitEdit = async (values: any) => {
    if (!selectedCertificate) return;
    
    try {
      setEditLoading(true);
      const response = await fetch(`/api/admin/student-certificates/${selectedCertificate._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        notification.success({ message: "Certificate updated successfully" });
        setIsEditModalVisible(false);
        fetchCertificates();
      } else {
        const data = await response.json();
        notification.error({ message: data.error || "Failed to update certificate" });
      }
    } catch (error) {
      console.error("Error updating:", error);
      notification.error({ message: "Network Error" });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Delete Certificate",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: "Are you sure you want to delete this certificate? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const response = await fetch(`/api/admin/student-certificates/${id}`, {
            method: "DELETE",
          });
          if (response.ok) {
            notification.success({ message: "Certificate deleted successfully" });
            fetchCertificates();
          } else {
            const data = await response.json();
            notification.error({ message: data.error || "Failed to delete" });
          }
        } catch (error) {
          notification.error({ message: "Network Error" });
        }
      },
    });
  };

  const columns = [
    {
      title: "Student Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (text: string) => <Text style={{ fontWeight: 500 }}>{text}</Text>,
    },
    {
      title: "Registration Number",
      dataIndex: "regNumber",
      key: "regNumber",
      sorter: true,
    },
    {
      title: "Certificate Number",
      dataIndex: "certNumber",
      key: "certNumber",
      sorter: true,
    },
    {
      title: "Learner Number",
      dataIndex: "learnerNumber",
      key: "learnerNumber",
      sorter: true,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: StudentCertificate) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: "#1890ff" }} />}
            onClick={() => handleView(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#faad14" }} />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />}
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div style={{ padding: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
              Student Certificates
            </Title>
            <Text type="secondary">Manage student certificate verifications</Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchCertificates}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push("/admin/student-certificates/add")}
            >
              Add Certificate
            </Button>
          </Space>
        </div>

        <Card style={{ borderRadius: 8, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
            <Input
              placeholder="Search by name, reg number, cert number..."
              allowClear
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ width: 350 }}
            />
          </div>

          <Table
            columns={columns}
            dataSource={certificates}
            rowKey="_id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
            }}
            onChange={handleTableChange}
            loading={loading}
          />
        </Card>
      </div>

      {/* View Drawer */}
      <Drawer
        title="Certificate Details"
        placement="right"
        width={500}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        {selectedCertificate && (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="Student Name">
              <Text strong>{selectedCertificate.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Registration Number">
              {selectedCertificate.regNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Certificate Number">
              {selectedCertificate.certNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Learner Number">
              {selectedCertificate.learnerNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Added On">
              {new Date(selectedCertificate.createdAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      {/* Edit Modal */}
      <Modal
        title="Edit Certificate"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={submitEdit}>
          <Form.Item
            name="name"
            label="Student Name"
            rules={[{ required: true, message: "Please enter the student's name" }]}
          >
            <Input placeholder="e.g. sandeep pradeep" />
          </Form.Item>

          <Form.Item
            name="regNumber"
            label="Registration Number"
            rules={[{ required: true, message: "Please enter registration number" }]}
          >
            <Input placeholder="e.g. 11025" />
          </Form.Item>

          <Form.Item
            name="certNumber"
            label="Certificate Number"
            rules={[{ required: true, message: "Please enter certificate number" }]}
          >
            <Input placeholder="e.g. cbpd/2025/hrm-3105" />
          </Form.Item>

          <Form.Item
            name="learnerNumber"
            label="Learner Number"
            rules={[{ required: true, message: "Please enter learner number" }]}
          >
            <Input placeholder="e.g. l-25-264" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsEditModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={editLoading}>
                Save Changes
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
