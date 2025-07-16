const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'src/app/admin/page.tsx');
let content = fs.readFileSync(dashboardPath, 'utf8');

// Add admin management button to header
content = content.replace(
  /Students\n          <\/Button>/,
  `Students
          </Button>
          <Button 
            icon={<UserOutlined />}
            onClick={() => router.push("/admin/admins")}
          >
            Admins`
);

// Add admin management quick action
content = content.replace(
  /(Comprehensive institution management.*?\n.*?<\/Text>\n.*?<\/Card>)/s,
  `$1
            </Col>
            
            <Col xs={24} sm={8}>
              <Card 
                hoverable
                style={{ textAlign: "center" }}
                onClick={() => router.push("/admin/admins")}
              >
                <UserOutlined style={{ fontSize: 32, color: "#722ed1", marginBottom: 16 }} />
                <Title level={4}>Admin Management</Title>
                <Text type="secondary">
                  Manage admin users and permissions
                </Text>
              </Card>`
);

fs.writeFileSync(dashboardPath, content);
console.log('Dashboard updated successfully!');