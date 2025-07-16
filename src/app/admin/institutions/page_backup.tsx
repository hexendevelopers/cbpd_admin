"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Progress,
  Typography,
  Spin,
  Badge,
  Tooltip,
  Popconfirm,
  Divider,
  Alert,
  notification,
  Dropdown,
  Menu,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  FilterOutlined,
  DownloadOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  PlusOutlined,
  MoreOutlined,
  TrophyOutlined,
  FireOutlined,
  ThunderboltOutlined,
  StarOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/AdminLayout";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface Institution {
  _id: string;
  orgName: string;
  email: string;
  industrySector: string;
  businessAddress: string;
  postalCode: string;
  mainTelephone: string;
  website: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  emailAddress: string;
  phoneNumber: string;
  mobileNumber: string;
  SfirstName: string;
  SlastName: string;
  SjobTitle: string;
  SemailAddress: string;
  SphoneNumber: string;
  SmobileNumber: string;
  isApproved: boolean;
  isTerminated: boolean;
  createdAt: string;
  studentCount: number;
}

interface InstitutionDetails extends Institution {
  statistics: {
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    departmentStats: Array<{ _id: string; count: number }>;
  };
  recentStudents: Array<{
    _id: string;
    fullName: string;
    createdAt: string;
    isActive: boolean;
  }>;
}

