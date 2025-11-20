/*
  App.jsx
  Main App component that manages student data and renders the application layout.
*/
import { deleteStudent, getStudentsPage, updateStudent, addNewStudent, getGenderStats, getStudentsSearch, getDomainStats, getNationalityStats, getCollegeStats } from "./Client";
import StudentDrawerForm                                from "./StudentDrawerForm.jsx";
import { errorNotification, successNotification }       from "./Notification";
import './App.css';
import React, { useState, useEffect, useMemo } from "react";
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
import {
  ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis,
  Legend,
  Tooltip as RechartsTooltip
} from 'recharts';
import useStudentStats from './hooks/useStudentStats';
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
const { Header, Content, Footer, Sider } = Layout;
/**
 * Navigation menu items configuration for the application sidebar.
 * Defines the hierarchical structure of menu items with their keys, labels, icons, and sub-items.
 * 
 * @type {Array<Object>}
 * @property {string} key - Unique identifier for the menu item
 * @property {string} label - Display text for the menu item
 * @property {React.ReactElement} icon - Ant Design icon component
 * @property {Array<Object>} [children] - Optional array of sub-menu items with the same structure
 * 
 * @example
 *  Top-level items include:
 *  - Dashboard: Main analytics view
 *  - Students: Student management with add, update, and delete operations
 *  - Reports: Reporting functionality
 *  - Files: Import/export operations for student data
 */
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
/**
 * Creates a menu item object with the specified properties.
 * 
 * @param {React.ReactNode} label - The display text or element for the menu item
 * @param {string} key - A unique identifier for the menu item
 * @param {React.ReactNode} icon - The icon element to display alongside the label
 * @param {Array} children - An array of child menu items for nested menus
 * @returns {Object} An object containing key, icon, children, and label properties
 */
function getItem(label, key, icon, children) { return { key, icon, children, label } }
/**
 * Renders an avatar component that displays initials derived from a name.
 * 
 * @component
 * @param {Object} props - The component props
 * @param {string} props.name - The name to extract initials from. First and last characters are used.
 * @returns {JSX.Element} An Avatar component displaying either:
 *   - A UserOutlined icon if the name is empty/invalid
 *   - The first and last characters of the name as initials
 * 
 * @example
 * Returns avatar with "JD"
 * <TheAvatar name="John Doe" />
 * 
 * @example
 * Returns avatar with user icon
 * <TheAvatar name="" />
 */
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
/**
 * Array of predefined colors used for domain visualization or categorization.
 * Contains 10 distinct hex color codes for visual differentiation.
 * 
 * @type {string[]}
 * @constant
 * 
 * Colors include:
 * - Blue (#1677ff)
 * - Cyan (#13c2c2)
 * - Magenta (#eb2f96)
 * - Orange (#faad14)
 * - Purple (#722ed1)
 * - Green (#52c41a)
 * - Red-Orange (#fa541c)
 * - Dark Blue (#2f54eb)
 * - Lime (#a0d911)
 * - Light Cyan (#5cdbd3)
 */
const DOMAIN_COLORS = ['#1677ff', '#13c2c2', '#eb2f96', '#faad14', '#722ed1', '#52c41a', '#fa541c', '#2f54eb', '#a0d911', '#5cdbd3'];
/**
 * A component that displays a horizontal legend for domains with color indicators.
 * 
 * @param {Object} props - The component props
 * @param {Array<{domain: string}>} props.items - An array of items where each item contains a domain property.
 *                                                 Colors are assigned cyclically from DOMAIN_COLORS based on array index.
 * @returns {JSX.Element} A flex container with colored squares and domain labels
 */
