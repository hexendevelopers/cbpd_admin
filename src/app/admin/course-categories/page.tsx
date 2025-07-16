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
  Drawer,
  Descriptions,
  Typography,
  Spin,
  Badge,
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
  AppstoreOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  StopOutlined,
  MoreOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/AdminLayout";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface CourseCategory {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export default function CourseCategoriesManagement() {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
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

  useEffect(() => {
    fetchCategories();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
      });

      const response = await fetch(`/api/admin/course-categories?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
        setPagination(data.pagination);
      } else if (response.status === 403) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch categories',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedCategories.length === 0) {
      notification.warning({
        message: 'No Selection',
        description: 'Please select categories first',
        placement: 'topRight',
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/course-categories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryIds: selectedCategories,
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
        fetchCategories();
        setSelectedCategories([]);
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

  const handleCategoryAction = async (categoryId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/course-categories/${categoryId}`, {
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
        fetchCategories();
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

  const handleSubmit = async (values: any) => {
    try {
      const url = isEditMode 
        ? `/api/admin/course-categories/${selectedCategory?._id}`
        : "/api/admin/course-categories";
      
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const data = await response.json();
        notification.success({
          message: 'Success',
          description: data.message,
          placement: 'topRight',
        });
        setIsModalVisible(false);
        setSelectedCategory(null);
        form.resetFields();
        fetchCategories();
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

  const getActionMenu = (record: CourseCategory) => (
    <Menu>
      <Menu.Item 
        key="view" 
        icon={<EyeOutlined />}
        onClick={() => {
          setSelectedCategory(record);
          setIsDrawerVisible(true);
        }}
      >
        View Details
      </Menu.Item>
      <Menu.Item 
        key="edit" 
        icon={<EditOutlined />}
        onClick={() => {
          setSelectedCategory(record);
          setIsEditMode(true);
          form.setFieldsValue(record);
          setIsModalVisible(true);
        }}
      >
        Edit Category
      </Menu.Item>
      <Menu.Item 
        key="toggle" 
        icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
        onClick={() => handleCategoryAction(record._id, record.isActive ? "deactivate" : "activate")}
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
            title: 'Delete Category',
            content: 'Are you sure you want to delete this category? This action cannot be undone and will affect all courses in this category.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: () => handleCategoryAction(record._id, "delete"),
          });
        }}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <Text strong style={{ color: "#1a202c" }}>{text}</Text>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text: string) => (
        <Text style={{ color: "#4a5568" }}>
          {text || "No description"}
        </Text>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (record: CourseCategory) => (
        <Tag 
          color={record.isActive ? "#22c55e" : "#ef4444"}
          style={{ borderRadius: 6, fontWeight: 500, border: "none" }}
        >
          {record.isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <Text style={{ color: "#4a5568" }}>
          {new Date(date).toLocaleDateString()}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: CourseCategory) => (
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
    selectedRowKeys: selectedCategories,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedCategories(selectedRowKeys as string[]);
    },
  };

  const activeCategories = categories.filter(category => category.isActive).length;

  if (loading && !categories.length) {
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
            Loading Categories...
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
                Course Categories
              </Title>
              <Text type="secondary">
                Manage course categories and organize your curriculum
              </Text>
            </div>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchCategories}
                style={{ borderRadius: 6 }}
              >
                Refresh
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setIsEditMode(false);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
                style={{ borderRadius: 6, background: "#2d3748", border: "none" }}
              >
                Add Category
              </Button>
            </Space>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12}>
            <Card style={{ borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <AppstoreOutlined style={{ fontSize: 24, color: "#64748b" }} />
                  <Badge status="processing" text="Live" />
                </div>
                <Statistic
                  title="Total Categories"
                  value={categories.length}
                  valueStyle={{ fontWeight: 600, fontSize: 24, color: "#1a202c" }}
                />
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card style={{ borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <CheckCircleOutlined style={{ fontSize: 24, color: "#22c55e" }} />
                  <Badge status="success" text="Active" />
                </div>
                <Statistic
                  title="Active Categories"
                  value={activeCategories}
                  valueStyle={{ fontWeight: 600, fontSize: 24, color: "#22c55e" }}
                />
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Filters Section */}
        <Card 
          title={
            <Space>
              <FilterOutlined />
              <span>Filter Categories</span>
            </Space>
          }
          style={{ marginBottom: 24, borderRadius: 8 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8} md={6}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Search Categories</Text>
              </div>
              <Input
                placeholder="Search by name, description..."
                prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                allowClear
                style={{ borderRadius: 6 }}
              />
            </Col>
            <Col xs={24} sm={8} md={4}>
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
                  <CheckCircleOutlined style={{ color: "#22c55e", marginRight: 8 }} />
                  Active
                </Option>
                <Option value="inactive">
                  <StopOutlined style={{ color: "#ef4444", marginRight: 8 }} />
                  Inactive
                </Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Bulk Actions */}
        {selectedCategories.length > 0 && (
          <Card 
            style={{ 
              marginBottom: 24,
              borderRadius: 8,
              border: "2px solid #2d3748",
              backgroundColor: "#f7f8fc",
            }}
          >
            <Space>
              <Text strong style={{ color: "#2d3748" }}>
                {selectedCategories.length} categor{selectedCategories.length > 1 ? 'ies' : 'y'} selected
              </Text>
              <Button 
                type="primary"
                size="small"
                onClick={() => handleBulkAction("activate")}
                style={{ borderRadius: 6, background: "#22c55e", border: "none" }}
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
            </Space>
          </Card>
        )}

        {/* Categories Table */}
        <Card
          title={
            <Space>
              <AppstoreOutlined />
              <span>Categories List</span>
              <Badge count={pagination.total} style={{ backgroundColor: "#64748b" }} />
            </Space>
          }
          style={{ borderRadius: 8, marginBottom: 24 }}
        >
          <Table
            columns={columns}
            dataSource={categories}
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
                `${range[0]}-${range[1]} of ${total} categories`,
              onChange: (page, pageSize) => {
                setFilters({ ...filters, page, limit: pageSize || 10 });
              },
            }}
            scroll={{ x: 800 }}
          />
        </Card>
      </div>

      {/* Category Details Drawer */}
      <Drawer
        title={
          <Space>
            <AppstoreOutlined style={{ color: "#64748b" }} />
            <span>Category Details</span>
          </Space>
        }
        placement="right"
        width={500}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        {selectedCategory && (
          <div>
            <div style={{ 
              textAlign: "center", 
              marginBottom: 24,
              padding: 24,
              background: "#f7f8fc",
              borderRadius: 8,
              border: "1px solid #e2e8f0"
            }}>
              <AppstoreOutlined style={{ fontSize: 48, color: "#64748b", marginBottom: 16 }} />
              <Title level={4} style={{ marginBottom: 8 }}>
                {selectedCategory.name}
              </Title>
              <Tag 
                color={selectedCategory.isActive ? "#22c55e" : "#ef4444"}
                style={{ borderRadius: 6, fontWeight: 500, border: "none" }}
              >
                {selectedCategory.isActive ? "Active" : "Inactive"}
              </Tag>
            </div>

            <Card 
              title="Category Information" 
              style={{ marginBottom: 16, borderRadius: 8 }}
              size="small"
            >
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Name">
                  <Text strong>{selectedCategory.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  <Text>{selectedCategory.description || "No description"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag 
                    color={selectedCategory.isActive ? "#22c55e" : "#ef4444"}
                    style={{ borderRadius: 6, fontWeight: 500, border: "none" }}
                  >
                    {selectedCategory.isActive ? "Active" : "Inactive"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {new Date(selectedCategory.createdAt).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Space style={{ width: "100%", justifyContent: "center" }}>
              <Button 
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setIsEditMode(true);
                  form.setFieldsValue(selectedCategory);
                  setIsModalVisible(true);
                  setIsDrawerVisible(false);
                }}
                style={{ borderRadius: 6, background: "#2d3748", border: "none" }}
              >
                Edit Category
              </Button>
              <Button 
                onClick={() => handleCategoryAction(selectedCategory._id, selectedCategory.isActive ? "deactivate" : "activate")}
                style={{ borderRadius: 6 }}
              >
                {selectedCategory.isActive ? "Deactivate" : "Activate"}
              </Button>
            </Space>
          </div>
        )}
      </Drawer>

      {/* Add/Edit Category Modal */}
      <Modal
        title={
          <Space>
            {isEditMode ? <EditOutlined /> : <PlusOutlined />}
            <span>{isEditMode ? "Edit Category" : "Add New Category"}</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedCategory(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input 
              placeholder="Enter category name"
              style={{ borderRadius: 6 }} 
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea 
              placeholder="Enter category description (optional)"
              rows={4}
              style={{ borderRadius: 6 }} 
            />
          </Form.Item>

          <Form.Item style={{ textAlign: "center", marginTop: 24 }}>
            <Space size="large">
              <Button 
                type="primary" 
                htmlType="submit"
                size="large"
                style={{ borderRadius: 6, minWidth: 120, background: "#2d3748", border: "none" }}
              >
                {isEditMode ? "Update Category" : "Add Category"}
              </Button>
              <Button 
                size="large"
                onClick={() => {
                  setIsModalVisible(false);
                  setSelectedCategory(null);
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