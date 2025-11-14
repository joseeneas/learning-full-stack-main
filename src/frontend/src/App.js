/*
  App.js
  Main App component that manages student data and renders the application layout.
  It imports necessary components and functions, sets up state management, and defines the layout structure.
*/
// Custom functional components and functions
import { deleteStudent, getStudentsPage, updateStudent, addNewStudent, getGenderStats, getStudentsSearch } from "./Client";
import StudentDrawerForm                                from "./StudentDrawerForm";
import { errorNotification, successNotification }       from "./Notification";
// Styles
import './App.css';
// Functional components and hooks from React and Ant Design
// React hooks are used for state management and side effects
// React hooks UseState and UseEffect are imported from React library and used in the App component\
// to manage state and handle side effects such as data fetching.
// React hooks are functions that let you use state and other React features without writing a class.
// They allow you to "hook into" React state and lifecycle features from function components.
// React hooks were introduced in React 16.8 and have become a fundamental part of modern React development.
// They enable developers to write cleaner, more concise, and reusable code by leveraging functional programming concepts.
// Here are brief explanations of the two hooks used:
// 1. useState: This hook allows you to add state to functional components. It returns an array with two elements:
//    the current state value and a function to update that state. You can use useState to manage local component state.
// 2. useEffect: This hook lets you perform side effects in functional components. It takes a function as an argument
//    that contains the side effect logic, such as data fetching, subscriptions, or manually changing the DOM.
//    You can also specify dependencies to control when the effect runs. useEffect is similar to lifecycle methods
//    like componentDidMount, componentDidUpdate, and componentWillUnmount in class components.
import React, { useState, useEffect } from "react";
// Ant Design components and hooks
// Ant Design is a popular React UI library that provides a wide range of pre-designed components and hooks
// for building user interfaces. It follows the Ant Design specification and offers a consistent and
// visually appealing design system.
// Ant Design components are built using React and can be easily integrated into React applications.
// They provide a set of ready-to-use UI elements such as buttons, forms, tables, modals, and more,
// which can be customized and styled according to the application's requirements.
// Ant Design hooks are utility functions provided by the Ant Design library that allow developers
// to manage component state, handle events, and perform other common tasks in a more convenient way.
// These hooks are designed to work seamlessly with Ant Design components and enhance their functionality.
import {
  Layout,     Menu, Table,
  Spin,       Empty,
  Button,     Badge,
  Tag,        Avatar,
  Space,      Popconfirm,
  Image,      Divider,
  Row,        Col,
  Card,       Statistic,
  List,       Tooltip,
  Upload,     Form,
  Input,      Select
} from "antd";
// Charts (recharts)
import {
  ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis,
  Legend,
  Tooltip as RechartsTooltip
} from 'recharts';
// Custom hook for student stats
import useStudentStats from './hooks/useStudentStats';
/**
 * Main App component that manages student data and renders the application layout.
 * 
 * This component provides a complete student management interface with the following features:
 * - Fetches and displays a list of students from the backend API
 * - Provides a collapsible sidebar navigation menu
 * - Includes a drawer form for adding/editing students
 * - Shows loading states and error notifications
 * - Displays students in a paginated table with add/delete functionality
 * - Handles empty states with appropriate UI feedback
 * 
 * @component
 * @returns {JSX.Element} The main application layout with header, sidebar, content area, and footer
 * 
 * @example
 * return (
 *   <App />
 * )
 */
