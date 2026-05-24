"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  DatePicker,
  Typography,
  Divider,
  message,
  Drawer,
  Table,
  Tag,
  Space,
  Avatar,
  Dropdown,
  Menu,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined,
  HistoryOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const { Title } = Typography;
const { TextArea } = Input;

interface InvoiceItem {
  key: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vat: number;
}

export default function InvoiceGenerator() {
  const [form] = Form.useForm();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Drawer states
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Receipt generation states
  const [generatingReceiptId, setGeneratingReceiptId] = useState<string | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [currentReceiptData, setCurrentReceiptData] = useState<any>(null);

  // Default initial values
  const [invoiceData, setInvoiceData] = useState({
    billTo: "ABC Training Academy Pvt Ltd\n312 V/14, Kadakkadan Building\nUp Hill, Malappuram\nKerala 676505",
    invoiceDate: dayjs().format("DD MMMM YYYY"),
    accountNumber: "21235",
    invoiceNumber: "INV-128",
    reference: "For CBPD Membership\n10/03",
    items: [
      {
        key: "1",
        description: "CBPD Provider Membership(UK) ( No Annual Renewal)",
        quantity: 1,
        unitPrice: 250,
        vat: 0,
      },
    ] as InvoiceItem[],
    bankDetails: "for payment please see below organisation bank details\n(Indian channel partner)\n\n7X GLOBAL\nFEDERAL BANK\nAccount Number:\n14640200005780\nIFSC: FDRL0001462\nBranch: Infopark - Kochi",
    amountDue: 0.0,
  });

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("adminToken");
      // Optionally we could filter out receipt statuses if needed, but showing all is usually fine
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

  const handleOpenHistory = () => {
    setIsDrawerVisible(true);
    fetchHistory();
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.invoiceDate) {
      allValues.invoiceDate = changedValues.invoiceDate.format("DD MMMM YYYY");
    } else {
      allValues.invoiceDate = invoiceData.invoiceDate;
    }
    setInvoiceData({ ...invoiceData, ...allValues });
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      key: Date.now().toString(),
      description: "New Item",
      quantity: 1,
      unitPrice: 0,
      vat: 0,
    };
    setInvoiceData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleRemoveItem = (key: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.key !== key),
    }));
  };

  const handleItemChange = (key: string, field: string, value: any) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      ),
    }));
  };

  const subtotal = invoiceData.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const totalVat = invoiceData.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice * (item.vat / 100),
    0
  );
  const totalGBP = subtotal + totalVat;

  const downloadPDF = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    setIsSaving(true);
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
      pdf.save(`Invoice_${invoiceData.invoiceNumber}.pdf`);

      const token = localStorage.getItem("adminToken");
      const saveRes = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...invoiceData,
          subtotal,
          totalVat,
          totalGBP,
        }),
      });
      if (saveRes.ok) {
        message.success("Invoice generated and saved to history!");
        // Refresh history if drawer is open
        if (isDrawerVisible) fetchHistory();
      } else {
        message.warning("PDF downloaded, but failed to save history.");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      message.error("Failed to generate PDF");
    } finally {
      setIsSaving(false);
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
    <div style={{ padding: "24px" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0, color: "#1a237e" }}>
            Invoice Generator
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<HistoryOutlined />}
            onClick={handleOpenHistory}
            style={{ borderRadius: 6, backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          >
            View History
          </Button>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Left Col: Form */}
        <Col xs={24} lg={10}>
          <Card
            title="Invoice Details"
            style={{ borderRadius: 8 }}
            extra={
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={downloadPDF}
                loading={isSaving}
                style={{ borderRadius: 6 }}
              >
                Download & Save
              </Button>
            }
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                billTo: invoiceData.billTo,
                invoiceDate: dayjs(invoiceData.invoiceDate, "DD MMMM YYYY"),
                accountNumber: invoiceData.accountNumber,
                invoiceNumber: invoiceData.invoiceNumber,
                reference: invoiceData.reference,
                bankDetails: invoiceData.bankDetails,
                amountDue: invoiceData.amountDue,
              }}
              onValuesChange={handleValuesChange}
            >
              <Form.Item label="Bill To" name="billTo">
                <TextArea rows={4} style={{ borderRadius: 6 }} />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Invoice Date" name="invoiceDate">
                    <DatePicker
                      style={{ width: "100%", borderRadius: 6 }}
                      format="DD MMMM YYYY"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Account Number" name="accountNumber">
                    <Input style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Invoice Number" name="invoiceNumber">
                    <Input style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Reference" name="reference">
                    <TextArea rows={2} style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">Line Items</Divider>

              {invoiceData.items.map((item, index) => (
                <Card
                  size="small"
                  key={item.key}
                  style={{ marginBottom: 16, backgroundColor: "#fafafa" }}
                  extra={
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveItem(item.key)}
                    />
                  }
                >
                  <Form.Item label="Description" style={{ marginBottom: 8 }}>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(item.key, "description", e.target.value)
                      }
                    />
                  </Form.Item>
                  <Row gutter={8}>
                    <Col span={8}>
                      <Form.Item label="Qty" style={{ marginBottom: 0 }}>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              item.key,
                              "quantity",
                              Number(e.target.value)
                            )
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Price" style={{ marginBottom: 0 }}>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(
                              item.key,
                              "unitPrice",
                              Number(e.target.value)
                            )
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="VAT %" style={{ marginBottom: 0 }}>
                        <Input
                          type="number"
                          value={item.vat}
                          onChange={(e) =>
                            handleItemChange(
                              item.key,
                              "vat",
                              Number(e.target.value)
                            )
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}

              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={handleAddItem}
                style={{ marginBottom: 24, borderRadius: 6 }}
              >
                Add Item
              </Button>

              <Form.Item label="Bank Details" name="bankDetails">
                <TextArea rows={6} style={{ borderRadius: 6 }} />
              </Form.Item>

              <Form.Item label="Amount Due GBP" name="amountDue">
                <Input type="number" style={{ borderRadius: 6 }} />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Right Col: PDF Preview */}
        <Col xs={24} lg={14}>
          <Card
            title="Live Preview"
            style={{ borderRadius: 8 }}
            bodyStyle={{ padding: 0, backgroundColor: "#f0f2f5" }}
          >
            <div style={{ overflowX: "auto", padding: "24px" }}>
              {/* A4 Size Container */}
              <div
                ref={invoiceRef}
                style={{
                  width: "210mm",
                  minHeight: "297mm",
                  backgroundColor: "white",
                  padding: "20mm",
                  margin: "0 auto",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  position: "relative",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {/* Top Section */}
                <Row>
                  {/* Left Column (Logo + INVOICE + Bill To) */}
                  <Col span={12}>
                    <img
                      src="/cbpd-logo-transparent.png"
                      alt="CBPD Logo"
                      style={{ height: "100px", marginBottom: "40px" }}
                    />
                    <div style={{ fontSize: "36px", fontWeight: "bold", letterSpacing: "1px", marginBottom: "20px" }}>
                      INVOICE
                    </div>
                    <div style={{ whiteSpace: "pre-line", fontSize: "14px", lineHeight: "1.5" }}>
                      {invoiceData.billTo}
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
                            <td style={{ paddingBottom: "10px" }}>{invoiceData.invoiceDate}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: "bold", paddingBottom: "10px" }}>Account Number</td>
                            <td style={{ paddingBottom: "10px" }}>{invoiceData.accountNumber}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: "bold", paddingBottom: "10px" }}>Invoice Number</td>
                            <td style={{ paddingBottom: "10px" }}>{invoiceData.invoiceNumber}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Reference</td>
                            <td style={{ whiteSpace: "pre-line", verticalAlign: "top" }}>{invoiceData.reference}</td>
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
                      {invoiceData.items.map((item) => (
                        <tr key={item.key}>
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
                    <Col span={8} style={{ textAlign: "right" }}>{subtotal.toFixed(0)}</Col>
                  </Row>
                  <Row style={{ marginBottom: "15px" }}>
                    <Col span={16} style={{ textAlign: "right", paddingRight: "30px" }}>TOTAL VAT 00%</Col>
                    <Col span={8} style={{ textAlign: "right" }}>{totalVat.toFixed(3).substring(0, 3)}</Col>
                  </Row>
                  <div style={{ borderTop: "2px solid #000", borderBottom: "2px solid #000", padding: "10px 0", marginBottom: "30px" }}>
                    <Row style={{ fontWeight: "bold" }}>
                      <Col span={16} style={{ textAlign: "right", paddingRight: "30px" }}>TOTAL GBP</Col>
                      <Col span={8} style={{ textAlign: "right" }}>{totalGBP.toFixed(0)}</Col>
                    </Row>
                  </div>
                  <div style={{ borderBottom: "2px solid #000", paddingBottom: "10px" }}>
                    <Row style={{ fontWeight: "bold" }}>
                      <Col span={16} style={{ textAlign: "right", paddingRight: "30px" }}>AMOUNT DUE GBP</Col>
                      <Col span={8} style={{ textAlign: "right" }}>{Number(invoiceData.amountDue).toFixed(2)}</Col>
                    </Row>
                  </div>
                </div>

                {/* Footer Section (Bank details & Seal) */}
                <div style={{ position: "absolute", bottom: "40mm", left: "20mm", right: "20mm" }}>
                  <Row justify="space-between" align="bottom">
                    <Col span={12}>
                      <div style={{ whiteSpace: "pre-line", fontSize: "12px", lineHeight: "1.5" }}>
                        {invoiceData.bankDetails}
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
          </Card>
        </Col>
      </Row>

      {/* History Drawer */}
      <Drawer
        title="Invoice History"
        placement="right"
        width={800}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        <Table
          columns={columns}
          dataSource={history}
          rowKey="_id"
          loading={loadingHistory}
          pagination={{ pageSize: 10 }}
        />
      </Drawer>

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

            <div style={{ position: "absolute", bottom: "15mm", left: "20mm", fontSize: "10px", color: "#333" }}>
              Company Registration No:16442180 , Registered office: 37th Floor 1 Canada Square London E14 5DY United Kingdom
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
