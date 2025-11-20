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

function StudentDrawerForm({ showDrawer, setShowDrawer, fetchStudents, initialValues, onSubmit }) {
    const onCLose                     = () => setShowDrawer(false);
    const [submitting, setSubmitting] = useState(false);
    const onFinish = student => {
        setSubmitting(true);
        const submitFn = onSubmit ? onSubmit : addNewStudent;
        submitFn(student)
            .then(() => {
                onCLose();
                successNotification("Success", `${student.name} saved successfully`)
                fetchStudents();
            }).catch(err => {
                err.response.json().then(res => {
                    errorNotification(
                        "There was an issue",
                        `${res.message} [statusCode ${res.status}] [${res.statusText}]`,
                        "bottomLeft");
                });
            }).finally(() => {
                setSubmitting(false);
            })
    };
    const onFinishFailed = errorInfo => {
        alert(JSON.stringify(errorInfo, null, 2));
    };
    return (
        <Drawer
            title={initialValues ? "Edit student" : "Create new student"}
            width={720}
            onClose={onCLose}
            open={showDrawer}
            destroyOnClose
            bodyStyle={{ paddingBottom: 80 }}
            footer={
                <div style={{ textAlign: 'right' }}>
                    <Button onClick={onCLose} style={{ marginRight: 8 }}>
                        Cancel
                    </Button>
                </div>}
        >
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
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="nationality"
                                label="Nationality"
                                rules={[{ required: false }]}> 
                                <Input placeholder="Please enter nationality" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="college"
                                label="College"
                                rules={[{ required: false }]}> 
                                <Input placeholder="Please enter college" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="major"
                                label="Major"
                                rules={[{ required: false }]}> 
                                <Input placeholder="Please enter major" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="minor"
                                label="Minor"
                                rules={[{ required: false }]}> 
                                <Input placeholder="Please enter minor" />
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
