"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Typography,
  message,
  Button,
  Tag,
} from "antd";
import { FileDoneOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const { Title } = Typography;

export default function InvoiceHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingReceiptId, setGeneratingReceiptId] = useState<string | null>(null);
  
  // Ref for the hidden receipt template
  const receiptRef = useRef<HTMLDivElement>(null);
  const [currentReceiptData, setCurrentReceiptData] = useState<any>(null);

  const fetchHistory = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const generateReceipt = async (record: any) => {
    setGeneratingReceiptId(record._id);
    setCurrentReceiptData(record);
    
    // We need a short timeout to let React render the hidden receipt template with the new data
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

        // Update status in database
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
          fetchHistory(); // Refresh table
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
    }, 500); // 500ms allows the DOM to properly update the off-screen element
  };

  const columns = [
    {
      title: "Invoice Number",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
    },
    {
      title: "Date",
      dataIndex: "invoiceDate",
      key: "invoiceDate",
    },
    {
      title: "Bill To",
      dataIndex: "billTo",
      key: "billTo",
      render: (text: string) => <div style={{ whiteSpace: "pre-wrap", maxWidth: "200px" }}>{text}</div>,
    },
    {
      title: "Total GBP",
      dataIndex: "totalGBP",
      key: "totalGBP",
      render: (val: number) => `£${val?.toFixed(2)}`,
    },
    {
      title: "Amount Due",
      dataIndex: "amountDue",
      key: "amountDue",
      render: (val: number) => `£${val?.toFixed(2) || "0.00"}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color = status === "Receipt Generated" ? "green" : "blue";
        return <Tag color={color}>{status || "Invoice Generated"}</Tag>;
      },
    },
    {
      title: "Generated At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val: string) => dayjs(val).format("DD MMM YYYY HH:mm"),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          type="primary"
          icon={<FileDoneOutlined />}
          loading={generatingReceiptId === record._id}
          onClick={() => generateReceipt(record)}
        >
          Generate Receipt
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0, color: "#1a237e" }}>
            Invoice History
          </Title>
        </Col>
      </Row>

      <Card style={{ borderRadius: 8 }}>
        <Table
          columns={columns}
          dataSource={history}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
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
            {/* Top Section */}
            <Row>
              {/* Left Column (Logo + RECEIPT + Bill To) */}
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

              {/* Right Column (Company Address & Invoice Details) */}
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

            {/* Table Section */}
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

            {/* Totals Section */}
            <div style={{ width: "40%", marginLeft: "auto", marginTop: "20px", fontSize: "13px" }}>
              <Row style={{ marginBottom: "10px" }}>
                <Col span={16} style={{ textAlign: "right", paddingRight: "30px" }}>Subtotal</Col>
                <Col span={8} style={{ textAlign: "right" }}>{currentReceiptData.subtotal?.toFixed(0)}</Col>
              </Row>
              <Row style={{ marginBottom: "15px" }}>
                <Col span={16} style={{ textAlign: "right", paddingRight: "30px" }}>TOTAL VAT 00%</Col>
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

            {/* Footer Section (Bank details & Seal) */}
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
                    style={{ width: "180px", opacity: 0.9 }}
                  />
                </Col>
              </Row>
            </div>

            {/* Company Reg Info */}
            <div style={{ position: "absolute", bottom: "15mm", left: "20mm", fontSize: "10px", color: "#333" }}>
              Company Registration No:16442180 , Registered office: 37th Floor 1 Canada Square London E14 5DY United Kingdom
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
