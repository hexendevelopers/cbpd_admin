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
    paymentMethod: "Bank Transfer",
    otherPaymentMethod: "",
    transactionRef: "",
    datePaymentReceived: dayjs().format("DD MMMM YYYY"),
    email: "info@cbpd.co.uk",
    website: "www.cbpd.co.uk",
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

  const totalGBP = receiptData.items.reduce(
    (sum, item) => sum + item.unitPrice,
    0
  );

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
          subtotal: totalGBP,
          totalVat: 0,
          totalGBP: totalGBP,
          amountDue: 0,
          bankDetails: "",
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

  const renderCheckbox = (label: string, isChecked: boolean) => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
      <div style={{ width: "12px", height: "12px", border: "1px solid #000", display: "flex", justifyContent: "center", alignItems: "center", marginRight: "6px", fontSize: "10px" }}>
        {isChecked ? "✔" : ""}
      </div>
      <span>{label}</span>
    </div>
  );

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
                  email: receiptData.email,
                  website: receiptData.website,
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
                    <Form.Item label="Amount (GBP)" style={{ marginBottom: 0 }}>
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
                <Form.Item label="Email" name="email">
                  <Input style={{ borderRadius: 6 }} />
                </Form.Item>
                <Form.Item label="Website" name="website">
                  <Input style={{ borderRadius: 6 }} />
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Right Col: PDF Preview */}
          <Col xs={24} lg={14}>
            <Card
              title="Live Preview"
              style={{ borderRadius: 8 }}
              bodyStyle={{ padding: 0, backgroundColor: "#e0e0e0", display: "flex", justifyContent: "center", overflowX: "auto" }}
            >
              <div style={{ padding: "24px 0" }}>
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
                        {receiptData.billTo}
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
                              <td style={{ fontWeight: "bold", paddingBottom: "10px", width: "120px" }}>Receipt Date</td>
                              <td style={{ paddingBottom: "10px" }}>{receiptData.invoiceDate}</td>
                            </tr>
                            <tr>
                              <td style={{ fontWeight: "bold", paddingBottom: "10px" }}>Account Number</td>
                              <td style={{ paddingBottom: "10px" }}>{receiptData.accountNumber}</td>
                            </tr>
                            <tr>
                              <td style={{ fontWeight: "bold", paddingBottom: "10px" }}>Receipt Number</td>
                              <td style={{ paddingBottom: "10px" }}>{receiptData.invoiceNumber}</td>
                            </tr>
                            <tr>
                              <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Reference</td>
                              <td style={{ whiteSpace: "pre-line", verticalAlign: "top" }}>{receiptData.reference}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </Col>
                  </Row>

                  {/* PAYMENT DETAILS SECTION */}
                  <div style={{ marginTop: "40px" }}>
                    <div style={{ borderTop: "1px solid #000", marginBottom: "3px" }}></div>
                    <div style={{ borderTop: "1px solid #000", marginBottom: "30px" }}></div>
                    
                    <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>
                      PAYMENT DETAILS
                    </div>

                    <table style={{ width: "55%", fontSize: "13px", marginBottom: "30px", marginLeft: "40px", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", paddingBottom: "10px", fontWeight: "bold" }}>Description</th>
                          <th style={{ textAlign: "left", paddingBottom: "10px", fontWeight: "bold", paddingLeft: "20px" }}>Amount (GBP)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receiptData.items.map((item) => (
                          <tr key={item.key}>
                            <td style={{ borderBottom: "1px solid #000", padding: "8px 0" }}>{item.description}</td>
                            <td style={{ borderBottom: "1px solid #000", padding: "8px 0", paddingLeft: "20px" }}>£ {item.unitPrice.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>

                    <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "20px" }}>
                      Total Amount Received GBP:
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "flex-end", marginBottom: "30px" }}>
                      <span style={{ fontSize: "24px", fontWeight: "bold", marginRight: "10px" }}>£</span>
                      <div style={{ borderBottom: "2px solid #000", width: "250px", fontSize: "18px", fontWeight: "bold", paddingBottom: "5px" }}>
                        {totalGBP.toFixed(2)}
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>

                    <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "15px" }}>
                      Payment Method
                    </div>

                    <div style={{ fontSize: "13px", marginBottom: "30px" }}>
                      {renderCheckbox("Bank Transfer", receiptData.paymentMethod === "Bank Transfer")}
                      {renderCheckbox("Wise Transfer", receiptData.paymentMethod === "Wise Transfer")}
                      {renderCheckbox("Card Payment", receiptData.paymentMethod === "Card Payment")}
                      {renderCheckbox("Cash", receiptData.paymentMethod === "Cash")}
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
                        <div style={{ width: "12px", height: "12px", border: "1px solid #000", display: "flex", justifyContent: "center", alignItems: "center", marginRight: "6px", fontSize: "10px" }}>
                          {receiptData.paymentMethod === "Other" ? "✔" : ""}
                        </div>
                        <span>Other: </span>
                        <div style={{ borderBottom: "1px solid #000", width: "150px", marginLeft: "5px", display: "inline-block", height: "15px", paddingLeft: "5px" }}>
                          {receiptData.paymentMethod === "Other" ? receiptData.otherPaymentMethod : ""}
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>

                    <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "15px" }}>
                      Transaction / Payment Reference No.
                    </div>
                    <div style={{ borderBottom: "1px solid #000", width: "100%", paddingBottom: "5px", marginBottom: "20px", minHeight: "20px", fontSize: "13px" }}>
                      {receiptData.transactionRef}
                    </div>

                    <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>

                    <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "15px" }}>
                      Date Payment Received
                    </div>
                    <div style={{ borderBottom: "1px solid #000", width: "100%", paddingBottom: "5px", marginBottom: "30px", minHeight: "20px", fontSize: "13px" }}>
                      {receiptData.datePaymentReceived}
                    </div>

                    <div style={{ borderTop: "1px solid #000", margin: "2px 0" }}></div>
                    <div style={{ borderTop: "1px solid #000", margin: "0 0 30px 0" }}></div>

                    <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>
                      PAYMENT STATUS
                    </div>
                    
                    <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "30px", display: "flex", alignItems: "center" }}>
                      PAID IN FULL <span style={{ color: "#7cb342", fontSize: "20px", marginLeft: "8px" }}>✅</span>
                    </div>

                    <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>

                    <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "15px" }}>
                      Notes
                    </div>
                    <div style={{ fontSize: "13px", marginBottom: "30px", lineHeight: "1.6" }}>
                      Payment received successfully against the invoice mentioned above.<br/><br/>
                      Thank you for your payment and continued association with CBPD UK.
                    </div>

                    <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>

                    <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "15px" }}>
                      Authorized By
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px" }}>
                      <div>
                        <div style={{ fontSize: "13px", marginBottom: "20px", lineHeight: "1.6" }}>
                          <strong>Accounts Department</strong><br/>
                          Central Board of Professional Development Ltd.
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "15px", display: "flex", alignItems: "flex-end" }}>
                          Authorized Signature: 
                          <div style={{ borderBottom: "1px solid #000", width: "200px", marginLeft: "10px", display: "inline-block", height: "15px" }}></div>
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                          Official Seal / Stamp
                        </div>
                      </div>
                      <div>
                        <img src="/seal.png" alt="CBPD Seal" style={{ width: "120px", opacity: 0.9 }} />
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>

                    <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "15px" }}>
                      Footer
                    </div>
                    <div style={{ fontSize: "13px", lineHeight: "1.6", marginBottom: "20px" }}>
                      <strong>Central Board of Professional Development Ltd.</strong><br/>
                      United Kingdom<br/><br/>
                      <div style={{ display: "flex", alignItems: "flex-end", marginBottom: "5px" }}>
                        Email: <div style={{ borderBottom: "1px solid #000", width: "200px", marginLeft: "5px", display: "inline-block", height: "15px", paddingLeft: "5px" }}>{receiptData.email}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-end" }}>
                        Website: <div style={{ borderBottom: "1px solid #000", width: "200px", marginLeft: "5px", display: "inline-block", height: "15px", paddingLeft: "5px" }}>{receiptData.website}</div>
                      </div>
                    </div>

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
