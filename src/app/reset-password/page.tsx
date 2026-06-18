"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Alert,
  notification,
  Spin,
} from "antd";
import {
  LockOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Content } = Layout;
const { Title, Text } = Typography;

function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [institutionName, setInstitutionName] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Reset token is missing from the URL.");
      setVerifying(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/institution/reset-password?token=${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setInstitutionName(data.data?.institutionName || "");
        } else {
          setError(data.error || "Invalid or expired reset token.");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (values: any) => {
    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/institution/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: values.password,
          confirmPassword: values.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        notification.success({
          message: "Password Reset Successful",
          description: "Your password has been securely updated.",
          placement: "topRight",
        });
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Verifying reset link...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <CheckCircleOutlined style={{ fontSize: 64, color: "#10b981", marginBottom: 24 }} />
        <Title level={3} style={{ marginBottom: 16 }}>Password Reset Complete</Title>
        <Text type="secondary" style={{ display: "block", marginBottom: 32 }}>
          Your password has been successfully reset. You can now use your new password to log in.
        </Text>
      </div>
    );
  }

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          style={{
            background: "#2d3748",
            borderRadius: 8,
            padding: 16,
            display: "inline-block",
            marginBottom: 16,
          }}
        >
          <SafetyCertificateOutlined
            style={{
              fontSize: 32,
              color: "white",
            }}
          />
        </div>
        <Title
          level={2}
          style={{ margin: 0, color: "#1a202c", fontWeight: 600 }}
        >
          Reset Password
        </Title>
        {institutionName ? (
          <Text type="secondary" style={{ fontSize: 14, color: "#4a5568", display: 'block', marginTop: 8 }}>
            Set a new password for {institutionName}
          </Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 14, color: "#4a5568" }}>
            Enter your new password below
          </Text>
        )}
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{
            marginBottom: 24,
            borderRadius: 6,
          }}
        />
      )}

      {!error && (
        <Form
          name="reset-password"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="password"
            label={
              <span style={{ fontWeight: 600, color: "#1a202c" }}>
                New Password
              </span>
            }
            rules={[
              { required: true, message: "Please enter your new password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#4a5568" }} />}
              placeholder="Enter new password"
              style={{
                borderRadius: 6,
                border: "1px solid #cbd5e0",
                padding: "12px 16px",
                fontSize: 16,
              }}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={
              <span style={{ fontWeight: 600, color: "#1a202c" }}>
                Confirm New Password
              </span>
            }
            dependencies={['password']}
            rules={[
              { required: true, message: "Please confirm your new password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#4a5568" }} />}
              placeholder="Confirm new password"
              style={{
                borderRadius: 6,
                border: "1px solid #cbd5e0",
                padding: "12px 16px",
                fontSize: 16,
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
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
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </Form.Item>
        </Form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex md:flex">
      <Layout
        style={{
          minHeight: "100vh",
          background: "#f7f8fc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            width: "100%",
          }}
        >
          <Card
            style={{
              width: "100%",
              maxWidth: 450,
              margin: "0 auto",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              background: "white",
            }}
            bodyStyle={{ padding: "40px" }}
          >
            <Suspense fallback={<div style={{ textAlign: "center" }}><Spin size="large" /></div>}>
              <ResetPasswordForm />
            </Suspense>
          </Card>
        </Content>
      </Layout>
    </div>
  );
}
