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
  Avatar,
  Progress,
  Tabs,
  Typography,
  Spin,
  Alert,
  Badge,
  Tooltip,
  Divider,
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
  TeamOutlined,
  BankOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  StopOutlined,
  BarChartOutlined,
  MoreOutlined,
  StarOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  FireOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/AdminLayout";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Student {
  _id: string;
  fullName: string;
  gender: string;
  phoneNumber: string;
  dateOfBirth: string;
  joiningDate: string;
  state: string;
  district: string;
  county: string;
  currentCourse: string;
  department: string;
  semester: string;
  admissionNumber: string;
  isActive: boolean;
  createdAt: string;
  institutionId: {
    _id: string;
    orgName: string;
    email: string;
  };
}

interface Institution {
  _id: string;
  orgName: string;
}

interface StudentStatistics {
  overview: {
    total: number;
    active: number;
    inactive: number;
    activePercentage: number;
    growthRate: number;
    avgAge: number;
    departmentCount: number;
    courseCount: number;
    stateCount: number;
  };
  demographics: {
    gender: Array<{ _id: string; count: number }>;
    age: Array<{ _id: string; count: number; avgAge: number }>;
  };
  academic: {
    departments: Array<{ _id: string; count: number; activeCount: number; maleCount: number; femaleCount: number }>;
    courses: Array<{ _id: string; count: number; departments: string[] }>;
    semesters: Array<{ _id: string; count: number; activeCount: number }>;
  };
  geographic: {
    states: Array<{ _id: string; count: number; districts: string[] }>;
  };
  institutions: Array<{ _id: string; institutionName: string; count: number; activeCount: number; activePercentage: number }>;
  trends: {
    monthly: Array<{ _id: { year: number; month: number }; count: number; activeCount: number }>;
    growthRate: number;
  };
}

