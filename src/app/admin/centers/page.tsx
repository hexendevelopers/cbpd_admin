"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Tag,
  Modal,
  Form,
  DatePicker,
  Drawer,
  Descriptions,
  Typography,
  Spin,
  Badge,
  notification,
  Dropdown,
  Menu,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  StopOutlined,
  MoreOutlined,
  FilterOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/AdminLayout";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;

interface Center {
  _id: string;
  centreCode: string;
  location: string;
  nameOfAffiliatedCentre: string;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
}

export default function CentersManagement() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    status: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const router = useRouter();
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCenters();
  }, [filters]);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.location && { location: filters.location }),
        ...(filters.status && { status: filters.status }),
      });

      const response = await fetch(`/api/admin/centers?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setCenters(data.centers);
        setPagination(data.pagination);
      } else if (response.status === 403) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Error fetching centers:", error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch centers',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedCenters.length === 0) {
      notification.warning({
        message: 'No Selection',
        description: 'Please select centers first',
        placement: 'topRight',
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/centers", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          centerIds: selectedCenters,
          action,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        notification.success({
          message: 'Success',
          description: data.message,
          placement: 'topRight',
        });
        fetchCenters();
        setSelectedCenters([]);
      } else {
        const data = await response.json();
        notification.error({
          message: 'Error',
          description: data.error || 'Action failed',
          placement: 'topRight',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Network Error',
        description: 'Please try again',
        placement: 'topRight',
      });
    }
  };

  const handleCenterAction = async (centerId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/centers/${centerId}`, {
        method: action === "delete" ? "DELETE" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: action !== "delete" ? JSON.stringify({
          isActive: action === "activate"
        }) : undefined,
      });

      if (response.ok) {
        const data = await response.json();
        notification.success({
          message: 'Success',
          description: data.message,
          placement: 'topRight',
        });
        fetchCenters();
      } else {
        const data = await response.json();
        notification.error({
          message: 'Error',
          description: data.error || 'Action failed',
          placement: 'topRight',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Network Error',
        description: 'Please try again',
        placement: 'topRight',
      });
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
        expiryDate: values.expiryDate ? dayjs(values.expiryDate).toISOString() : null,
      };

      const url = isEditMode 
        ? `/api/admin/centers/${selectedCenter?._id}`
        : "/api/admin/centers";
      
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedValues),
      });

      if (response.ok) {
        const data = await response.json();
        notification.success({
          message: 'Success',
          description: data.message,
          placement: 'topRight',
        });
        setIsModalVisible(false);
        setSelectedCenter(null);
        form.resetFields();
        fetchCenters();
      } else {
        const data = await response.json();
        notification.error({
          message: 'Error',
          description: data.error || 'Operation failed',
          placement: 'topRight',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Network Error',
        description: 'Please try again',
        placement: 'topRight',
      });
    }
  };

  const getActionMenu = (record: Center) => (
    <Menu>
      <Menu.Item 
        key="view" 
        icon={<EyeOutlined />}
        onClick={() => {
          setSelectedCenter(record);
          setIsDrawerVisible(true);
        }}
      >
        View Details
      </Menu.Item>
      <Menu.Item 
        key="edit" 
        icon={<EditOutlined />}
        onClick={() => {
          setSelectedCenter(record);
          setIsEditMode(true);
          form.setFieldsValue({
            ...record,
            expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null,
          });
          setIsModalVisible(true);
        }}
      >
        Edit Center
      </Menu.Item>
      <Menu.Item 
        key="toggle" 
        icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
        onClick={() => handleCenterAction(record._id, record.isActive ? "deactivate" : "activate")}
      >
        {record.isActive ? "Deactivate" : "Activate"}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />}
        danger
        onClick={() => {
          Modal.confirm({
            title: 'Delete Center',
            content: 'Are you sure you want to delete this center? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: () => handleCenterAction(record._id, "delete"),
          });
        }}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const columns = [
    {
      title: "Centre Code",
      dataIndex: "centreCode",
      key: "centreCode",
      render: (text: string) => (
        <Text strong style={{ color: "#1a202c" }}>{text}</Text>
      ),
    },
    {
      title: "Centre Name",
      dataIndex: "nameOfAffiliatedCentre",
      key: "nameOfAffiliatedCentre",
      ellipsis: true,
      render: (text: string) => (
        <Text style={{ fontWeight: 500 }}>{text}</Text>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (text: string) => (
        <Text style={{ color: "#4a5568" }}>{text}</Text>
      ),
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date: string) => {
        const expired = isExpired(date);
        return (
          <Tag 
            color={expired ? "#ef4444" : "#22c55e"}
            style={{ borderRadius: 6, fontWeight: 500, border: "none" }}
          >
            {new Date(date).toLocaleDateString()}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      render: (record: Center) => {
        const expired = isExpired(record.expiryDate);
        let color = "#22c55e";
        let text = "Active";
        
        if (!record.isActive) {
          color = "#ef4444";
          text = "Inactive";
        } else if (expired) {
          color = "#f59e0b";
          text = "Expired";
        }
        
        return (
          <Tag 
            color={color}
            style={{ borderRadius: 6, fontWeight: 500, border: "none" }}
          >
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Center) => (
        <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
          <Button 
            type="text" 
            icon={<MoreOutlined />}
            style={{ borderRadius: 6 }}
          />
        </Dropdown>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedCenters,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedCenters(selectedRowKeys as string[]);
    },
  };

  const activeCenters = centers.filter(center => center.isActive).length;
  const expiredCenters = centers.filter(center => isExpired(center.expiryDate)).length;

  if (loading && !centers.length) {
    return (
      <AdminLayout>
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          height: "60vh",
          flexDirection: "column"
        }}>
          <Spin size="large" />
          <Text style={{ marginTop: 16, fontSize: 16, color: "#4a5568" }}>
            Loading Centers...
          </Text>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ padding: "24px" }}>
        {/* Header Section */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
                Centers Management
              </Title>
              <Text type="secondary">
                Manage affiliated centers and their details
              </Text>
            </div>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchCenters}
                style={{ borderRadius: 6 }}
              >
                Refresh
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setIsEditMode(false);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
                style={{ borderRadius: 6, background: "#2d3748", border: "none" }}
              >
                Add Center
              </Button>
            </Space>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <EnvironmentOutlined style={{ fontSize: 24, color: "#64748b" }} />
                  <Badge status="processing" text="Live" />
                </div>
                <Statistic
                  title="Total Centers"
                  value={centers.length}
                  valueStyle={{ fontWeight: 600, fontSize: 24, color: "#1a202c" }}
                />
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <CheckCircleOutlined style={{ fontSize: 24, color: "#22c55e" }} />
                  <Badge status="success" text="Active" />
                </div>
                <Statistic
                  title="Active Centers"
                  value={activeCenters}
                  valueStyle={{ fontWeight: 600, fontSize: 24, color: "#22c55e" }}
                />
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <CalendarOutlined style={{ fontSize: 24, color: "#f59e0b" }} />
                  <Badge status="warning" text="Expired" />
                </div>
                <Statistic
                  title="Expired Centers"
                  value={expiredCenters}
                  valueStyle={{ fontWeight: 600, fontSize: 24, color: "#f59e0b" }}
                />
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Filters Section */}
        <Card 
          title={
            <Space>
              <FilterOutlined />
              <span>Filter Centers</span>
            </Space>
          }
          style={{ marginBottom: 24, borderRadius: 8 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8} md={6}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Search Centers</Text>
              </div>
              <Input
                placeholder="Search by code, name, location..."
                prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                allowClear
                style={{ borderRadius: 6 }}
              />
            </Col>
            <Col xs={24} sm={8} md={4}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Location</Text>
              </div>
              <Input
                placeholder="Enter location"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value, page: 1 })}
                allowClear
                style={{ borderRadius: 6 }}
              />
            </Col>
            <Col xs={24} sm={8} md={4}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Status</Text>
              </div>
              <Select
                placeholder="Select status"
                style={{ width: "100%" }}
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
                allowClear
              >
                <Option value="active">
                  <CheckCircleOutlined style={{ color: "#22c55e", marginRight: 8 }} />
                  Active
                </Option>
                <Option value="inactive">
                  <StopOutlined style={{ color: "#ef4444", marginRight: 8 }} />
                  Inactive
                </Option>
                <Option value="expired">
                  <CalendarOutlined style={{ color: "#f59e0b", marginRight: 8 }} />
                  Expired
                </Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Bulk Actions */}
        {selectedCenters.length > 0 && (
          <Card 
            style={{ 
              marginBottom: 24,
              borderRadius: 8,
              border: "2px solid #2d3748",
              backgroundColor: "#f7f8fc",
            }}
          >
            <Space>
              <Text strong style={{ color: "#2d3748" }}>
                {selectedCenters.length} center{selectedCenters.length > 1 ? 's' : ''} selected
              </Text>
              <Button 
                type="primary"
                size="small"
                onClick={() => handleBulkAction("activate")}
                style={{ borderRadius: 6, background: "#22c55e", border: "none" }}
              >
                Activate
              </Button>
              <Button 
                size="small"
                onClick={() => handleBulkAction("deactivate")}
                style={{ borderRadius: 6 }}
              >
                Deactivate
              </Button>
            </Space>
          </Card>
        )}

        {/* Centers Table */}
        <Card
          title={
            <Space>
              <EnvironmentOutlined />
              <span>Centers List</span>
              <Badge count={pagination.total} style={{ backgroundColor: "#64748b" }} />
            </Space>
          }
          style={{ borderRadius: 8, marginBottom: 24 }}
        >
          <Table
            columns={columns}
            dataSource={centers}
            rowKey="_id"
            loading={loading}
            rowSelection={rowSelection}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} centers`,
              onChange: (page, pageSize) => {
                setFilters({ ...filters, page, limit: pageSize || 10 });
              },
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>

      {/* Center Details Drawer */}
      <Drawer
        title={
          <Space>
            <EnvironmentOutlined style={{ color: "#64748b" }} />
            <span>Center Details</span>
          </Space>
        }
        placement="right"
        width={600}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        {selectedCenter && (
          <div>
            <div style={{ 
              textAlign: "center", 
              marginBottom: 24,
              padding: 24,
              background: "#f7f8fc",
              borderRadius: 8,
              border: "1px solid #e2e8f0"
            }}>
              <EnvironmentOutlined style={{ fontSize: 48, color: "#64748b", marginBottom: 16 }} />
              <Title level={4} style={{ marginBottom: 8 }}>
                {selectedCenter.nameOfAffiliatedCentre}
              </Title>
              <Text strong style={{ fontSize: 16, color: "#2d3748" }}>
                {selectedCenter.centreCode}
              </Text>
            </div>

            <Card 
              title="Center Information" 
              style={{ marginBottom: 16, borderRadius: 8 }}
              size="small"
            >
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Centre Code">
                  <Text strong copyable>{selectedCenter.centreCode}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Centre Name">
                  <Text strong>{selectedCenter.nameOfAffiliatedCentre}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Location">
                  {selectedCenter.location}
                </Descriptions.Item>
                <Descriptions.Item label="Expiry Date">
                  <Tag 
                    color={isExpired(selectedCenter.expiryDate) ? "#ef4444" : "#22c55e"}
                    style={{ borderRadius: 6, fontWeight: 500, border: "none" }}
                  >
                    {new Date(selectedCenter.expiryDate).toLocaleDateString()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag 
                    color={selectedCenter.isActive ? "#22c55e" : "#ef4444"}
                    style={{ borderRadius: 6, fontWeight: 500, border: "none" }}
                  >
                    {selectedCenter.isActive ? "Active" : "Inactive"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {new Date(selectedCenter.createdAt).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Space style={{ width: "100%", justifyContent: "center" }}>
              <Button 
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setIsEditMode(true);
                  form.setFieldsValue({
                    ...selectedCenter,
                    expiryDate: selectedCenter.expiryDate ? dayjs(selectedCenter.expiryDate) : null,
                  });
                  setIsModalVisible(true);
                  setIsDrawerVisible(false);
                }}
                style={{ borderRadius: 6, background: "#2d3748", border: "none" }}
              >
                Edit Center
              </Button>
              <Button 
                onClick={() => handleCenterAction(selectedCenter._id, selectedCenter.isActive ? "deactivate" : "activate")}
                style={{ borderRadius: 6 }}
              >
                {selectedCenter.isActive ? "Deactivate" : "Activate"}
              </Button>
            </Space>
          </div>
        )}
      </Drawer>

      {/* Add/Edit Center Modal */}
      <Modal
        title={
          <Space>
            {isEditMode ? <EditOutlined /> : <PlusOutlined />}
            <span>{isEditMode ? "Edit Center" : "Add New Center"}</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedCenter(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 24 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="centreCode"
                label="Centre Code"
                rules={[{ required: true, message: "Please enter centre code" }]}
              >
                <Input 
                  placeholder="Enter centre code"
                  style={{ borderRadius: 6 }} 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true, message: "Please enter location" }]}
              >
                <Input 
                  placeholder="Enter location"
                  style={{ borderRadius: 6 }} 
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="nameOfAffiliatedCentre"
            label="Name of Affiliated Centre"
            rules={[{ required: true, message: "Please enter centre name" }]}
          >
            <Input 
              placeholder="Enter centre name"
              style={{ borderRadius: 6 }} 
            />
          </Form.Item>

          <Form.Item
            name="expiryDate"
            label="Expiry Date"
            rules={[{ required: true, message: "Please select expiry date" }]}
          >
            <DatePicker 
              style={{ width: "100%", borderRadius: 6 }}
              placeholder="Select expiry date"
            />
          </Form.Item>

          <Form.Item style={{ textAlign: "center", marginTop: 24 }}>
            <Space size="large">
              <Button 
                type="primary" 
                htmlType="submit"
                size="large"
                style={{ borderRadius: 6, minWidth: 120, background: "#2d3748", border: "none" }}
              >
                {isEditMode ? "Update Center" : "Add Center"}
              </Button>
              <Button 
                size="large"
                onClick={() => {
                  setIsModalVisible(false);
                  setSelectedCenter(null);
                  form.resetFields();
                }}
                style={{ borderRadius: 6, minWidth: 120 }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}