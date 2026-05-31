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
  FileDoneOutlined,
  FileTextOutlined,
  MoreOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import AdminLayout from "@/components/AdminLayout";

const { Title } = Typography;

export default function InvoiceHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Receipt generation states
  const [generatingReceiptId, setGeneratingReceiptId] = useState<string | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [currentReceiptData, setCurrentReceiptData] = useState<any>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/invoices", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(data.invoices || []);
      } else {
        message.error(data.message || "Failed to fetch invoice history");
      }
    } catch (error) {
      console.error("Fetch history error:", error);
      message.error("An error occurred while fetching history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const generateReceipt = async (record: any) => {
    setGeneratingReceiptId(record._id);
    setCurrentReceiptData(record);
    
    setTimeout(async () => {
      const element = receiptRef.current;
      if (!element) {
        setGeneratingReceiptId(null);
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
        pdf.save(`Receipt_${record.invoiceNumber}.pdf`);

        const token = localStorage.getItem("adminToken");
        const updateRes = await fetch(`/api/admin/invoices/${record._id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "Receipt Generated" }),
        });

        if (updateRes.ok) {
          message.success("Receipt generated successfully!");
          fetchHistory();
        } else {
          message.warning("Receipt downloaded, but failed to update status.");
        }
      } catch (error) {
        console.error("Error generating receipt PDF:", error);
        message.error("Failed to generate Receipt PDF");
      } finally {
        setGeneratingReceiptId(null);
        setCurrentReceiptData(null);
      }
    }, 500);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this invoice?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const token = localStorage.getItem("adminToken");
          const res = await fetch(`/api/admin/invoices/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            message.success("Invoice deleted successfully");
            fetchHistory();
          } else {
            const data = await res.json();
            message.error(data.message || "Failed to delete invoice");
          }
        } catch (error) {
          console.error("Error deleting invoice:", error);
          message.error("An error occurred while deleting invoice");
        }
      },
    });
  };

  const columns = [
    {
      title: "Invoice",
      key: "invoice",
      render: (record: any) => (
        <Space>
          <Avatar
            icon={<FileTextOutlined />}
            style={{
              background: "linear-gradient(135deg, #1890ff 0%, #0050b3 100%)",
              boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
            }}
          />
          <div>
            <div style={{ fontWeight: 600, color: "#1a1a1a" }}>
              {record.invoiceNumber}
            </div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {record.invoiceDate}
            </Typography.Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Bill To",
      dataIndex: "billTo",
      key: "billTo",
      render: (text: string) => {
        const lines = text?.split("\n") || [];
        return (
          <div>
            <div style={{ fontWeight: 600, color: "#1a1a1a" }}>
              {lines[0]}
            </div>
            {lines.slice(1).map((line, idx) => (
              <div key={idx} style={{ fontSize: 12, color: "#666" }}>
                {line}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: "Total GBP",
      dataIndex: "totalGBP",
      key: "totalGBP",
      render: (val: number) => (
        <span style={{ fontWeight: 600 }}>£{val?.toFixed(2)}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const isReceipt = status === "Receipt Generated";
        return (
          <Tag
            color={isReceipt ? "success" : "processing"}
            icon={isReceipt ? <FileDoneOutlined /> : <FileTextOutlined />}
            style={{
              borderRadius: 12,
              fontWeight: 600,
              boxShadow: isReceipt 
                ? "0 2px 4px rgba(82, 196, 26, 0.3)"
                : "0 2px 4px rgba(24, 144, 255, 0.3)",
            }}
          >
            {status || "Invoice Generated"}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: any) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="generate_receipt"
                icon={<FileDoneOutlined />}
                onClick={() => generateReceipt(record)}
                disabled={generatingReceiptId === record._id}
              >
                {generatingReceiptId === record._id ? "Generating..." : "Generate Receipt"}
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
          Invoice History
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

        {/* Hidden Receipt Template for PDF Generation */}
        {currentReceiptData && (
          <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
            <div
              ref={receiptRef}
              style={{
                width: "210mm",
                minHeight: "297mm",
                backgroundColor: "white",
                padding: "20mm",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                fontFamily: "Arial, sans-serif",
              }}
            >
              <Row>
                <Col span={12}>
                  <img
                    src="/cbpd-logo-transparent.png"
                    alt="CBPD Logo"
                    style={{ height: "100px", marginBottom: "40px" }}
                  />
                  <div style={{ fontSize: "36px", fontWeight: "bold", letterSpacing: "1px", marginBottom: "20px" }}>
                    RECEIPT
                  </div>
                  <div style={{ whiteSpace: "pre-line", fontSize: "14px", lineHeight: "1.5" }}>
                    {currentReceiptData.billTo}
                  </div>
                </Col>

                <Col span={12}>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
                    <div style={{ width: "250px", fontSize: "13px", lineHeight: "1.5" }}>
                      Central Board of<br />
                      Professional Development<br />
                      37th Floor 1 Canada Square<br />
                      London, E14 5DY<br /><br />
                      accounts@cbpd.co.uk<br /><br />
                      +44 (0)203 807 4300
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <table style={{ width: "350px", fontSize: "13px", textAlign: "left" }}>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: "bold", paddingBottom: "10px", width: "120px" }}>Invoice Date</td>
                          <td style={{ paddingBottom: "10px" }}>{currentReceiptData.invoiceDate}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", paddingBottom: "10px" }}>Account Number</td>
                          <td style={{ paddingBottom: "10px" }}>{currentReceiptData.accountNumber}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", paddingBottom: "10px" }}>Invoice Number</td>
                          <td style={{ paddingBottom: "10px" }}>{currentReceiptData.invoiceNumber}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Reference</td>
                          <td style={{ whiteSpace: "pre-line", verticalAlign: "top" }}>{currentReceiptData.reference}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Col>
              </Row>

              <div style={{ marginTop: "60px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderTop: "2px solid #000", borderBottom: "1px solid #000" }}>
                      <th style={{ textAlign: "left", padding: "10px 0" }}>Description</th>
                      <th style={{ textAlign: "center", padding: "10px 0", width: "15%" }}>Quantity</th>
                      <th style={{ textAlign: "center", padding: "10px 0", width: "15%" }}>Unit Price</th>
                      <th style={{ textAlign: "center", padding: "10px 0", width: "15%" }}>VAT</th>
                      <th style={{ textAlign: "right", padding: "10px 0", width: "15%" }}>Amount GBP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReceiptData.items?.map((item: any) => (
                      <tr key={item.key || item._id}>
                        <td style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>{item.description}</td>
                        <td style={{ textAlign: "center", padding: "10px 0", borderBottom: "1px solid #eee" }}>{item.quantity.toFixed(2)}</td>
                        <td style={{ textAlign: "center", padding: "10px 0", borderBottom: "1px solid #eee" }}>{item.unitPrice}</td>
                        <td style={{ textAlign: "center", padding: "10px 0", borderBottom: "1px solid #eee" }}>{item.vat.toString().padStart(2, '0')}%</td>
                        <td style={{ textAlign: "right", padding: "10px 0", borderBottom: "1px solid #eee" }}>{(item.quantity * item.unitPrice).toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ width: "40%", marginLeft: "auto", marginTop: "20px", fontSize: "13px" }}>
                <Row style={{ marginBottom: "10px" }}>
                  <Col span={16} style={{ textAlign: "right", paddingRight: "30px" }}>Subtotal</Col>
                  <Col span={8} style={{ textAlign: "right" }}>{currentReceiptData.subtotal?.toFixed(0)}</Col>
                </Row>
                <Row style={{ marginBottom: "15px" }}>
                  <Col span={16} style={{ textAlign: "right", paddingRight: "30px" }}>TOTAL VAT {currentReceiptData?.items?.[0]?.vat?.toString().padStart(2, '0') || '00'}%</Col>
                  <Col span={8} style={{ textAlign: "right" }}>{currentReceiptData.totalVat?.toFixed(3).substring(0, 3)}</Col>
                </Row>
                <div style={{ borderTop: "2px solid #000", borderBottom: "2px solid #000", padding: "10px 0", marginBottom: "30px" }}>
                  <Row style={{ fontWeight: "bold" }}>
                    <Col span={16} style={{ textAlign: "right", paddingRight: "30px" }}>TOTAL GBP</Col>
                    <Col span={8} style={{ textAlign: "right" }}>{currentReceiptData.totalGBP?.toFixed(0)}</Col>
                  </Row>
                </div>
                <div style={{ borderBottom: "2px solid #000", paddingBottom: "10px" }}>
                  <Row style={{ fontWeight: "bold" }}>
                    <Col span={16} style={{ textAlign: "right", paddingRight: "30px" }}>AMOUNT DUE GBP</Col>
                    <Col span={8} style={{ textAlign: "right" }}>{Number(currentReceiptData.amountDue || 0).toFixed(2)}</Col>
                  </Row>
                </div>
              </div>

              <div style={{ position: "absolute", bottom: "40mm", left: "20mm", right: "20mm" }}>
                <Row justify="space-between" align="bottom">
                  <Col span={12}>
                    <div style={{ whiteSpace: "pre-line", fontSize: "12px", lineHeight: "1.5" }}>
                      {currentReceiptData.bankDetails}
                    </div>
                  </Col>
                  <Col span={12} style={{ textAlign: "right" }}>
                    <img
                      src="/seal.png"
                      alt="CBPD Seal"
                      style={{ width: "180px", opacity: 0.9, filter: "invert(11%) sepia(86%) saturate(6144%) hue-rotate(236deg) brightness(62%) contrast(113%)" }}
                    />
                  </Col>
                </Row>
              </div>

              <div style={{ position: "absolute", bottom: "15mm", left: "20mm", fontSize: "10px", color: "#333" }}>
                Company Registration No:16442180 , Registered office: 37th Floor 1 Canada Square London E14 5DY United Kingdom
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
