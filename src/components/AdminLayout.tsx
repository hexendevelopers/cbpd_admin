"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Layout,
  Menu,
  Button,
  Typography,
  Space,
  notification,
  Breadcrumb,
  theme,
  Modal,
} from "antd";
import {
  DashboardOutlined,
  BankOutlined,
  TeamOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  BookOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import "../styles/admin-layout.css";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      notification.success({
        message: "Success",
        description: "Logged out successfully",
        placement: "topRight",
      });
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      notification.error({
        message: "Error",
        description: "Failed to logout. Please try again.",
        placement: "topRight",
      });
    } finally {
      setLogoutModalVisible(false);
    }
  };

  const showLogoutConfirm = () => {
    setLogoutModalVisible(true);
  };

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/admin/institutions",
      icon: <BankOutlined />,
      label: "Institutions",
    },
    {
      key: "/admin/students",
      icon: <TeamOutlined />,
      label: "Students",
    },
    {
      key: "/admin/centers",
      icon: <EnvironmentOutlined />,
      label: "Centers",
    },
    {
      key: "/admin/memberships",
      icon: <IdcardOutlined />,
      label: "Memberships",
    },
    {
      key: "courses",
      icon: <BookOutlined />,
      label: "Courses",
      children: [
        {
          key: "/admin/courses",
          label: "All Courses",
        },
        {
          key: "/admin/course-categories",
          label: "Categories",
        },
      ],
    },
    {
      key: "/admin/admins",
      icon: <SafetyCertificateOutlined />,
      label: "Administrators",
    },
  ];

  const getBreadcrumbItems = () => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbItems = [
      {
        title: (
          <Space>
            <HomeOutlined />
            <span>Home</span>
          </Space>
        ),
      },
    ];
  
    if (pathSegments.length > 1) {
      pathSegments.slice(1).forEach((segment, index) => {
        const isLast = index === pathSegments.length - 2;
        let title = segment.charAt(0).toUpperCase() + segment.slice(1);
  
        // Handle special cases
        if (segment === "course-categories") {
          title = "Course Categories";
        }
  
        breadcrumbItems.push({
          title: <span>{isLast ? <Text strong>{title}</Text> : title}</span>,
        });
      });
    }
  
    return breadcrumbItems;
  };

  const getSelectedKeys = () => {
    if (pathname === "/admin") return ["/admin"];
    return [pathname];
  };

  const getOpenKeys = () => {
    if (
      pathname.includes("/courses") ||
      pathname.includes("/course-categories")
    ) {
      return ["courses"];
    }
    return [];
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: "#1e293b",
          boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
        className=" flex flex-col h-full justify-between"
        width={280}
        collapsedWidth={80}
      >
        <div className=" flex flex-col h-full justify-between">
          <div
            style={{
              height: 64,
              margin: 16,
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? 0 : "0 16px",
              transition: "all 0.2s",
            }}
          >
            <SafetyCertificateOutlined
              style={{
                fontSize: 24,
                color: "#64748b",
                marginRight: collapsed ? 0 : 12,
              }}
            />
            {!collapsed && (
              <div>
                <Title
                  level={5}
                  style={{ color: "white", margin: 0, fontWeight: 600 }}
                >
                  CBPD Admin
                </Title>
                <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
                  Management Portal
                </Text>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={getSelectedKeys()}
            defaultOpenKeys={getOpenKeys()}
            items={menuItems}
            onClick={({ key }) => {
              if (key.startsWith("/")) {
                router.push(key);
              }
            }}
            style={{
              border: "none",
              background: "transparent",
              flex: 1,
            }}
          />

          {/* Logout Button */}
          <div
            style={{
              padding: 16,
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={showLogoutConfirm}
              style={{
                width: "100%",
                height: 40,
                color: "rgba(255,255,255,0.85)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
            >
              {!collapsed && <span style={{ marginLeft: 8 }}>Logout</span>}
            </Button>
          </div>

          {/* Sidebar Footer */}
          {!collapsed && (
            <div
              style={{
                padding: "8px 16px",
                textAlign: "center",
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
                Version 1.0.0
              </Text>
            </div>
          )}
        </div>
        {/* Logo Section */}
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 80 : 280,
          transition: "margin-left 0.2s",
        }}
      >
        {/* Header */}
        <Header
          style={{
            padding: "0 24px",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            zIndex: 1,
            position: "fixed",
            top: 0,
            right: 0,
            left: collapsed ? 80 : 280,
            transition: "left 0.2s",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 40,
                height: 40,
                borderRadius: 8,
                color: "#4a5568",
              }}
            />

            <Breadcrumb
              items={getBreadcrumbItems()}
              style={{ marginLeft: 16 }}
            />
          </Space>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: "88px 24px 24px 24px",
            padding: 0,
            minHeight: "calc(100vh - 112px)",
            background: "#f7f8fc",
            borderRadius: borderRadiusLG,
            overflow: "auto",
          }}
        >
          {children}
        </Content>
      </Layout>

      {/* Logout Confirmation Modal */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: "#f59e0b" }} />
            <span>Confirm Logout</span>
          </Space>
        }
        open={logoutModalVisible}
        onOk={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
        okText="Yes, Logout"
        cancelText="Cancel"
        okButtonProps={{
          style: {
            background: "#ef4444",
            border: "none",
          },
        }}
        cancelButtonProps={{
          style: {
            color: "#4a5568",
            border: "1px solid #cbd5e0",
          },
        }}
      >
        <div style={{ padding: "16px 0" }}>
          <Text style={{ fontSize: 16, color: "#4a5568" }}>
            Are you sure you want to logout from the admin dashboard?
          </Text>
        </div>
      </Modal>
    </Layout>
  );
}
