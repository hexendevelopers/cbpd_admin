"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Card,
  Typography,
  Space,
  Button,
  Tag,
  Modal,
  notification,
  Select,
  Dropdown,
  Menu,
  Descriptions,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  MoreOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/AdminLayout";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface Partner {
  _id: string;
  organizationName: string;
  website: string;
  authorizedSignatory: string;
  yearOfInception: string;
  addressLine1: string;
  addressLine2?: string;
  cityState: string;
  country: string;
  email: string;
  phone: string;
  instituteProfile: string;
  hasAccreditations: string;
  status: string;
  createdAt: string;
}

export default function PartnersManagement() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    total: 0,
  });

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.status && { status: filters.status }),
      });

      const res = await fetch(`/api/admin/partners?${queryParams}`);
      const data = await res.json();
      if (res.ok) {
        setPartners(data.partners);
        setPagination({ total: data.pagination.total });
      } else {
        notification.error({ message: "Failed to fetch partners", description: data.error });
      }
    } catch (error) {
      notification.error({ message: "Error fetching partners" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [filters]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        notification.success({ message: "Status updated" });
        fetchPartners();
      }
    } catch (error) {
      notification.error({ message: "Failed to update status" });
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Delete Partner Enquiry",
      content: "Are you sure you want to delete this enquiry?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
          if (res.ok) {
            notification.success({ message: "Partner enquiry deleted" });
            fetchPartners();
          }
        } catch (error) {
          notification.error({ message: "Failed to delete" });
        }
      },
    });
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "New": return <Tag color="blue">New</Tag>;
      case "Reviewed": return <Tag color="orange">Reviewed</Tag>;
      case "Contacted": return <Tag color="success">Contacted</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Organization",
      key: "organizationName",
      render: (record: Partner) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.organizationName}</div>
          <a href={record.website} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
            {record.website}
          </a>
        </div>
      ),
    },
    {
      title: "Signatory",
      key: "signatory",
      render: (record: Partner) => (
        <div>
          <div>{record.authorizedSignatory}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
        </div>
      ),
    },
    {
      title: "Location",
      key: "location",
      render: (record: Partner) => (
        <div>
          <div>{record.cityState}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.country}</Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Partner) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="view"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedPartner(record);
                  setIsModalVisible(true);
                  if (record.status === "New") {
                    handleStatusChange(record._id, "Reviewed");
                  }
                }}
              >
                View Profile
              </Menu.Item>
              <Menu.Item
                key="markContacted"
                icon={<CheckCircleOutlined />}
                onClick={() => handleStatusChange(record._id, "Contacted")}
                disabled={record.status === "Contacted"}
              >
                Mark as Contacted
              </Menu.Item>
              <Menu.Item
                key="markReviewed"
                icon={<EyeOutlined />}
                onClick={() => handleStatusChange(record._id, "Reviewed")}
                disabled={record.status === "Reviewed"}
              >
                Mark as Reviewed
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                danger
                onClick={() => handleDelete(record._id)}
              >
                Delete
              </Menu.Item>
            </Menu>
          }
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between" }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>Partnership Enquiries</Title>
            <Text type="secondary">Manage all applications to become a partner</Text>
          </div>
          <Space>
            <Select
              placeholder="Filter by Status"
              allowClear
              style={{ width: 150 }}
              onChange={(val) => setFilters({ ...filters, status: val, page: 1 })}
            >
              <Select.Option value="New">New</Select.Option>
              <Select.Option value="Reviewed">Reviewed</Select.Option>
              <Select.Option value="Contacted">Contacted</Select.Option>
            </Select>
          </Space>
        </div>

        <Card bordered={false}>
          <Table
            columns={columns}
            dataSource={partners}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: filters.page,
              pageSize: filters.limit,
              total: pagination.total,
              onChange: (page) => setFilters({ ...filters, page }),
            }}
          />
        </Card>
      </div>

      <Modal
        title="Partnership Profile"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedPartner && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: 16 }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Organization" span={2}>
                <Text strong>{selectedPartner.organizationName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Signatory">
                {selectedPartner.authorizedSignatory}
              </Descriptions.Item>
              <Descriptions.Item label="Inception Year">
                {selectedPartner.yearOfInception}
              </Descriptions.Item>
              <Descriptions.Item label="Website">
                <a href={selectedPartner.website} target="_blank" rel="noreferrer">
                  {selectedPartner.website}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="Accreditations">
                <Tag color={selectedPartner.hasAccreditations === "Yes" ? "success" : "default"}>
                  {selectedPartner.hasAccreditations}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Descriptions bordered column={2} title="Contact Information">
              <Descriptions.Item label="Email">
                <a href={`mailto:${selectedPartner.email}`}>{selectedPartner.email}</a>
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                <a href={`tel:${selectedPartner.phone}`}>
                  <Space><PhoneOutlined /> {selectedPartner.phone}</Space>
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                {selectedPartner.addressLine1}
                {selectedPartner.addressLine2 && <><br />{selectedPartner.addressLine2}</>}
                <br />
                {selectedPartner.cityState}, {selectedPartner.country}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <Title level={5}>Institute Profile</Title>
              <div style={{ whiteSpace: "pre-wrap", background: "#f8fafc", padding: 16, borderRadius: 8 }}>
                {selectedPartner.instituteProfile}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
