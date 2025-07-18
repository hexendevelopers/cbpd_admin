"use client";

import { useState, useEffect, useCallback } from "react";
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
  Drawer,
  Descriptions,
  Avatar,
  Typography,
  Spin,
  Badge,
  Switch,
  Checkbox,
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
  UserOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  StopOutlined,
  MoreOutlined,
  KeyOutlined,
  MailOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/AdminLayout";

const { Option } = Select;
const { Title, Text } = Typography;

interface Admin {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  permissions: {
    institutions: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      approve: boolean;
    };
    students: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
    admins: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
  };
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

interface AdminFormData {
  username: string;
  email: string;
  fullName: string;
  role: string;
  password?: string;
  isActive: boolean;
}

interface AdminUpdateData {
  username?: string;
  email?: string;
  fullName?: string;
  role?: string;
  isActive?: boolean;
}

export default function AdminsManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
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

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.role && { role: filters.role }),
      });

      const response = await fetch(`/api/admin?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins);
        setPagination(data.pagination);
      } else if (response.status === 403) {
        router.push("/admin/login");
      }
    } catch (err) {
      console.error("Error fetching admins:", err);
      notification.error({
        message: "Error",
        description: "Failed to fetch admins",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, router]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleCreateAdmin = async (values: AdminFormData) => {
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const data = await response.json();
        notification.success({
          message: "Success",
          description: data.message,
          placement: "topRight",
        });
        setIsModalVisible(false);
        form.resetFields();
        fetchAdmins();
      } else {
        const data = await response.json();
        notification.error({
          message: "Error",
          description: data.error || "Failed to create admin",
          placement: "topRight",
        });
      }
    } catch (err) {
      console.error("Error creating admin:", err);
      notification.error({
        message: "Network Error",
        description: "Please try again",
        placement: "topRight",
      });
    }
  };

  const handleUpdateAdmin = async (
    adminId: string,
    updateData: AdminUpdateData
  ) => {
    try {
      const response = await fetch(`/api/admin/${adminId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        notification.success({
          message: "Success",
          description: data.message,
          placement: "topRight",
        });
        fetchAdmins();
      } else {
        const data = await response.json();
        notification.error({
          message: "Error",
          description: data.error || "Failed to update admin",
          placement: "topRight",
        });
      }
    } catch (err) {
      console.error("Error updating admin:", err);
      notification.error({
        message: "Network Error",
        description: "Please try again",
        placement: "topRight",
      });
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      const response = await fetch(`/api/admin/${adminId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        notification.success({
          message: "Success",
          description: data.message,
          placement: "topRight",
        });
        fetchAdmins();
      } else {
        const data = await response.json();
        notification.error({
          message: "Error",
          description: data.error || "Failed to delete admin",
          placement: "topRight",
        });
      }
    } catch (err) {
      console.error("Error deleting admin:", err);
      notification.error({
        message: "Network Error",
        description: "Please try again",
        placement: "topRight",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      super_admin: {
        color: "#ffc107",
        icon: <CrownOutlined />,
        text: "Super Admin",
      },
      admin: {
        color: "#495057",
        icon: <SafetyCertificateOutlined />,
        text: "Admin",
      },
      moderator: {
        color: "#28a745",
        icon: <UserOutlined />,
        text: "Moderator",
      },
    };

    const config =
      roleConfig[role as keyof typeof roleConfig] || roleConfig.moderator;

    return (
      <Tag
        color={config.color}
        style={{
          borderRadius: 6,
          fontWeight: 500,
        }}
      >
        {config.icon} {config.text}
      </Tag>
    );
  };

  const getActionMenu = (record: Admin) => (
    <Menu>
      <Menu.Item
        key="view"
        icon={<EyeOutlined />}
        onClick={() => {
          setSelectedAdmin(record);
          setIsDrawerVisible(true);
        }}
      >
        View Details
      </Menu.Item>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => {
          setSelectedAdmin(record);
          setIsEditMode(true);
          form.setFieldsValue(record);
          setIsModalVisible(true);
        }}
      >
        Edit Admin
      </Menu.Item>
      <Menu.Item
        key="toggle"
        icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
        onClick={() =>
          handleUpdateAdmin(record._id, { isActive: !record.isActive })
        }
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
            title: "Delete Admin",
            content:
              "Are you sure you want to delete this admin? This action cannot be undone.",
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk: () => handleDeleteAdmin(record._id),
          });
        }}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "Admin",
      key: "admin",
      render: (record: Admin) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ background: "#495057" }} />
          <div>
            <div style={{ fontWeight: 600 }}>{record.fullName}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              @{record.username}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => (
        <Text copyable style={{ fontWeight: 500 }}>
          {email}
        </Text>
      ),
    },
    {
      title: "Role",
      key: "role",
      render: (record: Admin) => getRoleBadge(record.role),
    },
    {
      title: "Status",
      key: "status",
      render: (record: Admin) => (
        <Tag
          color={record.isActive ? "success" : "error"}
          style={{ borderRadius: 6, fontWeight: 500 }}
        >
          {record.isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Last Login",
      dataIndex: "lastLogin",
      key: "lastLogin",
      render: (date: string) => (
        <Text style={{ fontWeight: 500 }}>
          {date ? new Date(date).toLocaleDateString() : "Never"}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Admin) => (
        <Dropdown overlay={getActionMenu(record)} trigger={["click"]}>
          <Button
            type="text"
            icon={<MoreOutlined />}
            style={{ borderRadius: 6 }}
          />
        </Dropdown>
      ),
    },
  ];

  const activeAdmins = admins.filter((admin) => admin.isActive).length;
  const superAdmins = admins.filter(
    (admin) => admin.role === "super_admin"
  ).length;

  if (loading && !admins.length) {
    return (
      <AdminLayout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
            flexDirection: "column",
          }}
        >
          <Spin size="large" />
          <Text style={{ marginTop: 16, fontSize: 16, color: "#666" }}>
            Loading Administrators...
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div>
              <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
                Administrators Management
              </Title>
              <Text type="secondary">
                Manage system administrators and their permissions
              </Text>
            </div>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchAdmins}
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
                style={{ borderRadius: 6 }}
              >
                Add Admin
              </Button>
            </Space>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 8, border: "1px solid #f0f0f0" }}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <UserOutlined style={{ fontSize: 24, color: "#495057" }} />
                  <Badge status="processing" text="Live" />
                </div>
                <Statistic
                  title="Total Admins"
                  value={admins.length}
                  valueStyle={{
                    fontWeight: 600,
                    fontSize: 24,
                    color: "#2c3e50",
                  }}
                />
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 8, border: "1px solid #f0f0f0" }}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <CheckCircleOutlined
                    style={{ fontSize: 24, color: "#28a745" }}
                  />
                  <Badge status="success" text="Active" />
                </div>
                <Statistic
                  title="Active Admins"
                  value={activeAdmins}
                  valueStyle={{
                    fontWeight: 600,
                    fontSize: 24,
                    color: "#28a745",
                  }}
                />
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 8, border: "1px solid #f0f0f0" }}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <CrownOutlined style={{ fontSize: 24, color: "#ffc107" }} />
                  <Text type="secondary">Super</Text>
                </div>
                <Statistic
                  title="Super Admins"
                  value={superAdmins}
                  valueStyle={{
                    fontWeight: 600,
                    fontSize: 24,
                    color: "#2c3e50",
                  }}
                />
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Filters Section */}
        <Card
          title={
            <Space>
              <SearchOutlined />
              <span>Filter Administrators</span>
            </Space>
          }
          style={{ marginBottom: 24, borderRadius: 8 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8} md={6}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Search Admins</Text>
              </div>
              <Input
                placeholder="Search by name, username, email..."
                prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value, page: 1 })
                }
                allowClear
                style={{ borderRadius: 6 }}
              />
            </Col>
            <Col xs={24} sm={8} md={4}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Role</Text>
              </div>
              <Select
                placeholder="Select role"
                style={{ width: "100%" }}
                value={filters.role}
                onChange={(value) =>
                  setFilters({ ...filters, role: value, page: 1 })
                }
                allowClear
              >
                <Option value="super_admin">
                  <CrownOutlined style={{ color: "#ffc107", marginRight: 8 }} />
                  Super Admin
                </Option>
                <Option value="admin">
                  <SafetyCertificateOutlined
                    style={{ color: "#495057", marginRight: 8 }}
                  />
                  Admin
                </Option>
                <Option value="moderator">
                  <UserOutlined style={{ color: "#28a745", marginRight: 8 }} />
                  Moderator
                </Option>
              </Select>
            </Col>
            {/* <Col xs={24} sm={8} md={3}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Status</Text>
              </div>
              <Select
                placeholder="Select status"
                style={{ width: "100%" }}
                value={filters.status}
                onChange={(value) =>
                  setFilters({ ...filters, status: value, page: 1 })
                }
                allowClear
              >
                <Option value="active">
                  <CheckCircleOutlined
                    style={{ color: "#28a745", marginRight: 8 }}
                  />
                  Active
                </Option>
                <Option value="inactive">
                  <StopOutlined style={{ color: "#dc3545", marginRight: 8 }} />
                  Inactive
                </Option>
              </Select>
            </Col> */}
          </Row>
        </Card>

        {/* Admins Table */}
        <Card
          title={
            <Space>
              <SafetyCertificateOutlined />
              <span>Administrators List</span>
              <Badge
                count={pagination.total}
                style={{ backgroundColor: "#495057" }}
              />
            </Space>
          }
          style={{ borderRadius: 8 }}
        >
          <Table
            columns={columns}
            dataSource={admins}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} administrators`,
              onChange: (page, pageSize) => {
                setFilters({ ...filters, page, limit: pageSize || 10 });
              },
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>

      {/* Admin Details Drawer */}
      <Drawer
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: "#495057" }} />
            <span>Administrator Details</span>
          </Space>
        }
        placement="right"
        width={700}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        {selectedAdmin && (
          <div>
            {/* Admin Header */}
            <div
              style={{
                textAlign: "center",
                marginBottom: 24,
                padding: 24,
                background: "#f8f9fa",
                borderRadius: 8,
                border: "1px solid #e9ecef",
              }}
            >
              <Avatar
                size={64}
                icon={<UserOutlined />}
                style={{
                  background: "#495057",
                  marginBottom: 16,
                }}
              />
              <Title level={4} style={{ marginBottom: 8 }}>
                {selectedAdmin.fullName}
              </Title>
              {getRoleBadge(selectedAdmin.role)}
              <div style={{ marginTop: 8 }}>
                <Tag
                  color={selectedAdmin.isActive ? "success" : "error"}
                  style={{ borderRadius: 6, fontWeight: 500 }}
                >
                  {selectedAdmin.isActive ? "Active" : "Inactive"}
                </Tag>
              </div>
            </div>

            {/* Admin Details */}
            <Card
              title="Account Information"
              style={{ marginBottom: 16, borderRadius: 8 }}
              size="small"
            >
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Username">
                  <Text strong copyable>
                    @{selectedAdmin.username}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  <Text copyable>{selectedAdmin.email}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Full Name">
                  <Text strong>{selectedAdmin.fullName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Role">
                  {getRoleBadge(selectedAdmin.role)}
                </Descriptions.Item>
                <Descriptions.Item label="Last Login">
                  {selectedAdmin.lastLogin
                    ? new Date(selectedAdmin.lastLogin).toLocaleString()
                    : "Never"}
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {new Date(selectedAdmin.createdAt).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Permissions */}
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span>Permissions</span>
                </div>
              }
              style={{ marginBottom: 24, borderRadius: 8 }}
              size="small"
            >
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Card
                    title="Institution Permissions"
                    size="small"
                    style={{ borderRadius: 8, background: "#f8f9fa" }}
                  >
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <Checkbox
                        checked={selectedAdmin.permissions.institutions.create}
                        disabled
                      >
                        Create
                      </Checkbox>
                      <Checkbox
                        checked={selectedAdmin.permissions.institutions.read}
                        disabled
                      >
                        Read
                      </Checkbox>
                      <Checkbox
                        checked={selectedAdmin.permissions.institutions.update}
                        disabled
                      >
                        Update
                      </Checkbox>
                      <Checkbox
                        checked={selectedAdmin.permissions.institutions.delete}
                        disabled
                      >
                        Delete
                      </Checkbox>
                      <Checkbox
                        checked={selectedAdmin.permissions.institutions.approve}
                        disabled
                      >
                        Approve
                      </Checkbox>
                    </Space>
                  </Card>
                </Col>

                <Col span={8}>
                  <Card
                    title="Student Permissions"
                    size="small"
                    style={{ borderRadius: 8, background: "#f8f9fa" }}
                  >
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <Checkbox
                        checked={selectedAdmin.permissions.students.create}
                        disabled
                      >
                        Create
                      </Checkbox>
                      <Checkbox
                        checked={selectedAdmin.permissions.students.read}
                        disabled
                      >
                        Read
                      </Checkbox>
                      <Checkbox
                        checked={selectedAdmin.permissions.students.update}
                        disabled
                      >
                        Update
                      </Checkbox>
                      <Checkbox
                        checked={selectedAdmin.permissions.students.delete}
                        disabled
                      >
                        Delete
                      </Checkbox>
                    </Space>
                  </Card>
                </Col>

                <Col span={8}>
                  <Card
                    title="Admin Permissions"
                    size="small"
                    style={{ borderRadius: 8, background: "#f8f9fa" }}
                  >
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <Checkbox
                        checked={selectedAdmin.permissions.admins.create}
                        disabled
                      >
                        Create
                      </Checkbox>
                      <Checkbox
                        checked={selectedAdmin.permissions.admins.read}
                        disabled
                      >
                        Read
                      </Checkbox>
                      <Checkbox
                        checked={selectedAdmin.permissions.admins.update}
                        disabled
                      >
                        Update
                      </Checkbox>
                      <Checkbox
                        checked={selectedAdmin.permissions.admins.delete}
                        disabled
                      >
                        Delete
                      </Checkbox>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Card>

            {/* Action Buttons */}
            <Space style={{ width: "100%", justifyContent: "center" }}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setIsEditMode(true);
                  form.setFieldsValue(selectedAdmin);
                  setIsModalVisible(true);
                  setIsDrawerVisible(false);
                }}
                style={{ borderRadius: 6 }}
              >
                Edit Admin
              </Button>
              <Button
                onClick={() =>
                  handleUpdateAdmin(selectedAdmin._id, {
                    isActive: !selectedAdmin.isActive,
                  })
                }
                style={{ borderRadius: 6 }}
              >
                {selectedAdmin.isActive ? "Deactivate" : "Activate"}
              </Button>
            </Space>
          </div>
        )}
      </Drawer>

      {/* Add/Edit Admin Modal */}
      <Modal
        title={
          <Space>
            {isEditMode ? <EditOutlined /> : <PlusOutlined />}
            <span>
              {isEditMode ? "Edit Administrator" : "Add New Administrator"}
            </span>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedAdmin(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={
            isEditMode
              ? (values) => {
                  if (selectedAdmin) {
                    handleUpdateAdmin(selectedAdmin._id, values);
                  }
                }
              : handleCreateAdmin
          }
          style={{ marginTop: 24 }}
        >
          <Card
            title="Account Information"
            style={{ marginBottom: 24, borderRadius: 8 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="username"
                  label="Username"
                  rules={[
                    { required: true, message: "Please enter username" },
                    {
                      min: 3,
                      message: "Username must be at least 3 characters",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    style={{ borderRadius: 6 }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Please enter email" },
                    { type: "email", message: "Please enter valid email" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    style={{ borderRadius: 6 }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="fullName"
                  label="Full Name"
                  rules={[
                    { required: true, message: "Please enter full name" },
                  ]}
                >
                  <Input style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="role"
                  label="Role"
                  rules={[{ required: true, message: "Please select role" }]}
                >
                  <Select style={{ borderRadius: 6 }}>
                    <Option value="super_admin">
                      <CrownOutlined
                        style={{ color: "#ffc107", marginRight: 8 }}
                      />
                      Super Admin
                    </Option>
                    <Option value="admin">
                      <SafetyCertificateOutlined
                        style={{ color: "#495057", marginRight: 8 }}
                      />
                      Admin
                    </Option>
                    <Option value="moderator">
                      <UserOutlined
                        style={{ color: "#28a745", marginRight: 8 }}
                      />
                      Moderator
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {!isEditMode && (
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Please enter password" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
              >
                <Input.Password
                  prefix={<KeyOutlined />}
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            )}

            <Form.Item
              name="isActive"
              label="Status"
              valuePropName="checked"
              initialValue
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Card>

          <Form.Item style={{ textAlign: "center", marginTop: 24 }}>
            <Space size="large">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{ borderRadius: 6, minWidth: 120 }}
              >
                {isEditMode ? "Update Admin" : "Create Admin"}
              </Button>
              <Button
                size="large"
                onClick={() => {
                  setIsModalVisible(false);
                  setSelectedAdmin(null);
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