export default function StudentsManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [statistics, setStatistics] = useState<StudentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    institution: "",
    department: "",
    course: "",
    semester: "",
    gender: "",
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
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const queryParams = new URLSearchParams({
        format,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.institution && { institutionId: filters.institution }),
        ...(filters.department && { department: filters.department }),
        ...(filters.course && { course: filters.course }),
        ...(filters.semester && { semester: filters.semester }),
        ...(filters.gender && { gender: filters.gender }),
      });

      if (format === 'csv') {
        const response = await fetch(`/api/admin/students/export?${queryParams}`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          notification.success({
            message: 'Export Successful',
            description: 'Students data exported to CSV successfully',
            placement: 'topRight',
          });
        } else {
          throw new Error('Export failed');
        }
      } else {
        const response = await fetch(`/api/admin/students/export?${queryParams}`);
        if (response.ok) {
          const data = await response.json();
          const { exportToExcel } = await import('@/utils/exportUtils');
          exportToExcel(data.data, data.filename);
          
          notification.success({
            message: 'Export Successful',
            description: 'Students data exported to Excel successfully',
            placement: 'topRight',
          });
        } else {
          throw new Error('Export failed');
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      notification.error({
        message: 'Export Failed',
        description: 'Failed to export students data. Please try again.',
        placement: 'topRight',
      });
    }
  };


  useEffect(() => {
    fetchStudents();
    fetchStatistics();
    fetchInstitutions();
  }, [filters]);

  const fetchInstitutions = async () => {
    try {
      const response = await fetch("/api/admin/institutions?limit=1000");
      if (response.ok) {
        const data = await response.json();
        setInstitutions(data.institutions);
      }
    } catch (error) {
      console.error("Error fetching institutions:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.institution && { institution: filters.institution }),
        ...(filters.department && { department: filters.department }),
        ...(filters.course && { course: filters.course }),
        ...(filters.semester && { semester: filters.semester }),
        ...(filters.gender && { gender: filters.gender }),
      });

      const response = await fetch(`/api/admin/students?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
        setPagination(data.pagination);
      } else if (response.status === 403) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch students',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch("/api/admin/students/statistics");
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedStudents.length === 0) {
      notification.warning({
        message: 'No Selection',
        description: 'Please select students first',
        placement: 'topRight',
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/students", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentIds: selectedStudents,
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
        fetchStudents();
        fetchStatistics();
        setSelectedStudents([]);
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

  const handleStudentAction = async (studentId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/students/${studentId}`, {
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
        fetchStudents();
        fetchStatistics();
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

  const handleEditStudent = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
        dateOfBirth: values.dateOfBirth ? dayjs(values.dateOfBirth).toISOString() : null,
        joiningDate: values.joiningDate ? dayjs(values.joiningDate).toISOString() : null,
      };

      const url = isEditMode 
        ? `/api/admin/students/${selectedStudent?._id}`
        : "/api/admin/students";
      
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
        setSelectedStudent(null);
        form.resetFields();
        fetchStudents();
        fetchStatistics();
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

  const getActionMenu = (record: Student) => (
    <Menu>
      <Menu.Item 
        key="view" 
        icon={<EyeOutlined />}
        onClick={() => {
          setSelectedStudent(record);
          setIsDrawerVisible(true);
        }}
      >
        View Details
      </Menu.Item>
      <Menu.Item 
        key="edit" 
        icon={<EditOutlined />}
        onClick={() => {
          setSelectedStudent(record);
          setIsEditMode(true);
          form.setFieldsValue({
            ...record,
            dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : null,
            joiningDate: record.joiningDate ? dayjs(record.joiningDate) : null,
            institutionId: record.institutionId._id,
          });
          setIsModalVisible(true);
        }}
      >
        Edit Student
      </Menu.Item>
      <Menu.Item 
        key="toggle" 
        icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
        onClick={() => handleStudentAction(record._id, record.isActive ? "deactivate" : "activate")}
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
            title: 'Delete Student',
            content: 'Are you sure you want to delete this student? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: () => handleStudentAction(record._id, "delete"),
          });
        }}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "Student",
      key: "student",
      render: (record: Student) => (
        <Space>
          <Avatar 
            icon={<UserOutlined />} 
            style={{ background: "#1890ff" }} 
          />
          <div>
            <div style={{ fontWeight: 600 }}>{record.fullName}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.admissionNumber}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Institution",
      dataIndex: ["institutionId", "orgName"],
      key: "institution",
      ellipsis: true,
      render: (text: string) => (
        <Text style={{ fontWeight: 500 }}>{text}</Text>
      ),
    },
    {
      title: "Course Details",
      key: "course",
      render: (record: Student) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.currentCourse}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.department} • {record.semester}
          </Text>
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (record: Student) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.phoneNumber}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.gender}
          </Text>
        </div>
      ),
    },
    {
      title: "Location",
      key: "location",
      render: (record: Student) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.state}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.district}
          </Text>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (record: Student) => (
        <Tag 
          color={record.isActive ? "success" : "error"}
          style={{ borderRadius: 6, fontWeight: 500 }}
        >
          {record.isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Student) => (
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
    selectedRowKeys: selectedStudents,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedStudents(selectedRowKeys as string[]);
    },
  };

  if (loading && !students.length) {
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
            Loading Students...
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
                Students Management
              </Title>
              <Text type="secondary">
                Manage and monitor all student records across institutions
              </Text>
            </div>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchStudents}
                style={{ borderRadius: 6 }}
              >
                Refresh
              </Button>
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item key="csv" onClick={() => handleExport('csv')}>
                      Export as CSV
                    </Menu.Item>
                    <Menu.Item key="excel" onClick={() => handleExport('excel')}>
                      Export as Excel
                    </Menu.Item>
                  </Menu>
                }
                trigger={['click']}
              >
                <Button 
                  icon={<DownloadOutlined />}
                  style={{ borderRadius: 6 }}
                >
                  Export
                </Button>
              </Dropdown>

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
                Add Student
              </Button>
            </Space>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={6}>
              <Card style={{ borderRadius: 8, border: "1px solid #f0f0f0" }}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <TeamOutlined style={{ fontSize: 24, color: "#495057" }} />
                    <Badge status="processing" text="Live" />
                  </div>
                  <Statistic
                    title="Total Students"
                    value={statistics.overview.total}
                    valueStyle={{ fontWeight: 600, fontSize: 24, color: "#2c3e50" }}
                  />
                  <Progress 
                    percent={statistics.overview.activePercentage} 
                    size="small"
                    format={() => `${statistics.overview.activePercentage}% active`}
                    strokeColor="#495057"
                  />
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card style={{ borderRadius: 8, border: "1px solid #f0f0f0" }}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <CheckCircleOutlined style={{ fontSize: 24, color: "#28a745" }} />
                    <Badge status="success" text="Active" />
                  </div>
                  <Statistic
                    title="Active Students"
                    value={statistics.overview.active}
                    valueStyle={{ fontWeight: 600, fontSize: 24, color: "#28a745" }}
                  />
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card style={{ borderRadius: 8, border: "1px solid #f0f0f0" }}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <BankOutlined style={{ fontSize: 24, color: "#6c757d" }} />
                    <Text type="secondary">Total</Text>
                  </div>
                  <Statistic
                    title="Departments"
                    value={statistics.overview.departmentCount}
                    valueStyle={{ fontWeight: 600, fontSize: 24, color: "#2c3e50" }}
                  />
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card style={{ borderRadius: 8, border: "1px solid #f0f0f0" }}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <UserOutlined style={{ fontSize: 24, color: "#6c757d" }} />
                    <Text type="secondary">Years</Text>
                  </div>
                  <Statistic
                    title="Average Age"
                    value={statistics.overview.avgAge}
                    valueStyle={{ fontWeight: 600, fontSize: 24, color: "#2c3e50" }}
                    suffix="years"
                  />
                </Space>
              </Card>
            </Col>
          </Row>
        )}

        {/* Filters Section */}
        <Card 
          title={
            <Space>
              <FilterOutlined />
              <span>Filter Students</span>
            </Space>
          }
          style={{ marginBottom: 24, borderRadius: 8 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8} md={6}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Search Students</Text>
              </div>
              <Input
                placeholder="Search by name, admission number..."
                prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                allowClear
                style={{ borderRadius: 6 }}
              />
            </Col>
            <Col xs={24} sm={8} md={4}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Institution</Text>
              </div>
              <Select
                placeholder="Select institution"
                style={{ width: "100%" }}
                value={filters.institution}
                onChange={(value) => setFilters({ ...filters, institution: value, page: 1 })}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {institutions.map((inst) => (
                  <Option key={inst._id} value={inst._id}>
                    {inst.orgName}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={8} md={3}>
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
                  <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                  Active
                </Option>
                <Option value="inactive">
                  <StopOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />
                  Inactive
                </Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={3}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Gender</Text>
              </div>
              <Select
                placeholder="Select gender"
                style={{ width: "100%" }}
                value={filters.gender}
                onChange={(value) => setFilters({ ...filters, gender: value, page: 1 })}
                allowClear
              >
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={3}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Department</Text>
              </div>
              <Input
                placeholder="Enter department"
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value, page: 1 })}
                allowClear
                style={{ borderRadius: 6 }}
              />
            </Col>
            <Col xs={24} sm={8} md={3}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Course</Text>
              </div>
              <Input
                placeholder="Enter course"
                value={filters.course}
                onChange={(e) => setFilters({ ...filters, course: e.target.value, page: 1 })}
                allowClear
                style={{ borderRadius: 6 }}
              />
            </Col>
          </Row>
        </Card>

        {/* Bulk Actions */}
        {selectedStudents.length > 0 && (
          <Card 
            style={{ 
              marginBottom: 24,
              borderRadius: 8,
              border: "2px solid #1890ff",
              backgroundColor: "#f6ffed",
            }}
          >
            <Space>
              <Text strong style={{ color: "#1890ff" }}>
                {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
              </Text>
              <Button 
                type="primary"
                size="small"
                onClick={() => handleBulkAction("activate")}
                style={{ borderRadius: 6 }}
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
                icon={<DownloadOutlined />}
                size="small"
                style={{ borderRadius: 6 }}
              >
                Export Selected
              </Button>
            </Space>
          </Card>
        )}

        {/* Students Table */}
        <Card
          title={
            <Space>
              <TeamOutlined />
              <span>Students List</span>
              <Badge count={pagination.total} style={{ backgroundColor: "#1890ff" }} />
            </Space>
          }
          style={{ borderRadius: 8, marginBottom: 24 }}
        >
          <Table
            columns={columns}
            dataSource={students}
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
                `${range[0]}-${range[1]} of ${total} students`,
              onChange: (page, pageSize) => {
                setFilters({ ...filters, page, limit: pageSize || 10 });
              },
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Analytics Dashboard */}
        {statistics && (
          <Card 
            title={
              <Space>
                <BarChartOutlined style={{ color: "#1890ff" }} />
                <span>Student Analytics</span>
              </Space>
            }
            style={{ borderRadius: 8 }}
          >
            <Tabs defaultActiveKey="demographics">
              <TabPane 
                tab={
                  <span>
                    <UserOutlined />
                    Demographics
                  </span>
                } 
                key="demographics"
              >
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <Card 
                      title="Gender Distribution" 
                      size="small"
                      style={{ borderRadius: 8 }}
                    >
                      {statistics.demographics.gender.map((item) => (
                        <div key={item._id} style={{ marginBottom: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontWeight: 600 }}>{item._id}</span>
                            <Badge count={item.count} style={{ backgroundColor: "#52c41a" }} />
                          </div>
                          <Progress 
                            percent={Math.round((item.count / statistics.overview.total) * 100)} 
                            size="small"
                            strokeColor="#52c41a"
                            showInfo={false}
                          />
                        </div>
                      ))}
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card 
                      title="Age Distribution" 
                      size="small"
                      style={{ borderRadius: 8 }}
                    >
                      {statistics.demographics.age.map((item) => (
                        <div key={item._id} style={{ marginBottom: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontWeight: 600 }}>{item._id}</span>
                            <Badge count={item.count} style={{ backgroundColor: "#1890ff" }} />
                          </div>
                          <Progress 
                            percent={Math.round((item.count / statistics.overview.total) * 100)} 
                            size="small"
                            strokeColor="#1890ff"
                            showInfo={false}
                          />
                        </div>
                      ))}
                    </Card>
                  </Col>
                </Row>
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <TrophyOutlined />
                    Academic
                  </span>
                } 
                key="academic"
              >
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={8}>
                    <Card 
                      title="Top Departments" 
                      size="small"
                      style={{ borderRadius: 8 }}
                    >
                      {statistics.academic.departments.slice(0, 5).map((dept) => (
                        <div key={dept._id} style={{ marginBottom: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <Text strong>{dept._id}</Text>
                            <Badge count={dept.count} />
                          </div>
                          <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                            Active: {dept.activeCount} | Male: {dept.maleCount} | Female: {dept.femaleCount}
                          </div>
                          <Progress 
                            percent={Math.round((dept.count / statistics.overview.total) * 100)} 
                            size="small"
                            showInfo={false}
                          />
                        </div>
                      ))}
                    </Card>
                  </Col>
                  <Col xs={24} lg={8}>
                    <Card 
                      title="Top Courses" 
                      size="small"
                      style={{ borderRadius: 8 }}
                    >
                      {statistics.academic.courses.slice(0, 5).map((course) => (
                        <div key={course._id} style={{ marginBottom: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <Text strong>{course._id}</Text>
                            <Badge count={course.count} />
                          </div>
                          <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                            Departments: {course.departments.length}
                          </div>
                          <Progress 
                            percent={Math.round((course.count / statistics.overview.total) * 100)} 
                            size="small"
                            showInfo={false}
                          />
                        </div>
                      ))}
                    </Card>
                  </Col>
                  <Col xs={24} lg={8}>
                    <Card 
                      title="Semester Distribution" 
                      size="small"
                      style={{ borderRadius: 8 }}
                    >
                      {statistics.academic.semesters.map((sem) => (
                        <div key={sem._id} style={{ marginBottom: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontWeight: 600 }}>Semester {sem._id}</span>
                            <Badge count={sem.count} />
                          </div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Active: {sem.activeCount}
                          </Text>
                          <Progress 
                            percent={Math.round((sem.count / statistics.overview.total) * 100)} 
                            size="small"
                            showInfo={false}
                            style={{ marginTop: 8 }}
                          />
                        </div>
                      ))}
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              <TabPane 
                tab={
                  <span>
                    <BankOutlined />
                    Institutions
                  </span>
                } 
                key="institutions"
              >
                <Card 
                  title="Students by Institution" 
                  size="small"
                  style={{ borderRadius: 8 }}
                >
                  {statistics.institutions.slice(0, 10).map((inst) => (
                    <div key={inst._id} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <Text strong>{inst.institutionName}</Text>
                        <Badge count={inst.count} />
                      </div>
                      <Progress 
                        percent={inst.activePercentage} 
                        size="small"
                        format={() => `${inst.activeCount}/${inst.count} active`}
                        strokeColor={{
                          '0%': '#ff4d4f',
                          '50%': '#faad14',
                          '100%': '#52c41a',
                        }}
                      />
                    </div>
                  ))}
                </Card>
              </TabPane>
            </Tabs>
          </Card>
        )}
      </div>

      {/* Student Details Drawer */}
      <Drawer
        title={
          <Space>
            <UserOutlined style={{ color: "#1890ff" }} />
            <span>Student Details</span>
          </Space>
        }
        placement="right"
        width={600}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        {selectedStudent && (
          <div>
            {/* Student Header */}
            <div style={{ 
              textAlign: "center", 
              marginBottom: 24,
              padding: 24,
              background: "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)",
              borderRadius: 8,
              color: "white"
            }}>
              <Avatar 
                size={64} 
                icon={<UserOutlined />} 
                style={{ 
                  background: "rgba(255,255,255,0.2)",
                  marginBottom: 16
                }} 
              />
              <Title level={4} style={{ color: "white", marginBottom: 8 }}>
                {selectedStudent.fullName}
              </Title>
              <Tag 
                color={selectedStudent.isActive ? "success" : "error"}
                style={{ borderRadius: 6, fontWeight: 500 }}
              >
                {selectedStudent.isActive ? "Active" : "Inactive"}
              </Tag>
            </div>

            {/* Student Details */}
            <Card 
              title="Personal Information" 
              style={{ marginBottom: 16, borderRadius: 8 }}
              size="small"
            >
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Admission Number">
                  <Text strong copyable>{selectedStudent.admissionNumber}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Institution">
                  <Text strong>{selectedStudent.institutionId.orgName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Course">
                  {selectedStudent.currentCourse}
                </Descriptions.Item>
                <Descriptions.Item label="Department">
                  {selectedStudent.department}
                </Descriptions.Item>
                <Descriptions.Item label="Semester">
                  {selectedStudent.semester}
                </Descriptions.Item>
                <Descriptions.Item label="Gender">
                  {selectedStudent.gender}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  <Text copyable>{selectedStudent.phoneNumber}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Date of Birth">
                  {new Date(selectedStudent.dateOfBirth).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Joining Date">
                  {new Date(selectedStudent.joiningDate).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Location">
                  {selectedStudent.state}, {selectedStudent.district}, {selectedStudent.county}
                </Descriptions.Item>
                <Descriptions.Item label="Registered">
                  {new Date(selectedStudent.createdAt).toLocaleDateString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Action Buttons */}
            <Space style={{ width: "100%", justifyContent: "center" }}>
              <Button 
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setIsEditMode(true);
                  form.setFieldsValue({
                    ...selectedStudent,
                    dateOfBirth: selectedStudent.dateOfBirth ? dayjs(selectedStudent.dateOfBirth) : null,
                    joiningDate: selectedStudent.joiningDate ? dayjs(selectedStudent.joiningDate) : null,
                    institutionId: selectedStudent.institutionId._id,
                  });
                  setIsModalVisible(true);
                  setIsDrawerVisible(false);
                }}
                style={{ borderRadius: 6 }}
              >
                Edit Student
              </Button>
              <Button 
                onClick={() => handleStudentAction(selectedStudent._id, selectedStudent.isActive ? "deactivate" : "activate")}
                style={{ borderRadius: 6 }}
              >
                {selectedStudent.isActive ? "Deactivate" : "Activate"}
              </Button>
            </Space>
          </div>
        )}
      </Drawer>

      {/* Add/Edit Student Modal */}
      <Modal
        title={
          <Space>
            {isEditMode ? <EditOutlined /> : <PlusOutlined />}
            <span>{isEditMode ? "Edit Student" : "Add New Student"}</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedStudent(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditStudent}
          style={{ marginTop: 24 }}
        >
          <Card title="Personal Information" style={{ marginBottom: 24, borderRadius: 8 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="fullName"
                  label="Full Name"
                  rules={[{ required: true, message: "Please enter full name" }]}
                >
                  <Input style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="admissionNumber"
                  label="Admission Number"
                  rules={[{ required: true, message: "Please enter admission number" }]}
                >
                  <Input style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="gender"
                  label="Gender"
                  rules={[{ required: true, message: "Please select gender" }]}
                >
                  <Select style={{ borderRadius: 6 }}>
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="phoneNumber"
                  label="Phone Number"
                  rules={[{ required: true, message: "Please enter phone number" }]}
                >
                  <Input style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="dateOfBirth"
                  label="Date of Birth"
                  rules={[{ required: true, message: "Please select date of birth" }]}
                >
                  <DatePicker style={{ width: "100%", borderRadius: 6 }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title="Location Information" style={{ marginBottom: 24, borderRadius: 8 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="state"
                  label="State"
                  rules={[{ required: true, message: "Please enter state" }]}
                >
                  <Input style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="district"
                  label="District"
                  rules={[{ required: true, message: "Please enter district" }]}
                >
                  <Input style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="county"
                  label="County"
                  rules={[{ required: true, message: "Please enter county" }]}
                >
                  <Input style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title="Academic Information" style={{ marginBottom: 24, borderRadius: 8 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="currentCourse"
                  label="Current Course"
                  rules={[{ required: true, message: "Please enter current course" }]}
                >
                  <Input style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="department"
                  label="Department"
                  rules={[{ required: true, message: "Please enter department" }]}
                >
                  <Input style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="semester"
                  label="Semester"
                  rules={[{ required: true, message: "Please enter semester" }]}
                >
                  <Input style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="joiningDate"
                  label="Joining Date"
                  rules={[{ required: true, message: "Please select joining date" }]}
                >
                  <DatePicker style={{ width: "100%", borderRadius: 6 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="institutionId"
                  label="Institution"
                  rules={[{ required: true, message: "Please select institution" }]}
                >
                  <Select 
                    placeholder="Select institution"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                    style={{ borderRadius: 6 }}
                  >
                    {institutions.map((inst) => (
                      <Option key={inst._id} value={inst._id}>
                        {inst.orgName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Form.Item style={{ textAlign: "center", marginTop: 24 }}>
            <Space size="large">
              <Button 
                type="primary" 
                htmlType="submit"
                size="large"
                style={{ borderRadius: 6, minWidth: 120 }}
              >
                {isEditMode ? "Update Student" : "Add Student"}
              </Button>
              <Button 
                size="large"
                onClick={() => {
                  setIsModalVisible(false);
                  setSelectedStudent(null);
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