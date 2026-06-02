"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Table, Button, Card, Row, Col, Typography, message, Modal } from "antd";
import { EyeOutlined, DeleteOutlined, DownloadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import AdminLayout from "@/components/AdminLayout";

const { Title } = Typography;

interface QuestionData {
  text: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
}

interface ModuleData {
  title: string;
  questions: QuestionData[];
}

interface PaperData {
  _id: string;
  courseCode: string;
  examinationTerm: string;
  courseName: string;
  time: string;
  marks: string;
  modules: ModuleData[];
  createdAt: string;
}

export default function QuestionPaperHistoryPage() {
  const [papers, setPapers] = useState<PaperData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Preview Modal State
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentPaper, setCurrentPaper] = useState<PaperData | null>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/question-papers");
      setPapers(response.data);
    } catch (error) {
      console.error("Error fetching question papers:", error);
      message.error("Failed to load question papers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/admin/question-papers/${id}`);
      message.success("Question Paper deleted successfully");
      fetchPapers();
    } catch (error) {
      console.error("Error deleting:", error);
      message.error("Failed to delete question paper");
    }
  };

  const showPreview = (paper: PaperData) => {
    setCurrentPaper(paper);
    setPreviewVisible(true);
  };

  const downloadPDF = async () => {
    if (paperRef.current && currentPaper) {
      const canvas = await html2canvas(paperRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${currentPaper.courseCode}_Question_Paper.pdf`);
    }
  };

  const columns = [
    {
      title: "Course Code",
      dataIndex: "courseCode",
      key: "courseCode",
    },
    {
      title: "Course Name",
      dataIndex: "courseName",
      key: "courseName",
      render: (text: string) => <div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</div>,
    },
    {
      title: "Exam Term",
      dataIndex: "examinationTerm",
      key: "examinationTerm",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: PaperData) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={() => showPreview(record)}
            size="small"
          >
            Preview
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record._id)}
            size="small"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  let globalQuestionNumber = 1;

  return (
    <AdminLayout>
      <div style={{ padding: "24px" }}>
        <Button 
          type="link" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => router.push('/admin')}
        style={{ marginBottom: "16px", paddingLeft: 0 }}
      >
        Back to Dashboard
      </Button>

      <Row justify="space-between" align="middle" style={{ marginBottom: "24px" }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            Question Paper History
          </Title>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <Table 
          columns={columns} 
          dataSource={papers} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Question Paper Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={downloadPDF}>
            Download PDF
          </Button>
        ]}
      >
        <div style={{ display: "flex", justifyContent: "center", backgroundColor: "#f0f2f5", padding: "20px" }}>
          {currentPaper && (
            <div
              ref={paperRef}
              style={{
                width: "210mm",
                minHeight: "297mm",
                boxSizing: "border-box",
                backgroundColor: "white",
                padding: "15mm",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                fontFamily: '"Cambria", Georgia, serif',
                lineHeight: "1.3",
                position: "relative",
                transform: "scale(0.85)",
                transformOrigin: "top center",
                color: "#000",
              }}
            >
              {/* Background Watermark */}
              <div
                style={{
                  position: "absolute",
                  top: "40%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  opacity: 0.1,
                  zIndex: 0,
                  width: "140mm",
                  textAlign: "center"
                }}
              >
                <img src="/cbpd-logo-transparent.png" alt="watermark logo" style={{ width: "100%", height: "auto" }} />
              </div>

              <div style={{ position: "relative", zIndex: 1 }}>
                {/* Headers */}
                <div style={{ textAlign: "center", marginBottom: "15px" }}>
                  <img src="/cbpd-logo-transparent.png" alt="Logo" style={{ height: "90px", width: "90px", objectFit: "contain", marginBottom: "8px", display: "inline-block" }} />
                  <div style={{ fontSize: "16pt", fontWeight: "bold", textTransform: "uppercase" }}>
                    CENTRAL BOARD OF PROFESSIONAL DEVELOPMENT UK
                  </div>
                  <div style={{ fontSize: "14pt", fontWeight: "bold", marginTop: "4px" }}>
                    {currentPaper.examinationTerm || "FINAL EXAMINATION 2026"}
                  </div>
                  <div style={{ fontSize: "12pt", fontWeight: "normal", marginTop: "4px" }}>
                    Course: {currentPaper.courseName || "International Diploma in AI Integrated Digital Marketing Management"}
                  </div>
                </div>

                {/* Time and Marks Row */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11pt", marginBottom: "15px", fontWeight: "normal" }}>
                  <div>Time: {currentPaper.time || "2 Hours"}</div>
                  <div>Marks: {currentPaper.marks || "100"}</div>
                </div>

                {/* Modules & Questions */}
                {currentPaper.modules?.map((module, mIndex) => {
                  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][mIndex] || (mIndex + 1);
                  return (
                    <div key={mIndex} style={{ marginBottom: "20px" }}>
                      <div style={{ 
                        textAlign: "center", 
                        fontWeight: "bold", 
                        fontSize: "12pt",
                        marginBottom: "6px"
                      }}>
                        Module {roman}: {module.title}
                      </div>
                      
                      {module.questions?.map((q, qIndex) => {
                        const num = globalQuestionNumber++;
                        return (
                          <div key={qIndex} style={{ marginBottom: "10px", fontSize: "11pt", fontWeight: "normal" }}>
                            {/* Question Text */}
                            <div style={{ display: "flex", marginBottom: "4px" }}>
                              <div style={{ width: "24px", flexShrink: 0, fontWeight: "normal" }}>{num}.</div>
                              <div style={{ flex: 1 }}>{q?.text || "Question Text"}</div>
                            </div>
                            
                            {/* Options with Two-Column Grid */}
                            <div style={{ 
                              display: "grid", 
                              gridTemplateColumns: "1fr 1fr", 
                              gap: "4px 20px", 
                              paddingLeft: "24px" 
                            }}>
                              <div style={{ display: "flex" }}>
                                <div style={{ width: "20px", flexShrink: 0 }}>a)</div>
                                <div>{q?.options?.a || "Option A"}</div>
                              </div>
                              <div style={{ display: "flex" }}>
                                <div style={{ width: "20px", flexShrink: 0 }}>b)</div>
                                <div>{q?.options?.b || "Option B"}</div>
                              </div>
                              <div style={{ display: "flex" }}>
                                <div style={{ width: "20px", flexShrink: 0 }}>c)</div>
                                <div>{q?.options?.c || "Option C"}</div>
                              </div>
                              <div style={{ display: "flex" }}>
                                <div style={{ width: "20px", flexShrink: 0 }}>d)</div>
                                <div>{q?.options?.d || "Option D"}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Modal>
      </div>
    </AdminLayout>
  );
}
