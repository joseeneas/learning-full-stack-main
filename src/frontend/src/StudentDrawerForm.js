/**
 * StudentDrawerForm component displays a drawer with a form to add or edit student information.
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {boolean} props.showDrawer - Controls the visibility of the drawer
 * @param {Function} props.setShowDrawer - Function to toggle the drawer visibility
 * @param {Function} props.fetchStudents - Function to refresh the student list after submission
 * @param {Object} [props.initialValues] - Initial values for editing an existing student. If provided, the form operates in edit mode
 * @param {string} [props.initialValues.id] - Student ID (used as form key)
 * @param {string} [props.initialValues.name] - Student name
 * @param {string} [props.initialValues.email] - Student email
 * @param {string} [props.initialValues.gender] - Student gender (MALE, FEMALE, or OTHER)
 * @param {Function} [props.onSubmit] - Custom submit function. If not provided, defaults to addNewStudent
 * @returns {JSX.Element} A drawer component containing a form for student data entry
 * 
 * @example
 * // Adding a new student
 * <StudentDrawerForm 
 *   showDrawer={true} 
 *   setShowDrawer={setShowDrawer}
 *   fetchStudents={fetchStudents}
 * />
 * 
 * @example
 * // Editing an existing student
 * <StudentDrawerForm 
 *   showDrawer={true} 
 *   setShowDrawer={setShowDrawer}
 *   fetchStudents={fetchStudents}
 *   initialValues={{id: 1, name: "John", email: "john@example.com", gender: "MALE"}}
 *   onSubmit={updateStudent}
 * />
 */
import { useState } from 'react';
import { addNewStudent } from './Client';
import { successNotification, errorNotification } from './Notification';
import {
    Drawer,
    Input,
    Col,
    Select,
    Form,
    Row,
    Spin,
    Button, 
} from 'antd';
import {
    LoadingOutlined
} from '@ant-design/icons';

const { Option } = Select;
const antIcon    = <LoadingOutlined style={{ fontSize: 24 }} spin />;

// This is the right vertical menu with form to add new students
// Functional component StudentDrawerForm with showDrawer, setShowDrawer, and fetchStudents properties
function StudentDrawerForm({ showDrawer, setShowDrawer, fetchStudents, initialValues, onSubmit }) {

    const onCLose                     = () => setShowDrawer(false);
    const [submitting, setSubmitting] = useState(false);
    // Handle form submission
    const onFinish = student => {
        setSubmitting(true);
        console.log(JSON.stringify(student, null, 2))
        const submitFn = onSubmit ? onSubmit : addNewStudent;
        submitFn(student)
            .then(() => {
                console.log("student added/updated successfully");
                onCLose();
                successNotification("Success", `${student.name} saved successfully`)
                fetchStudents();
            }).catch(async (err) => {
                const res = err && err.response;
                console.log(res);
                if (!res) {
                    errorNotification("Network error", "Request failed or was blocked", "bottomLeft");
                } else {
                    try {
                        const ct = res.headers.get && res.headers.get('content-type');
                        if (ct && ct.includes('application/json')) {
                            const data = await res.json();
                            errorNotification(
                                "There was an issue",
                                `${data.message ?? 'Request failed'} [statusCode ${res.status}]`,
                                "bottomLeft");
                        } else {
                            const text = await res.text();
                            errorNotification(
                                "There was an issue",
                                `${(text || 'Non-JSON error').slice(0,200)} [statusCode ${res.status}]`,
                                "bottomLeft");
                        }
                    } catch (_e) {
                        errorNotification("There was an issue", `Request failed [statusCode ${res.status}]`, "bottomLeft");
                    }
                }
            }).finally(() => {
                setSubmitting(false);
            })
    };
    // Handle form submission failure
    const onFinishFailed = errorInfo => {
        alert(JSON.stringify(errorInfo, null, 2));
    };
    // Render the drawer with the student form
    return (
        <Drawer
            title={initialValues ? "Edit student" : "Create new student"}
            width={720}
            onClose={onCLose}
            open={showDrawer}
            destroyOnClose
            bodyStyle={{ paddingBottom: 80 }}
            footer={
                <div
                    style={{
                        textAlign: 'right',
                    }}>
                    <Button onClick={onCLose} style={{ marginRight: 8 }}>
                        Cancel
                    </Button>
                </div>}>
            <Form layout="vertical"
                key={initialValues ? initialValues.id : 'create'}
                initialValues={initialValues}
                onFinishFailed={onFinishFailed}
                onFinish={onFinish}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="Name"
                            rules={[{ required: true, message: 'Please enter student name' }]}>
                            <Input placeholder="Please enter student name" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[{ required: true, message: 'Please enter student email' }]}>
                            <Input placeholder="Please enter student email" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="gender"
                            label="gender"
                            rules={[{ required: true, message: 'Please select a gender' }]}>
                            <Select placeholder="Please select a gender">
                                <Option value="MALE">MALE</Option>
                                <Option value="FEMALE">FEMALE</Option>
                                <Option value="OTHER">OTHER</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Form.Item >
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    {submitting && <Spin indicator={antIcon} />}
                </Row>
            </Form>
        </Drawer>
    )
}

export default StudentDrawerForm;