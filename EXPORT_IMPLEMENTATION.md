# Export Functionality Implementation

## ✅ Completed:
1. Created Institution Export API: `/api/admin/institutions/export`
2. Created Student Export API: `/api/admin/students/export`
3. Created Export Utilities: `/utils/exportUtils.ts`
4. Created Export Button Component: `/components/ExportButton.tsx`
5. Installed required dependencies: `xlsx` and `file-saver`

## 🔧 APIs Created:

### Institution Export API (`/api/admin/institutions/export`)
- Supports CSV and Excel formats
- Applies same filters as main institutions page (search, status)
- Returns properly formatted data with all institution details

### Student Export API (`/api/admin/students/export`)
- Supports CSV and Excel formats  
- Applies same filters as main students page (search, status, institutionId)
- Returns properly formatted data with student details and institution names

## 📋 Manual Steps Required:

### For Institutions Page (`/app/admin/institutions/page.tsx`):

1. **Add Export Function** (after `const [form] = Form.useForm();`):
```typescript
const handleExport = async (format: 'csv' | 'excel') => {
  try {
    const queryParams = new URLSearchParams({
      format,
      ...(filters.search && { search: filters.search }),
      ...(filters.status && { status: filters.status }),
    });

    if (format === 'csv') {
      const response = await fetch(`/api/admin/institutions/export?${queryParams}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `institutions_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        notification.success({
          message: 'Export Successful',
          description: 'Institutions data exported to CSV successfully',
          placement: 'topRight',
        });
      }
    } else {
      const response = await fetch(`/api/admin/institutions/export?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        const { exportToExcel } = await import('@/utils/exportUtils');
        exportToExcel(data.data, data.filename);
        
        notification.success({
          message: 'Export Successful',
          description: 'Institutions data exported to Excel successfully',
          placement: 'topRight',
        });
      }
    }
  } catch (error) {
    notification.error({
      message: 'Export Failed',
      description: 'Failed to export institutions data. Please try again.',
      placement: 'topRight',
    });
  }
};
```

2. **Replace Export Button** (find the button with `icon={<DownloadOutlined />}` and text "Export"):
```typescript
<Dropdown
  overlay={
    <Menu>
      <Menu.Item key="csv" onClick={() => handleExport('csv')}>
        Export as CSV
      </Menu.Item>
      <Menu.Item key="excel" onClick={() => handleExport('excel')}>
        Export as Excel
      </Menu.Item>
    </Menu>
  }
  trigger={['click']}
>
  <Button 
    icon={<DownloadOutlined />}
    style={{ borderRadius: 6 }}
  >
    Export
  </Button>
</Dropdown>
```

### For Students Page (`/app/admin/students/page.tsx`):

1. **Add Export Function** (similar to institutions but with `students` endpoint)
2. **Replace Export Button** (same pattern as institutions)

## 🎯 Features:
- ✅ Export filtered data (respects current search and filter settings)
- ✅ CSV and Excel format support
- ✅ Professional file naming with dates
- ✅ Success/error notifications
- ✅ Proper data formatting with headers
- ✅ Auto-download functionality

## 📊 Export Data Includes:

### Institutions:
- S.No, Organization Name, Email, Contact Person, Phone, Address, Status, Created Date, Approved Date

### Students:
- S.No, Student ID, Full Name, Email, Phone, Date of Birth, Gender, Address, Institution, Status, Created Date, Updated Date

## 🚀 Usage:
1. Navigate to Institutions or Students page
2. Apply any filters you want (search, status, etc.)
3. Click "Export" button
4. Choose CSV or Excel format
5. File will automatically download with filtered data