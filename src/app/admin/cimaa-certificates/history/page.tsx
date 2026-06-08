"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Typography,
  notification,
  Modal,
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/AdminLayout";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface CimaaCertificate {
  _id: string;
  studentName: string;
  programName: string;
  providerName: string;
  certificateNo: string;
  registrationNo: string;
  dateIssued: string;
  createdAt: string;
}

export default function CimaaCertificatesHistory() {
  const [certificates, setCertificates] = useState<CimaaCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortConfig, setSortConfig] = useState({ field: "createdAt", order: "descend" });
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(searchInput);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  useEffect(() => {
    fetchCertificates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, searchQuery, sortConfig.field, sortConfig.order]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.pageSize.toString(),
        ...(searchQuery && { search: searchQuery }),
        sortBy: sortConfig.field,
        order: sortConfig.order === "ascend" ? "asc" : "desc",
      });

      const response = await fetch(`/api/admin/cimaa-certificates?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setCertificates(data.certificates);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
        }));
      } else if (response.status === 403) {
        router.push("/admin/login");
      } else {
        notification.error({ message: "Failed to fetch certificates" });
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
      notification.error({ message: "Network Error" });
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination: any, filters: any, sorter: any) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
    if (sorter && sorter.field) {
      setSortConfig({ field: sorter.field, order: sorter.order || "descend" });
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Delete Certificate",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: "Are you sure you want to delete this certificate? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const response = await fetch(`/api/admin/cimaa-certificates/${id}`, {
            method: "DELETE",
          });
          if (response.ok) {
            notification.success({ message: "Certificate deleted successfully" });
            fetchCertificates();
          } else {
            const data = await response.json();
            notification.error({ message: data.error || "Failed to delete" });
          }
        } catch (error) {
          notification.error({ message: "Network Error" });
        }
      },
    });
  };

  const columns = [
    {
      title: "Learner Name",
      dataIndex: "studentName",
      key: "studentName",
      sorter: true,
      render: (text: string) => <Text style={{ fontWeight: 500 }}>{text}</Text>,
    },
    {
      title: "Program",
      dataIndex: "programName",
      key: "programName",
      sorter: true,
      ellipsis: true,
    },
    {
      title: "Provider",
      dataIndex: "providerName",
      key: "providerName",
      sorter: true,
    },
    {
      title: "Certificate No",
      dataIndex: "certificateNo",
      key: "certificateNo",
      sorter: true,
    },
    {
      title: "Registration No",
      dataIndex: "registrationNo",
      key: "registrationNo",
      sorter: true,
    },
    {
      title: "Issued On",
      dataIndex: "dateIssued",
      key: "dateIssued",
      sorter: true,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: CimaaCertificate) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />}
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div style={{ padding: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
              CIMAA Certificates History
            </Title>
            <Text type="secondary" style={{ fontSize: '14px', color: '#64748b' }}>
              View and manage generated CIMAA / Montessori certificates
            </Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchCertificates}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => router.push("/admin/cimaa-certificates/generate")}
            >
              Generate New
            </Button>
          </Space>
        </div>

        <Card style={{ borderRadius: 8, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
            <Input
              placeholder="Search by name, cert no, reg no..."
              allowClear
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ width: 350 }}
            />
          </div>

          <Table
            columns={columns}
            dataSource={certificates}
            rowKey="_id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
            }}
            onChange={handleTableChange}
            loading={loading}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
