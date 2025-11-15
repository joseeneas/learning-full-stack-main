/*
  App.jsx
  Main App component that manages student data and renders the application layout.
*/
import { deleteStudent, getStudentsPage, updateStudent, addNewStudent, getGenderStats, getStudentsSearch, getDomainStats } from "./Client";
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
function getItem(label, key, icon, children) { return { key, icon, children, label } }
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
  const [reportData     , setReportData]      = useState([]);
  const [reportFetching , setReportFetching]  = useState(false);
  const [reportTotal    , setReportTotal]     = useState(0);
  const [reportPage     , setReportPage]      = useState(1);
  const [reportPageSize , setReportPageSize]  = useState(20);
  const [reportGender   , setReportGender]    = useState();
  const [reportDomain   , setReportDomain]    = useState('');
  const stats = useStudentStats(students);
  // Compute a clear, deterministic "top domains" list:
  // - Accepts either an array of domain strings or aggregated objects {domain, count, percentage}
  // - Sorts by count desc, tie-break by domain name, returns top 10
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
      .catch(err => { console.log(err.response); });
  };
  const refreshDomainStats = () => {
    getDomainStats()
      .then(r => r.json())
      .then(data => setDomainStats(data))
      .catch(err => { console.log(err.response); setDomainStats(null); });
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
                  <Statistic title="Email Domains" value={stats.domains.length} />
                </Card>
              </Col>
            </Row>
            <Divider orientation="left">Gender and Domain Distribution</Divider>
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
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Showing top 10 email domains by occurrence (count)</div>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topDomains} margin={{ bottom: 56, left: 8, right: 8, top: 8 }}>
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