// Import Icons from Ant Design Icons library
import {
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  LoadingOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  PrinterOutlined
} from '@ant-design/icons';
// Setup Main Layout left vertical sidebar/menu items 
// Destructure Layout components for easier access
// Layout components: Header, Content, Footer, Sider
// Header: The top section of the layout, typically used for branding, navigation, or user actions.
// Content: The main area of the layout where the primary content is displayed.
// Footer: The bottom section of the layout, often used for copyright information or additional links.
// Sider: The sidebar section of the layout, commonly used for navigation menus or additional content.  
const { Header, Content, Footer, Sider } = Layout;
// Menu items for the sidebar navigation menu (purposeful navigation)
// Each key maps to a content panel rendered in renderContent()
const items = [
  getItem('Dashboard', 'dashboard', <PieChartOutlined />),
  getItem('Students', 'students', <TeamOutlined />, [
    getItem('Add', 'students-add', <PlusOutlined />),
    getItem('Update', 'students-update', <UserOutlined />),
    getItem('Delete', 'students-delete', <DeleteOutlined />),
  ]),
  getItem('Reports', 'reports', <PrinterOutlined />),
  getItem('Files', 'files', <FileOutlined />, [
    getItem('Export Students CSV', 'files-export-students', <DownloadOutlined />),
    getItem('Import Students CSV', 'files-import-students', <UploadOutlined />),
  ]),
];
// Helper function to create menu items
// This function is used to create menu items for the sidebar navigation menu
// It takes four parameters: label, key, icon, and children
// label: The text label for the menu item
// key: A unique identifier for the menu item
// icon: An optional icon component to display alongside the label
// children: An optional array of sub-items for nested menus
// The function returns an object representing the menu item
// which can be used in the Menu component from Ant Design
// Example usage:
// const menuItem = getItem('Dashboard', 'dashboard', <DashboardOutlined />, []);
// This will create a menu item with the label "Dashboard", key "dashboard", and a dashboard icon
// The returned object can then be added to the items array for the Menu component
// This approach helps to keep the code organized and makes it easier to manage menu items
// throughout the application.
function getItem(label, key, icon, children) { return { key, icon, children, label } }
// Avatar component to show initials or default user icon
// This component is used to display an avatar for each student in the table
// It takes a single prop, name, which is the name of the student
// If the name is null, it displays a default user icon
// If the name is not null, it extracts the initials from the name
// and displays them in the avatar
const TheAvatar = ({ name }) => {
  const safe = typeof name === 'string' ? name.trim() : '';
  if (!safe) {
    return <Avatar icon={<UserOutlined />} />
  }
  const chars = Array.from(safe);
  const first = chars[0];
  const last = chars.length > 1 ? chars[chars.length - 1] : chars[0];
  return <Avatar>{`${first}${last}`}</Avatar>
}

