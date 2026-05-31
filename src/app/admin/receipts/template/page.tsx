"use client";

import React, { useState, useRef } from "react";
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
  Select,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import AdminLayout from "@/components/AdminLayout";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface InvoiceItem {
  key: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vat: number;
}

export default function ReceiptTemplate() {
  const [form] = Form.useForm();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [receiptData, setReceiptData] = useState({
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
    bankDetails: "Payment received successfully against the invoice mentioned above.\nThank you for your payment and continued association with CBPD UK.",
    amountDue: 0.0,
    paymentMethod: "Bank Transfer",
    otherPaymentMethod: "",
    transactionRef: "TRX-993821",
    datePaymentReceived: dayjs().format("DD MMMM YYYY"),
  });

  const handleValuesChange = (changedValues: any, allValues: any) => {
    const updated = { ...allValues };
    if (changedValues.invoiceDate) {
      updated.invoiceDate = changedValues.invoiceDate.format("DD MMMM YYYY");
    } else {
      updated.invoiceDate = receiptData.invoiceDate;
    }
    if (changedValues.datePaymentReceived) {
      updated.datePaymentReceived = changedValues.datePaymentReceived.format("DD MMMM YYYY");
    } else {
      updated.datePaymentReceived = receiptData.datePaymentReceived;
    }
    setReceiptData({ ...receiptData, ...updated });
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      key: Date.now().toString(),
      description: "New Item",
      quantity: 1,
      unitPrice: 0,
      vat: 0,
    };
    setReceiptData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleRemoveItem = (key: string) => {
    setReceiptData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.key !== key),
    }));
  };

  const handleItemChange = (key: string, field: string, value: any) => {
    setReceiptData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      ),
    }));
  };

  const subtotal = receiptData.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const totalVat = receiptData.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice * (item.vat / 100),
    0
  );
  const totalGBP = subtotal + totalVat;

  const downloadPDF = async () => {
    const element = receiptRef.current;
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
      pdf.save(`Receipt_${receiptData.invoiceNumber}.pdf`);

      const token = localStorage.getItem("adminToken");
      const saveRes = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...receiptData,
          subtotal,
          totalVat,
          totalGBP,
          status: "Receipt Generated",
        }),
      });
      if (saveRes.ok) {
        message.success("Receipt generated and saved to history!");
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

  return (
    <AdminLayout>
      <div style={{ padding: "24px" }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ margin: 0, color: "#1a237e" }}>
              Receipt Template
            </Title>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* Left Col: Form */}
          <Col xs={24} lg={10}>
            <Card
              title="Receipt Details"
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
                  billTo: receiptData.billTo,
                  invoiceDate: dayjs(receiptData.invoiceDate, "DD MMMM YYYY"),
                  accountNumber: receiptData.accountNumber,
                  invoiceNumber: receiptData.invoiceNumber,
                  reference: receiptData.reference,
                  paymentMethod: receiptData.paymentMethod,
                  otherPaymentMethod: receiptData.otherPaymentMethod,
                  transactionRef: receiptData.transactionRef,
                  datePaymentReceived: dayjs(receiptData.datePaymentReceived, "DD MMMM YYYY"),
                  bankDetails: receiptData.bankDetails,
                  amountDue: receiptData.amountDue,
                }}
                onValuesChange={handleValuesChange}
              >
                <Form.Item label="Bill To" name="billTo">
                  <TextArea rows={4} style={{ borderRadius: 6 }} />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Receipt Date" name="invoiceDate">
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
                    <Form.Item label="Receipt Number" name="invoiceNumber">
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

                {receiptData.items.map((item) => (
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

                <Divider orientation="left">Payment Details</Divider>

                <Form.Item label="Payment Method" name="paymentMethod">
                  <Select style={{ borderRadius: 6 }}>
                    <Option value="Bank Transfer">Bank Transfer</Option>
                    <Option value="Wise Transfer">Wise Transfer</Option>
                    <Option value="Card Payment">Card Payment</Option>
                    <Option value="Cash">Cash</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
                
                {receiptData.paymentMethod === "Other" && (
                  <Form.Item label="Specify Other Method" name="otherPaymentMethod">
                    <Input style={{ borderRadius: 6 }} />
                  </Form.Item>
                )}

                <Form.Item label="Transaction / Payment Ref No." name="transactionRef">
                  <Input style={{ borderRadius: 6 }} />
                </Form.Item>

                <Form.Item label="Date Payment Received" name="datePaymentReceived">
                  <DatePicker
                    style={{ width: "100%", borderRadius: 6 }}
                    format="DD MMMM YYYY"
                  />
                </Form.Item>

                <Divider orientation="left">Footer Info</Divider>
                <Form.Item label="Notes" name="bankDetails">
                  <TextArea rows={4} style={{ borderRadius: 6 }} />
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
                  ref={receiptRef}
                  style={{
                    width: "210mm",
                    minHeight: "297mm",
                    backgroundColor: "white",
                    padding: "20mm",
                    margin: "0 auto",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    position: "relative",
                    fontFamily: "Arial, sans-serif",
                    color: "#000"
                  }}
                >
                  {/* Top Section */}
                  <Row>
                    {/* Left Column (Logo + RECEIPT + Bill To) */}
                    <Col span={10}>
                      <img
                        src="/cbpd-logo-transparent.png"
                        alt="CBPD Logo"
                        style={{ height: "100px", marginBottom: "30px" }}
                      />
                      <div style={{ fontSize: "32px", fontWeight: "bold", letterSpacing: "1px", marginBottom: "15px", color: "#000" }}>
                        RECEIPT
                      </div>
                      <div style={{ whiteSpace: "pre-line", fontSize: "13px", lineHeight: "1.5", color: "#000" }}>
                        {receiptData.billTo}
                      </div>
                    </Col>

                    {/* Right Column (Invoice Details & Company Address) */}
                    <Col span={14}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "30px", marginTop: "10px" }}>
                        {/* Receipt Details */}
                        <div style={{ fontSize: "13px", lineHeight: "1.4", textAlign: "left", minWidth: "150px" }}>
                          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Receipt Date</div>
                          <div style={{ marginBottom: "12px" }}>{receiptData.invoiceDate}</div>
                          
                          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Account Number</div>
                          <div style={{ marginBottom: "12px" }}>{receiptData.accountNumber}</div>
                          
                          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Receipt Number</div>
                          <div style={{ marginBottom: "12px" }}>{receiptData.invoiceNumber}</div>
                          
                          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Reference</div>
                          <div style={{ whiteSpace: "pre-line" }}>{receiptData.reference}</div>
                        </div>
                        
                        {/* Company Address */}
                        <div style={{ fontSize: "13px", lineHeight: "1.4", textAlign: "left", minWidth: "180px" }}>
                          Central Board of<br />
                          Professional Development<br />
                          37th Floor 1 Canada Square<br />
                          London, E14 5DY<br /><br />
                          accounts@cbpd.co.uk<br /><br />
                          +44 (0)203 807 4300
                        </div>
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
                        {receiptData.items.map((item) => (
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

                  {/* Totals & Payment Details Section */}
                  <Row style={{ marginTop: "30px" }}>
                    {/* Left Column: Payment Details */}
                    <Col span={12}>
                      <div style={{ fontSize: "13px", paddingRight: "20px" }}>
                        <div style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "14px", borderBottom: "1px solid #eee", paddingBottom: "5px", width: "90%" }}>Payment Details</div>
                        <table style={{ width: "100%", fontSize: "13px", textAlign: "left", borderCollapse: "collapse" }}>
                          <tbody>
                            <tr>
                              <td style={{ paddingBottom: "8px", width: "150px", color: "#555" }}>Payment Method:</td>
                              <td style={{ paddingBottom: "8px", fontWeight: "500" }}>{receiptData.paymentMethod === "Other" ? receiptData.otherPaymentMethod : receiptData.paymentMethod}</td>
                            </tr>
                            <tr>
                              <td style={{ paddingBottom: "8px", color: "#555" }}>Transaction Ref No:</td>
                              <td style={{ paddingBottom: "8px", fontWeight: "500" }}>{receiptData.transactionRef}</td>
                            </tr>
                            <tr>
                              <td style={{ paddingBottom: "8px", color: "#555" }}>Date Received:</td>
                              <td style={{ paddingBottom: "8px", fontWeight: "500" }}>{receiptData.datePaymentReceived}</td>
                            </tr>
                            <tr>
                              <td style={{ paddingBottom: "8px", color: "#555", paddingTop: "5px" }}>Status:</td>
                              <td style={{ paddingBottom: "8px", color: "#28a745", fontWeight: "bold", paddingTop: "5px", fontSize: "14px" }}>PAID IN FULL ✅</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </Col>

                    {/* Right Column: Totals */}
                    <Col span={12}>
                      <div style={{ width: "80%", marginLeft: "auto", fontSize: "13px" }}>
                        <Row style={{ marginBottom: "10px" }}>
                          <Col span={16} style={{ textAlign: "right", paddingRight: "30px" }}>Subtotal</Col>
                          <Col span={8} style={{ textAlign: "right" }}>{subtotal.toFixed(0)}</Col>
                        </Row>
                        <Row style={{ marginBottom: "15px" }}>
                          <Col span={16} style={{ textAlign: "right", paddingRight: "30px" }}>TOTAL VAT {receiptData.items.length > 0 ? receiptData.items[0].vat.toString().padStart(2, '0') : '00'}%</Col>
                          <Col span={8} style={{ textAlign: "right" }}>{totalVat.toFixed(3).substring(0, 3)}</Col>
                        </Row>
                        <div style={{ borderTop: "2px solid #000", borderBottom: "2px solid #000", padding: "10px 0", marginBottom: "30px" }}>
                          <Row style={{ fontWeight: "bold" }}>
                            <Col span={16} style={{ textAlign: "right", paddingRight: "30px" }}>Total Amount Received GBP</Col>
                            <Col span={8} style={{ textAlign: "right" }}>{totalGBP.toFixed(0)}</Col>
                          </Row>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  {/* Footer Section (Notes & Seal) */}
                  <div style={{ position: "absolute", bottom: "40mm", left: "20mm", right: "20mm" }}>
                    <Row justify="space-between" align="bottom">
                      <Col span={12}>
                        <div style={{ whiteSpace: "pre-line", fontSize: "12px", lineHeight: "1.5", color: "#555" }}>
                          {receiptData.bankDetails}
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
                  <div style={{ position: "absolute", bottom: "15mm", left: "20mm", fontSize: "10px", color: "#666" }}>
                    Company Registration No: 16442180, Registered office: 37th Floor 1 Canada Square London E14 5DY United Kingdom
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
}
