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
  Upload,
  Image,
  message,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BookOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  StopOutlined,
  MoreOutlined,
  FilterOutlined,
  UploadOutlined,
  PictureOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/AdminLayout";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface Course {
  _id: string;
  title: string;
  description: string;
  image?: string;
  categoryId?: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
}

interface CourseCategory {
  _id: string;
  name: string;
}

export default function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    categoryId: "",
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
    fetchCourses();
    fetchCategories();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/course-categories?all=true");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
      });

      const response = await fetch(`/api/admin/courses?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
        setPagination(data.pagination);
      } else if (response.status === 403) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch courses",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/courses/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setImageUrl(data.imageUrl);
        form.setFieldsValue({ image: data.imageUrl });
        message.success("Image uploaded successfully");
        return data.imageUrl;
      } else {
        const errorData = await response.json();
        message.error(errorData.error || "Upload failed");
        return false;
      }
    } catch (error) {
      message.error("Upload failed");
      return false;
    } finally {
      setUploadLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedCourses.length === 0) {
      notification.warning({
        message: "No Selection",
        description: "Please select courses first",
        placement: "topRight",
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/courses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseIds: selectedCourses,
          action,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        notification.success({
          message: "Success",
          description: data.message,
          placement: "topRight",
        });
        fetchCourses();
        setSelectedCourses([]);
      } else {
        const data = await response.json();
        notification.error({
          message: "Error",
          description: data.error || "Action failed",
          placement: "topRight",
        });
      }
    } catch (error) {
      notification.error({
        message: "Network Error",
        description: "Please try again",
        placement: "topRight",
      });
    }
  };

  const handleCourseAction = async (courseId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: action === "delete" ? "DELETE" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body:
          action !== "delete"
            ? JSON.stringify({
                isActive: action === "activate",
              })
            : undefined,
      });

      if (response.ok) {
        const data = await response.json();
        notification.success({
          message: "Success",
          description: data.message,
          placement: "topRight",
        });
        fetchCourses();
      } else {
        const data = await response.json();
        notification.error({
          message: "Error",
          description: data.error || "Action failed",
          placement: "topRight",
        });
      }
    } catch (error) {
      notification.error({
        message: "Network Error",
        description: "Please try again",
        placement: "topRight",
      });
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
        image: imageUrl || values.image || null,
      };

      const url = isEditMode
        ? `/api/admin/courses/${selectedCourse?._id}`
        : "/api/admin/courses";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedValues),
      });

      if (response.ok) {
        const data = await response.json();
        notification.success({
          message: "Success",
          description: data.message,
          placement: "topRight",
        });
        setIsModalVisible(false);
        setSelectedCourse(null);
        setImageUrl("");
        form.resetFields();
        fetchCourses();
      } else {
        const data = await response.json();
        notification.error({
          message: "Error",
          description: data.error || "Operation failed",
          placement: "topRight",
        });
      }
    } catch (error) {
      notification.error({
        message: "Network Error",
        description: "Please try again",
        placement: "topRight",
      });
    }
  };

  const getActionMenu = (record: Course) => (
    <Menu>
      <Menu.Item
        key="view"
        icon={<EyeOutlined />}
        onClick={() => {
          setSelectedCourse(record);
          setIsDrawerVisible(true);
        }}
      >
        View Details
      </Menu.Item>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => {
          setSelectedCourse(record);
          setIsEditMode(true);
          setImageUrl(record.image || "");
          form.setFieldsValue({
            ...record,
            categoryId: record.categoryId?._id,
          });
          setIsModalVisible(true);
        }}
      >
        Edit Course
      </Menu.Item>
      <Menu.Item
        key="toggle"
        icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
        onClick={() =>
          handleCourseAction(
            record._id,
            record.isActive ? "deactivate" : "activate"
          )
        }
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
            title: "Delete Course",
            content:
              "Are you sure you want to delete this course? This action cannot be undone.",
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk: () => handleCourseAction(record._id, "delete"),
          });
        }}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "Course",
      key: "course",
      render: (record: Course) => (
        <Space>
          {record.image ? (
            <Image
              src={record.image}
              alt={record.title}
              width={40}
              height={40}
              style={{ borderRadius: 6, objectFit: "cover" }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 6,
                background: "#f7f8fc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #e2e8f0",
              }}
            >
              <PictureOutlined style={{ color: "#64748b" }} />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, color: "#1a202c" }}>
              {record.title}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description.length > 50
                ? `${record.description.substring(0, 50)}...`
                : record.description}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Category",
      key: "category",
      render: (record: Course) => (
        <Tag
          color="#64748b"
          style={{ borderRadius: 6, fontWeight: 500, border: "none" }}
        >
          {record.categoryId?.name || "No Category"}
        </Tag>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (record: Course) => (
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
      render: (record: Course) => (
        <Dropdown overlay={getActionMenu(record)} trigger={["click"]}>
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
    selectedRowKeys: selectedCourses,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedCourses(selectedRowKeys as string[]);
    },
  };

  const activeCourses = courses.filter((course) => course.isActive).length;

  if (loading && !courses.length) {
    return (
      <AdminLayout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
            flexDirection: "column",
          }}
        >
          <Spin size="large" />
          <Text style={{ marginTop: 16, fontSize: 16, color: "#4a5568" }}>
            Loading Courses...
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div>
              <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
                Courses Management
              </Title>
              <Text type="secondary">
                Manage course catalog and educational content
              </Text>
            </div>
            <Space>
              <Button
                icon={<AppstoreOutlined />}
                onClick={() => router.push("/admin/course-categories")}
                style={{ borderRadius: 6 }}
              >
                Manage Categories
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchCourses}
                style={{ borderRadius: 6 }}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setIsEditMode(false);
                  setImageUrl("");
                  form.resetFields();
                  setIsModalVisible(true);
                }}
                style={{
                  borderRadius: 6,
                  background: "#2d3748",
                  border: "none",
                }}
              >
                Add Course
              </Button>
            </Space>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <BookOutlined style={{ fontSize: 24, color: "#64748b" }} />
                  <Badge status="processing" text="Live" />
                </div>
                <Statistic
                  title="Total Courses"
                  value={courses.length}
                  valueStyle={{
                    fontWeight: 600,
                    fontSize: 24,
                    color: "#1a202c",
                  }}
                />
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <CheckCircleOutlined
                    style={{ fontSize: 24, color: "#22c55e" }}
                  />
                  <Badge status="success" text="Active" />
                </div>
                <Statistic
                  title="Active Courses"
                  value={activeCourses}
                  valueStyle={{
                    fontWeight: 600,
                    fontSize: 24,
                    color: "#22c55e",
                  }}
                />
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <AppstoreOutlined
                    style={{ fontSize: 24, color: "#8b5cf6" }}
                  />
                  <Badge status="default" text="Categories" />
                </div>
                <Statistic
                  title="Categories"
                  value={categories.length}
                  valueStyle={{
                    fontWeight: 600,
                    fontSize: 24,
                    color: "#1a202c",
                  }}
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
              <span>Filter Courses</span>
            </Space>
          }
          style={{ marginBottom: 24, borderRadius: 8 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8} md={6}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Search Courses</Text>
              </div>
              <Input
                placeholder="Search by title, description..."
                prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value, page: 1 })
                }
                allowClear
                style={{ borderRadius: 6 }}
              />
            </Col>
            <Col xs={24} sm={8} md={4}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Category</Text>
              </div>
              <Select
                placeholder="Select category"
                style={{ width: "100%" }}
                value={filters.categoryId}
                onChange={(value) =>
                  setFilters({ ...filters, categoryId: value, page: 1 })
                }
                allowClear
              >
                {categories.map((category) => (
                  <Option key={category._id} value={category._id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={8} md={4}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Status</Text>
              </div>
              <Select
                placeholder="Select status"
                style={{ width: "100%" }}
                value={filters.status}
                onChange={(value) =>
                  setFilters({ ...filters, status: value, page: 1 })
                }
                allowClear
              >
                <Option value="active">
                  <CheckCircleOutlined
                    style={{ color: "#22c55e", marginRight: 8 }}
                  />
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
        {selectedCourses.length > 0 && (
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
                {selectedCourses.length} course
                {selectedCourses.length > 1 ? "s" : ""} selected
              </Text>
              <Button
                type="primary"
                size="small"
                onClick={() => handleBulkAction("activate")}
                style={{
                  borderRadius: 6,
                  background: "#22c55e",
                  border: "none",
                }}
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

        {/* Courses Table */}
        <Card
          title={
            <Space>
              <BookOutlined />
              <span>Courses List</span>
              <Badge
                count={pagination.total}
                style={{ backgroundColor: "#64748b" }}
              />
            </Space>
          }
          style={{ borderRadius: 8, marginBottom: 24 }}
        >
          <Table
            columns={columns}
            dataSource={courses}
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
                `${range[0]}-${range[1]} of ${total} courses`,
              onChange: (page, pageSize) => {
                setFilters({ ...filters, page, limit: pageSize || 10 });
              },
            }}
          />
        </Card>
      </div>

      {/* Course Details Drawer */}
      <Drawer
        title={
          <Space>
            <BookOutlined style={{ color: "#64748b" }} />
            <span>Course Details</span>
          </Space>
        }
        placement="right"
        width={600}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        {selectedCourse && (
          <div>
            <div
              style={{
                textAlign: "center",
                marginBottom: 24,
                padding: 24,
                background: "#f7f8fc",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
              }}
            >
              {selectedCourse.image ? (
                <Image
                  src={selectedCourse.image}
                  alt={selectedCourse.title}
                  width={120}
                  height={120}
                  style={{
                    borderRadius: 8,
                    objectFit: "cover",
                    marginBottom: 16,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 8,
                    background: "#f7f8fc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #e2e8f0",
                    margin: "0 auto 16px",
                  }}
                >
                  <PictureOutlined style={{ fontSize: 48, color: "#64748b" }} />
                </div>
              )}
              <Title level={4} style={{ marginBottom: 8 }}>
                {selectedCourse.title}
              </Title>
              <Space>
                <Tag
                  color="#64748b"
                  style={{ borderRadius: 6, fontWeight: 500, border: "none" }}
                >
                  {selectedCourse.categoryId?.name || "No Category"}
                </Tag>
                <Tag
                  color={selectedCourse.isActive ? "#22c55e" : "#ef4444"}
                  style={{ borderRadius: 6, fontWeight: 500, border: "none" }}
                >
                  {selectedCourse.isActive ? "Active" : "Inactive"}
                </Tag>
              </Space>
            </div>

            <Card
              title="Course Information"
              style={{ marginBottom: 16, borderRadius: 8 }}
              size="small"
            >
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Title">
                  <Text strong>{selectedCourse.title}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Category">
                  <Tag
                    color="#64748b"
                    style={{ borderRadius: 6, fontWeight: 500, border: "none" }}
                  >
                    {selectedCourse.categoryId?.name || "No Category"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  <Text>{selectedCourse.description}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Image">
                  {selectedCourse.image ? (
                    <Text copyable style={{ color: "#64748b" }}>
                      Image uploaded
                    </Text>
                  ) : (
                    <Text type="secondary">No image</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag
                    color={selectedCourse.isActive ? "#22c55e" : "#ef4444"}
                    style={{ borderRadius: 6, fontWeight: 500, border: "none" }}
                  >
                    {selectedCourse.isActive ? "Active" : "Inactive"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {new Date(selectedCourse.createdAt).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Space style={{ width: "100%", justifyContent: "center" }}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setIsEditMode(true);
                  setImageUrl(selectedCourse.image || "");
                  form.setFieldsValue({
                    ...selectedCourse,
                    categoryId: selectedCourse.categoryId?._id,
                  });
                  setIsModalVisible(true);
                  setIsDrawerVisible(false);
                }}
                style={{
                  borderRadius: 6,
                  background: "#2d3748",
                  border: "none",
                }}
              >
                Edit Course
              </Button>
              <Button
                onClick={() =>
                  handleCourseAction(
                    selectedCourse._id,
                    selectedCourse.isActive ? "deactivate" : "activate"
                  )
                }
                style={{ borderRadius: 6 }}
              >
                {selectedCourse.isActive ? "Deactivate" : "Activate"}
              </Button>
            </Space>
          </div>
        )}
      </Drawer>

      {/* Add/Edit Course Modal */}
      <Modal
        title={
          <Space>
            {isEditMode ? <EditOutlined /> : <PlusOutlined />}
            <span>{isEditMode ? "Edit Course" : "Add New Course"}</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedCourse(null);
          setImageUrl("");
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="title"
            label="Course Title"
            rules={[{ required: true, message: "Please enter course title" }]}
          >
            <Input
              placeholder="Enter course title"
              style={{ borderRadius: 6 }}
            />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Course Category"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select
              placeholder="Select course category"
              style={{ borderRadius: 6 }}
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {categories.map((category) => (
                <Option key={category._id} value={category._id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Course Description"
            rules={[
              { required: true, message: "Please enter course description" },
            ]}
          >
            <TextArea
              placeholder="Enter course description"
              rows={4}
              style={{ borderRadius: 6 }}
            />
          </Form.Item>

          <Form.Item name="image" label="Course Image">
            <div>
              <Upload
                name="file"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={handleImageUpload}
                accept="image/*"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="course"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div>
                    {uploadLoading ? <Spin /> : <UploadOutlined />}
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
              <Text
                type="secondary"
                style={{ fontSize: 12, marginTop: 8, display: "block" }}
              >
                Upload course image (JPG, PNG, WebP - Max 5MB)
              </Text>
            </div>
          </Form.Item>

          <Form.Item style={{ textAlign: "center", marginTop: 24 }}>
            <Space size="large">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{
                  borderRadius: 6,
                  minWidth: 120,
                  background: "#2d3748",
                  border: "none",
                }}
              >
                {isEditMode ? "Update Course" : "Add Course"}
              </Button>
              <Button
                size="large"
                onClick={() => {
                  setIsModalVisible(false);
                  setSelectedCourse(null);
                  setImageUrl("");
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