// Palette and custom legend for domain chart
const DOMAIN_COLORS = ['#1677ff', '#13c2c2', '#eb2f96', '#faad14', '#722ed1', '#52c41a', '#fa541c', '#2f54eb', '#a0d911', '#5cdbd3'];
const DomainLegend = ({ items }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    {items.map((it, idx) => (
      <span key={it.domain} style={{ display: 'flex', alignItems: 'center', marginRight: 12 }}>
        <span style={{ width: 10, height: 10, backgroundColor: DOMAIN_COLORS[idx % DOMAIN_COLORS.length], display: 'inline-block', marginRight: 6, borderRadius: 2 }} />
        <span style={{ fontSize: 12 }}>{it.domain}</span>
      </span>
    ))}
  </div>
);
// Function to remove a student by ID
// This function is used to delete a student from the backend API
// It takes two parameters: studentId and callback
// studentId: The ID of the student to be deleted
// callback: A function to be called after the student is successfully deleted
// The function calls the deleteStudent function from the Client module
// If the deletion is successful, it shows a success notification
// and calls the callback function to refresh the student list
// If there is an error, it logs the error response and shows an error notification
// with the error message and status code
// Example usage:
// removeStudent(1, fetchStudents);
// This will delete the student with ID 1 and refresh the student list
// after successful deletion.
// Note: Make sure to handle the callback function appropriately
// to ensure the UI is updated after the deletion.
const removeStudent = (studentId, callback) => {
  deleteStudent(studentId).then(() => {
    successNotification("Student deleted", `Student with ${studentId} was deleted`);
    callback();
  }).catch(err => {
    console.log(err.response);
    // get error response as an object
    err.response.json().then(res => {
      console.log(res);
      errorNotification(
        "There was an issue",
        `${res.message} [statusCode ${res.status}] [${res.statusText}]`
      )
    })
  });
}
// Table columns configuration for displaying student data
// This configuration defines the columns for the Ant Design Table component
// used to display the list of students. Each column is represented as an object
// with properties such as title, dataIndex, key, and render.
// The columns include an avatar, ID, name, email, gender, and actions.
// The actions column includes buttons for deleting and editing students.
// The delete button is wrapped in a Popconfirm component to confirm the action
// before proceeding with the deletion.
// The render function for the avatar column uses the TheAvatar component
// to display the student's initials or a default icon.
// Example usage:
// <Table dataSource={students} columns={columns(fetchStudents)} />
// This will render a table with the defined columns and student data.
// The fetchStudents function is passed as a parameter to allow
// the actions column to refresh the student list after a deletion.
// Note: Make sure to handle the callback function appropriately
// to ensure the UI is updated after any actions are performed.
// The columns configuration is essential for defining how the student data
// is presented in the table and how user interactions are handled.
const columns = (fetchStudents, openEdit) => [
  {
    title     : 'Initials',
    dataIndex : 'avatar',
    key       : 'avatar',
    render    : (_text, student) => <TheAvatar name={student.name} />
  },
  {
    title     : 'Id',
    dataIndex : 'id',
    key       : 'id',
  },
  {
    title     : 'Name',
    dataIndex : 'name',
    key       : 'name',
  },
  {
    title     : 'Email',
    dataIndex : 'email',
    key       : 'email',
  },
  {
    title     : 'Gender',
    dataIndex : 'gender',
    key       : 'gender',
  },
  {
    title     : 'Actions',
    key       : 'actions',
    render    : (_text, student) =>
      <Space size={8}>
        <Popconfirm
          placement   = 'topRight'
          title       = {`Are you sure to delete ${student.name}`}
          description = {`This action will permanently remove ${student.name} from the student list. This cannot be undone.`}
          onConfirm   = {() => removeStudent(student.id, fetchStudents)}
          okText      = 'Yes'
          cancelText  = 'No'>
          <Button danger size="small">Delete</Button>
        </Popconfirm>
        <Button size="small" onClick={() => openEdit(student)}>Edit</Button>
      </Space>
  }
];
// Ant Design loading icon for spin indicator
// This icon is used to indicate loading states in the application
// It uses the LoadingOutlined icon from Ant Design Icons library
// and applies a spin animation to it.
// The icon is styled with a font size of 24 pixels.
// Example usage:
// <Spin indicator={antIcon} />
// This will render a spinning loading icon in the UI
// to indicate that data is being fetched or a process is ongoing.
// The antIcon constant is used in the renderStudentsTable function
// to show a loading spinner while student data is being fetched.
// Note: You can customize the style and size of the icon as needed
// to fit the design requirements of your application.
const antIcon = <LoadingOutlined style={{ fontSize: 24, }} spin />;
/**
 * Main App component that manages student data and renders the application layout.
 * 
 * This component provides a complete student management interface with the following features:
 * - Fetches and displays a list of students from the backend API
 * - Provides a collapsible sidebar navigation menu
 * - Includes a drawer form for adding/editing students
 * - Shows loading states and error notifications
 * - Displays students in a paginated table with add/delete functionality
 * - Handles empty states with appropriate UI feedback
 * 
 * @component
 * @returns {JSX.Element} The main application layout with header, sidebar, content area, and footer
 * 
 * @example
 * return (
 *   <App />
 * )
 */
