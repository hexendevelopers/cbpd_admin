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
import "@/styles/certificate-generator.css"; // Ensure this has relevant CSS or we'll add inline

const { Title, Text } = Typography;

// We assume portrait orientation roughly proportional to A4
const CANVAS_W = 1234;
const CANVAS_H = 1738;

type CimaaFormValues = {
  studentName: string;
  programName: string;
  providerName: string;
  certificateNumber: string;
  registrationNumber: string;
  dateIssued: Dayjs;
};

type CimaaCanvasProps = {
  studentName: string;
  programName: string;
  providerName: string;
  certificateNumber: string;
  registrationNumber: string;
  dateIssuedText: string;
};

const getStudentNameFontSize = (text: string) => {
  const len = text.length;
  if (len > 50) return "32px";
  if (len > 35) return "40px";
  if (len > 25) return "48px";
  return "56px";
};

const getProgramNameFontSize = (text: string) => {
  const len = text.length;
  if (len > 120) return "20px";
  if (len > 80) return "24px";
  if (len > 50) return "28px";
  return "36px";
};

const CimaaCanvas = forwardRef<HTMLDivElement, CimaaCanvasProps>(
  function CimaaCanvas(
    {
      studentName,
      programName,
      providerName,
      certificateNumber,
      registrationNumber,
      dateIssuedText,
    },
    ref,
  ) {
    return (
      <div 
        ref={ref} 
        className="certificate-canvas"
        style={{ 
          position: "relative", 
          width: CANVAS_W, 
          height: CANVAS_H, 
          minWidth: CANVAS_W,
          minHeight: CANVAS_H,
          backgroundColor: "#fff",
          overflow: "hidden",
          flexShrink: 0
        }}
      >
        <img
          src="/cimaa-template.png"
          alt="Template"
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "fill" }}
          draggable={false}
          crossOrigin="anonymous"
        />
        <div style={{ 
          position: "absolute", top: "580px", left: "50px", width: "calc(100% - 100px)", height: "100px", 
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ textAlign: "center", fontSize: getStudentNameFontSize(studentName), fontWeight: "bold", color: "#000", fontFamily: "'Times New Roman', Times, serif", textTransform: "uppercase", lineHeight: "1.2" }}>
            {studentName}
          </div>
        </div>

        <div style={{ 
          position: "absolute", top: "680px", left: "100px", width: "calc(100% - 200px)", height: "140px", 
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ textAlign: "center", fontSize: getProgramNameFontSize(programName), fontWeight: "bold", color: "#000", fontFamily: "'Times New Roman', Times, serif", textTransform: "uppercase", whiteSpace: "pre-wrap", lineHeight: "1.2" }}>
            {programName}
          </div>
        </div>
        
        <div style={{ position: "absolute", top: "976px", left: "610px", fontSize: "20px", color: "#000", fontFamily: "'Times New Roman', Times, serif", fontWeight: "bold" }}>
          {providerName}
        </div>
        <div style={{ position: "absolute", top: "1016px", left: "610px", fontSize: "20px", color: "#000", fontFamily: "'Times New Roman', Times, serif", fontWeight: "bold" }}>
          {certificateNumber}
        </div>
        <div style={{ position: "absolute", top: "1061px", left: "610px", fontSize: "20px", color: "#000", fontFamily: "'Times New Roman', Times, serif", fontWeight: "bold" }}>
          {registrationNumber}
        </div>
        
        <div style={{ position: "absolute", top: "1370px", left: "660px", fontSize: "20px", color: "#000", fontFamily: "'Times New Roman', Times, serif", fontWeight: "bold" }}>
          {dateIssuedText}
        </div>
      </div>
    );
  },
);