const DomainLegend = ({ items }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 12}}>
    {items.map((it, idx) => (
      <span key={it.domain} style={{ display: 'flex', alignItems: 'center', marginRight: 12 }}>
        <span style={{ width: 10, height: 10, backgroundColor: DOMAIN_COLORS[idx % DOMAIN_COLORS.length], display: 'inline-block', marginRight: 6, borderRadius: 2 }} />
        <span style={{ fontSize: 10 }}>{it.domain}</span>
      </span>
    ))}
  </div>
);
/**
 * Removes a student from the system by their ID.
 * 
 * @param {string|number} studentId - The unique identifier of the student to be deleted
 * @param {Function} callback - A callback function to be executed after successful deletion
 * @returns {void}
 * 
 * @description
 * This function performs the following actions:
 * - Calls the deleteStudent API with the provided studentId
 * - On success: displays a success notification and executes the callback function
 * - On error: logs the error response, parses the error details, and displays an error notification
 *   with the error message, status code, and status text
 */
const removeStudent = (studentId, callback) => {
  deleteStudent(studentId).then(() => {
    successNotification("Student deleted", `Student with ${studentId} was deleted`);
    callback();
  }).catch(err => {
    console.log(err.response);
    err.response.json().then(res => {
      console.log(res);
      errorNotification(
        "There was an issue",
        `${res.message} [statusCode ${res.status}] [${res.statusText}]`
      )
    })
  });
}
/**
 * Generates the column configuration for the students table.
 * 
 * @param {Function} fetchStudents - Callback function to refresh the students list after an operation
 * @param {Function} openEdit      - Callback function to open the edit modal/form with the selected student data
 * @returns {Array<Object>}        - Array of column configuration objects for Ant Design Table component
 * 
 * @property {string} title      - The column header text
 * @property {string} dataIndex  - The key to access data in the student object
 * @property {string} key        - Unique identifier for the column
 * @property {Function} [render] - Optional custom render function for the column cell
 * 
 * @example
 * const studentColumns = columns(fetchStudents, handleEdit);
 * <Table columns={studentColumns} dataSource={students} />
 */