function App() {
  // Fetch students only once when the component is loaded
  useEffect(() => {
    console.log("Component is mounted");
    fetchStudents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [collapsed      , setCollapsed]       = useState(false);      // Setup Main Layout left vertical sidebar/menu collapsed state
  const [selectedMenuKey, setSelectedMenuKey] = useState('students'); // Currently selected menu key
  const [showDrawer     , setShowDrawer]      = useState(false);      // Student Drawer Form vertical right sidebar/menu
  const [editingStudent , setEditingStudent]  = useState(null);       // Setup editing student state
  const [students       , setStudents]        = useState([]);         // Current page of students data
  const [fetching       , setFetching]        = useState(true);       // Spin indicator
  const [totalStudents  , setTotalStudents]   = useState(0);          // Total number of students (all pages)
  const [currentPage    , setCurrentPage]     = useState(1);          // 1-based for AntD
  const [genderStats    , setGenderStats]     = useState(null);       // Global gender counts
  // Reports view state (read-only table)
  const [reportData     , setReportData]      = useState([]);
  const [reportFetching , setReportFetching]  = useState(false);
  const [reportTotal    , setReportTotal]     = useState(0);
  const [reportPage     , setReportPage]      = useState(1);
  const [reportPageSize , setReportPageSize]  = useState(20);
  const [reportGender   , setReportGender]    = useState();
  const [reportDomain   , setReportDomain]    = useState('');
  // Derived dashboard statistics via custom hook
  const stats = useStudentStats(students);
  // Helper: jump to Reports with a prefilled domain filter
  const jumpToReportsWithDomain = (domain) => {
    if (!domain) return;
    setReportDomain(domain);
    setReportGender(undefined);
    setSelectedMenuKey('reports');
  };
  // Trigger existing features directly based on submenu selection
  useEffect(() => {
    if (selectedMenuKey === 'students-add') {
      // Open drawer in add mode
      setEditingStudent(null);
      setShowDrawer(true);
    } else if (selectedMenuKey === 'students-update') {
      // Wait for user row click; ensure drawer closed until selection
      setShowDrawer(!!editingStudent);
    } else if (selectedMenuKey === 'students-delete') {
      // Close drawer to reduce visual distraction in delete mode
      setShowDrawer(false);
      setEditingStudent(null);
    }
  }, [selectedMenuKey, editingStudent]);
  // Rows per page for the students table (persisted to localStorage)
  const [pageSize, setPageSize] = useState(() => {
    const stored = localStorage.getItem('students.pageSize');
    return stored ? Number(stored) : 50;
  });
  // Persist pageSize to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('students.pageSize', String(pageSize));
  }, [pageSize]);
  // Function to fetch all students from the backend API
  const fetchStudents = (page = currentPage, size = pageSize) => {
    setFetching(true);
    getStudentsPage(page - 1, size)
      .then(r => r.json())
      .then(data => {
        setStudents(data.content);
        setTotalStudents(data.totalElements);
        setCurrentPage(data.number + 1); // backend is 0-based
        // Refresh global gender stats alongside page fetch
        refreshGenderStats();
      }).catch(err => {
        console.log(err.response);
        err.response.json().then(res => {
          errorNotification(
            "There was an issue",
            `${res.message} [statusCode ${res.status}] [${res.error}]`
          );
        });
      }).finally(() => setFetching(false));
  };
  const refreshGenderStats = () => {
    getGenderStats()
      .then(r => r.json())
      .then(data => setGenderStats(data))
      .catch(err => {
        console.log(err.response);
      });
  };
  // Fetch report page
  const fetchReport = (page = reportPage, size = reportPageSize) => {
    setReportFetching(true);
    const genderParam = reportGender ? reportGender.toUpperCase() : undefined;
    const domainParam = reportDomain && reportDomain.trim().length ? reportDomain.trim() : undefined;
    const fetcher = (genderParam || domainParam)
      ? getStudentsSearch(page - 1, size, 'id', 'asc', genderParam, domainParam)
      : getStudentsPage(page - 1, size);
    fetcher
      .then(r => r.json())
      .then(data => {
        setReportData(data.content);
        setReportTotal(data.totalElements);
        setReportPage(data.number + 1);
      })
      .catch(err => {
        console.log(err.response);
      })
      .finally(() => setReportFetching(false));
  };
  // Auto-load report when user navigates to Reports
  useEffect(() => {
    if (selectedMenuKey === 'reports') {
      fetchReport(1, reportPageSize);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMenuKey, reportPageSize]);
  // Report table columns (read-only)
  const reportColumns = [
    { title: 'Id', dataIndex: 'id', key: 'id', width: 90, sorter: (a,b) => a.id - b.id },
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a,b) => (a.name||'').localeCompare(b.name||'') },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (text) => <a href={`mailto:${text}`}>{text}</a>, sorter: (a,b) => (a.email||'').localeCompare(b.email||'') },
    { title: 'Gender', dataIndex: 'gender', key: 'gender', render: (g) => {
        const color = g === 'Male' ? 'blue' : (g === 'Female' ? 'magenta' : 'orange');
        return <Tag color={color}>{g}</Tag>
      }
    },
  ];
  // Setup Table Students data
  const renderStudentsTable = () => {
    // Run spin while the data is fetching
    if (fetching) { return <Spin indicator={antIcon} />; }
    // Check for data if is empty show add new student button hide students table and show empty bucket icon
    if (students.length <= 0) {
      return <>
        <Button
          onClick={() => { setEditingStudent(null); setShowDrawer(true); }}
          type="primary" shape="round" icon={<PlusOutlined />} size="small">
          Add New Student
        </Button>
        <StudentDrawerForm
          showDrawer={showDrawer}
          setShowDrawer={setShowDrawer}
          fetchStudents={fetchStudents}
          initialValues={editingStudent ?? undefined}
          onSubmit={editingStudent ? (values) => updateStudent(editingStudent.id, values) : undefined}
        />
        <Empty />
      </>
    }
    return <>
      {/* Render Student Drawer Form component */}
      <StudentDrawerForm
        showDrawer    = {showDrawer}
        setShowDrawer ={ setShowDrawer}
        fetchStudents = {fetchStudents}
        initialValues = {editingStudent ?? undefined}
        onSubmit      = {editingStudent ? (values) => updateStudent(editingStudent.id, values) : undefined}
      />
      <Table
        dataSource={students}
        columns={columns(fetchStudents, (student) => { setEditingStudent(student); setShowDrawer(true); })}
        bordered
        onRow={(student) => ({
          onClick: () => {
            if (selectedMenuKey === 'students-update') {
              setEditingStudent(student);
              setShowDrawer(true);
            }
          }
        })}
        rowClassName={(student) => {
          const classes = [];
          if (selectedMenuKey === 'students-update') classes.push('clickable-row');
          if (editingStudent && selectedMenuKey === 'students-update' && editingStudent.id === student.id) classes.push('editing-row');
          return classes.join(' ');
        }}
        title={() =>
          <>
            <Tag style={{ marginLeft: "10px" }}>Number of students</Tag>
            <Badge
              count={totalStudents}
              showZero
              overflowCount={Number.MAX_SAFE_INTEGER}
              className="site-badge-count-4"
            />
            {selectedMenuKey === 'students-add' && <Tag color="green" style={{ marginLeft: 8 }}>Add Mode</Tag>}
            {selectedMenuKey === 'students-update' && <Tag color="blue" style={{ marginLeft: 8 }}>Update Mode - click a row or Edit button</Tag>}
            {selectedMenuKey === 'students-delete' && <Tag color="red" style={{ marginLeft: 8 }}>Delete Mode - use Delete buttons</Tag>}
            <br /><br />
            <Button
              // Call show drawer form right vertical menu
              onClick={() => { setEditingStudent(null); setShowDrawer(true); }}
              type="primary"  icon={<PlusOutlined />} size="small"
            > Add New Student </Button>
          </>
        }
        pagination={{
          current          : currentPage,
          pageSize,
          total            : totalStudents,
          showSizeChanger  : true,
          pageSizeOptions  : ['10', '20', '50', '100', '200'],
          onShowSizeChange : (_current, size) => { setPageSize(size); fetchStudents(1, size); },
          onChange         : (page, size) => { setCurrentPage(page); fetchStudents(page, size); },
          showTotal        : (total, range) => `${range[0]}-${range[1]} of ${total}`,
        }}
        scroll = {{ y: 500 }}
        rowKey ={(student) => student.id}
      />
    </>
  }
  // Render dynamic content based on selectedMenuKey
  // CSV export helper (handles simple escaping of commas, quotes, newlines)
  const exportStudentsCsv = () => {
    if (!students || students.length === 0) {
      errorNotification('No data', 'There are no students to export');
      return;
    }
    const headers = ['id','name','email','gender'];
    const escapeField = (f) => {
      if (f == null) return '';
      const s = String(f);
      if (/([",\n])/g.test(s)) {
        return '"' + s.replace(/"/g,'""') + '"';
      }
      return s;
    };
    const rows = students.map(stu => headers.map(h => escapeField(stu[h])).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    successNotification('Export complete', 'Students CSV downloaded');
  };
  // CSV import handler (expects headers id,name,email,gender; id optional)
  const handleCsvImport = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lines.length < 2) {
          errorNotification('Invalid CSV', 'Need at least a header and one data row');
          return;
        }
        const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g,''));
        const required = ['name','email','gender'];
        const missing = required.filter(r => !header.includes(r));
        if (missing.length) {
          errorNotification('Missing columns', `CSV missing required: ${missing.join(', ')}`);
          return;
        }
        const nameIdx = header.indexOf('name');
        const emailIdx = header.indexOf('email');
        const genderIdx = header.indexOf('gender');
        let importedCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const raw = lines[i];
          // Basic CSV split accounting for quoted commas
          const fields = [];
          let current = '';
          let inQuotes = false;
          for (let c = 0; c < raw.length; c++) {
            const ch = raw[c];
            if (ch === '"') {
              if (inQuotes && raw[c+1] === '"') { current += '"'; c++; } else { inQuotes = !inQuotes; }
            } else if (ch === ',' && !inQuotes) {
              fields.push(current); current = '';
            } else {
              current += ch;
            }
          }
          fields.push(current);
          const name = (fields[nameIdx] || '').trim();
          const email = (fields[emailIdx] || '').trim();
            const gender = (fields[genderIdx] || '').trim();
          if (!name || !email || !gender) { continue; }
          // Call API to add new student
          try {
            await addNewStudent({ name, email, gender });
            importedCount++;
          } catch (err) {
            console.log('Import row error', err);
          }
        }
        if (importedCount > 0) {
          successNotification('Import complete', `${importedCount} students imported`);
          fetchStudents();
        } else {
          errorNotification('Nothing imported', 'No valid rows processed');
        }
      } catch (ex) {
        console.error(ex);
        errorNotification('Import failed', 'Unexpected error parsing CSV');
      }
    };
    reader.readAsText(file);
    return false; // prevent auto upload
  };
  const renderContent = () => {
    switch (selectedMenuKey) {
      case 'dashboard':
        return <>
          <h2 style={{ marginBottom: 16 }}>Dashboard</h2>
          {fetching && <Spin style={{ marginBottom: 24 }} />}
          {!fetching && totalStudents === 0 && <Empty description="No students yet" />}
          {!fetching && totalStudents > 0 && <>
            <Row gutter={[16,16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card size="small">
                  <Statistic title="Total Students" value={totalStudents} />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card size="small">
                  <Statistic title="Distinct Genders" value={genderStats ? Object.values(genderStats).filter(v => v > 0).length : 0} />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card size="small">
                  <Statistic title="Email Domains" value={stats.domains.length} />
                </Card>
              </Col>
            </Row>
            <Divider orientation="left">Gender Distribution</Divider>
            <Row gutter={[16,16]}>
              <Col xs={24} md={12}>
                <Card size="small" bodyStyle={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={(genderStats ? Object.entries(genderStats) : []).map(([g,c]) => ({ name:g, value:c, percent: totalStudents ? +(c * 100 / totalStudents).toFixed(1) : 0 }))} dataKey="value" nameKey="name" outerRadius={80} label={(d) => `${d.name} ${d.percent}%`}>
                        {(genderStats ? Object.entries(genderStats) : []).map(([g], idx) => <Cell key={g} fill={['#1677ff','#13c2c2','#eb2f96','#faad14','#722ed1','#52c41a'][idx % 6]} />)}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title="Top Email Domains" bodyStyle={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.domains.slice(0,10)} margin={{ bottom: 56, left: 8, right: 8, top: 8 }}>
                      <XAxis
                        dataKey="domain"
                        interval={0}
                        angle={-35}
                        textAnchor="end"
                        height={56}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis allowDecimals={false} />
                      <RechartsTooltip formatter={(value) => [value, 'Count']} labelFormatter={(label) => `Domain: ${label}`} />
                      <Legend verticalAlign="top" align="left" content={() => <DomainLegend items={stats.domains.slice(0,10)} />} />
                      <Bar dataKey="count" name="Top Domains" onClick={(data) => jumpToReportsWithDomain(data && data.payload && data.payload.domain)} cursor="pointer">
                        {stats.domains.slice(0,10).map((entry, index) => (
                          <Cell key={entry.domain} fill={DOMAIN_COLORS[index % DOMAIN_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
            <Divider orientation="left">Genders</Divider>
            <Row gutter={[16,16]}>
              {(genderStats ? Object.entries(genderStats) : []).map(([g,count]) => (
                <Col key={g} xs={12} sm={8} md={6} lg={4}>
                  <Card size="small" bodyStyle={{ padding: 12 }}>
                    <Tag color="blue" style={{ marginBottom: 4 }}>{g}</Tag>
                    <Space direction="vertical" size={4}>
                      <Badge count={count} showZero />
                      <Tag color="geekblue" style={{ margin: 0 }}>{totalStudents ? +(count * 100 / totalStudents).toFixed(1) : 0}%</Tag>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
            <Divider orientation="left">Top Email Domains</Divider>
            <List
              size="small"
              bordered
              dataSource={stats.domains.slice(0, 10)}
              renderItem={item => (
                <List.Item onClick={() => jumpToReportsWithDomain(item.domain)} style={{ cursor: 'pointer' }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Tooltip title={item.domain}>
                      <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.domain}</span>
                    </Tooltip>
                    <Space size={8}>
                      <Badge count={item.count} showZero />
                      <Tag color="purple">{item.percentage}%</Tag>
                    </Space>
                  </Space>
                </List.Item>
              )}
            />
          </>}
        </>;
      case 'students':
        return renderStudentsTable();
      case 'students-add':
        return renderStudentsTable();
      case 'students-update':
        return renderStudentsTable();
      case 'students-delete':
        return renderStudentsTable();
      case 'teams':
        return <>
          <h2>Teams</h2>
          <p>Teams management placeholder. Implement CRUD for team entities here.</p>
        </>;
      case 'files':
        return <>
          <h2>Files</h2>
          <p>Select an action in the submenu (Export / Import CSV).</p>
        </>;
      case 'reports':
        return <>
          <h2 style={{ marginBottom: 16 }}>Reports</h2>
          <Card size="small" title="Student Report" style={{ marginBottom: 16 }}>
            <Form layout="inline" onFinish={() => fetchReport(1, reportPageSize)}>
              <Form.Item label="Gender">
                <Select
                  allowClear
                  placeholder="Any"
                  style={{ width: 160 }}
                  value={reportGender}
                  onChange={(val) => setReportGender(val)}
                  options={[
                    { label: 'Male', value: 'MALE' },
                    { label: 'Female', value: 'FEMALE' },
                    { label: 'Other', value: 'OTHER' },
                  ]}
                />
              </Form.Item>
              <Form.Item label="Domain">
                <Input
                  placeholder="e.g. gmail.com"
                  style={{ width: 220 }}
                  value={reportDomain}
                  onChange={(e) => setReportDomain(e.target.value)}
                  allowClear
                />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">Apply</Button>
                  <Button onClick={() => { setReportGender(undefined); setReportDomain(''); fetchReport(1, reportPageSize); }}>Reset</Button>
                  <Button htmlType="button" icon={<DownloadOutlined />} onClick={() => {
                    const params = new URLSearchParams({ sortBy: 'id', direction: 'asc' });
                    if (reportGender) params.set('gender', String(reportGender).toUpperCase());
                    if (reportDomain && reportDomain.trim().length) params.set('domain', reportDomain.trim());
                    const url = `api/v1/students/export?${params.toString()}`;
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `students-report-${new Date().toISOString().slice(0,10)}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}>Export CSV</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
          <Card size="small">
            <Table
              size="small"
              bordered
              sticky
              dataSource={reportData}
              columns={reportColumns}
              loading={reportFetching}
              rowKey={(s) => s.id}
              pagination={{
                current: reportPage,
                pageSize: reportPageSize,
                total: reportTotal,
                showSizeChanger: true,
                pageSizeOptions: ['10','20','50','100','200'],
                onChange: (page, size) => { setReportPage(page); setReportPageSize(size); fetchReport(page, size); },
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
              }}
              scroll={{ y: 500, x: true }}
            />
          </Card>
        </>;
      case 'files-export-students':
        return <>
          <h2>Export Students CSV</h2>
          <p>Download all current students as a CSV file.</p>
          <Button type="primary" icon={<DownloadOutlined />} onClick={exportStudentsCsv} disabled={students.length === 0}>Export CSV</Button>
          {students.length === 0 && <Tag color="red" style={{ marginLeft: 12 }}>No students to export</Tag>}
        </>;
      case 'files-import-students':
        return <>
          <h2>Import Students CSV</h2>
          <p>Upload a CSV with columns: name,email,gender (id optional).</p>
          <Upload
            accept=".csv,text/csv"
            beforeUpload={handleCsvImport}
            maxCount={1}
            showUploadList={{ showRemoveIcon: true }}
          >
            <Button icon={<UploadOutlined />}>Select CSV File</Button>
          </Upload>
          <Divider />
          <Tag color="blue">Tip</Tag> Example header: <code>name,email,gender</code>
        </>;
      default:
        return <Empty description="No content" />;
    }
  }
  // Main Layout
  return (
    <Layout
      style={{
        minHeight: '100vh',
      }}
    >
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="logo" />
        <Menu
          theme="dark"
          selectedKeys={[selectedMenuKey]}
          onSelect={({ key }) => setSelectedMenuKey(key)}
          mode="inline"
          items={items}
        />
      </Sider>
      <Layout className="site-layout">
        <Header
          className="site-layout-background"
          style={{
            padding: 0,
          }}
        />
        <Content
          style={{
            margin: '0 16px',
          }}
        >
          <div
            className="site-layout-background"
            style={{
              padding: 24,
              minHeight: 360,
            }}
          >
            { renderContent() }
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }} >
          <Divider></Divider>
          <Image
            width={75}
            src="logo192.png"
          />
          {' '}Find more about React and Ant Design at{' '}
            <a
                rel="noopener noreferrer"
                target="_blank"
                href="http://www.reactjs.org">
                ReactJS Official Website
            </a>
        </Footer>
      </Layout>
    </Layout>
  )
}
export default App;