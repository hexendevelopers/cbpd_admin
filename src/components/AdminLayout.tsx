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
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

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
      icon: (
        <svg
          width="20"
          height="20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          transform="rotate(0 0 0)"
        >
          <path
            d="M3.25 6C3.25 4.75736 4.25736 3.75 5.5 3.75H9C10.2426 3.75 11.25 4.75736 11.25 6V9.49998C11.25 10.7426 10.2426 11.75 9 11.75H5.5C4.25736 11.75 3.25 10.7426 3.25 9.49998V6Z"
            fill="#ffff"
          />
          <path
            d="M3.25 15.5C3.25 14.2574 4.25736 13.25 5.5 13.25H9C10.2426 13.25 11.25 14.2574 11.25 15.5V19C11.25 20.2426 10.2426 21.25 9 21.25H5.5C4.25736 21.25 3.25 20.2426 3.25 19V15.5Z"
            fill="#ffff"
          />
          <path
            d="M12.75 6C12.75 4.75736 13.7574 3.75 15 3.75H18.5C19.7426 3.75 20.75 4.75736 20.75 6V9.49998C20.75 10.7426 19.7426 11.75 18.5 11.75H15C13.7574 11.75 12.75 10.7426 12.75 9.49998V6Z"
            fill="#ffff"
          />
          <path
            d="M12.75 15.5C12.75 14.2574 13.7574 13.25 15 13.25H18.5C19.7426 13.25 20.75 14.2574 20.75 15.5V19C20.75 20.2426 19.7426 21.25 18.5 21.25H15C13.7574 21.25 12.75 20.2426 12.75 19V15.5Z"
            fill="#ffff"
          />
        </svg>
      ),
      label: "Dashboard",
    },
    {
      key: "/admin/institutions",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          transform="rotate(0 0 0)"
        >
          <path
            d="M9.75 6C9.75 4.75736 10.7574 3.75 12 3.75H19C20.2426 3.75 21.25 4.75736 21.25 6V20.5C21.25 20.9142 20.9142 21.25 20.5 21.25H9.75V6ZM14 9.0835C13.5858 9.0835 13.25 9.41928 13.25 9.8335C13.25 10.2477 13.5858 10.5835 14 10.5835H17C17.4142 10.5835 17.75 10.2477 17.75 9.8335C17.75 9.41928 17.4142 9.0835 17 9.0835H14ZM14 14.4168C13.5858 14.4168 13.25 14.7526 13.25 15.1668C13.25 15.581 13.5858 15.9168 14 15.9168H17C17.4142 15.9168 17.75 15.581 17.75 15.1668C17.75 14.7526 17.4142 14.4168 17 14.4168H14Z"
            fill="#ffffff"
          />
          <path
            d="M8.75 8.25H6C4.75736 8.25 3.75 9.25736 3.75 10.5V20.5C3.75 20.9142 4.08579 21.25 4.5 21.25H8.75V17.5H7.50586C7.09165 17.5 6.75586 17.1642 6.75586 16.75C6.75586 16.3358 7.09165 16 7.50586 16H8.75V13.5H7.50586C7.09165 13.5 6.75586 13.1642 6.75586 12.75C6.75586 12.3358 7.09165 12 7.50586 12H8.75V8.25Z"
            fill="#ffffff"
          />
        </svg>
      ),
      label: "Institutions",
    },
    {
      key: "/admin/students",
      icon: (
        <svg
          width="20"
          height="20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          transform="rotate(0 0 0)"
        >
          <path
            d="M8.80437 4.10156C6.7626 4.10156 5.10742 5.75674 5.10742 7.79851C5.10742 9.84027 6.7626 11.4955 8.80437 11.4955C10.8461 11.4955 12.5013 9.84027 12.5013 7.79851C12.5013 5.75674 10.8461 4.10156 8.80437 4.10156Z"
            fill="#ffffff"
          />
          <path
            d="M1.85175 19.16L1.85172 19.1577L1.85165 19.1513L1.85156 19.1321C1.85156 19.1164 1.85169 19.0952 1.85215 19.0688C1.85309 19.016 1.85538 18.9421 1.86069 18.8502C1.8713 18.6666 1.89402 18.4095 1.94242 18.1031C2.03866 17.4938 2.23948 16.6698 2.66304 15.837C3.08862 15.0001 3.74414 14.1453 4.74743 13.5023C5.75344 12.8576 7.06383 12.4551 8.75032 12.4551C10.4368 12.4551 11.7472 12.8576 12.7532 13.5023C13.7565 14.1453 14.412 15.0001 14.8376 15.837C15.2612 16.6698 15.462 17.4938 15.5582 18.1031C15.6066 18.4095 15.6293 18.6666 15.6399 18.8502C15.6453 18.9421 15.6476 19.016 15.6485 19.0688C15.649 19.0952 15.6491 19.1164 15.6491 19.1321L15.649 19.1513L15.6489 19.1577L15.6489 19.161C15.6418 19.5701 15.3081 19.8988 14.899 19.8988H2.60167C2.19253 19.8988 1.85888 19.5709 1.85178 19.1618C1.85178 19.1618 1.85179 19.1625 1.85175 19.16Z"
            fill="#ffffff"
          />
          <path
            d="M17.0209 19.8988C17.0999 19.6756 17.1446 19.4363 17.149 19.187L17.1491 19.1799L17.1493 19.1676L17.1494 19.1387L17.1494 19.1327C17.1494 19.1083 17.1492 19.078 17.1486 19.0422C17.1473 18.9708 17.1443 18.8769 17.1378 18.7637C17.1247 18.538 17.0974 18.2312 17.0402 17.8691C17.0103 17.6801 16.9717 17.472 16.9215 17.2494C16.9165 17.2261 16.9113 17.2028 16.9058 17.1794C16.6448 16.0607 16.0667 14.4931 14.7497 13.189C14.515 12.9567 14.2627 12.7384 13.9924 12.5363C14.3865 12.4831 14.8056 12.4551 15.2509 12.4551C16.9373 12.4551 18.2477 12.8576 19.2537 13.5023C20.257 14.1453 20.9126 15.0001 21.3381 15.837C21.7617 16.6698 21.9625 17.4938 22.0588 18.1031C22.1072 18.4095 22.1299 18.6666 22.1405 18.8502C22.1458 18.9421 22.1481 19.016 22.149 19.0688C22.1495 19.0952 22.1496 19.1164 22.1496 19.1321L22.1495 19.1513L22.1495 19.1577L22.1494 19.161C22.1423 19.5701 21.8086 19.8988 21.3995 19.8988H17.0209Z"
            fill="#ffffff"
          />
          <path
            d="M14.0028 7.79851C14.0028 8.89595 13.6627 9.91394 13.082 10.7528C13.7007 11.219 14.4705 11.4955 15.3049 11.4955C17.3467 11.4955 19.0018 9.84027 19.0018 7.79851C19.0018 5.75674 17.3467 4.10156 15.3049 4.10156C14.4705 4.10156 13.7007 4.37797 13.082 4.84422C13.6627 5.68307 14.0028 6.70106 14.0028 7.79851Z"
            fill="#ffffff"
          />
        </svg>
      ),
      label: "Students",
    },
    {
      key: "/admin/centers",
      icon: (
        <svg
          width="20"
          height="20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          transform="rotate(0 0 0)"
        >
          <path
            d="M5.03125 10.392C5.03125 6.26528 8.3766 2.91992 12.5033 2.91992C16.63 2.91992 19.9754 6.26528 19.9754 10.392C19.9754 13.194 18.9108 15.7454 17.6454 17.7938C16.3778 19.8458 14.8791 21.441 13.9389 22.3454C13.139 23.1148 11.9045 23.1163 11.1026 22.3493C10.1581 21.4458 8.65084 19.8507 7.37569 17.7982C6.1028 15.7493 5.03125 13.1963 5.03125 10.392ZM9.50391 10.3906C9.50391 12.0475 10.8471 13.3906 12.5039 13.3906C14.1608 13.3906 15.5039 12.0475 15.5039 10.3906C15.5039 8.73377 14.1608 7.39062 12.5039 7.39062C10.8471 7.39062 9.50391 8.73377 9.50391 10.3906Z"
            fill="#ffffff"
          />
        </svg>
      ),
      label: "Centers",
    },
    {
      key: "/admin/memberships",
      icon: (
        <svg
          width="20"
          height="20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          transform="rotate(0 0 0)"
        >
          <path
            d="M13.4423 4.0528C13.4423 3.02209 14.2778 2.18652 15.3085 2.18652C16.3393 2.18652 17.1748 3.02208 17.1748 4.0528C17.1748 5.08352 16.3393 5.91908 15.3085 5.91908C14.2778 5.91908 13.4423 5.08352 13.4423 4.0528Z"
            fill="#ffffff"
          />
          <path
            d="M11.856 8.51792C11.856 7.2817 12.8581 6.27955 14.0943 6.27955H16.5226C17.7589 6.27955 18.761 7.2817 18.761 8.51792V9.44815C18.761 9.86237 18.4252 10.1982 18.011 10.1982H12.606C12.1917 10.1982 11.856 9.86237 11.856 9.44815V8.51792Z"
            fill="#ffffff"
          />
          <path
            d="M19.4265 11.0839C20.0838 10.5508 21.0446 10.6311 21.6042 11.2659C22.1113 11.841 22.1316 12.6974 21.6523 13.2959L17.7857 18.1245C17.4103 18.5934 16.8422 18.8663 16.2415 18.8663H10.0683C9.88238 18.8663 9.70304 18.9354 9.56514 19.0601L9.24091 19.3533C9.22557 19.3227 9.20925 19.2925 9.19195 19.2625L6.19328 14.0687C6.11945 13.9408 6.03193 13.8258 5.93363 13.7244L7.38752 12.5621C7.94102 12.1196 8.64045 11.8146 9.41265 11.8112C10.2258 11.8075 11.511 11.8794 12.6743 12.3037H15.6309C16.1953 12.3037 16.6724 12.6779 16.8276 13.1917C16.8623 13.3063 16.8809 13.4278 16.8809 13.5537C16.8809 14.2441 16.3212 14.8037 15.6309 14.8037H13.8345C13.5583 14.8037 13.3345 15.0276 13.3345 15.3037C13.3345 15.5799 13.5583 15.8037 13.8345 15.8037H15.6309C16.8735 15.8037 17.8809 14.7964 17.8809 13.5537C17.8809 13.187 17.7931 12.8408 17.6375 12.5349L19.4265 11.0839Z"
            fill="#ffffff"
          />
          <path
            d="M8.32592 19.7625C8.52709 20.1109 8.41691 20.5537 8.0817 20.7686L6.12367 21.899C5.76495 22.1062 5.30626 21.9832 5.09915 21.6245L2.10048 16.4307C2.00103 16.2584 1.97408 16.0537 2.02556 15.8616C2.07704 15.6694 2.20274 15.5056 2.375 15.4062L4.30273 14.2941C4.65191 14.0925 5.0958 14.2036 5.31019 14.5405C5.31605 14.5497 5.32174 14.5591 5.32725 14.5687L8.32592 19.7625Z"
            fill="#ffffff"
          />
        </svg>
      ),
      label: "Memberships",
    },
    {
      key: "courses",
      icon: (
        <svg
          width="20"
          height="20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          transform="rotate(0 0 0)"
        >
          <path
            d="M6.33301 6L4.25 6C3.00736 6 2 7.00736 2 8.25V17.75C2 18.9926 3.00736 20 4.25 20H6.58333C6.78518 20 6.98082 19.9734 7.16694 19.9236C6.64867 19.3477 6.33335 18.5856 6.33333 17.75L6.33301 6Z"
            fill="#ffffff"
          />
          <path
            d="M8.08324 19.4272C8.48119 19.7834 9.00673 20 9.58301 20H11.1663C12.409 20 13.4163 18.9926 13.4163 17.75V15.1865L11.6447 8.57457C11.2569 7.12745 11.9096 5.64668 13.1442 4.92645C12.763 4.22565 12.0202 3.75 11.1663 3.75H9.58301C8.34037 3.75 7.33301 4.75736 7.33301 6L7.33333 17.75C7.33334 18.4164 7.62294 19.0151 8.08324 19.4272Z"
            fill="#ffffff"
          />
          <path
            d="M12.6106 8.31575C12.289 7.11545 13.0013 5.88169 14.2016 5.56007L16.4554 4.95616C17.6557 4.63454 18.8895 5.34598 19.2111 6.54628L21.9287 16.6885C22.2503 17.8888 21.538 19.1226 20.3377 19.4442L18.0839 20.0481C16.8836 20.3697 15.6499 19.6574 15.3282 18.4571L12.6106 8.31575Z"
            fill="#ffffff"
          />
        </svg>
      ),
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
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          transform="rotate(0 0 0)"
        >
          <path
            d="M12 3.5C12.2326 3.5 12.452 3.60791 12.594 3.79212L16.7497 9.18332L20.7777 5.91743C21.0147 5.72527 21.3445 5.69584 21.6118 5.843C21.879 5.99017 22.0305 6.2846 21.9949 6.58763L21.0346 14.75H2.96544L2.00516 6.58763C1.96951 6.2846 2.12099 5.99017 2.38828 5.843C2.65556 5.69584 2.98537 5.72527 3.22237 5.91743L7.2503 9.18332L11.406 3.79212C11.548 3.60791 11.7674 3.5 12 3.5Z"
            fill="#ffffff"
          />
          <path
            d="M3.14191 16.25L3.34931 18.0129C3.48261 19.146 4.44295 20 5.58389 20H18.4161C19.5571 20 20.5174 19.146 20.6507 18.0129L20.8581 16.25H3.14191Z"
            fill="#ffffff"
          />
        </svg>
      ),
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
