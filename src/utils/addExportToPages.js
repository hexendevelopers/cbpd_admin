// This is a utility script to add export functionality to institutions and students pages
// Run this manually to update the pages

const fs = require('fs');
const path = require('path');

// Export functions to add to pages
const exportFunctions = `
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const queryParams = new URLSearchParams({
        format,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.institutionId && { institutionId: filters.institutionId }),
      });

      if (format === 'csv') {
        const response = await fetch(\`/api/admin/\${exportEndpoint}/export?\${queryParams}\`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = \`\${exportEndpoint}_export_\${new Date().toISOString().split('T')[0]}.csv\`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          notification.success({
            message: 'Export Successful',
            description: \`\${exportEndpoint.charAt(0).toUpperCase() + exportEndpoint.slice(1)} data exported to CSV successfully\`,
            placement: 'topRight',
          });
        } else {
          throw new Error('Export failed');
        }
      } else {
        const response = await fetch(\`/api/admin/\${exportEndpoint}/export?\${queryParams}\`);
        if (response.ok) {
          const data = await response.json();
          const { exportToExcel } = await import('@/utils/exportUtils');
          exportToExcel(data.data, data.filename);
          
          notification.success({
            message: 'Export Successful',
            description: \`\${exportEndpoint.charAt(0).toUpperCase() + exportEndpoint.slice(1)} data exported to Excel successfully\`,
            placement: 'topRight',
          });
        } else {
          throw new Error('Export failed');
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      notification.error({
        message: 'Export Failed',
        description: \`Failed to export \${exportEndpoint} data. Please try again.\`,
        placement: 'topRight',
      });
    }
  };
`;

console.log('Export functions ready to be added to pages:');
console.log(exportFunctions);
console.log('\nAlso add this import:');
console.log('import ExportButton from "@/components/ExportButton";');
console.log('\nAnd replace export buttons with:');
console.log('<ExportButton onExport={handleExport} />');