"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Space,
  Typography,
  Progress,
  List,
  Avatar,
  Tag,
  Alert,
  Spin,
  Tabs,
  Badge,
  notification,
  Empty,
  Divider,
} from "antd";
import {
  UserOutlined,
  BankOutlined,
  TeamOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  EyeOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/AdminLayout";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface DashboardStats {
  statistics: {
    institutions: {
      total: number;
      approved: number;
      pending: number;
      terminated: number;
      recent: number;
    };
    students: {
      total: number;
      active: number;
      inactive: number;
      recent: number;
    };
    admins: {
      total: number;
      active: number;
    };
  };
  trends: {
    monthlyInstitutions: Array<{ _id: { year: number; month: number }; count: number }>;
    monthlyStudents: Array<{ _id: { year: number; month: number }; count: number }>;
  };
  topInstitutions: Array<{ institutionName: string; studentCount: number }>;
  recentActivities: {
    institutions: Array<{ _id: string; orgName: string; createdAt: string; isApproved: boolean }>;
    students: Array<{ _id: string; fullName: string; createdAt: string; institutionId: { orgName: string } }>;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 403) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      notification.error({
        message: 'Error',
        description: 'Failed to load dashboard data',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
            Loading Dashboard...
          </Text>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div style={{ padding: "50px" }}>
          <Alert
            message="Error"
            description="Failed to load dashboard data"
            type="error"
            showIcon
            action={
              <Button size="small" onClick={fetchDashboardData}>
                Retry
              </Button>
            }
          />
        </div>
      </AdminLayout>
    );
  }

  const institutionColumns = [
    {
      title: "Institution",
      dataIndex: "institutionName",
      key: "institutionName",
      render: (text: string) => (
        <Text strong style={{ color: "#2d3748" }}>{text}</Text>
      ),
    },
    {
      title: "Students",
      dataIndex: "studentCount",
      key: "studentCount",
      render: (count: number) => (
        <Badge 
          count={count} 
          style={{ 
            backgroundColor: "#64748b",
            boxShadow: "0 2px 8px rgba(100, 116, 139, 0.3)"
          }} 
        />
      ),
    },
  ];

  const recentInstitutionColumns = [
    {
      title: "Institution",
      dataIndex: "orgName",
      key: "orgName",
      render: (text: string) => (
        <Text strong style={{ color: "#1a202c" }}>{text}</Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "isApproved",
      key: "isApproved",
      render: (approved: boolean) => (
        <Tag 
          color={approved ? "#22c55e" : "#f59e0b"} 
          style={{ 
            borderRadius: 6,
            fontWeight: 500,
            border: "none",
          }}
        >
          {approved ? "Approved" : "Pending"}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <Text style={{ color: "#4a5568" }}>{new Date(date).toLocaleDateString()}</Text>
      ),
    },
  ];

  const approvalRate = stats.statistics.institutions.total > 0 
    ? Math.round((stats.statistics.institutions.approved / stats.statistics.institutions.total) * 100)
    : 0;

  const studentActiveRate = stats.statistics.students.total > 0
    ? Math.round((stats.statistics.students.active / stats.statistics.students.total) * 100)
    : 0;

  return (
    <AdminLayout>
      <div style={{ padding: "24px" }}>
        {/* Welcome Section */}
        {/* <Card 
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            marginBottom: 24,
          }}
          bodyStyle={{ padding: "24px" }}
        >
          <Row align="middle">
            <Col span={18}>
              <Title level={2} style={{ color: "#1a202c", marginBottom: 8, fontWeight: 600 }}>
                CBPD Admin Dashboard
              </Title>
              <Paragraph style={{ color: "#4a5568", fontSize: 16, marginBottom: 0 }}>
                Manage educational institutions and students efficiently.
              </Paragraph>
            </Col>
            <Col span={6} style={{ textAlign: "right" }}>
              <div style={{
                background: "#f7f8fc",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: 16,
              }}>
                <DashboardOutlined style={{ fontSize: 32, color: "#2d3748", marginBottom: 8 }} />
                <div style={{ fontSize: 14, fontWeight: 500, color: "#4a5568" }}>Admin Portal</div>
              </div>
            </Col>
          </Row>
        </Card> */}

        {/* Key Metrics */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{ 
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <BankOutlined style={{ fontSize: 24, color: "#64748b" }} />
                  <Tag style={{ margin: 0, background: "#f1f5f9", color: "#475569", border: "none" }}>
                    +{stats.statistics.institutions.recent}
                  </Tag>
                </div>
                <Statistic
                  title="Total Institutions"
                  value={stats.statistics.institutions.total}
                  valueStyle={{ fontWeight: 600, fontSize: 28, color: "#1a202c" }}
                />
                <Progress 
                  percent={approvalRate} 
                  size="small" 
                  format={() => `${approvalRate}% approved`}
                  strokeColor="#64748b"
                />
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{ 
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <TeamOutlined style={{ fontSize: 24, color: "#22c55e" }} />
                  <Tag style={{ margin: 0, background: "#f0fdf4", color: "#15803d", border: "none" }}>
                    +{stats.statistics.students.recent}
                  </Tag>
                </div>
                <Statistic
                  title="Total Students"
                  value={stats.statistics.students.total}
                  valueStyle={{ fontWeight: 600, fontSize: 28, color: "#1a202c" }}
                />
                <Progress 
                  percent={studentActiveRate} 
                  size="small" 
                  format={() => `${studentActiveRate}% active`}
                  strokeColor="#22c55e"
                />
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{ 
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <ClockCircleOutlined style={{ fontSize: 24, color: "#f59e0b" }} />
                  {stats.statistics.institutions.pending > 0 && (
                    <Badge status="processing" text="Action Required" />
                  )}
                </div>
                <Statistic
                  title="Pending Approvals"
                  value={stats.statistics.institutions.pending}
                  valueStyle={{ fontWeight: 600, fontSize: 28, color: "#f59e0b" }}
                />
                {stats.statistics.institutions.pending > 0 && (
                  <Button 
                    type="primary"
                    size="small"
                    onClick={() => router.push("/admin/institutions?status=pending")}
                    style={{ 
                      width: "100%",
                      background: "#2d3748",
                      border: "none"
                    }}
                  >
                    Review Now
                  </Button>
                )}
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{ 
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <SafetyCertificateOutlined style={{ fontSize: 24, color: "#64748b" }} />
                  <Badge status="success" text="Online" />
                </div>
                <Statistic
                  title="Active Admins"
                  value={stats.statistics.admins.active}
                  valueStyle={{ fontWeight: 600, fontSize: 28, color: "#1a202c" }}
                  suffix={<Text style={{ color: "#4a5568" }}>/ {stats.statistics.admins.total}</Text>}
                />
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Status Breakdown */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <BankOutlined style={{ color: "#64748b" }} />
                  <span style={{ color: "#1a202c" }}>Institution Status</span>
                </Space>
              }
              style={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
              extra={<Badge status="processing" text="Live" />}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ textAlign: "center", padding: 16 }}>
                    <CheckCircleOutlined style={{ fontSize: 32, color: "#22c55e", marginBottom: 8 }} />
                    <div style={{ fontSize: 24, fontWeight: 600, color: "#22c55e" }}>
                      {stats.statistics.institutions.approved}
                    </div>
                    <div style={{ color: "#4a5568", fontSize: 14 }}>Approved</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: "center", padding: 16 }}>
                    <ClockCircleOutlined style={{ fontSize: 32, color: "#f59e0b", marginBottom: 8 }} />
                    <div style={{ fontSize: 24, fontWeight: 600, color: "#f59e0b" }}>
                      {stats.statistics.institutions.pending}
                    </div>
                    <div style={{ color: "#4a5568", fontSize: 14 }}>Pending</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: "center", padding: 16 }}>
                    <StopOutlined style={{ fontSize: 32, color: "#ef4444", marginBottom: 8 }} />
                    <div style={{ fontSize: 24, fontWeight: 600, color: "#ef4444" }}>
                      {stats.statistics.institutions.terminated}
                    </div>
                    <div style={{ color: "#4a5568", fontSize: 14 }}>Terminated</div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <TeamOutlined style={{ color: "#22c55e" }} />
                  <span style={{ color: "#1a202c" }}>Student Status</span>
                </Space>
              }
              style={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
              extra={
                <Tag style={{ background: "#f0fdf4", color: "#15803d", border: "none" }}>
                  {studentActiveRate}% Active
                </Tag>
              }
            >
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ textAlign: "center", padding: 16 }}>
                    <ThunderboltOutlined style={{ fontSize: 32, color: "#22c55e", marginBottom: 8 }} />
                    <div style={{ fontSize: 24, fontWeight: 600, color: "#22c55e" }}>
                      {stats.statistics.students.active}
                    </div>
                    <div style={{ color: "#4a5568", fontSize: 14 }}>Active</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: "center", padding: 16 }}>
                    <StopOutlined style={{ fontSize: 32, color: "#ef4444", marginBottom: 8 }} />
                    <div style={{ fontSize: 24, fontWeight: 600, color: "#ef4444" }}>
                      {stats.statistics.students.inactive}
                    </div>
                    <div style={{ color: "#4a5568", fontSize: 14 }}>Inactive</div>
                  </div>
                </Col>
              </Row>
              <Divider />
              <Progress 
                percent={studentActiveRate}
                strokeColor="#22c55e"
                format={() => `${studentActiveRate}% Active Rate`}
              />
            </Card>
          </Col>
        </Row>

        {/* Data Tables */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <TrophyOutlined style={{ color: "#f59e0b" }} />
                  <span style={{ color: "#1a202c" }}>Top Institutions</span>
                </Space>
              }
              style={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
              extra={
                <Button 
                  type="link" 
                  icon={<EyeOutlined />}
                  onClick={() => router.push("/admin/institutions")}
                  style={{ color: "#2d3748" }}
                >
                  View All
                </Button>
              }
            >
              <Table
                dataSource={stats.topInstitutions}
                columns={institutionColumns}
                pagination={false}
                size="small"
                rowKey="institutionName"
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <BarChartOutlined style={{ color: "#64748b" }} />
                  <span style={{ color: "#1a202c" }}>Recent Activities</span>
                </Space>
              }
              style={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
            >
              <Tabs defaultActiveKey="institutions" size="small">
                <TabPane 
                  tab={
                    <span>
                      <BankOutlined />
                      Institutions
                    </span>
                  } 
                  key="institutions"
                >
                  <Table
                    dataSource={stats.recentActivities.institutions.slice(0, 5)}
                    columns={recentInstitutionColumns}
                    pagination={false}
                    size="small"
                    rowKey="_id"
                  />
                </TabPane>
                <TabPane 
                  tab={
                    <span>
                      <TeamOutlined />
                      Students
                    </span>
                  } 
                  key="students"
                >
                  <List
                    size="small"
                    dataSource={stats.recentActivities.students.slice(0, 5)}
                    renderItem={(student) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              icon={<UserOutlined />} 
                              style={{ background: "#64748b" }} 
                            />
                          }
                          title={<Text strong style={{ color: "#1a202c" }}>{student.fullName}</Text>}
                          description={
                            <Text style={{ color: "#4a5568" }}>
                              {student.institutionId.orgName} • {new Date(student.createdAt).toLocaleDateString()}
                            </Text>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Card 
          title={
            <Space>
              <DashboardOutlined style={{ color: "#64748b" }} />
              <span style={{ color: "#1a202c" }}>Quick Actions</span>
            </Space>
          }
          style={{ borderRadius: 8, marginBottom: 24, border: "1px solid #e2e8f0" }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card 
                hoverable
                style={{ 
                  textAlign: "center",
                  borderRadius: 8,
                  border: "1px solid #fbbf24",
                  background: "#fffbeb",
                }}
                bodyStyle={{ padding: 20 }}
                onClick={() => router.push("/admin/institutions?status=pending")}
              >
                <ClockCircleOutlined style={{ fontSize: 32, color: "#f59e0b", marginBottom: 12 }} />
                <Title level={5} style={{ marginBottom: 8, color: "#1a202c" }}>Review Pending</Title>
                <Text style={{ color: "#4a5568" }}>
                  {stats.statistics.institutions.pending} awaiting approval
                </Text>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card 
                hoverable
                style={{ 
                  textAlign: "center",
                  borderRadius: 8,
                  border: "1px solid #4ade80",
                  background: "#f0fdf4",
                }}
                bodyStyle={{ padding: 20 }}
                onClick={() => router.push("/admin/students")}
              >
                <TeamOutlined style={{ fontSize: 32, color: "#22c55e", marginBottom: 12 }} />
                <Title level={5} style={{ marginBottom: 8, color: "#1a202c" }}>Manage Students</Title>
                <Text style={{ color: "#4a5568" }}>
                  {stats.statistics.students.total} total students
                </Text>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card 
                hoverable
                style={{ 
                  textAlign: "center",
                  borderRadius: 8,
                  border: "1px solid #94a3b8",
                  background: "#f8fafc",
                }}
                bodyStyle={{ padding: 20 }}
                onClick={() => router.push("/admin/institutions")}
              >
                <BankOutlined style={{ fontSize: 32, color: "#64748b", marginBottom: 12 }} />
                <Title level={5} style={{ marginBottom: 8, color: "#1a202c" }}>Institutions</Title>
                <Text style={{ color: "#4a5568" }}>
                  Manage all institutions
                </Text>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card 
                hoverable
                style={{ 
                  textAlign: "center",
                  borderRadius: 8,
                  border: "1px solid #64748b",
                  background: "#f8fafc",
                }}
                bodyStyle={{ padding: 20 }}
                onClick={() => router.push("/admin/admins")}
              >
                <SafetyCertificateOutlined style={{ fontSize: 32, color: "#2d3748", marginBottom: 12 }} />
                <Title level={5} style={{ marginBottom: 8, color: "#1a202c" }}>Admin Control</Title>
                <Text style={{ color: "#4a5568" }}>
                  Manage administrators
                </Text>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* System Alert */}
        {stats.statistics.institutions.pending > 5 && (
          <Alert
            message="Attention Required"
            description={`You have ${stats.statistics.institutions.pending} institutions waiting for approval. Please review them to maintain service quality.`}
            type="warning"
            showIcon
            style={{ borderRadius: 8 }}
            action={
              <Button 
                size="small" 
                type="primary"
                onClick={() => router.push("/admin/institutions?status=pending")}
                style={{
                  background: "#2d3748",
                  border: "none"
                }}
              >
                Review Now
              </Button>
            }
          />
        )}
      </div>
    </AdminLayout>
  );
}