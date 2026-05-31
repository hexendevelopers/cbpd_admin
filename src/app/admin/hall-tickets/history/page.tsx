"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  message,
  Table,
  Tag,
  Space,
  Avatar,
  Dropdown,
  Menu,
  Button,
  Modal,
} from "antd";
import {
  IdcardOutlined,
  FileDoneOutlined,
  MoreOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import AdminLayout from "@/components/AdminLayout";

const { Title } = Typography;

export default function HallTicketHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // PDF generation states
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
  const [currentTicketData, setCurrentTicketData] = useState<any>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/hall-tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(data.hallTickets || []);
      } else {
        message.error(data.message || "Failed to fetch hall ticket history");
      }
    } catch (error) {
      console.error("Fetch history error:", error);
      message.error("An error occurred while fetching history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const generatePDF = async (record: any) => {
    setGeneratingId(record._id);
    setCurrentTicketData(record);
    
    setTimeout(async () => {
      const element = ticketRef.current;
      if (!element) {
        setGeneratingId(null);
        return;
      }

      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`HallTicket_${record.rollNumber}.pdf`);

        message.success("Hall Ticket downloaded successfully!");
      } catch (error) {
        console.error("Error generating PDF:", error);
        message.error("Failed to generate PDF");
      } finally {
        setGeneratingId(null);
        setCurrentTicketData(null);
      }
    }, 500);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this hall ticket?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const token = localStorage.getItem("adminToken");
          const res = await fetch(`/api/admin/hall-tickets/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            message.success("Hall ticket deleted successfully");
            fetchHistory();
          } else {
            const data = await res.json();
            message.error(data.message || "Failed to delete hall ticket");
          }
        } catch (error) {
          console.error("Error deleting hall ticket:", error);
          message.error("An error occurred while deleting hall ticket");
        }
      },
    });
  };

  const columns = [
    {
      title: "Candidate",
      key: "candidate",
      render: (record: any) => (
        <Space>
          <Avatar
            icon={<IdcardOutlined />}
            style={{
              background: "linear-gradient(135deg, #1890ff 0%, #0050b3 100%)",
              boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
            }}
          />
          <div>
            <div style={{ fontWeight: 600, color: "#1a1a1a" }}>
              {record.candidateName}
            </div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Roll No: {record.rollNumber}
            </Typography.Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Course",
      dataIndex: "course",
      key: "course",
      render: (text: string) => (
        <span style={{ fontWeight: 500 }}>{text}</span>
      ),
    },
    {
      title: "Exam Date",
      dataIndex: "examinationDate",
      key: "examinationDate",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color="success"
          icon={<FileDoneOutlined />}
          style={{
            borderRadius: 12,
            fontWeight: 600,
            boxShadow: "0 2px 4px rgba(82, 196, 26, 0.3)",
          }}
        >
          {status || "Generated"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: any) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="download"
                icon={<FileDoneOutlined />}
                onClick={() => generatePDF(record)}
                disabled={generatingId === record._id}
              >
                {generatingId === record._id ? "Downloading..." : "Download PDF"}
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
          trigger={["click"]}
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            style={{
              borderRadius: 8,
              background: "#f5f5f5",
            }}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div style={{ padding: "24px" }}>
        <Title level={2} style={{ color: "#1a237e", marginBottom: 24 }}>
          Hall Ticket History
        </Title>

        <Card
          style={{
            borderRadius: 16,
            border: "none",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            className="w-full"
            columns={columns}
            dataSource={history}
            rowKey="_id"
            loading={loadingHistory}
            pagination={{
              pageSize: 10,
              style: { padding: "16px 24px" },
            }}
            style={{ borderRadius: 16 }}
          />
        </Card>

        {/* Hidden Hall Ticket Template for PDF Generation */}
        {currentTicketData && (
          <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
            <div
              ref={ticketRef}
              style={{
                width: "210mm",
                minHeight: "297mm",
                backgroundColor: "white",
                padding: "20mm",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                fontFamily: "Times New Roman, serif",
                position: "relative",
              }}
            >
              {/* Background Watermark */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  opacity: 0.05,
                  zIndex: 0,
                  textAlign: "center",
                  width: "100%",
                }}
              >
                <div style={{ fontSize: "150px", fontWeight: "bold", color: "#d4af37" }}>CBPD</div>
                <div style={{ fontSize: "40px", fontWeight: "bold", color: "#d4af37" }}>CENTRAL BOARD OF</div>
                <div style={{ fontSize: "40px", fontWeight: "bold", color: "#d4af37" }}>PROFESSIONAL DEVELOPMENT</div>
              </div>

              <div style={{ position: "relative", zIndex: 1 }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <img
                    src="/cbpd-logo-transparent.png"
                    alt="CBPD Logo"
                    style={{ height: "100px", marginBottom: "10px" }}
                  />
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "#000080", marginBottom: "5px" }}>
                    CENTRAL BOARD OF PROFESSIONAL DEVELOPMENT
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "5px" }}>
                    FINAL EXAMINATION - 2025
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "#000080" }}>
                    HALLTICKET
                  </div>
                </div>

                {/* Details Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px", fontSize: "14px", fontWeight: "bold" }}>
                  <tbody>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "10px", width: "35%" }}>NAME OF CANDIDATE</td>
                      <td style={{ border: "1px solid #000", padding: "10px", textTransform: "uppercase" }}>{currentTicketData.candidateName}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "10px" }}>DATE OF BIRTH</td>
                      <td style={{ border: "1px solid #000", padding: "10px" }}>{currentTicketData.dateOfBirth}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "10px" }}>COURSE</td>
                      <td style={{ border: "1px solid #000", padding: "10px", textTransform: "uppercase" }}>{currentTicketData.course}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "10px" }}>COURSE DURATION</td>
                      <td style={{ border: "1px solid #000", padding: "10px", textTransform: "uppercase" }}>{currentTicketData.courseDuration}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "10px" }}>EXAMINATION CENTRE</td>
                      <td style={{ border: "1px solid #000", padding: "10px", textTransform: "uppercase" }}>{currentTicketData.examinationCentre}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "10px" }}>EXAMINATION DATE</td>
                      <td style={{ border: "1px solid #000", padding: "10px" }}>{currentTicketData.examinationDate}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "10px" }}>EXAMINATION TIME</td>
                      <td style={{ border: "1px solid #000", padding: "10px" }}>{currentTicketData.examinationTime}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "10px" }}>EXAMINATION TEST CODE</td>
                      <td style={{ border: "1px solid #000", padding: "10px" }}>{currentTicketData.examinationTestCode}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Roll Number and Photo */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
                  <table style={{ borderCollapse: "collapse", width: "60%", fontSize: "14px", fontWeight: "bold" }}>
                    <tbody>
                      <tr>
                        <td style={{ border: "2px solid #000", padding: "10px", width: "40%", textAlign: "center" }}>ROLL NUMBER</td>
                        <td style={{ border: "2px solid #000", padding: "10px", textAlign: "center" }}>{currentTicketData.rollNumber}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  {currentTicketData.photoData && (
                    <div style={{ width: "150px", height: "180px", border: "1px solid #ccc", overflow: "hidden" }}>
                      <img 
                        src={currentTicketData.photoData} 
                        alt="Candidate" 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  )}
                </div>

                {/* Signatures */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px", fontSize: "14px", fontWeight: "bold", textAlign: "center" }}>
                  <div>
                    <div style={{ height: "60px" }}></div>
                    <div>Signature<br/>Examination Supervisor</div>
                  </div>
                  <div>
                    <div style={{ height: "60px" }}></div>
                    <div>Seal<br/>(Examination Centre)</div>
                  </div>
                  <div>
                    <div style={{ height: "60px" }}></div>
                    <div>Signature Of Candidate</div>
                  </div>
                </div>

                {/* Instructions */}
                <div style={{ fontSize: "14px" }}>
                  <div style={{ textAlign: "center", color: "#000080", fontWeight: "bold", fontSize: "16px", marginBottom: "15px" }}>
                    INSTRUCTIONS TO THE CANDIDATE
                  </div>
                  <ol style={{ fontWeight: "bold", paddingLeft: "20px", margin: 0, lineHeight: "1.5" }}>
                    <li style={{ marginBottom: "10px" }}>Register Number, Subject code.are to entered in the column provided correctly Do not write your Register Number or name anywhere else in the answer book.</li>
                    <li style={{ marginBottom: "10px" }}>Use of any incriminating written printed/xerox material, calculator, cell phone or any other electronic devices are prohibated.</li>
                    <li style={{ marginBottom: "10px" }}>Malpractice of any nature is punishable</li>
                    <li style={{ marginBottom: "10px" }}>You have to write the Question Numbers and Answers within the border line provided</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
