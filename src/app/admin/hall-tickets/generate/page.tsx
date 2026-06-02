"use client";

import React, { useState, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Input,
  Button,
  Form,
  Space,
  message,
  Upload,
} from "antd";
import {
  IdcardOutlined,
  SaveOutlined,
  PrinterOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import AdminLayout from "@/components/AdminLayout";
import type { UploadFile } from "antd/es/upload/interface";

const { Title, Text } = Typography;

export default function GenerateHallTicket() {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);
  
  const [ticketData, setTicketData] = useState({
    candidateName: "VIVEK KS",
    dateOfBirth: "29 / 10 / 1996",
    course: "AI INTEGRATED DIGITAL MARKETING MANAGER",
    courseDuration: "4 MONTHS",
    examinationCentre: "INFERA AIBI CAMPUS PRIVATE LIMITED, EDAPPALLY",
    examinationDate: "18/11/2025",
    examinationTime: "10 AM - 12 PM",
    examinationTestCode: "001",
    rollNumber: "DMB000104",
    photoData: "",
  });

  const handleValuesChange = (changedValues: any, allValues: any) => {
    setTicketData(prev => ({ ...prev, ...allValues }));
  };

  const handlePhotoUpload = (info: any) => {
    if (info.fileList && info.fileList.length > 0) {
      const file = info.fileList[info.fileList.length - 1].originFileObj;
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setTicketData(prev => ({ ...prev, photoData: e.target?.result as string }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setTicketData(prev => ({ ...prev, photoData: "" }));
    }
  };

  const saveAndDownload = async () => {
    try {
      await form.validateFields();
    } catch (error) {
      message.error("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    const element = ticketRef.current;
    if (!element) {
      setSaving(false);
      return;
    }

    try {
      // Small delay to ensure all images and DOM updates are fully rendered
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 1. Generate PDF
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`HallTicket_${ticketData.rollNumber}.pdf`);

      // 2. Save to database
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/hall-tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ticketData),
      });

      if (res.ok) {
        message.success("Hall Ticket generated and saved successfully!");
        form.resetFields();
        setTicketData({
          candidateName: "",
          dateOfBirth: "",
          course: "",
          courseDuration: "",
          examinationCentre: "",
          examinationDate: "",
          examinationTime: "",
          examinationTestCode: "",
          rollNumber: "",
          photoData: "",
        });
      } else {
        const data = await res.json();
        message.error(data.message || "Failed to save Hall Ticket");
      }
    } catch (error) {
      console.error("Error generating/saving Hall Ticket:", error);
      message.error("Failed to process Hall Ticket");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: "24px" }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ color: "#1a237e", margin: 0 }}>
              <IdcardOutlined style={{ marginRight: 12 }} />
              Generate Hall Ticket
            </Title>
            <Text type="secondary">
              Fill in the details below to generate a new Hall Ticket.
            </Text>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PrinterOutlined />}
                size="large"
                onClick={saveAndDownload}
                loading={saving}
                style={{
                  background: "linear-gradient(135deg, #1890ff 0%, #0050b3 100%)",
                  boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
                  borderRadius: 8,
                }}
              >
                Generate & Save PDF
              </Button>
            </Space>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* Input Form Column */}
          <Col span={10}>
            <Card
              title="Hall Ticket Details"
              style={{
                borderRadius: 16,
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                border: "none",
                position: "sticky",
                top: 100,
              }}
            >
              <Form
                form={form}
                layout="vertical"
                initialValues={ticketData}
                onValuesChange={handleValuesChange}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="candidateName"
                      label="Candidate Name"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input placeholder="Enter Candidate Name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="rollNumber"
                      label="Roll Number"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input placeholder="Enter Roll Number" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="dateOfBirth"
                      label="Date of Birth"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input placeholder="DD / MM / YYYY" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="examinationDate"
                      label="Examination Date"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input placeholder="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="course"
                  label="Course"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input placeholder="Enter Course Name" />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="courseDuration"
                      label="Course Duration"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input placeholder="e.g. 4 MONTHS" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="examinationTime"
                      label="Examination Time"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input placeholder="e.g. 10 AM - 12 PM" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="examinationCentre"
                  label="Examination Centre"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input placeholder="Enter Examination Centre" />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="examinationTestCode"
                      label="Test Code"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input placeholder="e.g. 001" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Candidate Photo"
                      required
                    >
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={handlePhotoUpload}
                      >
                        <Button icon={<UploadOutlined />}>Upload Photo</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>

          {/* Live Preview Column */}
          <Col span={14}>
            <div
              style={{
                width: "100%",
                overflowX: "auto",
                background: "#e2e8f0",
                padding: "24px",
                borderRadius: 16,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                ref={ticketRef}
                style={{
                  width: "210mm",
                  height: "297mm",
                  boxSizing: "border-box",
                  backgroundColor: "white",
                  padding: "10mm",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  fontFamily: "Arial, sans-serif",
                  position: "relative",
                  transform: "scale(0.8)",
                  transformOrigin: "top center",
                }}
              >
                {/* Background Watermark */}
                <div
                  style={{
                    position: "absolute",
                    top: "35%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    opacity: 0.1,
                    zIndex: 0,
                    width: "70%",
                    textAlign: "center"
                  }}
                >
                  <img src="/cbpd-logo-transparent.png" alt="watermark logo" style={{ width: "100%", height: "auto" }} />
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: "70%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    opacity: 0.05,
                    zIndex: 0,
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  <div style={{ fontSize: "150px", fontWeight: "bold", color: "#d4af37" }}>CBPD</div>
                  <div style={{ fontSize: "30px", fontWeight: "bold", color: "#d4af37" }}>CENTRAL BOARD OF</div>
                  <div style={{ fontSize: "30px", fontWeight: "bold", color: "#d4af37" }}>PROFESSIONAL DEVELOPMENT</div>
                </div>

                <div style={{ position: "relative", zIndex: 1 }}>
                  {/* Header */}
                  <div style={{ textAlign: "center", marginBottom: "10px", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "Times New Roman, serif" }}>
                    <img
                      src="/cbpd-logo-transparent.png"
                      alt="CBPD Logo"
                      style={{ height: "95px", marginBottom: "5px", display: "block" }}
                    />
                    <div style={{ fontSize: "16px", fontWeight: "bold", color: "#000080", marginBottom: "5px" }}>
                      CENTRAL BOARD OF PROFESSIONAL DEVELOPMENT
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "5px" }}>
                      FINAL EXAMINATION - 2025
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "#000080" }}>
                      HALLTICKET
                    </div>
                  </div>

                  {/* Details Table */}
                  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px", fontSize: "12px", fontWeight: "bold" }}>
                    <tbody>
                      <tr>
                        <td style={{ border: "1px solid #000", padding: "4px", width: "35%" }}>NAME OF CANDIDATE</td>
                        <td style={{ border: "1px solid #000", padding: "4px", textTransform: "uppercase" }}>{ticketData.candidateName}</td>
                      </tr>
                      <tr>
                        <td style={{ border: "1px solid #000", padding: "4px" }}>DATE OF BIRTH</td>
                        <td style={{ border: "1px solid #000", padding: "4px" }}>{ticketData.dateOfBirth}</td>
                      </tr>
                      <tr>
                        <td style={{ border: "1px solid #000", padding: "4px" }}>COURSE</td>
                        <td style={{ border: "1px solid #000", padding: "4px", textTransform: "uppercase" }}>{ticketData.course}</td>
                      </tr>
                      <tr>
                        <td style={{ border: "1px solid #000", padding: "4px" }}>COURSE DURATION</td>
                        <td style={{ border: "1px solid #000", padding: "4px", textTransform: "uppercase" }}>{ticketData.courseDuration}</td>
                      </tr>
                      <tr>
                        <td style={{ border: "1px solid #000", padding: "4px" }}>EXAMINATION CENTRE</td>
                        <td style={{ border: "1px solid #000", padding: "4px", textTransform: "uppercase" }}>{ticketData.examinationCentre}</td>
                      </tr>
                      <tr>
                        <td style={{ border: "1px solid #000", padding: "4px" }}>EXAMINATION DATE</td>
                        <td style={{ border: "1px solid #000", padding: "4px" }}>{ticketData.examinationDate}</td>
                      </tr>
                      <tr>
                        <td style={{ border: "1px solid #000", padding: "4px" }}>EXAMINATION TIME</td>
                        <td style={{ border: "1px solid #000", padding: "4px" }}>{ticketData.examinationTime}</td>
                      </tr>
                      <tr>
                        <td style={{ border: "1px solid #000", padding: "4px" }}>EXAMINATION TEST CODE</td>
                        <td style={{ border: "1px solid #000", padding: "4px" }}>{ticketData.examinationTestCode}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Roll Number and Photo */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                    <table style={{ borderCollapse: "collapse", width: "55%", fontSize: "12px", fontWeight: "bold" }}>
                      <tbody>
                        <tr>
                          <td style={{ border: "2px solid #000", padding: "6px", width: "40%", textAlign: "center" }}>ROLL NUMBER</td>
                          <td style={{ border: "2px solid #000", padding: "6px", textAlign: "center" }}>{ticketData.rollNumber}</td>
                        </tr>
                      </tbody>
                    </table>
                    
                    <div style={{ width: "100px", height: "120px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
                      {ticketData.photoData ? (
                        <img 
                          src={ticketData.photoData} 
                          alt="Candidate" 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        "Photo Here"
                      )}
                    </div>
                  </div>

                  {/* Signatures */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "15px", fontSize: "11px", fontWeight: "bold" }}>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={{ height: "30px" }}></div>
                      <div>Signature<br/>Examination Supervisor</div>
                    </div>
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ height: "30px" }}></div>
                      <div>Seal<br/>(Examination Centre)</div>
                    </div>
                    <div style={{ flex: 1, textAlign: "right" }}>
                      <div style={{ height: "30px" }}></div>
                      <div>Signature Of Candidate</div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div style={{ fontSize: "11px" }}>
                    <div style={{ textAlign: "center", color: "#000080", fontWeight: "bold", fontSize: "12px", marginBottom: "5px" }}>
                      INSTRUCTIONS TO THE CANDIDATE
                    </div>
                    <ol style={{ fontWeight: "bold", paddingLeft: "15px", margin: 0, lineHeight: "1.3" }}>
                      <li style={{ marginBottom: "4px" }}>Register Number, Subject code.are to entered in the column provided correctly Do not write your Register Number or name anywhere else in the answer book.</li>
                      <li style={{ marginBottom: "4px" }}>Use of any incriminating written printed/xerox material, calculator, cell phone or any other electronic devices are prohibated.</li>
                      <li style={{ marginBottom: "4px" }}>Malpractice of any nature is punishable</li>
                      <li style={{ marginBottom: "4px" }}>You have to write the Question Numbers and Answers within the border line provided</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
}
