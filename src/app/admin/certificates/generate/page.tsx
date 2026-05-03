"use client";

import { forwardRef, useCallback, useRef, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  DatePicker,
  Space,
  Tabs,
  notification,
} from "antd";
import { EyeOutlined, DownloadOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import AdminLayout from "@/components/AdminLayout";
import "@/styles/certificate-generator.css";

const { Title, Text } = Typography;

/** Must match intrinsic size of `public/certificate-template.png` (no stretch). */
const CANVAS_W = 1234;
const CANVAS_H = 1738;
const LAR_CANVAS_W = 737;
const LAR_CANVAS_H = 1042;
const UNIT_ROWS = 10;

type CertificateFormValues = {
  studentName: string;
  courseName: string;
  courseLevel: string;
  providerName: string;
  certificateNumber: string;
  registrationNumber: string;
  dateIssued: Dayjs;
};

type CertificateCanvasProps = {
  studentName: string;
  courseName: string;
  courseLevel: string;
  providerName: string;
  certificateNumber: string;
  registrationNumber: string;
  dateIssuedText: string;
};

type LarUnitRow = {
  unitCode?: string;
  unitTitle?: string;
  level?: string;
  hours?: string;
  credits?: string;
  unitMark?: string;
  decision?: string;
  academicSession?: string;
};

type LarFormValues = {
  learnerName?: string;
  learnerNo?: string;
  dateOfBirth?: Dayjs;
  programmeCode?: string;
  qualificationTitle?: string;
  qualificationLevel?: string;
  modeOfStudy?: string;
  providerName?: string;
  centreCode?: string;
  awardingBody?: string;
  languageOfInstruction?: string;
  languageOfAssessment?: string;
  dateOfAward?: Dayjs;
  units?: LarUnitRow[];
  totalCreditsEarned?: string;
  overallAwardClassification?: string;
  qualificationAwarded?: string;
  certificateNo?: string;
  registrationNo?: string;
};

const CertificateCanvas = forwardRef<HTMLDivElement, CertificateCanvasProps>(
  function CertificateCanvas(
    {
      studentName,
      courseName,
      courseLevel,
      providerName,
      certificateNumber,
      registrationNumber,
      dateIssuedText,
    },
    ref,
  ) {
    return (
      <div ref={ref} className="certificate-canvas">
        <img
          src="/newcert.jpeg"
          alt=""
          className="certificate-bg"
          width={CANVAS_W}
          height={CANVAS_H}
          draggable={false}
        />
        <div className="student-name" style={{ marginTop: "130px" }}>
          {studentName}
        </div>
        <div
          className="course-name max-w-1000 text-center"
          style={{ marginTop: "145px", fontSize: "27px" }}
        >
          {courseName}
        </div>
        <div
          className="course-level"
          style={{ marginTop: "120px", fontSize: "23px" }}
        >
          {courseLevel}
        </div>
        <div className="" style={{marginTop : "100px"}}>
          <div className="provider-name" style={{marginTop : "112px", marginLeft : "40px"}}>{providerName}</div>
          <div className="certificate-number" style={{marginTop : "112px", marginLeft : "40px"}}>{certificateNumber}</div>
          <div className="registration-number" style={{marginTop : "112px", marginLeft : "40px"}}>{registrationNumber}</div>
        </div>
        <div className="date-issued" style={{marginBottom : "121px", marginLeft : "90px"}}>{dateIssuedText}</div>
      </div>
    );
  },
);

type LarCanvasProps = {
  values: Partial<LarFormValues>;
  dateOfBirthText: string;
  dateOfAwardText: string;
};

const LarCanvas = forwardRef<HTMLDivElement, LarCanvasProps>(function LarCanvas(
  { values, dateOfBirthText, dateOfAwardText },
  ref,
) {
  const units = values.units ?? [];

  return (
    <div ref={ref} className="lar-canvas">
      <img
        src="/lar-template.jpeg"
        alt=""
        className="lar-bg"
        width={LAR_CANVAS_W}
        height={LAR_CANVAS_H}
        draggable={false}
      />
      <div className="ml-20" style={{marginLeft:"100px"}}>

      <div className="lar-field learner-name" style={{marginLeft:"80px", marginTop:"-10px", fontSize:"11px"}}>{values.learnerName}</div>
      <div className="lar-field learner-no" style={{marginLeft:"80px", marginTop:"-14px",  fontSize:"11px"}}>{values.learnerNo}</div>
      <div className="lar-field date-of-birth" style={{marginLeft:"80px", marginTop:"-18px",  fontSize:"11px"}}>{dateOfBirthText}</div>
      <div className="lar-field programme-code" style={{marginLeft:"80px", marginTop:"-22px",  fontSize:"11px"}}>{values.programmeCode}</div>
      <div className="lar-field qualification-title" style={{marginLeft:"80px", marginTop:"-28px", width:"210px",  fontSize:"12px"}}>{values.qualificationTitle}</div>
      <div className="lar-field qualification-level" style={{marginLeft:"80px", marginTop:"-38px",  fontSize:"11px"}}>{values.qualificationLevel}</div>
      </div>

      <div className="lar-field mode-of-study">{values.modeOfStudy}</div>
      <div className="lar-field provider-name">{values.providerName}</div>
      <div className="lar-field centre-code">{values.centreCode}</div>
      <div className="lar-field awarding-body">{values.awardingBody}</div>
      <div className="lar-field language-instruction">
        {values.languageOfInstruction}
      </div>
      <div className="lar-field language-assessment">{values.languageOfAssessment}</div>
      <div className="lar-field date-of-award">{dateOfAwardText}</div>

      {Array.from({ length: UNIT_ROWS }).map((_, index) => {
        const row = units[index] ?? {};
        const top = 520 + index * 26;
        return (
          <div key={`lar-row-${index}`}>
            <div className="lar-field unit-code" style={{ top }}>
              {row.unitCode}
            </div>
            <div className="lar-field unit-title" style={{ top }}>
              {row.unitTitle}
            </div>
            <div className="lar-field unit-level" style={{ top }}>
              {row.level}
            </div>
            <div className="lar-field unit-hours" style={{ top, marginLeft:"5px" }}>
              {row.hours}
            </div>
            <div className="lar-field unit-credits" style={{ top, marginLeft:"6px" }}>
              {row.credits}
            </div>
            <div className="lar-field unit-mark" style={{ top, marginLeft:"10px" }}>
              {row.unitMark}
            </div>
            <div className="lar-field unit-decision" style={{ top, marginLeft:"25px" }}>
              {row.decision}
            </div>
            <div className="lar-field unit-session" style={{ top, marginLeft:"25px" }}>
              {row.academicSession}
            </div>
          </div>
        );
      })}

      <div className="lar-field total-credits">{values.totalCreditsEarned}</div>
      <div className="lar-field overall-classification">
        {values.overallAwardClassification}
      </div>
      <div className="lar-field qualification-awarded">
        {values.qualificationAwarded}
      </div>
      <div className="lar-field certificate-no">{values.certificateNo}</div>
      <div className="lar-field registration-no">{values.registrationNo}</div>
    </div>
  );
});

const buildDefaultUnits = () =>
  Array.from({ length: UNIT_ROWS }, () => ({
    unitCode: "",
    unitTitle: "",
    level: "",
    hours: "",
    credits: "",
    unitMark: "",
    decision: "",
    academicSession: "",
  }));

export default function GenerateCertificatePage() {
  const [form] = Form.useForm<CertificateFormValues>();
  const [larForm] = Form.useForm<LarFormValues>();
  const certificateRef = useRef<HTMLDivElement>(null);
  const larRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [larPdfLoading, setLarPdfLoading] = useState(false);

  const scrollToPreview = () => {
    certificateRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handlePreview = async () => {
    try {
      await form.validateFields();
      notification.success({
        message: "Preview updated",
        description: "Certificate values are shown in the preview below.",
        placement: "topRight",
      });
      scrollToPreview();
    } catch {
      notification.warning({
        message: "Check the form",
        description: "Please fill all required fields before previewing.",
        placement: "topRight",
      });
    }
  };

  const handleDownloadPdf = useCallback(async () => {
    let values: CertificateFormValues;
    try {
      values = await form.validateFields();
    } catch {
      notification.warning({
        message: "Check the form",
        description: "Please fill all required fields before downloading.",
        placement: "topRight",
      });
      return;
    }

    const el = certificateRef.current;
    if (!el) {
      notification.error({
        message: "Preview not ready",
        description: "Could not find the certificate element.",
        placement: "topRight",
      });
      return;
    }

    setPdfLoading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: CANVAS_W,
        height: CANVAS_H,
        windowWidth: CANVAS_W,
        windowHeight: CANVAS_H,
      });

      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [CANVAS_W, CANVAS_H],
      });
      pdf.addImage(img, "PNG", 0, 0, CANVAS_W, CANVAS_H);

      const safeCert = (values.certificateNumber || "certificate").replace(
        /[^a-zA-Z0-9/_-]+/g,
        "_",
      );
      pdf.save(`certificate-${safeCert}.pdf`);

      notification.success({
        message: "PDF downloaded",
        placement: "topRight",
      });
    } catch (e) {
      console.error(e);
      notification.error({
        message: "PDF export failed",
        description: e instanceof Error ? e.message : "Unknown error",
        placement: "topRight",
      });
    } finally {
      setPdfLoading(false);
    }
  }, [form]);

  const handleLarPreview = () => {
    notification.success({
      message: "LAR preview updated",
      description: "Learner Achievement Record values are shown in preview.",
      placement: "topRight",
    });
    larRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleLarDownloadPdf = useCallback(async () => {
    const values = larForm.getFieldsValue(true);
    const el = larRef.current;
    if (!el) {
      notification.error({
        message: "Preview not ready",
        description: "Could not find the LAR preview element.",
        placement: "topRight",
      });
      return;
    }

    setLarPdfLoading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(el, {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: LAR_CANVAS_W,
        height: LAR_CANVAS_H,
        windowWidth: LAR_CANVAS_W,
        windowHeight: LAR_CANVAS_H,
      });

      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [LAR_CANVAS_W, LAR_CANVAS_H],
      });
      pdf.addImage(img, "PNG", 0, 0, LAR_CANVAS_W, LAR_CANVAS_H);

      const safeCert = (values.certificateNo || "lar").replace(
        /[^a-zA-Z0-9/_-]+/g,
        "_",
      );
      pdf.save(`learner-achievement-record-${safeCert}.pdf`);

      notification.success({
        message: "LAR PDF downloaded",
        placement: "topRight",
      });
    } catch (e) {
      console.error(e);
      notification.error({
        message: "LAR PDF export failed",
        description: e instanceof Error ? e.message : "Unknown error",
        placement: "topRight",
      });
    } finally {
      setLarPdfLoading(false);
    }
  }, [larForm]);

  const watched = Form.useWatch(undefined, form) as
    | Partial<CertificateFormValues>
    | undefined;
  const larWatched = Form.useWatch(undefined, larForm) as
    | Partial<LarFormValues>
    | undefined;

  const studentName = (watched?.studentName ?? "").trim();
  const courseName = (watched?.courseName ?? "").trim();
  const courseLevel = (watched?.courseLevel ?? "").trim();
  const providerName = (watched?.providerName ?? "").trim();
  const certificateNumber = (watched?.certificateNumber ?? "").trim();
  const registrationNumber = (watched?.registrationNumber ?? "").trim();
  const dateIssuedText = watched?.dateIssued
    ? dayjs(watched.dateIssued).format("D MMMM YYYY")
    : "";
  const larValues = larWatched ?? {};
  const dateOfBirthText = larValues.dateOfBirth
    ? dayjs(larValues.dateOfBirth).format("D MMMM YYYY")
    : "";
  const dateOfAwardText = larValues.dateOfAward
    ? dayjs(larValues.dateOfAward).format("D MMMM YYYY")
    : "";

  return (
    <AdminLayout>
      <div style={{ padding: 24 }}>
        <Title level={3} style={{ marginTop: 0 }}>
          Generate Certificate
        </Title>
        <Text type="secondary">
          Enter details below. The template image is the fixed canvas; only your
          text is overlaid.
        </Text>

        <Tabs
          style={{ marginTop: 24 }}
          items={[
            {
              key: "certificate",
              label: "Certificate",
              children: (
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={10}>
                    <Card title="Certificate details" bordered={false}>
                      <Form<CertificateFormValues>
                        form={form}
                        layout="vertical"
                        requiredMark="optional"
                        initialValues={{ dateIssued: dayjs() }}
                      >
                        <Form.Item
                          name="studentName"
                          label="Student Name"
                          rules={[
                            { required: true, message: "Student name is required" },
                          ]}
                        >
                          <Input placeholder="e.g. SYAMLY V.A" autoComplete="off" />
                        </Form.Item>
                        <Form.Item
                          name="courseName"
                          label="Course Name"
                          rules={[
                            { required: true, message: "Course name is required" },
                          ]}
                        >
                          <Input.TextArea rows={3} autoComplete="off" />
                        </Form.Item>
                        <Form.Item
                          name="courseLevel"
                          label="Course Level"
                          rules={[
                            { required: true, message: "Course level is required" },
                          ]}
                        >
                          <Input placeholder="e.g. LEVEL 3" autoComplete="off" />
                        </Form.Item>
                        <Form.Item
                          name="providerName"
                          label="Provider Name"
                          rules={[
                            { required: true, message: "Provider name is required" },
                          ]}
                        >
                          <Input autoComplete="off" />
                        </Form.Item>
                        <Form.Item
                          name="certificateNumber"
                          label="Certificate Number"
                          rules={[
                            {
                              required: true,
                              message: "Certificate number is required",
                            },
                          ]}
                        >
                          <Input autoComplete="off" />
                        </Form.Item>
                        <Form.Item
                          name="registrationNumber"
                          label="Registration Number"
                          rules={[
                            {
                              required: true,
                              message: "Registration number is required",
                            },
                          ]}
                        >
                          <Input autoComplete="off" />
                        </Form.Item>
                        <Form.Item
                          name="dateIssued"
                          label="Date Issued"
                          rules={[
                            { required: true, message: "Date issued is required" },
                          ]}
                        >
                          <DatePicker
                            style={{ width: "100%" }}
                            format="D MMMM YYYY"
                          />
                        </Form.Item>
                        <Space wrap>
                          <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={handlePreview}
                          >
                            Preview Certificate
                          </Button>
                          <Button
                            icon={<DownloadOutlined />}
                            loading={pdfLoading}
                            onClick={handleDownloadPdf}
                          >
                            Download PDF
                          </Button>
                        </Space>
                      </Form>
                    </Card>
                  </Col>
                  <Col xs={24} lg={14}>
                    <Card
                      title="Certificate preview (1234 × 1738 px)"
                      bordered={false}
                    >
                      <Text
                        type="secondary"
                        style={{ display: "block", marginBottom: 16 }}
                      >
                        Canvas matches the template image pixel size (no stretching).
                        PDF uses the same layout.
                      </Text>
                      <div
                        style={{
                          overflow: "auto",
                          maxHeight: "min(85vh, 1200px)",
                          background: "#e2e8f0",
                          borderRadius: 8,
                          padding: 16,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <CertificateCanvas
                            ref={certificateRef}
                            studentName={studentName}
                            courseName={courseName}
                            courseLevel={courseLevel}
                            providerName={providerName}
                            certificateNumber={certificateNumber}
                            registrationNumber={registrationNumber}
                            dateIssuedText={dateIssuedText}
                          />
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: "lar",
              label: "Learner Achievement Record",
              children: (
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={10}>
                    <Card title="LAR details" bordered={false}>
                      <Form<LarFormValues>
                        form={larForm}
                        layout="vertical"
                        requiredMark={false}
                        initialValues={{ units: buildDefaultUnits() }}
                      >
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item name="learnerName" label="Learner Name">
                              <Input autoComplete="off" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="learnerNo" label="Learner No">
                              <Input autoComplete="off" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item name="dateOfBirth" label="Date of Birth">
                              <DatePicker
                                style={{ width: "100%" }}
                                format="D MMMM YYYY"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="programmeCode" label="Programme Code">
                              <Input autoComplete="off" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item name="qualificationTitle" label="Qualification Title">
                          <Input.TextArea rows={2} autoComplete="off" />
                        </Form.Item>
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item
                              name="qualificationLevel"
                              label="Qualification Level"
                            >
                              <Input autoComplete="off" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="modeOfStudy" label="Mode of Study">
                              <Input autoComplete="off" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item name="providerName" label="Provider Name">
                              <Input autoComplete="off" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="centreCode" label="Centre Code">
                              <Input autoComplete="off" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item name="awardingBody" label="Awarding Body">
                              <Input autoComplete="off" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name="languageOfInstruction"
                              label="Language of Instruction"
                            >
                              <Input autoComplete="off" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item
                              name="languageOfAssessment"
                              label="Language of Assessment"
                            >
                              <Input autoComplete="off" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="dateOfAward" label="Date of Award">
                              <DatePicker
                                style={{ width: "100%" }}
                                format="D MMMM YYYY"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Title level={5}>Units (up to 10 rows)</Title>
                        {Array.from({ length: UNIT_ROWS }).map((_, index) => (
                          <Row key={`unit-row-${index}`} gutter={8}>
                            <Col span={6}>
                              <Form.Item name={["units", index, "unitCode"]} label="Code">
                                <Input size="small" autoComplete="off" />
                              </Form.Item>
                            </Col>
                            <Col span={10}>
                              <Form.Item
                                name={["units", index, "unitTitle"]}
                                label="Title"
                              >
                                <Input size="small" autoComplete="off" />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item name={["units", index, "level"]} label="Level">
                                <Input size="small" autoComplete="off" />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item name={["units", index, "hours"]} label="Hours">
                                <Input size="small" autoComplete="off" />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                name={["units", index, "credits"]}
                                label="Credits"
                              >
                                <Input size="small" autoComplete="off" />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item name={["units", index, "unitMark"]} label="Mark %">
                                <Input size="small" autoComplete="off" />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                name={["units", index, "decision"]}
                                label="Decision"
                              >
                                <Input size="small" autoComplete="off" />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item
                                name={["units", index, "academicSession"]}
                                label="Session"
                              >
                                <Input size="small" autoComplete="off" />
                              </Form.Item>
                            </Col>
                          </Row>
                        ))}
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item
                              name="totalCreditsEarned"
                              label="Total Credits Earned"
                            >
                              <Input autoComplete="off" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name="overallAwardClassification"
                              label="Overall Award Classification"
                            >
                              <Input autoComplete="off" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item
                          name="qualificationAwarded"
                          label="Qualification Awarded"
                        >
                          <Input.TextArea rows={2} autoComplete="off" />
                        </Form.Item>
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item name="certificateNo" label="Certificate No">
                              <Input autoComplete="off" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="registrationNo" label="Registration No">
                              <Input autoComplete="off" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Space wrap>
                          <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={handleLarPreview}
                          >
                            Preview LAR
                          </Button>
                          <Button
                            icon={<DownloadOutlined />}
                            loading={larPdfLoading}
                            onClick={handleLarDownloadPdf}
                          >
                            Download PDF
                          </Button>
                        </Space>
                      </Form>
                    </Card>
                  </Col>
                  <Col xs={24} lg={14}>
                    <Card title="LAR preview (737 × 1042 px)" bordered={false}>
                      <Text
                        type="secondary"
                        style={{ display: "block", marginBottom: 16 }}
                      >
                        Template background is fixed and fields overlay the content.
                      </Text>
                      <div
                        style={{
                          overflow: "auto",
                          maxHeight: "min(85vh, 1200px)",
                          background: "#e2e8f0",
                          borderRadius: 8,
                          padding: 16,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <LarCanvas
                            ref={larRef}
                            values={larValues}
                            dateOfBirthText={dateOfBirthText}
                            dateOfAwardText={dateOfAwardText}
                          />
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              ),
            },
          ]}
        />
      </div>
    </AdminLayout>
  );
}
