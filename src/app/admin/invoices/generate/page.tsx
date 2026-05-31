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
              Invoice Generator
            </Title>
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
                  <Col span={10}>
                    <img
                      src="/cbpd-logo-transparent.png"
                      alt="CBPD Logo"
                      style={{ height: "100px", marginBottom: "30px" }}
                    />
                    <div style={{ fontSize: "32px", fontWeight: "bold", letterSpacing: "1px", marginBottom: "15px", color: "#000" }}>
                      INVOICE
                    </div>
                    <div style={{ whiteSpace: "pre-line", fontSize: "13px", lineHeight: "1.5", color: "#000" }}>
                      {invoiceData.billTo}
                    </div>
                  </Col>

                  {/* Right Column (Invoice Details & Company Address) */}
                  <Col span={14}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "30px", marginTop: "10px" }}>
                      {/* Invoice Details */}
                      <div style={{ fontSize: "13px", lineHeight: "1.4", textAlign: "left", minWidth: "150px" }}>
                        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Invoice Date</div>
                        <div style={{ marginBottom: "12px" }}>{invoiceData.invoiceDate}</div>
                        
                        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Account Number</div>
                        <div style={{ marginBottom: "12px" }}>{invoiceData.accountNumber}</div>
                        
                        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Invoice Number</div>
                        <div style={{ marginBottom: "12px" }}>{invoiceData.invoiceNumber}</div>
                        
                        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Reference</div>
                        <div style={{ whiteSpace: "pre-line" }}>{invoiceData.reference}</div>
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
                <div style={{ width: "45%", marginLeft: "auto", marginTop: "20px", fontSize: "13px", color: "#000" }}>
                  <Row style={{ marginBottom: "10px" }}>
                    <Col span={16} style={{ textAlign: "right", paddingRight: "30px" }}>Subtotal</Col>
                    <Col span={8} style={{ textAlign: "right" }}>{subtotal.toFixed(0)}</Col>
                  </Row>
                  <Row style={{ marginBottom: "15px" }}>
                    <Col span={16} style={{ textAlign: "right", paddingRight: "30px" }}>TOTAL VAT {invoiceData.items.length > 0 ? invoiceData.items[0].vat.toString().padStart(2, '0') : '00'}%</Col>
                    <Col span={8} style={{ textAlign: "right" }}>{totalVat.toFixed(3).substring(0, 3)}</Col>
                  </Row>
                  <div style={{ borderTop: "1px solid #000", paddingTop: "10px", paddingBottom: "30px" }}>
                    <Row style={{ fontWeight: "bold" }}>
                      <Col span={16} style={{ textAlign: "right", paddingRight: "30px" }}>TOTAL GBP</Col>
                      <Col span={8} style={{ textAlign: "right" }}>{totalGBP.toFixed(0)}</Col>
                    </Row>
                  </div>
                  <div style={{ borderTop: "1px solid #000", paddingTop: "10px" }}>
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
                        style={{ width: "180px", opacity: 0.9, filter: "invert(17%) sepia(92%) saturate(2369%) hue-rotate(224deg) brightness(90%) contrast(105%)" }}
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
      </div>
    </AdminLayout>
  );
}
