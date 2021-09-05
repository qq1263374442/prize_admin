import React, { useState } from 'react';
import { Button, Modal, Form, Input,Switch } from 'antd';
import PubSub from 'pubsub-js';

const CollectionCreateForm = ({ visible, onCreate, onCancel }) => {
  const [form] = Form.useForm();
  return (
    <Modal
      visible={visible}
      title="添加一个奖品"
      okText="确定"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
            onCreate(values);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{
          modifier: 'public',
        }}
      >
        <Form.Item
          name="prize_name"
          label="Prize_name"
          rules={[
            {
              required: true,
              message: 'Please input the title of collection!',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="prize_probability" label="Prize_probability">
          <Input type="textarea" />
        </Form.Item>
        <Form.Item name="prize_amount" label="Prize_amount">
          <Input type="textarea" />
        </Form.Item>

        <Form.Item name="isprize" label="isprize" valuePropName="checked" initialValue={true} >
          <Switch  defaultChecked></Switch>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const CollectionsPage = () => {
  const [visible, setVisible] = useState(false);

  // 发布消息--新增行的数据
  const onCreate = (values) => {
    PubSub.publish('AddPrize',values);
    setVisible(false);
  };

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          setVisible(true);
        }}
      >
        添加
      </Button  >
      <CollectionCreateForm
        visible={visible}
        onCreate={onCreate}
        onCancel={() => {
          setVisible(false);
        }}
      />
    </div>
  );
};
export default CollectionsPage;