"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  notification,
  Space,
  Divider,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import AdminLayout from "@/components/AdminLayout";

const { Title, Text } = Typography;

export default function AddStudentCertificate() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/student-certificates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        notification.success({
          message: "Success",
          description: "Student certificate added successfully.",
        });
        router.push("/admin/student-certificates");
      } else {
        const data = await response.json();
        notification.error({
          message: "Error",
          description: data.error || "Failed to add certificate.",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      notification.error({
        message: "Network Error",
        description: "An error occurred while saving. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: "16px" }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/admin/student-certificates")}
            style={{ fontSize: "16px" }}
          />
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
              Add Certificate
            </Title>
            <Text type="secondary">Enter the details for the new student certificate</Text>
          </div>
        </div>

        <Card style={{ borderRadius: 8, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Form.Item
                name="name"
                label="Student Name"
                rules={[{ required: true, message: "Please enter the student's name" }]}
              >
                <Input size="large" placeholder="e.g. sandeep pradeep" />
              </Form.Item>

              <Form.Item
                name="regNumber"
                label="Registration Number"
                rules={[{ required: true, message: "Please enter the registration number" }]}
              >
                <Input size="large" placeholder="e.g. 11025" />
              </Form.Item>

              <Form.Item
                name="certNumber"
                label="Certificate Number"
                rules={[{ required: true, message: "Please enter the certificate number" }]}
              >
                <Input size="large" placeholder="e.g. cbpd/2025/hrm-3105" />
              </Form.Item>

              <Form.Item
                name="learnerNumber"
                label="Learner Number"
                rules={[{ required: true, message: "Please enter the learner number" }]}
              >
                <Input size="large" placeholder="e.g. l-25-264" />
              </Form.Item>
            </div>

            <Divider />

            <Form.Item style={{ marginBottom: 0 }}>
              <Space style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button size="large" onClick={() => router.push("/admin/student-certificates")}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  Save Certificate
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
}
