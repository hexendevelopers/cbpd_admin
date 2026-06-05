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
    courseCode: "IDAIDM",
    examinationTerm: "FINAL EXAMINATION 2026",
    courseName: "International Diploma in AI Integrated Digital Marketing Management",
    time: "2 Hrs",
    marks: "100",
    modules: [{ title: "MARKETING BASICS", questions: [{ text: "", options: { a: "", b: "", c: "", d: "" } }] }]
  });
  const [loading, setLoading] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleValuesChange = (changedValues: any, allValues: any) => {
    setPaperData(allValues as PaperData);
  };

  const handleSaveAndDownload = async () => {
    try {
      await form.validateFields();
      setLoading(true);

      // Save to database
      await axios.post("/api/admin/question-papers", paperData);
      message.success("Question Paper saved successfully!");

      // Generate PDF
      if (paperRef.current) {
        const canvas = await html2canvas(paperRef.current, {
          scale: 4,
          useCORS: true,
          logging: false,
        });
        
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${paperData.courseCode}_Question_Paper.pdf`);
      }
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

  // Helper to calculate continuous question number
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
            bodyStyle={{ display: "flex", justifyContent: "center", backgroundColor: "#f0f2f5", padding: "20px" }}
          >
            <div
              ref={paperRef}
              style={{
                width: "210mm",
                minHeight: "297mm",
                boxSizing: "border-box",
                backgroundColor: "white",
                padding: "10mm 5mm",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                fontFamily: '"Times New Roman", Times, serif',
                lineHeight: "1.2",
                position: "relative",
                transform: "scale(0.85)",
                transformOrigin: "top center",
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
                  opacity: 0.1,
                  zIndex: 0,
                  width: "140mm",
                  textAlign: "center"
                }}
              >
                <img src="/cbpd-logo-transparent.png" alt="watermark logo" style={{ width: "100%", height: "auto" }} />
              </div>

              <div style={{ position: "relative", zIndex: 1 }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "6px", display: "flex", justifyContent: "center" }}>
                  <img src="/cbpd-logo-transparent.png" alt="Logo" style={{ height: "80px", width: "auto", objectFit: "contain" }} />
                </div>

                {/* 3-Column Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "15px", fontSize: "10pt", fontWeight: "bold" }}>
                  <div style={{ flex: 1, textAlign: "left", paddingLeft: "5px", fontSize: "7pt", fontWeight: "normal" }}>
                    <div style={{ fontWeight: "bold" }}>CBPD</div>
                    <div style={{ fontWeight: "bold" }}>{paperData.courseCode || "IDAIDM"}</div>
                  </div>
                  
                  <div style={{ flex: 4, textAlign: "center" }}>
                    <div style={{ fontSize: "13pt", fontWeight: "bold", textTransform: "uppercase", marginBottom: "4px", color: "#1a237e", whiteSpace: "nowrap" }}>
                      CENTRAL BOARD OF PROFESSIONAL DEVELOPMENT UK
                    </div>
                    <div style={{ fontSize: "11pt", fontWeight: "bold", marginBottom: "4px" }}>
                      {paperData.examinationTerm || "FINAL EXAMINATION 2026"}
                    </div>
                    <div style={{ fontSize: "10pt", fontWeight: "bold" }}>
                      Course : {paperData.courseName || "International Diploma in AI Integrated Digital Marketing Management"}
                    </div>
                  </div>

                  <div style={{ flex: 1, textAlign: "right", paddingRight: "5px", fontSize: "7pt", fontWeight: "normal", whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: "bold" }}>Time: {paperData.time || "2 Hrs"}</div>
                    <div style={{ fontWeight: "bold" }}>Marks: {paperData.marks || "100"}</div>
                  </div>
                </div>

                {/* Modules & Questions */}
                {paperData.modules?.map((module, mIndex) => {
                  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][mIndex] || (mIndex + 1);
                  return (
                    <div key={mIndex} style={{ marginBottom: "10px" }}>
                      <div style={{ 
                        textAlign: "left", 
                        fontWeight: "bold", 
                        fontSize: "11pt",
                        marginBottom: "6px",
                        paddingLeft: "10px",
                        marginTop: mIndex > 0 ? "12px" : "0"
                      }}>
                        MODULE {roman} : {module.title?.toUpperCase()}
                      </div>
                      
                      {module.questions?.map((q, qIndex) => {
                        const num = globalQuestionNumber++;
                        return (
                          <div key={qIndex} style={{ marginBottom: "8px", fontSize: "10pt", fontWeight: "normal", paddingLeft: "10px" }}>
                            {/* Question Text */}
                            <div style={{ display: "flex", marginBottom: "2px", fontFamily: "Arial, sans-serif", fontWeight: "normal" }}>
                              <div style={{ width: "20px", flexShrink: 0, fontWeight: "bold" }}>{num}.</div>
                              <div style={{ flex: 1 }}>{q?.text || "Question Text"}</div>
                            </div>
                            
                            {/* Options inline */}
                            <div style={{ paddingLeft: "20px", fontFamily: "Arial, sans-serif", fontWeight: "normal" }}>
                              a) {q.options?.a} &nbsp;&nbsp;&nbsp; 
                              b) {q.options?.b} &nbsp;&nbsp;&nbsp; 
                              c) {q.options?.c} &nbsp;&nbsp;&nbsp; 
                              d) {q.options?.d}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      </div>
    </AdminLayout>
  );
}
