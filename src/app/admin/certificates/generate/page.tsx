"use client";

import { forwardRef, useCallback, useRef, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  DatePicker,
  Space,
  notification,
} from "antd";
import { EyeOutlined, DownloadOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import AdminLayout from "@/components/AdminLayout";
import "@/styles/certificate-generator.css";

const { Title, Text } = Typography;

/** Must match intrinsic size of `public/certificate-template.png` (no stretch). */
const CANVAS_W = 1234;
const CANVAS_H = 1738;

type CertificateFormValues = {
  studentName: string;
  courseName: string;
  courseLevel: string;
  providerName: string;
  certificateNumber: string;
  registrationNumber: string;
  dateIssued: Dayjs;
};

type CertificateCanvasProps = {
  studentName: string;
  courseName: string;
  courseLevel: string;
  providerName: string;
  certificateNumber: string;
  registrationNumber: string;
  dateIssuedText: string;
};

const CertificateCanvas = forwardRef<HTMLDivElement, CertificateCanvasProps>(
  function CertificateCanvas(
    {
      studentName,
      courseName,
      courseLevel,
      providerName,
      certificateNumber,
      registrationNumber,
      dateIssuedText,
    },
    ref,
  ) {
    return (
      <div ref={ref} className="certificate-canvas">
        <img
          src="/certificate-template.png"
          alt=""
          className="certificate-bg"
          width={CANVAS_W}
          height={CANVAS_H}
          draggable={false}
        />
        <div className="student-name" style={{ marginTop: "130px" }}>
          {studentName}
        </div>
        <div
          className="course-name max-w-1000 text-center"
          style={{ marginTop: "145px", fontSize: "27px" }}
        >
          {courseName}
        </div>
        <div
          className="course-level"
          style={{ marginTop: "120px", fontSize: "23px" }}
        >
          {courseLevel}
        </div>
        <div className="" style={{marginTop : "100px"}}>
          <div className="provider-name" style={{marginTop : "112px", marginLeft : "40px"}}>{providerName}</div>
          <div className="certificate-number" style={{marginTop : "112px", marginLeft : "40px"}}>{certificateNumber}</div>
          <div className="registration-number" style={{marginTop : "112px", marginLeft : "40px"}}>{registrationNumber}</div>
        </div>
        <div className="date-issued" style={{marginBottom : "121px", marginLeft : "70px"}}>{dateIssuedText}</div>
      </div>
    );
  },
);

export default function GenerateCertificatePage() {
  const [form] = Form.useForm<CertificateFormValues>();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const scrollToPreview = () => {
    certificateRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handlePreview = async () => {
    try {
      await form.validateFields();
      notification.success({
        message: "Preview updated",
        description: "Certificate values are shown in the preview below.",
        placement: "topRight",
      });
      scrollToPreview();
    } catch {
      notification.warning({
        message: "Check the form",
        description: "Please fill all required fields before previewing.",
        placement: "topRight",
      });
    }
  };

  const handleDownloadPdf = useCallback(async () => {
    let values: CertificateFormValues;
    try {
      values = await form.validateFields();
    } catch {
      notification.warning({
        message: "Check the form",
        description: "Please fill all required fields before downloading.",
        placement: "topRight",
      });
      return;
    }

    const el = certificateRef.current;
    if (!el) {
      notification.error({
        message: "Preview not ready",
        description: "Could not find the certificate element.",
        placement: "topRight",
      });
      return;
    }

    setPdfLoading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: CANVAS_W,
        height: CANVAS_H,
        windowWidth: CANVAS_W,
        windowHeight: CANVAS_H,
      });

      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [CANVAS_W, CANVAS_H],
      });
      pdf.addImage(img, "PNG", 0, 0, CANVAS_W, CANVAS_H);

      const safeCert = (values.certificateNumber || "certificate").replace(
        /[^a-zA-Z0-9/_-]+/g,
        "_",
      );
      pdf.save(`certificate-${safeCert}.pdf`);

      notification.success({
        message: "PDF downloaded",
        placement: "topRight",
      });
    } catch (e) {
      console.error(e);
      notification.error({
        message: "PDF export failed",
        description: e instanceof Error ? e.message : "Unknown error",
        placement: "topRight",
      });
    } finally {
      setPdfLoading(false);
    }
  }, [form]);

  const watched = Form.useWatch(undefined, form) as
    | Partial<CertificateFormValues>
    | undefined;

  const studentName = (watched?.studentName ?? "").trim();
  const courseName = (watched?.courseName ?? "").trim();
  const courseLevel = (watched?.courseLevel ?? "").trim();
  const providerName = (watched?.providerName ?? "").trim();
  const certificateNumber = (watched?.certificateNumber ?? "").trim();
  const registrationNumber = (watched?.registrationNumber ?? "").trim();
  const dateIssuedText = watched?.dateIssued
    ? dayjs(watched.dateIssued).format("D MMMM YYYY")
    : "";

  return (
    <AdminLayout>
      <div style={{ padding: 24 }}>
        <Title level={3} style={{ marginTop: 0 }}>
          Generate Certificate
        </Title>
        <Text type="secondary">
          Enter details below. The template image is the fixed canvas; only your
          text is overlaid.
        </Text>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={10}>
            <Card title="Certificate details" bordered={false}>
              <Form<CertificateFormValues>
                form={form}
                layout="vertical"
                requiredMark="optional"
                initialValues={{
                  dateIssued: dayjs(),
                }}
              >
                <Form.Item
                  name="studentName"
                  label="Student Name"
                  rules={[
                    { required: true, message: "Student name is required" },
                  ]}
                >
                  <Input placeholder="e.g. SYAMLY V.A" autoComplete="off" />
                </Form.Item>
                <Form.Item
                  name="courseName"
                  label="Course Name"
                  rules={[
                    { required: true, message: "Course name is required" },
                  ]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="e.g. International Skill Diploma In Montessori Education"
                    autoComplete="off"
                  />
                </Form.Item>
                <Form.Item
                  name="courseLevel"
                  label="Course Level"
                  rules={[
                    { required: true, message: "Course level is required" },
                  ]}
                >
                  <Input placeholder="e.g. LEVEL 3" autoComplete="off" />
                </Form.Item>
                <Form.Item
                  name="providerName"
                  label="Provider Name"
                  rules={[
                    { required: true, message: "Provider name is required" },
                  ]}
                >
                  <Input placeholder="e.g. Create Plus" autoComplete="off" />
                </Form.Item>
                <Form.Item
                  name="certificateNumber"
                  label="Certificate Number"
                  rules={[
                    {
                      required: true,
                      message: "Certificate number is required",
                    },
                  ]}
                >
                  <Input
                    placeholder="e.g. CBPD/IASDME/25/3160"
                    autoComplete="off"
                  />
                </Form.Item>
                <Form.Item
                  name="registrationNumber"
                  label="Registration Number"
                  rules={[
                    {
                      required: true,
                      message: "Registration number is required",
                    },
                  ]}
                >
                  <Input placeholder="e.g. CBPD/11080" autoComplete="off" />
                </Form.Item>
                <Form.Item
                  name="dateIssued"
                  label="Date Issued"
                  rules={[
                    { required: true, message: "Date issued is required" },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} format="D MMMM YYYY" />
                </Form.Item>
                <Space wrap>
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={handlePreview}
                  >
                    Preview Certificate
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    loading={pdfLoading}
                    onClick={handleDownloadPdf}
                  >
                    Download PDF
                  </Button>
                </Space>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={14}>
            <Card title="Certificate preview (1234 × 1738 px)" bordered={false}>
              <Text
                type="secondary"
                style={{ display: "block", marginBottom: 16 }}
              >
                Canvas matches the template image pixel size (no stretching).
                PDF uses the same layout.
              </Text>
              <div
                style={{
                  overflow: "auto",
                  maxHeight: "min(85vh, 1200px)",
                  background: "#e2e8f0",
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <CertificateCanvas
                    ref={certificateRef}
                    studentName={studentName}
                    courseName={courseName}
                    courseLevel={courseLevel}
                    providerName={providerName}
                    certificateNumber={certificateNumber}
                    registrationNumber={registrationNumber}
                    dateIssuedText={dateIssuedText}
                  />
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
}
