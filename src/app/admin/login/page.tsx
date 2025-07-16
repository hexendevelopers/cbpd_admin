"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Checkbox,
  notification,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (values: { email: string; password: string; remember?: boolean }) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        notification.success({
          message: 'Welcome Back!',
          description: 'Successfully logged into CBPD Admin Dashboard',
          placement: 'topRight',
          duration: 3,
        });
        router.push("/admin");
      } else {
        setError(data.error || "Login failed");
        notification.error({
          message: 'Login Failed',
          description: data.error || 'Please check your credentials and try again',
          placement: 'topRight',
        });
      }
    } catch (error) {
      setError("Network error. Please try again.");
      notification.error({
        message: 'Connection Error',
        description: 'Unable to connect to server. Please try again.',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ 
      minHeight: "100vh", 
      background: "#f7f8fc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <Content style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        padding: "20px",
        width: "100%"
      }}>
        <Card
          style={{
            width: "100%",
            maxWidth: 400,
            margin: "0 auto",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            background: "white",
          }}
          bodyStyle={{ padding: "40px" }}
        >
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              background: "#2d3748",
              borderRadius: 8,
              padding: 16,
              display: "inline-block",
              marginBottom: 16,
            }}>
              <SafetyCertificateOutlined 
                style={{ 
                  fontSize: 32, 
                  color: "white",
                }} 
              />
            </div>
            <Title level={2} style={{ margin: 0, color: "#1a202c", fontWeight: 600 }}>
              Admin Login
            </Title>
            <Text type="secondary" style={{ fontSize: 14, color: "#4a5568" }}>
              Sign in to your account
            </Text>
          </div>

          {error && (
            <Alert
              message="Authentication Failed"
              description={error}
              type="error"
              showIcon
              style={{ 
                marginBottom: 24,
                borderRadius: 6,
              }}
            />
          )}

          <Form
            name="admin-login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label={<span style={{ fontWeight: 600, color: "#1a202c" }}>Email Address</span>}
              rules={[
                { required: true, message: "Please enter your email address" },
                { type: "email", message: "Please enter a valid email address" },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "#4a5568" }} />}
                placeholder="Enter your email"
                autoComplete="email"
                style={{
                  borderRadius: 6,
                  border: "1px solid #cbd5e0",
                  padding: "12px 16px",
                  fontSize: 16,
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ fontWeight: 600, color: "#1a202c" }}>Password</span>}
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#4a5568" }} />}
                placeholder="Enter your password"
                autoComplete="current-password"
                style={{
                  borderRadius: 6,
                  border: "1px solid #cbd5e0",
                  padding: "12px 16px",
                  fontSize: 16,
                }}
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Checkbox style={{ fontWeight: 500, color: "#4a5568" }}>Remember me</Checkbox>
                <Button type="link" style={{ padding: 0, fontWeight: 600, color: "#2d3748" }}>
                  Forgot password?
                </Button>
              </div>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<LoginOutlined />}
                style={{
                  width: "100%",
                  height: 48,
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 6,
                  background: "#2d3748",
                  border: "none",
                }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
}