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
  IdcardOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  StopOutlined,
  MoreOutlined,
  FilterOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/AdminLayout";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface Membership {
  _id: string;
  membershipName: string;
  membershipNumber: string;
  membershipType: string;
  membershipStatus: string;
  validityPeriod: {
    startDate: string;
    endDate: string;
  };
  isActive: boolean;
  createdAt: string;
}

export default function MembershipsManagement() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [selectedMemberships, setSelectedMemberships] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    membershipType: "",
    membershipStatus: "",
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

  const membershipTypes = ['Individual', 'Corporate', 'Student', 'Senior', 'Premium', 'Basic'];
  const membershipStatuses = ['Active', 'Inactive', 'Suspended', 'Expired', 'Pending'];

  useEffect(() => {
    fetchMemberships();
  }, [filters]);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.membershipType && { membershipType: filters.membershipType }),
        ...(filters.membershipStatus && { membershipStatus: filters.membershipStatus }),
      });

      const response = await fetch(`/api/admin/memberships?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setMemberships(data.memberships);
        setPagination(data.pagination);
      } else if (response.status === 403) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Error fetching memberships:", error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch memberships',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedMemberships.length === 0) {
      notification.warning({
        message: 'No Selection',
        description: 'Please select memberships first',
        placement: 'topRight',
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/memberships", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          membershipIds: selectedMemberships,
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
        fetchMemberships();
        setSelectedMemberships([]);
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

  const handleMembershipAction = async (membershipId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/memberships/${membershipId}`, {
        method: action === "delete" ? "DELETE" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: action !== "delete" ? JSON.stringify({
          membershipStatus: action === "activate" ? "Active" : "Inactive"
        }) : undefined,
      });

      if (response.ok) {
        const data = await response.json();
        notification.success({
          message: 'Success',
          description: data.message,
          placement: 'topRight',
        });
        fetchMemberships();
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
        validityPeriod: {
          startDate: values.validityPeriod[0].toISOString(),
          endDate: values.validityPeriod[1].toISOString(),
        }
      };

      const url = isEditMode 
        ? `/api/admin/memberships/${selectedMembership?._id}`
        : "/api/admin/memberships";
      
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
        setSelectedMembership(null);
        form.resetFields();
        fetchMemberships();
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

  const getActionMenu = (record: Membership) => (
    <Menu>
      <Menu.Item 
        key="view" 
        icon={<EyeOutlined />}
        onClick={() => {
          setSelectedMembership(record);
          setIsDrawerVisible(true);
        }}
      >
        View Details
      </Menu.Item>
      <Menu.Item 
        key="edit" 
        icon={<EditOutlined />}
        onClick={() => {
          setSelectedMembership(record);
          setIsEditMode(true);
          form.setFieldsValue({
            ...record,
            validityPeriod: [
              dayjs(record.validityPeriod.startDate),
              dayjs(record.validityPeriod.endDate)
            ],
          });
          setIsModalVisible(true);
        }}
      >
        Edit Membership
      </Menu.Item>
      <Menu.Item 
        key="toggle" 
        icon={record.membershipStatus === "Active" ? <StopOutlined /> : <CheckCircleOutlined />}
        onClick={() => handleMembershipAction(record._id, record.membershipStatus === "Active" ? "deactivate" : "activate")}
      >
        {record.membershipStatus === "Active" ? "Deactivate" : "Activate"}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />}
        danger
        onClick={() => {
          Modal.confirm({
            title: 'Delete Membership',
            content: 'Are you sure you want to delete this membership? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: () => handleMembershipAction(record._id, "delete"),
          });
        }}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Active': '#22c55e',
      'Inactive': '#ef4444',
      'Suspended': '#f59e0b',
      'Expired': '#ef4444',
      'Pending': '#64748b'
    };
    return colors[status] || '#64748b';
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Individual': '#64748b',
      'Corporate': '#2d3748',
      'Student': '#22c55e',
      'Senior': '#f59e0b',
      'Premium': '#8b5cf6',
      'Basic': '#6b7280'
    };
    return colors[type] || '#64748b';
  };

  const columns = [
    {
      title: "Member",
      key: "member",
      render: (record: Membership) => (
        <Space>
          <UserOutlined style={{ fontSize: 16, color: "#64748b" }} />
          <div>
            <div style={{ fontWeight: 600, color: "#1a202c" }}>{record.membershipName}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.membershipNumber}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "membershipType",
      key: "membershipType",
      render: (type: string) => (
        <Tag 
          color={getTypeColor(type)}
          style={{ borderRadius: 6, fontWeight: 500, border: "none" }}
        >
          {type}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "membershipStatus",
      key: "membershipStatus",
      render: (status: string) => (
        <Tag 
          color={getStatusColor(status)}
          style={{ borderRadius: 6, fontWeight: 500, border: "none" }}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Validity Period",
      key: "validityPeriod",
      render: (record: Membership) => (
        <div>
          <div style={{ fontWeight: 500, color: "#1a202c" }}>
            {new Date(record.validityPeriod.startDate).toLocaleDateString()}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            to {new Date(record.validityPeriod.endDate).toLocaleDateString()}
          </Text>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Membership) => (
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
    selectedRowKeys: selectedMemberships,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedMemberships(selectedRowKeys as string[]);
    },
  };

  const activeMemberships = memberships.filter(m => m.membershipStatus === 'Active').length;
  const expiredMemberships = memberships.filter(m => 
    new Date(m.validityPeriod.endDate) < new Date()
  ).length;

  if (loading && !memberships.length) {
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
            Loading Memberships...
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
                Memberships Management
              </Title>
              <Text type="secondary">
                Manage member registrations and membership details
              </Text>
            </div>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchMemberships}
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
                Add Membership
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
                  <IdcardOutlined style={{ fontSize: 24, color: "#64748b" }} />
                  <Badge status="processing" text="Live" />
                </div>
                <Statistic
                  title="Total Memberships"
                  value={memberships.length}
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
                  title="Active Memberships"
                  value={activeMemberships}
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
                  title="Expired Memberships"
                  value={expiredMemberships}
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
              <span>Filter Memberships</span>
            </Space>
          }
          style={{ marginBottom: 24, borderRadius: 8 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8} md={6}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Search Memberships</Text>
              </div>
              <Input
                placeholder="Search by name, number..."
                prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                allowClear
                style={{ borderRadius: 6 }}
              />
            </Col>
            <Col xs={24} sm={8} md={4}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Type</Text>
              </div>
              <Select
                placeholder="Select type"
                style={{ width: "100%" }}
                value={filters.membershipType}
                onChange={(value) => setFilters({ ...filters, membershipType: value, page: 1 })}
                allowClear
              >
                {membershipTypes.map(type => (
                  <Option key={type} value={type}>
                    <Tag 
                      color={getTypeColor(type)}
                      style={{ marginRight: 8, border: "none" }}
                    />
                    {type}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={8} md={4}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Status</Text>
              </div>
              <Select
                placeholder="Select status"
                style={{ width: "100%" }}
                value={filters.membershipStatus}
                onChange={(value) => setFilters({ ...filters, membershipStatus: value, page: 1 })}
                allowClear
              >
                {membershipStatuses.map(status => (
                  <Option key={status} value={status}>
                    <Tag 
                      color={getStatusColor(status)}
                      style={{ marginRight: 8, border: "none" }}
                    />
                    {status}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Bulk Actions */}
        {selectedMemberships.length > 0 && (
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
                {selectedMemberships.length} membership{selectedMemberships.length > 1 ? 's' : ''} selected
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
              <Button 
                size="small"
                onClick={() => handleBulkAction("suspend")}
                style={{ borderRadius: 6, background: "#f59e0b", color: "white", border: "none" }}
              >
                Suspend
              </Button>
            </Space>
          </Card>
        )}

        {/* Memberships Table */}
        <Card
          title={
            <Space>
              <IdcardOutlined />
              <span>Memberships List</span>
              <Badge count={pagination.total} style={{ backgroundColor: "#64748b" }} />
            </Space>
          }
          style={{ borderRadius: 8, marginBottom: 24 }}
        >
          <Table
            columns={columns}
            dataSource={memberships}
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
                `${range[0]}-${range[1]} of ${total} memberships`,
              onChange: (page, pageSize) => {
                setFilters({ ...filters, page, limit: pageSize || 10 });
              },
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>

      {/* Membership Details Drawer */}
      <Drawer
        title={
          <Space>
            <IdcardOutlined style={{ color: "#64748b" }} />
            <span>Membership Details</span>
          </Space>
        }
        placement="right"
        width={600}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        {selectedMembership && (
          <div>
            <div style={{ 
              textAlign: "center", 
              marginBottom: 24,
              padding: 24,
              background: "#f7f8fc",
              borderRadius: 8,
              border: "1px solid #e2e8f0"
            }}>
              <IdcardOutlined style={{ fontSize: 48, color: "#64748b", marginBottom: 16 }} />
              <Title level={4} style={{ marginBottom: 8 }}>
                {selectedMembership.membershipName}
              </Title>
              <Text strong style={{ fontSize: 16, color: "#2d3748" }}>
                {selectedMembership.membershipNumber}
              </Text>
            </div>

            <Card 
              title="Membership Information" 
              style={{ marginBottom: 16, borderRadius: 8 }}
              size="small"
            >
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Member Name">
                  <Text strong>{selectedMembership.membershipName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Membership Number">
                  <Text strong copyable>{selectedMembership.membershipNumber}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Type">
                  <Tag 
                    color={getTypeColor(selectedMembership.membershipType)}
                    style={{ borderRadius: 6, fontWeight: 500, border: "none" }}
                  >
                    {selectedMembership.membershipType}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag 
                    color={getStatusColor(selectedMembership.membershipStatus)}
                    style={{ borderRadius: 6, fontWeight: 500, border: "none" }}
                  >
                    {selectedMembership.membershipStatus}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Start Date">
                  {new Date(selectedMembership.validityPeriod.startDate).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="End Date">
                  {new Date(selectedMembership.validityPeriod.endDate).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {new Date(selectedMembership.createdAt).toLocaleString()}
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
                    ...selectedMembership,
                    validityPeriod: [
                      dayjs(selectedMembership.validityPeriod.startDate),
                      dayjs(selectedMembership.validityPeriod.endDate)
                    ],
                  });
                  setIsModalVisible(true);
                  setIsDrawerVisible(false);
                }}
                style={{ borderRadius: 6, background: "#2d3748", border: "none" }}
              >
                Edit Membership
              </Button>
              <Button 
                onClick={() => handleMembershipAction(selectedMembership._id, selectedMembership.membershipStatus === "Active" ? "deactivate" : "activate")}
                style={{ borderRadius: 6 }}
              >
                {selectedMembership.membershipStatus === "Active" ? "Deactivate" : "Activate"}
              </Button>
            </Space>
          </div>
        )}
      </Drawer>

      {/* Add/Edit Membership Modal */}
      <Modal
        title={
          <Space>
            {isEditMode ? <EditOutlined /> : <PlusOutlined />}
            <span>{isEditMode ? "Edit Membership" : "Add New Membership"}</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedMembership(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
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
                name="membershipName"
                label="Member Name"
                rules={[{ required: true, message: "Please enter member name" }]}
              >
                <Input 
                  placeholder="Enter member name"
                  style={{ borderRadius: 6 }} 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="membershipNumber"
                label="Membership Number"
                rules={[{ required: true, message: "Please enter membership number" }]}
              >
                <Input 
                  placeholder="Enter membership number"
                  style={{ borderRadius: 6 }} 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="membershipType"
                label="Membership Type"
                rules={[{ required: true, message: "Please select membership type" }]}
              >
                <Select 
                  placeholder="Select membership type"
                  style={{ borderRadius: 6 }}
                >
                  {membershipTypes.map(type => (
                    <Option key={type} value={type}>
                      <Tag 
                        color={getTypeColor(type)}
                        style={{ marginRight: 8, border: "none" }}
                      />
                      {type}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="membershipStatus"
                label="Membership Status"
                rules={[{ required: true, message: "Please select membership status" }]}
              >
                <Select 
                  placeholder="Select membership status"
                  style={{ borderRadius: 6 }}
                >
                  {membershipStatuses.map(status => (
                    <Option key={status} value={status}>
                      <Tag 
                        color={getStatusColor(status)}
                        style={{ marginRight: 8, border: "none" }}
                      />
                      {status}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="validityPeriod"
            label="Validity Period"
            rules={[{ required: true, message: "Please select validity period" }]}
          >
            <RangePicker 
              style={{ width: "100%", borderRadius: 6 }}
              placeholder={["Start Date", "End Date"]}
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
                {isEditMode ? "Update Membership" : "Add Membership"}
              </Button>
              <Button 
                size="large"
                onClick={() => {
                  setIsModalVisible(false);
                  setSelectedMembership(null);
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