export default function InstitutionsManagement() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionDetails | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();

  useEffect(() => {
    const status = searchParams.get("status");
    if (status) {
      setFilters(prev => ({ ...prev, status }));
    }
    fetchInstitutions();
  }, [filters]);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
      });

      const response = await fetch(`/api/admin/institutions?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setInstitutions(data.institutions);
        setPagination(data.pagination);
      } else if (response.status === 403) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Error fetching institutions:", error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch institutions',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutionDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/institutions/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedInstitution({
          ...data.institution,
          statistics: data.statistics,
          recentStudents: data.recentStudents
        });
      } else {
        notification.error({
          message: 'Error',
          description: 'Failed to fetch institution details',
          placement: 'topRight',
        });
      }
    } catch (error) {
      console.error("Error fetching institution details:", error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch institution details',
        placement: 'topRight',
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedInstitutions.length === 0) {
      notification.warning({
        message: 'No Selection',
        description: 'Please select institutions first',
        placement: 'topRight',
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/institutions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          institutionIds: selectedInstitutions,
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
        fetchInstitutions();
        setSelectedInstitutions([]);
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

  const handleInstitutionAction = async (institutionId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/institutions/${institutionId}`, {
        method: action === "delete" ? "DELETE" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: action !== "delete" ? JSON.stringify({ action }) : undefined,
      });

      if (response.ok) {
        const data = await response.json();
        notification.success({
          message: 'Success',
          description: data.message,
          placement: 'topRight',
        });
        fetchInstitutions();
        if (selectedInstitution && selectedInstitution._id === institutionId) {
          setIsDrawerVisible(false);
          setSelectedInstitution(null);
        }
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

  const handleEditInstitution = async (values: any) => {
    try {
      const response = await fetch(`/api/admin/institutions/${selectedInstitution?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const data = await response.json();
        notification.success({
          message: 'Success',
          description: data.message,
          placement: 'topRight',
        });
        setIsModalVisible(false);
        setSelectedInstitution(null);
        form.resetFields();
        fetchInstitutions();
      } else {
        const data = await response.json();
        notification.error({
          message: 'Error',
          description: data.error || 'Update failed',
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

  const getStatusBadge = (institution: Institution) => {
    if (institution.isTerminated) {
      return (
        <Tag 
          color="error" 
          icon={<StopOutlined />}
          style={{ 
            borderRadius: 12, 
            fontWeight: 600,
            boxShadow: "0 2px 4px rgba(255, 77, 79, 0.3)"
          }}
        >
          Terminated
        </Tag>
      );
    } else if (institution.isApproved) {
      return (
        <Tag 
          color="success" 
          icon={<CheckCircleOutlined />}
          style={{ 
            borderRadius: 12, 
            fontWeight: 600,
            boxShadow: "0 2px 4px rgba(82, 196, 26, 0.3)"
          }}
        >
          Approved
        </Tag>
      );
    } else {
      return (
        <Tag 
          color="warning" 
          icon={<ClockCircleOutlined />}
          style={{ 
            borderRadius: 12, 
            fontWeight: 600,
            boxShadow: "0 2px 4px rgba(250, 173, 20, 0.3)"
          }}
        >
          Pending
        </Tag>
      );
    }
  };

  const getActionMenu = (record: Institution) => (
    <Menu>
      <Menu.Item 
        key="view" 
        icon={<EyeOutlined />}
        onClick={async () => {
          await fetchInstitutionDetails(record._id);
          setIsDrawerVisible(true);
        }}
      >
        View Details
      </Menu.Item>
      <Menu.Item 
        key="edit" 
        icon={<EditOutlined />}
        onClick={() => {
          setSelectedInstitution(record as InstitutionDetails);
          setIsEditMode(true);
          form.setFieldsValue(record);
          setIsModalVisible(true);
        }}
      >
        Edit Institution
      </Menu.Item>
      {!record.isApproved && !record.isTerminated && (
        <Menu.Item 
          key="approve" 
          icon={<CheckCircleOutlined />}
          onClick={() => handleInstitutionAction(record._id, "approve")}
        >
          Approve
        </Menu.Item>
      )}
      {!record.isTerminated && (
        <Menu.Item 
          key="terminate" 
          icon={<StopOutlined />}
          onClick={() => handleInstitutionAction(record._id, "terminate")}
        >
          Terminate
        </Menu.Item>
      )}
      {record.isTerminated && (
        <Menu.Item 
          key="reactivate" 
          icon={<CheckCircleOutlined />}
          onClick={() => handleInstitutionAction(record._id, "reactivate")}
        >
          Reactivate
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />}
        danger
        onClick={() => {
          Modal.confirm({
            title: 'Delete Institution',
            content: 'Are you sure you want to delete this institution? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: () => handleInstitutionAction(record._id, "delete"),
          });
        }}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "Institution",
      key: "institution",
      render: (record: Institution) => (
        <Space>
          <Avatar 
            icon={<BankOutlined />} 
            style={{ 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
            }} 
          />
          <div>
            <div style={{ fontWeight: 600, color: "#1a1a1a" }}>{record.orgName}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.industrySector}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Contact Person",
      key: "contact",
      render: (record: Institution) => (
        <div>
          <div style={{ fontWeight: 600, color: "#1a1a1a" }}>
            {record.firstName} {record.lastName}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.jobTitle}
          </Text>
          <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
            <MailOutlined style={{ marginRight: 4 }} /> {record.emailAddress}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            <PhoneOutlined style={{ marginRight: 4 }} /> {record.phoneNumber}
          </div>
        </div>
      ),
    },
    {
      title: "Location",
      key: "location",
      render: (record: Institution) => (
        <div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>
            <EnvironmentOutlined style={{ marginRight: 4, color: "#1890ff" }} /> 
            {record.businessAddress}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.postalCode}
          </Text>
        </div>
      ),
      ellipsis: true,
    },
        {
      title: "Status",
      key: "status",
      render: (record: Institution) => getStatusBadge(record),
      filters: [
        { text: "Approved", value: "approved" },
        { text: "Pending", value: "pending" },
        { text: "Terminated", value: "terminated" },
      ],
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Institution) => (
        <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
          <Button 
            type="text" 
            icon={<MoreOutlined />}
            style={{
              borderRadius: 8,
              background: "#f5f5f5",
            }}
          />
        </Dropdown>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedInstitutions,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedInstitutions(selectedRowKeys as string[]);
    },
  };

  const pendingCount = institutions.filter(inst => !inst.isApproved && !inst.isTerminated).length;
  const approvedCount = institutions.filter(inst => inst.isApproved && !inst.isTerminated).length;
  const terminatedCount = institutions.filter(inst => inst.isTerminated).length;

  if (loading && !institutions.length) {
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
          <Text style={{ marginTop: 16, fontSize: 16, color: "#666" }}>
            Loading Institutions...
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
                Institutions Management
              </Title>
              <Text type="secondary">
                Manage and monitor all educational institutions
              </Text>
            </div>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchInstitutions}
                style={{ borderRadius: 6 }}
              >
                Refresh
              </Button>
              <Button 
                icon={<DownloadOutlined />}
                style={{ borderRadius: 6 }}
              >
                Export
              </Button>
            </Space>
          </div>
        </div>
        {/* Enhanced Statistics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={6}>
            <Card 
              style={{ 
                borderRadius: 8,
                border: "1px solid #f0f0f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
              bodyStyle={{ padding: 24 }}
            >
              <BankOutlined style={{ fontSize: 32, color: "#495057", marginBottom: 16 }} />
              <Statistic
                title={<span style={{ color: "#6c757d", fontWeight: 600 }}>Total Institutions</span>}
                value={institutions.length}
                valueStyle={{ color: "#2c3e50", fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card 
              style={{ 
                borderRadius: 8,
                border: "1px solid #f0f0f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
              bodyStyle={{ padding: 24 }}
            >
              <CheckCircleOutlined style={{ fontSize: 32, color: "#28a745", marginBottom: 16 }} />
              <Statistic
                title={<span style={{ color: "#6c757d", fontWeight: 600 }}>Approved</span>}
                value={approvedCount}
                valueStyle={{ color: "#28a745", fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card 
              style={{ 
                borderRadius: 8,
                border: "1px solid #f0f0f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
              bodyStyle={{ padding: 24 }}
            >
              <ClockCircleOutlined style={{ fontSize: 32, color: "#ffc107", marginBottom: 16 }} />
              <Statistic
                title={<span style={{ color: "#6c757d", fontWeight: 600 }}>Pending</span>}
                value={pendingCount}
                valueStyle={{ color: "#ffc107", fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card 
              style={{ 
                borderRadius: 8,
                border: "1px solid #f0f0f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
              bodyStyle={{ padding: 24 }}
            >
              <StopOutlined style={{ fontSize: 32, color: "#dc3545", marginBottom: 16 }} />
              <Statistic
                title={<span style={{ color: "#6c757d", fontWeight: 600 }}>Terminated</span>}
                value={terminatedCount}
                valueStyle={{ color: "#dc3545", fontWeight: 700 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Priority Alert */}
        {pendingCount > 0 && (
          <Alert
            message={
              <div style={{ display: "flex", alignItems: "center" }}>
                <FireOutlined style={{ marginRight: 8, color: "#faad14" }} />
                <span style={{ fontWeight: 600 }}>Action Required</span>
              </div>
            }
            description={`${pendingCount} institutions are pending approval. Review them to maintain service quality.`}
            type="warning"
            showIcon
            style={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 4px 16px rgba(250, 173, 20, 0.2)",
              marginBottom: 24,
            }}
            action={
              <Button 
                size="small" 
                type="primary"
                onClick={() => setFilters({ ...filters, status: "pending", page: 1 })}
                style={{
                  borderRadius: 8,
                  fontWeight: 600,
                  background: "#faad14",
                  border: "none",
                }}
              >
                Review Now
              </Button>
            }
          />
        )}

        {/* Enhanced Filters */}
        <Card 
          style={{ 
            marginBottom: 24,
            borderRadius: 16,
            border: "none",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          }}
          bodyStyle={{ padding: 24 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8} md={6}>
              <Input
                placeholder="Search institutions..."
                prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                allowClear
                style={{
                  borderRadius: 8,
                  border: "2px solid #f0f0f0",
                }}
              />
            </Col>
            <Col xs={24} sm={8} md={4}>
              <Select
                placeholder="Status"
                style={{ width: "100%" }}
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
                allowClear
              >
                <Option value="approved">
                  <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                  Approved
                </Option>
                <Option value="pending">
                  <ClockCircleOutlined style={{ color: "#faad14", marginRight: 8 }} />
                  Pending
                </Option>
                <Option value="terminated">
                  <StopOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />
                  Terminated
                </Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={4}>
              <Select
                placeholder="Sort By"
                style={{ width: "100%" }}
                value={filters.sortBy}
                onChange={(value) => setFilters({ ...filters, sortBy: value, page: 1 })}
              >
                <Option value="createdAt">Date Created</Option>
                <Option value="orgName">Name</Option>
                <Option value="studentCount">Student Count</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={4}>
              <Select
                placeholder="Order"
                style={{ width: "100%" }}
                value={filters.sortOrder}
                onChange={(value) => setFilters({ ...filters, sortOrder: value, page: 1 })}
              >
                <Option value="desc">Descending</Option>
                <Option value="asc">Ascending</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={4}>
              <Select
                placeholder="Per Page"
                style={{ width: "100%" }}
                value={filters.limit}
                onChange={(value) => setFilters({ ...filters, limit: value, page: 1 })}
              >
                <Option value={10}>10 per page</Option>
                <Option value={25}>25 per page</Option>
                <Option value={50}>50 per page</Option>
              </Select>
            </Col>
            {/* <Col xs={24} sm={8} md={2}>
              <Button 
                type="primary" 
                icon={<SearchOutlined />}
                onClick={fetchInstitutions}
                style={{ 
                  width: "100%",
                  borderRadius: 8,
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                }}
              >
                Search
              </Button>
            </Col> */}
          </Row>
        </Card>

        {/* Enhanced Bulk Actions */}
        {selectedInstitutions.length > 0 && (
          <Card 
            style={{ 
              marginBottom: 24,
              borderRadius: 16,
              border: "2px solid #1890ff",
              boxShadow: "0 8px 32px rgba(24, 144, 255, 0.15)",
            }}
            bodyStyle={{ padding: 16 }}
          >
            <Space>
              <Text strong style={{ color: "#1890ff" }}>
                {selectedInstitutions.length} selected
              </Text>
              <Button 
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleBulkAction("approve")}
                style={{ borderRadius: 8, fontWeight: 600 }}
              >
                Approve
              </Button>
              <Button 
                icon={<StopOutlined />}
                onClick={() => handleBulkAction("terminate")}
                style={{ borderRadius: 8, fontWeight: 600 }}
              >
                Terminate
              </Button>
              <Button 
                icon={<CheckCircleOutlined />}
                onClick={() => handleBulkAction("reactivate")}
                style={{ borderRadius: 8, fontWeight: 600 }}
              >
                Reactivate
              </Button>
              <Button 
                icon={<DownloadOutlined />}
                style={{ borderRadius: 8, fontWeight: 600 }}
              >
                Export Selected
              </Button>
            </Space>
          </Card>
        )}

        {/* Enhanced Institutions Table */}
        <Card
          style={{
            borderRadius: 16,
            border: "none",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            columns={columns}
            dataSource={institutions}
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
                `${range[0]}-${range[1]} of ${total} institutions`,
              onChange: (page, pageSize) => {
                setFilters({ ...filters, page, limit: pageSize || 10 });
              },
              style: { padding: "16px 24px" }
            }}
            scroll={{ x: 1400 }}
            style={{ borderRadius: 16 }}
          />
        </Card>
      </div>

      {/* Enhanced Institution Details Drawer */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <BankOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            <span style={{ fontWeight: 700 }}>Institution Details</span>
          </div>
        }
        placement="right"
        width={800}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        style={{ borderRadius: "16px 0 0 16px" }}
      >
        {selectedInstitution && (
          <div>
            {/* Institution Header */}
            <div style={{ 
              textAlign: "center", 
              marginBottom: 32,
              padding: 24,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 16,
              color: "white"
            }}>
              <Avatar 
                size={80} 
                icon={<BankOutlined />} 
                style={{ 
                  background: "rgba(255,255,255,0.2)",
                  marginBottom: 16
                }} 
              />
              <Title level={4} style={{ color: "white", marginBottom: 8 }}>
                {selectedInstitution.orgName}
              </Title>
              {getStatusBadge(selectedInstitution)}
            </div>

            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card size="small" style={{ textAlign: "center", borderRadius: 12 }}>
                  <TeamOutlined style={{ fontSize: 24, color: "#1890ff", marginBottom: 8 }} />
                  <Statistic
                    title="Total Students"
                    value={selectedInstitution.statistics?.totalStudents || 0}
                    valueStyle={{ fontSize: 20, fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: "center", borderRadius: 12 }}>
                  <CheckCircleOutlined style={{ fontSize: 24, color: "#52c41a", marginBottom: 8 }} />
                  <Statistic
                    title="Active Students"
                    value={selectedInstitution.statistics?.activeStudents || 0}
                    valueStyle={{ color: "#52c41a", fontSize: 20, fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: "center", borderRadius: 12 }}>
                  <TrophyOutlined style={{ fontSize: 24, color: "#faad14", marginBottom: 8 }} />
                  <Statistic
                    title="Departments"
                    value={selectedInstitution.statistics?.departmentStats?.length || 0}
                    valueStyle={{ color: "#faad14", fontSize: 20, fontWeight: 700 }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Institution Details */}
            <Card 
              title="Organization Information" 
              style={{ marginBottom: 16, borderRadius: 12 }}
              size="small"
            >
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Organization Name">
                  <Text strong>{selectedInstitution.orgName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Industry Sector">
                  {selectedInstitution.industrySector}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  <Text copyable>{selectedInstitution.email}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Address">
                  {selectedInstitution.businessAddress}, {selectedInstitution.postalCode}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  <Text copyable>{selectedInstitution.mainTelephone}</Text>
                </Descriptions.Item>
                {selectedInstitution.website && (
                  <Descriptions.Item label="Website">
                    <a href={selectedInstitution.website} target="_blank" rel="noopener noreferrer">
                      {selectedInstitution.website}
                    </a>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Contact Information */}
            <Card 
              title="Primary Contact" 
              style={{ marginBottom: 16, borderRadius: 12 }}
              size="small"
            >
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Name">
                  <Text strong>{selectedInstitution.firstName} {selectedInstitution.lastName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Job Title">
                  {selectedInstitution.jobTitle}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  <Text copyable>{selectedInstitution.emailAddress}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  <Text copyable>{selectedInstitution.phoneNumber}</Text>
                </Descriptions.Item>
                {selectedInstitution.mobileNumber && (
                  <Descriptions.Item label="Mobile">
                    <Text copyable>{selectedInstitution.mobileNumber}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Secondary Contact */}
            {(selectedInstitution.SfirstName || selectedInstitution.SlastName) && (
              <Card 
                title="Secondary Contact" 
                style={{ marginBottom: 24, borderRadius: 12 }}
                size="small"
              >
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Name">
                    <Text strong>{selectedInstitution.SfirstName} {selectedInstitution.SlastName}</Text>
                  </Descriptions.Item>
                  {selectedInstitution.SjobTitle && (
                    <Descriptions.Item label="Job Title">
                      {selectedInstitution.SjobTitle}
                    </Descriptions.Item>
                  )}
                  {selectedInstitution.SemailAddress && (
                    <Descriptions.Item label="Email">
                      <Text copyable>{selectedInstitution.SemailAddress}</Text>
                    </Descriptions.Item>
                  )}
                  {selectedInstitution.SphoneNumber && (
                    <Descriptions.Item label="Phone">
                      <Text copyable>{selectedInstitution.SphoneNumber}</Text>
                    </Descriptions.Item>
                  )}
                  {selectedInstitution.SmobileNumber && (
                    <Descriptions.Item label="Mobile">
                      <Text copyable>{selectedInstitution.SmobileNumber}</Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            {/* Action Buttons */}
            <Space style={{ width: "100%", justifyContent: "center" }}>
              <Button 
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setIsEditMode(true);
                  form.setFieldsValue(selectedInstitution);
                  setIsModalVisible(true);
                  setIsDrawerVisible(false);
                }}
                style={{ borderRadius: 8, fontWeight: 600 }}
              >
                Edit Institution
              </Button>
              {!selectedInstitution.isApproved && !selectedInstitution.isTerminated && (
                <Button 
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleInstitutionAction(selectedInstitution._id, "approve")}
                  style={{ borderRadius: 8, fontWeight: 600, background: "#52c41a", border: "none" }}
                >
                  Approve
                </Button>
              )}
              {!selectedInstitution.isTerminated && (
                <Button 
                  danger
                  icon={<StopOutlined />}
                  onClick={() => handleInstitutionAction(selectedInstitution._id, "terminate")}
                  style={{ borderRadius: 8, fontWeight: 600 }}
                >
                  Terminate
                </Button>
              )}
              {selectedInstitution.isTerminated && (
                <Button 
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleInstitutionAction(selectedInstitution._id, "reactivate")}
                  style={{ borderRadius: 8, fontWeight: 600 }}
                >
                  Reactivate
                </Button>
              )}
            </Space>
          </div>
        )}
      </Drawer>

      {/* Enhanced Edit Institution Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <EditOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            <span style={{ fontWeight: 700 }}>Edit Institution</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedInstitution(null);
          form.resetFields();
        }}
        footer={null}
        width={1000}
        style={{ borderRadius: 16 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditInstitution}
          style={{ marginTop: 24 }}
        >
          <Card title="Organization Information" style={{ marginBottom: 24, borderRadius: 12 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="orgName"
                  label="Organization Name"
                  rules={[{ required: true, message: "Please enter organization name" }]}
                >
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="industrySector"
                  label="Industry Sector"
                  rules={[{ required: true, message: "Please enter industry sector" }]}
                >
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Organization Email"
                  rules={[
                    { required: true, message: "Please enter email" },
                    { type: "email", message: "Please enter valid email" }
                  ]}
                >
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="mainTelephone"
                  label="Main Telephone"
                  rules={[{ required: true, message: "Please enter telephone" }]}
                >
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  name="businessAddress"
                  label="Business Address"
                  rules={[{ required: true, message: "Please enter address" }]}
                >
                  <TextArea rows={2} style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="postalCode"
                  label="Postal Code"
                  rules={[{ required: true, message: "Please enter postal code" }]}
                >
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="website"
              label="Website"
            >
              <Input placeholder="https://example.com" style={{ borderRadius: 8 }} />
            </Form.Item>
          </Card>

          <Card title="Primary Contact Person" style={{ marginBottom: 24, borderRadius: 12 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[{ required: true, message: "Please enter first name" }]}
                >
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[{ required: true, message: "Please enter last name" }]}
                >
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="jobTitle"
                  label="Job Title"
                  rules={[{ required: true, message: "Please enter job title" }]}
                >
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="emailAddress"
                  label="Email Address"
                  rules={[
                    { required: true, message: "Please enter email" },
                    { type: "email", message: "Please enter valid email" }
                  ]}
                >
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="phoneNumber"
                  label="Phone Number"
                  rules={[{ required: true, message: "Please enter phone number" }]}
                >
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="mobileNumber"
                  label="Mobile Number"
                >
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title="Secondary Contact Person (Optional)" style={{ marginBottom: 24, borderRadius: 12 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="SfirstName"
                  label="First Name"
                >
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="SlastName"
                  label="Last Name"
                >
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="SjobTitle"
                  label="Job Title"
                >
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="SemailAddress"
                  label="Email Address"
                  rules={[
                    { type: "email", message: "Please enter valid email" }
                  ]}
                >
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="SphoneNumber"
                  label="Phone Number"
                >
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="SmobileNumber"
                  label="Mobile Number"
                >
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Form.Item style={{ textAlign: "center", marginTop: 32 }}>
            <Space size="large">
              <Button 
                type="primary" 
                htmlType="submit"
                size="large"
                style={{ 
                  borderRadius: 8, 
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  minWidth: 120
                }}
              >
                Update Institution
              </Button>
              <Button 
                size="large"
                onClick={() => {
                  setIsModalVisible(false);
                  setSelectedInstitution(null);
                  form.resetFields();
                }}
                style={{ borderRadius: 8, fontWeight: 600, minWidth: 120 }}
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