export default function GenerateCimaaCertificatePage() {
  const [form] = Form.useForm<CimaaFormValues>();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const scrollToPreview = () => {
    canvasRef.current?.scrollIntoView({
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

  const saveToDatabase = async (values: CimaaFormValues, safeCertNo: string) => {
    try {
      await fetch("/api/admin/cimaa-certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: values.studentName,
          programName: values.programName,
          providerName: values.providerName,
          certificateNo: values.certificateNumber,
          registrationNo: values.registrationNumber,
          dateIssued: values.dateIssued.toISOString(),
        }),
      });
    } catch (e) {
      console.error("Failed to save to database", e);
    }
  };

  const handleDownloadPdf = useCallback(async () => {
    let values: CimaaFormValues;
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

    const el = canvasRef.current;
    if (!el) return;

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
      pdf.save(`cimaa-certificate-${safeCert}.pdf`);
      
      // Save to database silently
      await saveToDatabase(values, safeCert);

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

  const watched = Form.useWatch(undefined, form) as Partial<CimaaFormValues> | undefined;

  const studentName = (watched?.studentName ?? "Name").trim() || "Name";
  const programName = (watched?.programName ?? "Montessori Program").trim() || "Montessori Program";
  const providerName = (watched?.providerName ?? "Provider Name").trim() || "Provider Name";
  const certificateNumber = (watched?.certificateNumber ?? "Cert No").trim() || "Cert No";
  const registrationNumber = (watched?.registrationNumber ?? "Reg No").trim() || "Reg No";
  const dateIssuedText = watched?.dateIssued ? dayjs(watched.dateIssued).format("D MMMM YYYY") : dayjs().format("D MMMM YYYY");

  return (
    <AdminLayout>
      <div style={{ padding: 24 }}>
        <Title level={3} style={{ marginTop: 0 }}>
          Generate CIMAA Certificate
        </Title>
        <Text type="secondary">
          Enter details below. The template image is the fixed canvas; only your text is overlaid.
        </Text>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={10}>
            <Card title="Certificate details" bordered={false}>
              <Form<CimaaFormValues>
                form={form}
                layout="vertical"
                requiredMark="optional"
                initialValues={{ dateIssued: dayjs() }}
              >
                <Form.Item
                  name="studentName"
                  label="Name"
                  rules={[{ required: true, message: "Name is required" }]}
                >
                  <Input placeholder="e.g. John Doe" autoComplete="off" />
                </Form.Item>
                <Form.Item
                  name="programName"
                  label="Program Name"
                  rules={[{ required: true, message: "Program name is required" }]}
                >
                  <Input.TextArea rows={2} placeholder="e.g. International Diploma in Montessori Teachers Training" autoComplete="off" />
                </Form.Item>
                <Form.Item
                  name="providerName"
                  label="Provider Name"
                  rules={[{ required: true, message: "Provider name is required" }]}
                >
                  <Input placeholder="e.g. Montessori Academy" autoComplete="off" />
                </Form.Item>
                <Form.Item
                  name="certificateNumber"
                  label="Certificate No"
                  rules={[{ required: true, message: "Certificate No is required" }]}
                >
                  <Input placeholder="e.g. CIMAA-2026-001" autoComplete="off" />
                </Form.Item>
                <Form.Item
                  name="registrationNumber"
                  label="Registration No"
                  rules={[{ required: true, message: "Registration No is required" }]}
                >
                  <Input placeholder="e.g. REG-2026-001" autoComplete="off" />
                </Form.Item>
                <Form.Item
                  name="dateIssued"
                  label="Date Issued"
                  rules={[{ required: true, message: "Date is required" }]}
                >
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>

                <Space style={{ marginTop: 16 }}>
                  <Button
                    type="default"
                    icon={<EyeOutlined />}
                    onClick={handlePreview}
                  >
                    Preview
                  </Button>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadPdf}
                    loading={pdfLoading}
                  >
                    Download PDF
                  </Button>
                </Space>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={14}>
            <Card title="Live Preview" bordered={false} bodyStyle={{ overflowX: "auto" }}>
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
                  <CimaaCanvas
                  ref={canvasRef}
                  studentName={studentName}
                  programName={programName}
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