const columns = (fetchStudents, openEdit) => [
  {
    title     : 'Initials',
    dataIndex : 'avatar',
    key       : 'avatar',
    render    : (_text, student) => <TheAvatar name={student.name} />
  },
  { title: 'Id', dataIndex: 'id', key: 'id' },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Gender', dataIndex: 'gender', key: 'gender' },
  { title: 'Nationality', dataIndex: 'nationality', key: 'nationality' },
  { title: 'College', dataIndex: 'college', key: 'college' },
  { title: 'Major', dataIndex: 'major', key: 'major' },
  { title: 'Minor', dataIndex: 'minor', key: 'minor' },
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
const antIcon = <LoadingOutlined style={{ fontSize: 24, }} spin />;
/**
 * Main application component that manages the student management system.
 * 
 * Provides a comprehensive interface for:
 * - Viewing and managing students (CRUD operations)
 * - Dashboard with statistics and visualizations (gender distribution, email domains)
 * - Reports with filtering capabilities (by gender and email domain)
 * - CSV import/export functionality
 * - Team management placeholder
 * 
 * @component
 * @returns {JSX.Element} The main application layout with sidebar navigation and dynamic content
 * 
 * @description
 * Features include:
 * - Paginated student table with inline editing
 * - Real-time statistics (gender distribution, top email domains)
 * - Interactive charts (pie chart for gender, bar chart for domains)
 * - CSV export/import for bulk operations
 * - Advanced filtering and search in reports
 * - Responsive layout with collapsible sidebar
 * - Local storage persistence for page size preferences
 * 
 * State Management:
 * @state {boolean} collapsed                - Sidebar collapse state
 * @state {string} selectedMenuKey           - Currently selected menu item
 * @state {boolean} showDrawer               - Student form drawer visibility
 * @state {Object|null} editingStudent       - Student being edited
 * @state {Array} students                   - List of students for current page
 * @state {boolean} fetching                 - Loading state for student data
 * @state {number} totalStudents             - Total count of students
 * @state {number} currentPage               - Current page number
 * @state {Object|null} genderStats          - Gender distribution statistics
 * @state {Array|null} domainStats           - Email domain statistics
 * @state {Array} reportData                 - Report table data
 * @state {boolean} reportFetching           - Loading state for reports
 * @state {number} reportTotal               - Total report entries
 * @state {number} reportPage                - Current report page
 * @state {number} reportPageSize            - Report page size
 * @state {string|undefined} reportGender    - Report gender filter
 * @state {string} reportDomain              - Report domain filter
 * @state {number} pageSize                  - Students table page size
 */
/**
 * Main application component that provides a full-featured student management system.
 * 
 * Features:
 * - Dashboard with statistics and visualizations (gender distribution, email domains)
 * - Student CRUD operations (Create, Read, Update, Delete)
 * - Paginated student table with customizable page sizes
 * - Student report generation with filtering by gender and email domain
 * - CSV export and import functionality for bulk student data management
 * - Responsive layout with collapsible sidebar navigation
 * - Real-time statistics including gender counts and top email domains
 * 
 * The component manages multiple views through menu navigation:
 * - Dashboard: Overview with charts and statistics
 * - Students: Table view with add/update/delete modes
 * - Files: CSV import/export operations
 * - Reports: Filtered student reports with export capability
 * 
 * @component
 * @returns {JSX.Element} The main application layout with sidebar navigation and dynamic content area
 */
/**
 * Main application component that manages student data, reports, and navigation.
 * 
 * Provides a comprehensive interface for:
 * - Viewing and managing students (CRUD operations)
 * - Dashboard with statistics (gender distribution, email domains)
 * - Report generation with filtering capabilities
 * - CSV import/export functionality
 * - Navigation between different sections (Dashboard, Students, Teams, Files, Reports)
 * 
 * @component
 * @returns {JSX.Element} The main application layout with sidebar navigation and content area
 * 
 * @description
 * This component handles:
 * - Student pagination with configurable page sizes
 * - Real-time statistics for gender and email domain distribution
 * - Interactive charts (pie charts for gender, bar charts for domains)
 * - Drawer-based forms for adding/editing students
 * - CSV export/import with proper field escaping
 * - Report filtering by gender and email domain
 * - Responsive layout with collapsible sidebar
 * 
 * State management includes:
 * - Student list with pagination
 * - Statistics (gender and domain)
 * - Report data with filtering
 * - UI states (drawer visibility, selected menu, editing mode)
 * - Page size persistence in localStorage
 */
function App() {
  useEffect(() => {
    console.log("Component is mounted");
    fetchStudents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [collapsed      , setCollapsed]       = useState(false);
  const [selectedMenuKey, setSelectedMenuKey] = useState('students');
  const [showDrawer     , setShowDrawer]      = useState(false);
  const [editingStudent , setEditingStudent]  = useState(null);
  const [students       , setStudents]        = useState([]);
  const [fetching       , setFetching]        = useState(true);
  const [totalStudents  , setTotalStudents]   = useState(0);
  const [currentPage    , setCurrentPage]     = useState(1);
    const [genderStats    , setGenderStats     ] = useState(null);
    const [domainStats    , setDomainStats     ] = useState(null);
    const [nationalityStats, setNationalityStats] = useState(null);
    const [collegeStats   , setCollegeStats    ] = useState(null);
  const [reportData     , setReportData]      = useState([]);
  const [reportFetching , setReportFetching]  = useState(false);
  const [reportTotal    , setReportTotal]     = useState(0);
  const [reportPage     , setReportPage]      = useState(1);
  const [reportPageSize , setReportPageSize]  = useState(20);
  const [reportGender   , setReportGender]    = useState();
  const [reportDomain   , setReportDomain]    = useState('');
  const stats = useStudentStats(students);
  /**
   * Computes the top 10 domains with their counts and percentages.
   *
   * Accepts domain data in two formats:
   * - Array of strings: counts occurrences and converts to {domain, count} objects
   * - Array of objects: expects {domain, count, percentage?} structure
   *
   * Calculates percentages based on totalStudents if available, otherwise uses the sum of counts.
   * Results are sorted by count (descending) and then alphabetically by domain name.
   *
   * @type {Array<{domain: string, count: number, percentage: number}>}
   * @returns {Array<{domain: string, count: number, percentage: number}>} Top 10 domains with their statistics
   */
  const topDomains = useMemo(() => {
    const raw = (Array.isArray(domainStats) && domainStats.length) ? domainStats : stats?.domains;
    if (!Array.isArray(raw) || raw.length === 0) return [];
    // Helper to ensure entries are {domain, count}
    let entries = [];
    if (typeof raw[0] === 'string') {
      const counts = raw.reduce((map, d) => {
        if (!d) return map;
        map[d] = (map[d] || 0) + 1;
        return map;
      }, Object.create(null));
      entries = Object.entries(counts).map(([domain, count]) => ({ domain, count }));
    } else {
      entries = raw.map(it => ({ domain: it.domain, count: it.count ?? 0, percentage: it.percentage }));
    }
    const totalForPercent = entries.reduce((s, e) => s + (e.count || 0), 0) || 1;
    entries.sort((a, b) => (b.count || 0) - (a.count || 0) || (a.domain || '').localeCompare(b.domain || ''));
    return entries.slice(0, 10).map(e => ({
      ...e,
      percentage: e.percentage != null ? e.percentage : +( (totalStudents ? (e.count * 100 / totalStudents) : (e.count * 100 / totalForPercent)) ).toFixed(1)
    }));
  }, [stats?.domains, totalStudents, domainStats]);
  /**
   * Navigates to the reports section with a specific domain filter applied.
   * Clears the gender filter and sets the selected menu to 'reports'.
   * 
   * @param {string} domain - The domain to filter reports by. If falsy, the function returns early without making changes.
   * @returns {void}
   */
  const jumpToReportsWithDomain = (domain) => {
    if (!domain) return;
    setReportDomain(domain);
    setReportGender(undefined);
    setSelectedMenuKey('reports');
  };
  useEffect(() => {
    if (selectedMenuKey === 'students-add') {
      setEditingStudent(null);
      setShowDrawer(true);
    } else if (selectedMenuKey === 'students-update') {
      setShowDrawer(!!editingStudent);
    } else if (selectedMenuKey === 'students-delete') {
      setShowDrawer(false);
      setEditingStudent(null);
    }
  }, [selectedMenuKey, editingStudent]);
  const [pageSize, setPageSize] = useState(() => {
    const stored = localStorage.getItem('students.pageSize');
    return stored ? Number(stored) : 50;
  });
  useEffect(() => { localStorage.setItem('students.pageSize', String(pageSize)); }, [pageSize]);
  const refreshGenderStats = () => {
    getGenderStats()
      .then(r => r.json())
      .then(data => setGenderStats(data))
      .catch(err => { console.log(err.response); });
  };
  const refreshDomainStats = () => {
    getDomainStats()
      .then(r => r.json())
      .then(data => setDomainStats(data))
      .catch(err => { console.log(err.response); setDomainStats(null); });
  };
  const refreshNationalityStats = () => {
    getNationalityStats()
      .then(r => r.json())
      .then(data => setNationalityStats(data))
      .catch(err => { console.log(err.response); setNationalityStats(null); });
  };
  const refreshCollegeStats = () => {
    getCollegeStats()
      .then(r => r.json())
      .then(data => setCollegeStats(data))
      .catch(err => { console.log(err.response); setCollegeStats(null); });
  };
  const fetchStudents = (page = currentPage, size = pageSize) => {
    setFetching(true);
    getStudentsPage(page - 1, size)
      .then(r => r.json())
      .then(data => {
        setStudents(data.content);
        setTotalStudents(data.totalElements);
        setCurrentPage(data.number + 1);
        refreshGenderStats();
        refreshDomainStats();
        refreshNationalityStats();
        refreshCollegeStats();
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
      .catch(err => { console.log(err.response); })
      .finally(() => setReportFetching(false));
  };
  useEffect(() => {
    if (selectedMenuKey === 'reports') { fetchReport(1, reportPageSize); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMenuKey, reportPageSize]);
  const reportColumns = [
    { title: 'Id', dataIndex: 'id', key: 'id', width: 90, sorter: (a,b) => a.id - b.id },
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a,b) => (a.name||'').localeCompare(b.name||'') },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (text) => <a href={`mailto:${text}`}>{text}</a>, sorter: (a,b) => (a.email||'').localeCompare(b.email||'') },
    { title: 'Gender', dataIndex: 'gender', key: 'gender', render: (g) => {
        const color = g === 'Male' ? 'blue' : (g === 'Female' ? 'magenta' : 'orange');
        return <Tag color={color}>{g}</Tag>
      }
    },
    { title: 'Nationality', dataIndex: 'nationality', key: 'nationality' },
    { title: 'College', dataIndex: 'college', key: 'college' },
    { title: 'Major', dataIndex: 'major', key: 'major' },
    { title: 'Minor', dataIndex: 'minor', key: 'minor' },
  ];
  const renderStudentsTable = () => {
    if (fetching) { return <Spin indicator={antIcon} />; }
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
    return false;
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
                  <Statistic title="Email Domains" value={domainStats?.length || stats.domains.length} />
                </Card>
              </Col>
            </Row>
            <Divider orientation="left">Visualizations</Divider>
            <Row gutter={[16,16]}>
              <Col xs={24} md={12}>
                <Card size="small" title="Gender Distribution" styles={{ body: { height: 320 } }}>
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
                <Card size="small" title="Top Email Domains" styles={{ body: { height: 320 } }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Showing top 10 email domains by occurrence (count)</div>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topDomains} margin={{ bottom: 56, left: 8, right: 8, top: 12 }}>
                      <XAxis
                        dataKey="domain"
                        interval={0}
                        angle={-35}
                        textAnchor="end"
                        height={56}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis allowDecimals={false} />
                      <RechartsTooltip formatter={(value) => [value, 'Count']} labelFormatter={(label) => `Domain: ${label}`} />
                      <Legend verticalAlign="top" align="left" content={() => <DomainLegend items={topDomains} />} />
                      <Bar dataKey="count" name="Top Domains" onClick={(data) => jumpToReportsWithDomain(data && data.payload && data.payload.domain)} cursor="pointer">
                        {topDomains.map((entry, index) => (
                          <Cell key={entry.domain} fill={DOMAIN_COLORS[index % DOMAIN_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
            <Row gutter={[16,16]}>
              <Col xs={24} md={12}>
                <Card size="small" title="Top 10 Nationalities" styles={{ body: { height: 320 } }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Student distribution by nationality</div>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(nationalityStats || []).slice(0, 10).map(item => ({ name: item.domain, count: item.count }))} margin={{ bottom: 56, left: 8, right: 8, top: 12 }}>
                      <XAxis
                        dataKey="name"
                        interval={0}
                        angle={-35}
                        textAnchor="end"
                        height={56}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis allowDecimals={false} />
                      <RechartsTooltip formatter={(value) => [value, 'Students']} labelFormatter={(label) => `Nationality: ${label}`} />
                      <Legend verticalAlign="top" align="left" content={() => null} />
                      <Bar dataKey="count" name="Nationalities" fill="#52c41a">
                        {(nationalityStats || []).slice(0, 10).map((entry, index) => (
                          <Cell key={entry.domain} fill={DOMAIN_COLORS[index % DOMAIN_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title="Top 10 Colleges" styles={{ body: { height: 320 } }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Student distribution by college</div>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(collegeStats || []).slice(0, 10).map(item => ({ name: item.domain, count: item.count }))} margin={{ bottom: 56, left: 8, right: 8, top: 12 }}>
                      <XAxis
                        dataKey="name"
                        interval={0}
                        angle={-35}
                        textAnchor="end"
                        height={56}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis allowDecimals={false} />
                      <RechartsTooltip formatter={(value) => [value, 'Students']} labelFormatter={(label) => `College: ${label}`} />
                      <Legend verticalAlign="top" align="left" content={() => null} />
                      <Bar dataKey="count" name="Colleges" fill="#722ed1">
                        {(collegeStats || []).slice(0, 10).map((entry, index) => (
                          <Cell key={entry.domain} fill={DOMAIN_COLORS[index % DOMAIN_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
            <Divider orientation="left">Top Email Domains</Divider>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Showing top 10 email domains by occurrence (count)</div>
            <List
              size="small"
              bordered
              dataSource={topDomains}
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
      case 'students-add':
      case 'students-update':
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
        return (
            <>
                <h2 style={{marginBottom: 16}}>Reports</h2>
                <Card size="small" title="Student Report" style={{marginBottom: 16}}>
                    <Form layout="inline" onFinish={() => fetchReport(1, reportPageSize)}>
                        <Form.Item label="Gender">
                            <Select
                                options={[
                                    {label: "MALE", value: "MALE"},
                                    {label: "FEMALE", value: "FEMALE"},
                                    {label: "OTHER", value: "OTHER"},
                                ]}
                                placeholder="Any"
                                style={{width: 160}}
                                value={reportGender}
                                onChange={(val) => setReportGender(val)}
                                allowClear
                            />
                        </Form.Item>
                        <Form.Item label="Domain">
                            <Input
                                placeholder="e.g. gmail.com"
                                style={{width: 220}}
                                value={reportDomain}
                                onChange={(e) => setReportDomain(e.target.value)}
                                allowClear
                            />
                        </Form.Item>
                        <Form.Item>
                            <Space>
                                <Button type="primary" htmlType="submit">
                                    Apply
                                </Button>
                                <Button
                                    onClick={() => {
                                        setReportGender(undefined);
                                        setReportDomain("");
                                        fetchReport(1, reportPageSize);
                                    }}
                                >
                                    Reset
                                </Button>
                                <Button
                                    htmlType="button"
                                    icon={<DownloadOutlined />}
                                    onClick={() => {
                                        const params = new URLSearchParams({sortBy: "id", direction: "asc"});
                                        if (reportGender) params.set("gender", String(reportGender).toUpperCase());
                                        if (reportDomain && reportDomain.trim().length)
                                            params.set("domain", reportDomain.trim());
                                        const url = `api/v1/students/export?${params.toString()}`;
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = `students-report-${new Date().toISOString().slice(0, 10)}.csv`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                    }}
                                >
                                    Export CSV
                                </Button>
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
                            pageSizeOptions: ["10", "20", "50", "100", "200"],
                            onChange: (page, size) => {
                                setReportPage(page);
                                setReportPageSize(size);
                                fetchReport(page, size);
                            },
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                        }}
                        scroll={{y: 500, x: true}}
                    />
                </Card>
            </>
        );
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
  return (
    <Layout style={{ minHeight: '100vh' }}>
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
        <Header className="site-layout-background" style={{ padding: 0 }} />
        <Content style={{ margin: '0 16px' }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            { renderContent() }
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }} >
          <Divider></Divider>
          <Image width={75} src="logo192.png" />
          {' '}Find more about React and Ant Design at{' '}
            <a rel="noopener noreferrer" target="_blank" href="http://www.reactjs.org">ReactJS Official Website</a>
        </Footer>
      </Layout>
    </Layout>
  )
}
export default App;
