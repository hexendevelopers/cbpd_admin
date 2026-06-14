"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Row, 
  Col, 
  message, 
  Space,
  Typography,
  Divider,
} from "antd";
import { PlusOutlined, DeleteOutlined, SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import AdminLayout from "@/components/AdminLayout";

const { Title, Text } = Typography;

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
  courseCode: string;
  examinationTerm: string;
  courseName: string;
  time: string;
  marks: string;
  modules: ModuleData[];
}

export default function GenerateQuestionPaperPage() {
  const [form] = Form.useForm();
  const [paperData, setPaperData] = useState<PaperData>({
    courseCode: "",
    examinationTerm: "",
    courseName: "",
    time: "2 Hrs",
    marks: "100",
    modules: [
      {
        title: "",
        questions: [
          { text: "", options: { a: "", b: "", c: "", d: "" } }
        ]
      }
    ]
  });
  const [loading, setLoading] = useState(false);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const router = useRouter();

  const handleValuesChange = (changedValues: any, allValues: any) => {
    setPaperData(allValues as PaperData);
  };

  const handleSaveAndDownload = async () => {
    try {
      setLoading(true);
      await form.validateFields();
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Fix for html2canvas text overlapping bug: remove parent scales before capture
      const wrappers = document.querySelectorAll('.pdf-page-wrapper') as NodeListOf<HTMLElement>;
      const originalStyles: { transform: string, marginBottom: string }[] = [];
      
      wrappers.forEach((w, index) => {
        originalStyles[index] = { transform: w.style.transform, marginBottom: w.style.marginBottom };
        w.style.transform = 'none';
        w.style.marginBottom = '20px';
      });

      // Wait a tick for DOM to update styles
      await new Promise(resolve => setTimeout(resolve, 50));

      let pagesAdded = 0;
      for (let i = 0; i < pageRefs.current.length; i++) {
        const pageNode = pageRefs.current[i];
        if (pageNode) {
          const canvas = await html2canvas(pageNode, {
            scale: 2, // Scale 2 is plenty sharp and reduces size
            useCORS: true,
            logging: false,
          });
          
          // Use JPEG with 0.8 compression to dramatically reduce the 100+ MB file size
          const imgData = canvas.toDataURL("image/jpeg", 0.8);
          
          if (pagesAdded > 0) {
            pdf.addPage();
          }
          // FAST compression for the PDF container
          pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
          pagesAdded++;
        }
      }
      
      if (pagesAdded > 0) {
        pdf.save(`${paperData.courseCode}_Question_Paper.pdf`);
      }

      // Restore visual scaling
      wrappers.forEach((w, index) => {
        w.style.transform = originalStyles[index].transform;
        w.style.marginBottom = originalStyles[index].marginBottom;
      });
    } catch (error) {
      console.error("Error saving/generating:", error);
      message.error("Please fill all required fields correctly.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = (add: any) => {
    const currentModules = form.getFieldValue("modules") || [];
    if (currentModules.length > 0) {
      const lastModule = currentModules[currentModules.length - 1];
      if (!lastModule.title || !lastModule.title.trim()) {
        message.warning("Please fill in the title of the current module before adding a new one.");
        return;
      }
      if (!lastModule.questions || lastModule.questions.length === 0) {
        message.warning("Please add at least one question to the current module.");
        return;
      }
      
      const lastQuestion = lastModule.questions[lastModule.questions.length - 1];
      if (lastQuestion) {
        if (!lastQuestion.text || !lastQuestion.options?.a || !lastQuestion.options?.b || !lastQuestion.options?.c || !lastQuestion.options?.d) {
          message.warning("Please fill in all fields of the last question before adding a new module.");
          return;
        }
      }
    }
    add({ title: "", questions: [{ text: "", options: { a: "", b: "", c: "", d: "" } }] });
  };

  const handleAddQuestion = (add: any, moduleIndex: number) => {
    const currentModules = form.getFieldValue("modules") || [];
    const currentModule = currentModules[moduleIndex];
    
    if (currentModule && currentModule.questions && currentModule.questions.length > 0) {
      const lastQuestion = currentModule.questions[currentModule.questions.length - 1];
      if (!lastQuestion.text || !lastQuestion.text.trim()) {
        message.warning("Please enter the question text before adding another.");
        return;
      }
      if (!lastQuestion.options?.a || !lastQuestion.options?.b || !lastQuestion.options?.c || !lastQuestion.options?.d) {
        message.warning("Please fill in all options (a, b, c, d) for the current question.");
        return;
      }
    }
    add({ text: "", options: { a: "", b: "", c: "", d: "" } });
  };

  // Pagination Logic based on estimated lines to prevent bottom overflow
  const MAX_LINES_FIRST_PAGE = 74; // Adjusted to strictly prevent bottom padding overflow
  const MAX_LINES_NEXT_PAGES = 88; // Adjusted to strictly prevent bottom padding overflow

  type RenderItem = 
    | { type: 'module', title: string, moduleIndex: number, roman: string }
    | { type: 'question', data: QuestionData, globalIndex: number };

  const allItems: RenderItem[] = [];
  let globalQ = 1;
  paperData.modules?.forEach((module, mIndex) => {
    const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][mIndex] || (mIndex + 1).toString();
    allItems.push({ type: 'module', title: module.title, moduleIndex: mIndex, roman });
    module.questions?.forEach(q => {
      allItems.push({ type: 'question', data: q, globalIndex: globalQ++ });
    });
  });

  const estimateLines = (text: string, charsPerLine: number = 95) => {
    if (!text) return 1;
    // Count exact newlines if any
    const newlines = (text.match(/\n/g) || []).length;
    // Estimate wrapping lines
    const wrapLines = Math.ceil(text.length / charsPerLine);
    return Math.max(newlines + 1, wrapLines);
  };

  const pages: RenderItem[][] = [];
  let currentPage: RenderItem[] = [];
  let currentLines = 0;

  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const limit = pages.length === 0 ? MAX_LINES_FIRST_PAGE : MAX_LINES_NEXT_PAGES;
    let itemLines = 0;

    if (item.type === 'question') {
      const qTextLines = estimateLines(item.data.text, 95);
      const optionsText = `${item.data.options?.a || ''} ${item.data.options?.b || ''} ${item.data.options?.c || ''} ${item.data.options?.d || ''}`;
      const optLines = estimateLines(optionsText, 100);
      itemLines = qTextLines + optLines + 1.5; // +1.5 for margins and spacing
    } else {
      itemLines = 3.5; // Module headers have margins and bold text
    }

    // Check if adding this item exceeds the limit
    let willExceed = currentLines + itemLines > limit;

    // Orphan prevention: if it's a module header, ensure there's room for at least 1 question (approx 6 lines) after it
    if (!willExceed && item.type === 'module') {
      if (currentLines + itemLines + 6 > limit) {
        willExceed = true;
      }
    }

    if (willExceed && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      currentLines = 0;
    }

    currentPage.push(item);
    currentLines += itemLines;
  }
  
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  // Ensure pageRefs array size matches pages
  pageRefs.current = pageRefs.current.slice(0, pages.length);

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
            Generate Question Paper
          </Title>
          <Text type="secondary">Create a new question paper and download as PDF</Text>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Question Paper Details" bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <Form
              form={form}
              layout="vertical"
              initialValues={paperData}
              onValuesChange={handleValuesChange}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="courseCode" label="Course Code" rules={[{ required: true }]}>
                    <Input placeholder="e.g. IDAIDM" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="examinationTerm" label="Examination Term" rules={[{ required: true }]}>
                    <Input placeholder="e.g. FINAL EXAMINATION 2026" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item name="courseName" label="Course Name" rules={[{ required: true }]}>
                <Input placeholder="e.g. International Diploma in AI..." />
              </Form.Item>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="time" label="Time" rules={[{ required: true }]}>
                    <Input placeholder="e.g. 2 Hrs" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="marks" label="Marks" rules={[{ required: true }]}>
                    <Input placeholder="e.g. 100" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>Modules</Divider>
              
              <Form.List name="modules">
                {(moduleFields, { add: addModule, remove: removeModule }) => (
                  <>
                    {moduleFields.map((moduleField, index) => (
                      <Card key={moduleField.key} size="small" style={{ marginBottom: 16, border: "1px solid #d9d9d9" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                          <Text strong>Module {index + 1}</Text>
                          {moduleFields.length > 1 && (
                            <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeModule(moduleField.name)} />
                          )}
                        </div>
                        
                        <Form.Item
                          name={[moduleField.name, "title"]}
                          label="Module Title"
                          rules={[{ required: true, message: "Missing title" }]}
                        >
                          <Input placeholder="e.g. MARKETING BASICS" />
                        </Form.Item>

                        <Form.List name={[moduleField.name, "questions"]}>
                          {(questionFields, { add: addQuestion, remove: removeQuestion }) => (
                            <div style={{ paddingLeft: 16, borderLeft: "2px solid #f0f0f0" }}>
                              {questionFields.map((questionField, qIndex) => (
                                <div key={questionField.key} style={{ marginBottom: 16, padding: 12, background: "#fafafa", borderRadius: 8 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                    <Text type="secondary">Question {qIndex + 1}</Text>
                                    <Button danger type="text" size="small" icon={<DeleteOutlined />} onClick={() => removeQuestion(questionField.name)} />
                                  </div>
                                  <Form.Item
                                    name={[questionField.name, "text"]}
                                    rules={[{ required: true, message: "Missing question" }]}
                                    style={{ marginBottom: 8 }}
                                  >
                                    <Input.TextArea rows={2} placeholder="Question Text" />
                                  </Form.Item>
                                  <Row gutter={8}>
                                    <Col span={12}>
                                      <Form.Item name={[questionField.name, "options", "a"]} rules={[{ required: true }]} style={{ marginBottom: 8 }}>
                                        <Input prefix="a)" placeholder="Option A" />
                                      </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                      <Form.Item name={[questionField.name, "options", "b"]} rules={[{ required: true }]} style={{ marginBottom: 8 }}>
                                        <Input prefix="b)" placeholder="Option B" />
                                      </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                      <Form.Item name={[questionField.name, "options", "c"]} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                                        <Input prefix="c)" placeholder="Option C" />
                                      </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                      <Form.Item name={[questionField.name, "options", "d"]} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                                        <Input prefix="d)" placeholder="Option D" />
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                </div>
                              ))}
                              <Button type="dashed" onClick={() => handleAddQuestion(addQuestion, index)} block icon={<PlusOutlined />}>
                                Add Question
                              </Button>
                            </div>
                          )}
                        </Form.List>
                      </Card>
                    ))}
                    <Button type="dashed" onClick={() => handleAddModule(addModule)} block icon={<PlusOutlined />} style={{ marginBottom: 24 }}>
                      Add Module
                    </Button>
                  </>
                )}
              </Form.List>

              <Button
                type="primary"
                icon={<SaveOutlined />}
                size="large"
                block
                onClick={handleSaveAndDownload}
                loading={loading}
              >
                Save & Download Question Paper
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title="A4 Live Preview" 
            bordered={false} 
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
            bodyStyle={{ display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "#f0f2f5", padding: "20px", overflowY: "auto", maxHeight: "1200px", gap: "20px" }}
          >
            {pages.map((pageItems, pageIndex) => (
              <div 
                key={pageIndex}
                className="pdf-page-wrapper"
                style={{
                  transform: "scale(0.85)",
                  transformOrigin: "top center",
                  marginBottom: "-40mm", // Offset visual scaling gap
                  width: "210mm" // ensure the wrapper bounds the content
                }}
              >
                <div
                  ref={(el) => {
                    if (el) pageRefs.current[pageIndex] = el;
                  }}
                  style={{
                    width: "210mm",
                    height: "297mm",
                    boxSizing: "border-box",
                    backgroundColor: "white",
                    padding: pageIndex === 0 ? "12.1mm 16.1mm 14.1mm 15.1mm" : "12.1mm 16.1mm 14.1mm 15.1mm",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    letterSpacing: "0.4px", // Fix font squishing
                    wordSpacing: "1px",
                    lineHeight: "1.3",
                    position: "relative",
                    color: "#000000",
                    overflow: "hidden"
                  }}
                >
                  {/* Background Watermark (All pages) */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      opacity: 0.08,
                      zIndex: 0,
                      width: "148.2mm",
                      height: "139mm",
                      textAlign: "center"
                    }}
                  >
                    <img src="/cbpd-logo-transparent.png" alt="watermark logo" style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "multiply" }} />
                  </div>

                <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
                  {pageIndex === 0 && (
                    <>
                      {/* Logo */}
                      <div style={{ textAlign: "center", marginBottom: "3.6mm", display: "flex", justifyContent: "center" }}>
                        <img src="/cbpd-logo-transparent.png" alt="Logo" style={{ height: "30mm", width: "31.7mm", objectFit: "contain", mixBlendMode: "multiply" }} />
                      </div>

                      {/* Header Replicated from Exact PDF Specs */}
                      <div style={{ position: "relative", marginBottom: "6px", fontFamily: "Helvetica, Arial, sans-serif" }}>
                        {/* Center Title */}
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "12pt", fontWeight: "bold", color: "#1A1A6E" }}>
                            CENTRAL BOARD OF PROFESSIONAL DEVELOPMENT
                          </div>
                          <div style={{ fontSize: "12pt", fontWeight: "bold", marginTop: "1px", color: "#000000" }}>
                            {paperData.examinationTerm || "FINAL EXAMINATION 2026"}
                          </div>
                        </div>

                        {/* Left Side Info */}
                        <div style={{ position: "absolute", left: 0, top: 0, textAlign: "left", fontSize: "10pt", fontWeight: "bold", lineHeight: "1.3", color: "#000000" }}>
                          <div>CBPD</div>
                          <div>{paperData.courseCode || "AIDMM"}</div>
                        </div>

                        {/* Right Side Info */}
                        <div style={{ position: "absolute", right: 0, top: 0, textAlign: "right", fontSize: "10pt", fontWeight: "bold", lineHeight: "1.3", color: "#000000" }}>
                          <div>Time: {paperData.time || "2 Hrs"}</div>
                          <div>Marks: {paperData.marks || "100"}</div>
                        </div>

                        {/* Course Name centered below everything */}
                        <div style={{ textAlign: "center", fontSize: "10pt", fontStyle: "italic", marginTop: "2px", color: "#1A1A6E" }}>
                          Course : {paperData.courseName || "International Diploma in AI Integrated Digital Marketing Management"}
                        </div>
                      </div>
                      
                      {/* Separator Line */}
                      <div style={{ borderBottom: "1pt solid #1A1A6E", marginBottom: "6px" }} />
                    </>
                  )}

                  {/* Modules & Questions for this Page */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: pageIndex === pages.length - 1 ? "flex-start" : "space-between" }}>
                    {pageItems.map((item, idx) => {
                    if (item.type === 'module') {
                      return (
                        <div key={`m-${item.moduleIndex}-${idx}`} style={{ 
                          textAlign: "center", 
                          fontWeight: "bold", 
                          fontSize: "11pt",
                          color: "#1A1A6E",
                          marginBottom: "4px",
                          marginTop: idx > 0 ? "8px" : "0",
                          textTransform: "uppercase",
                          fontFamily: "Helvetica, Arial, sans-serif"
                        }}>
                          MODULE {item.roman} : {item.title}
                        </div>
                      );
                    } else {
                      return (
                        <div key={`q-${item.globalIndex}`} style={{ marginBottom: "4px", fontSize: "9.5pt", fontFamily: "Helvetica, Arial, sans-serif", color: "#000000" }}>
                          {/* Question Text */}
                          <div style={{ display: "flex", marginBottom: "1px", fontWeight: "bold" }}>
                            <div style={{ marginRight: "4px", flexShrink: 0 }}>{item.globalIndex}.</div>
                            <div style={{ flex: 1 }}>{item.data?.text || "Question Text"}</div>
                          </div>
                          
                          {/* Options inline */}
                          <div style={{ paddingLeft: "10pt", fontWeight: "normal" }}>
                            <span style={{marginRight: "12px"}}>a) {item.data?.options?.a}</span>
                            <span style={{marginRight: "12px"}}>b) {item.data?.options?.b}</span>
                            <span style={{marginRight: "12px"}}>c) {item.data?.options?.c}</span>
                            <span>d) {item.data?.options?.d}</span>
                          </div>
                        </div>
                      );
                    }
                  })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          </Card>
        </Col>
      </Row>
      </div>
    </AdminLayout>
  );
}
