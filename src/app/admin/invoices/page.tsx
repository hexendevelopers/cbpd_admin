"use client";

import React, { useState, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Space,
  DatePicker,
  Table,
  Typography,
  Divider,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const { Title, Text } = Typography;
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
  });

  const handleValuesChange = (changedValues: any, allValues: any) => {
    // Format date if changed
    if (changedValues.invoiceDate) {
      allValues.invoiceDate = changedValues.invoiceDate.format("DD MMMM YYYY");
    } else {
      allValues.invoiceDate = invoiceData.invoiceDate; // Preserve if not changed in this event
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

  const downloadPDF = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Better quality
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${invoiceData.invoiceNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  // Calculations
  const subtotal = invoiceData.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const totalVat = invoiceData.items.reduce(
    (sum, item) =>
      sum + item.quantity * item.unitPrice * (item.vat / 100),
    0
  );
  const totalGBP = subtotal + totalVat;
  const amountDue = 0.0; // Assuming paid/due logic can be static for now or added later

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
            icon={<DownloadOutlined />}
            size="large"
            onClick={downloadPDF}
            style={{ borderRadius: 6 }}
          >
            Download PDF
          </Button>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Left Col: Form */}
        <Col xs={24} lg={10}>
          <Card title="Invoice Details" style={{ borderRadius: 8 }}>
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
                  padding: "20mm 15mm",
                  margin: "0 auto",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  position: "relative",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {/* Header */}
                <Row justify="space-between" align="top" style={{ marginBottom: "10mm" }}>
                  <Col span={10}>
                    <img
                      src="/cbpd-logo-transparent.png"
                      alt="CBPD Logo"
                      style={{ maxWidth: "180px", marginBottom: "20px" }}
                    />
                    <div style={{ fontSize: "28px", fontWeight: "bold", letterSpacing: "2px", marginBottom: "15px" }}>
                      INVOICE
                    </div>
                    <div style={{ whiteSpace: "pre-line", fontSize: "12px", lineHeight: "1.5" }}>
                      {invoiceData.billTo}
                    </div>
                  </Col>
                  <Col span={10} style={{ fontSize: "12px", lineHeight: "1.6" }}>
                    <Row>
                      <Col span={12} style={{ fontWeight: "bold" }}>Invoice Date</Col>
                      <Col span={12}>
                        Central Board of<br/>
                        Professional Development<br/>
                        37th Floor 1 Canada Square<br/>
                        London, E14 5DY<br/>
                        <br/>
                        accounts@cbpd.co.uk<br/>
                        <br/>
                        +44 (0)203 807 4300
                      </Col>
                    </Row>
                    <div style={{ marginTop: "-140px" }}>
                        <Row style={{ marginBottom: "8px" }}>
                          <Col span={12} style={{ fontWeight: "bold" }}>Invoice Date</Col>
                          <Col span={12}>{invoiceData.invoiceDate}</Col>
                        </Row>
                        <Row style={{ marginBottom: "8px" }}>
                          <Col span={12} style={{ fontWeight: "bold" }}>Account Number</Col>
                          <Col span={12}>{invoiceData.accountNumber}</Col>
                        </Row>
                        <Row style={{ marginBottom: "8px" }}>
                          <Col span={12} style={{ fontWeight: "bold" }}>Invoice Number</Col>
                          <Col span={12}>{invoiceData.invoiceNumber}</Col>
                        </Row>
                        <Row>
                          <Col span={12} style={{ fontWeight: "bold" }}>Reference</Col>
                          <Col span={12} style={{ whiteSpace: "pre-line" }}>{invoiceData.reference}</Col>
                        </Row>
                    </div>
                  </Col>
                </Row>

                {/* Table */}
                <div style={{ marginTop: "40px" }}>
                  {/* Table Header */}
                  <Row style={{ borderBottom: "1px solid #000", paddingBottom: "8px", fontWeight: "bold", fontSize: "12px" }}>
                    <Col span={12}>Description</Col>
                    <Col span={3} style={{ textAlign: "center" }}>Quantity</Col>
                    <Col span={3} style={{ textAlign: "right" }}>Unit Price</Col>
                    <Col span={3} style={{ textAlign: "right" }}>VAT</Col>
                    <Col span={3} style={{ textAlign: "right" }}>Amount GBP</Col>
                  </Row>
                  
                  {/* Table Body */}
                  {invoiceData.items.map((item) => (
                    <Row key={item.key} style={{ padding: "12px 0", borderBottom: "1px solid #eee", fontSize: "12px" }}>
                      <Col span={12}>{item.description}</Col>
                      <Col span={3} style={{ textAlign: "center" }}>{item.quantity.toFixed(2)}</Col>
                      <Col span={3} style={{ textAlign: "right" }}>{item.unitPrice}</Col>
                      <Col span={3} style={{ textAlign: "right" }}>{item.vat.toString().padStart(2, '0')}%</Col>
                      <Col span={3} style={{ textAlign: "right" }}>{(item.quantity * item.unitPrice).toFixed(0)}</Col>
                    </Row>
                  ))}
                </div>

                {/* Totals */}
                <div style={{ width: "40%", marginLeft: "auto", marginTop: "20px", fontSize: "12px" }}>
                  <Row style={{ marginBottom: "8px" }}>
                    <Col span={12} style={{ textAlign: "right", paddingRight: "20px" }}>Subtotal</Col>
                    <Col span={12} style={{ textAlign: "right" }}>{subtotal.toFixed(0)}</Col>
                  </Row>
                  <Row style={{ marginBottom: "8px" }}>
                    <Col span={12} style={{ textAlign: "right", paddingRight: "20px" }}>TOTAL VAT 00%</Col>
                    <Col span={12} style={{ textAlign: "right" }}>{totalVat.toFixed(3).substring(0, 3)}</Col>
                  </Row>
                  <div style={{ borderTop: "1px solid #000", borderBottom: "1px solid #000", padding: "8px 0", marginBottom: "30px" }}>
                    <Row style={{ fontWeight: "bold" }}>
                      <Col span={12} style={{ textAlign: "right", paddingRight: "20px" }}>TOTAL GBP</Col>
                      <Col span={12} style={{ textAlign: "right" }}>{totalGBP.toFixed(0)}</Col>
                    </Row>
                  </div>
                  <Row style={{ fontWeight: "bold" }}>
                    <Col span={12} style={{ textAlign: "right", paddingRight: "20px" }}>AMOUNT DUE GBP</Col>
                    <Col span={12} style={{ textAlign: "right" }}>{amountDue.toFixed(2)}</Col>
                  </Row>
                </div>

                {/* Footer Section */}
                <div style={{ position: "absolute", bottom: "40mm", left: "15mm", right: "15mm" }}>
                  <Row justify="space-between" align="bottom">
                    <Col span={12}>
                      <div style={{ whiteSpace: "pre-line", fontSize: "11px", lineHeight: "1.4" }}>
                        {invoiceData.bankDetails}
                      </div>
                    </Col>
                    <Col span={12} style={{ textAlign: "right" }}>
                      <img
                        src="/cpdlogo.png"
                        alt="CBPD Seal"
                        style={{ width: "160px", opacity: 0.9 }}
                      />
                    </Col>
                  </Row>
                </div>

                {/* Company Reg Info */}
                <div style={{ position: "absolute", bottom: "15mm", left: "15mm", fontSize: "9px", color: "#666" }}>
                  Company Registration No:16442180 , Registered office: 37th Floor 1 Canada Square London E14 5DY United Kingdom
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
