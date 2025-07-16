"use client";

import { useState } from "react";
import { Button, Dropdown, Menu, notification } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

interface ExportButtonProps {
  onExport: (format: 'csv' | 'excel') => Promise<void>;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export default function ExportButton({ onExport, disabled = false, style }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: 'csv' | 'excel') => {
    setLoading(true);
    try {
      await onExport(format);
    } catch (error) {
      console.error('Export error:', error);
      notification.error({
        message: 'Export Failed',
        description: 'Failed to export data. Please try again.',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="csv" onClick={() => handleExport('csv')}>
        Export as CSV
      </Menu.Item>
      <Menu.Item key="excel" onClick={() => handleExport('excel')}>
        Export as Excel
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']} disabled={disabled || loading}>
      <Button 
        icon={<DownloadOutlined />}
        loading={loading}
        disabled={disabled}
        style={{ borderRadius: 6, ...style }}
      >
        Export
      </Button>
    </Dropdown>
  );
}