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
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/AdminLayout";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  enquiryType: string;
  programmeName?: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function ContactsManagement() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    enquiryType: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    total: 0,
  });

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.enquiryType && { enquiryType: filters.enquiryType }),
      });

      const res = await fetch(`/api/admin/contacts?${queryParams}`);
      const data = await res.json();
      if (res.ok) {
        setContacts(data.contacts);
        setPagination({ total: data.pagination.total });
      } else {
        notification.error({ message: "Failed to fetch contacts", description: data.error });
      }
    } catch (error) {
      notification.error({ message: "Error fetching contacts" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [filters]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        notification.success({ message: "Status updated" });
        fetchContacts();
      }
    } catch (error) {
      notification.error({ message: "Failed to update status" });
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Delete Contact",
      content: "Are you sure you want to delete this enquiry?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
          if (res.ok) {
            notification.success({ message: "Contact deleted" });
            fetchContacts();
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
      case "Read": return <Tag color="orange">Read</Tag>;
      case "Replied": return <Tag color="success">Replied</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (record: Contact) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: "Contact Info",
      key: "contactInfo",
      render: (record: Contact) => (
        <div>
          <div>{record.email}</div>
          <Text type="secondary">{record.phone}</Text>
        </div>
      ),
    },
    {
      title: "Enquiry Type",
      key: "type",
      render: (record: Contact) => (
        <div>
          <div>{record.enquiryType}</div>
          {record.programmeName && <Text type="secondary">{record.programmeName}</Text>}
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
      render: (record: Contact) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="view"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedContact(record);
                  setIsModalVisible(true);
                  if (record.status === "New") {
                    handleStatusChange(record._id, "Read");
                  }
                }}
              >
                View Message
              </Menu.Item>
              <Menu.Item
                key="markReplied"
                icon={<CheckCircleOutlined />}
                onClick={() => handleStatusChange(record._id, "Replied")}
                disabled={record.status === "Replied"}
              >
                Mark as Replied
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
            <Title level={3} style={{ margin: 0 }}>Contact Enquiries</Title>
            <Text type="secondary">Manage all messages from the contact form</Text>
          </div>
          <Space>
            <Select
              placeholder="Filter by Status"
              allowClear
              style={{ width: 150 }}
              onChange={(val) => setFilters({ ...filters, status: val, page: 1 })}
            >
              <Select.Option value="New">New</Select.Option>
              <Select.Option value="Read">Read</Select.Option>
              <Select.Option value="Replied">Replied</Select.Option>
            </Select>
            <Select
              placeholder="Filter by Type"
              allowClear
              style={{ width: 180 }}
              onChange={(val) => setFilters({ ...filters, enquiryType: val, page: 1 })}
            >
              <Select.Option value="General Enquiry">General Enquiry</Select.Option>
              <Select.Option value="Programme Enquiry">Programme Enquiry</Select.Option>
            </Select>
          </Space>
        </div>

        <Card bordered={false}>
          <Table
            columns={columns}
            dataSource={contacts}
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
        title="Contact Message"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedContact && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#f8fafc", padding: 16, borderRadius: 8 }}>
              <Text strong style={{ fontSize: 16 }}>
                From: {selectedContact.firstName} {selectedContact.lastName}
              </Text>
              <br />
              <Text type="secondary">{selectedContact.email} | {selectedContact.phone}</Text>
            </div>
            
            <div>
              <Text strong>Enquiry Type:</Text> {selectedContact.enquiryType}
              {selectedContact.programmeName && (
                <div>
                  <Text strong>Programme:</Text> {selectedContact.programmeName}
                </div>
              )}
            </div>

            <div>
              <Text strong>Message:</Text>
              <div style={{ marginTop: 8, whiteSpace: "pre-wrap", background: "#f1f5f9", padding: 16, borderRadius: 8 }}>
                {selectedContact.message}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
