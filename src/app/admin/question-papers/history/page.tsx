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
                fontFamily: "Arial, sans-serif",
                position: "relative",
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
                  opacity: 0.15,
                  zIndex: 0,
                  width: "60%",
                  textAlign: "center"
                }}
              >
                <img src="/cbpd-logo-transparent.png" alt="watermark logo" style={{ width: "100%", height: "auto" }} />
              </div>

              <div style={{ position: "relative", zIndex: 1 }}>
                {/* Headers */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px", fontFamily: "Arial, sans-serif" }}>
                  {/* Left Column */}
                  <div style={{ fontWeight: "bold", fontSize: "12px", lineHeight: "1.2", flex: 1 }}>
                    <div>CBPD</div>
                    <div>{currentPaper.courseCode || "CODE"}</div>
                  </div>
                  
                  {/* Center Column */}
                  <div style={{ textAlign: "center", flex: 3, fontFamily: "Times New Roman, serif" }}>
                    <img
                      src="/cbpd-logo-transparent.png"
                      alt="CBPD Logo"
                      style={{ height: "60px", marginBottom: "2px", display: "block", margin: "0 auto" }}
                    />
                    <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>CBPD</div>
                    <div style={{ fontSize: "17px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "4px" }}>
                      CENTRAL BOARD OF PROFESSIONAL DEVELOPMENT
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "6px" }}>
                      {currentPaper.examinationTerm || "FINAL EXAMINATION"}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                      Course : {currentPaper.courseName || "Course Name"}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div style={{ fontWeight: "bold", fontSize: "12px", lineHeight: "1.2", textAlign: "right", flex: 1 }}>
                    <div>Time: {currentPaper.time || "2 Hrs"}</div>
                    <div>Marks: {currentPaper.marks || "100"}</div>
                  </div>
                </div>

                {/* Modules & Questions */}
                {currentPaper.modules?.map((module, mIndex) => {
                  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][mIndex] || (mIndex + 1);
                  return (
                    <div key={mIndex} style={{ marginBottom: "20px", fontSize: "12px", fontFamily: "Arial, sans-serif" }}>
                      {module?.title && (
                        <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "10px", textTransform: "uppercase" }}>
                          MODULE {roman} : {module.title}
                        </div>
                      )}
                      
                      {module.questions?.map((q, qIndex) => {
                        const num = globalQuestionNumber++;
                        return (
                          <div key={qIndex} style={{ marginBottom: "12px", paddingLeft: "5px" }}>
                            <div style={{ display: "flex", marginBottom: "4px" }}>
                              <div style={{ width: "20px", flexShrink: 0 }}>{num}.</div>
                              <div style={{ flex: 1 }}>{q?.text || "Question Text"}</div>
                            </div>
                            
                            {/* Options Inline */}
                            <div style={{ paddingLeft: "20px", lineHeight: "1.5" }}>
                              <span style={{ marginRight: "15px" }}>a) {q?.options?.a || "Option A"}</span>
                              <span style={{ marginRight: "15px" }}>b) {q?.options?.b || "Option B"}</span>
                              <span style={{ marginRight: "15px" }}>c) {q?.options?.c || "Option C"}</span>
                              <span>d) {q?.options?.d || "Option D"}</span>
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
