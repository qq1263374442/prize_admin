import React, {useState} from 'react';
import {
    Table,
    Input,
    InputNumber,
    Form,
    Button,
    Switch
} from 'antd';
import PubSub from 'pubsub-js';
import axios from 'axios';
import { nanoid } from 'nanoid';


const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
}) => {
    const inputNode = inputType === 'number' ? < InputNumber / > : < Input / > ;
    return ( <td {...restProps}> 
            {editing ? ( <
                Form.Item name = {
                    dataIndex
                }
                style = {
                    {
                        margin: 0,
                    }
                }
                rules = {
                    [{
                        required: true,
                        message: `Please Input ${title}!`,
                    }, ]
                } >
                {
                    inputNode
                } 
                </Form.Item>
            ) : (
                children
            )
        } 
        </td>
    );
};

const EditableTable = () => {
    // 创建表单实例form
    const [form] = Form.useForm();
    //data---展示数据的状态
    const [data, setData] = useState();
    //editingKey---正在编辑行的id
    const [editingKey, setEditingKey] = useState('');
    
    //从后台获取展示信息,添加key:prize_id
    React.useEffect(()=>{
        axios.post('https://qc1hz1.fn.thelarkcloud.com/prizeinfo')
        .then(function (res) {
           let newdata=res.data.response;
           newdata=newdata.map((item)=>{return {...item,key:item.prize_id}})
           setData(newdata);
        });
        return ()=>{};
    },[])// eslint-disable-line

    // 订阅新增奖品信息
    React.useEffect(()=>{
        // 订阅CollectionPage下的消息
        const token=PubSub.subscribe('AddPrize',(msg,item)=>{
            //生成唯一id
            const id=nanoid();
            const newData=[...data,{prize_id:id,...item,key:id}];
            // 更新展示数据的state
            setData(newData);
            // 向后台发送新增奖品数据
            axios.post('https://qc1hz1.fn.thelarkcloud.com/addPrize',{prize_id:id,...item})
        });
        // 取消订阅
        return ()=>{PubSub.unsubscribe(token)};
    },[data])// eslint-disable-line
    // 将函数的声明放在useEffect函数外面时
    // 或者使用useState定义的历史变量,会报eslint警告
    // 解决办法
    // 1.在useEffect后面加个eslint注释,忽略掉
    // 2.如果是函数,将函数放在useEffect内部,如果是变量,
    //用deepcopy拷贝useSet定义的变量或者采用useRef
    
    
    // 是否在编辑
    const isEditing = (record) => record.prize_id === editingKey;
    // 点击修改按钮后触发
    const edit = (record) => {
        //输入框内保留先前值
        form.setFieldsValue({
            prize_name: '',
            prize_probability: '',
            prize_amount: '',
            isprize:true,
            ...record,
        });
        //记录正在编辑的行的id
        setEditingKey(record.prize_id);
    };
    
    //清除正在编辑行的标记
    const cancel = () => {
        setEditingKey('');
    };
    //删除一个奖品
    const cut=(record)=>{
        const newData = [...data];
        const index = newData.findIndex((item) => record.prize_id === item.prize_id);
        newData.splice(index, 1);
        setData(newData);
        // 向后台发送要删除奖品的id
        axios.post('https://qc1hz1.fn.thelarkcloud.com/deletePrize',{id:record.prize_id}) 
    }
    
    //保存修改的数据
    const save = async (key) => {
        try {
            // row新数据
            const row = await form.validateFields();
            const newData = [...data];
            const index = newData.findIndex((item) => key ===item.prize_id);

            // item旧数据，row新数据
            const item = newData[index];
            //判断旧数据和新数据是否相等
            if(item.prize_amount===row.prize_amount&&item.prize_name===row.prize_name
                &&item.prize_probability===row.prize_probability){
                    return;
                }
            console.log("更新了数据");
            // 让新数据覆盖旧数据
            newData.splice(index, 1, {
                ...item,
                ...row
            });
            setData(newData);
            setEditingKey('');
            //让后台保存新数据
            axios.post('https://qc1hz1.fn.thelarkcloud.com/changePrize',newData[index])
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    // isprize值更新
    const changeCheck=(record)=>{
        const newData = [...data];
        const index = newData.findIndex((item) => record.prize_id === item.prize_id);
        newData[index].isprize=!newData[index].isprize;
        setData(newData);
        setEditingKey('');
        // 让后台更新isprize的值
        save(record.prize_id);
    }

    const columns = [{
            title: 'prize_name',
            dataIndex: 'prize_name',
            width: '20%',
            editable: true,
        },
        {
            title: 'prize_probability',
            dataIndex: 'prize_probability',
            width: '20%',
            editable: true,
        },
        {
            title: 'prize_amount',
            dataIndex: 'prize_amount',
            width: '20%',
            editable: true,
        },
        {
            title: 'isprize',
            dataIndex: 'isprize',
            width: '5%',
            editable: false,
            render:(_,record)=>{
                return <Switch checked={record.isprize} onChange={(checked)=>{
                    changeCheck(record)
                }}></Switch>
                
            }
        },
        {
            title: 'operation',
            dataIndex: 'operation',
            // record---一行的数据
            render: (_, record) => {
                const editable = isEditing(record);
                // 编辑行
                return editable ? (
                    <span >                  
                    <Button type="link" 
                    onClick={()=>{save(record.prize_id)}}
                    style = {{marginRight: 8,}}
                    >保存</Button>

                    <Button type="link" onClick={cancel}>取消</Button>
                    </span>
                ) 
                //非编辑行返回修改、删除按钮 
                //编辑时其他非编辑行不可选取
                : ( 

                    <div>
                    <Button disabled={editingKey !== ''} type="primary" onClick={()=>edit(record)} >
                        修改
                    </Button>
                    <Button type="danger" onClick={()=>cut(record)} style={{marginLeft: 8}}>
                        删除
                    </Button>
                    </div>
                );
            },
        },
    ];
    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }

        return {
            ...col,
            onCell: (record) => ({
                record,
                inputType: col.dataIndex === 'age' ? 'number' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });


    return ( <
        Form form = {
            form
        }
        component = {
            false
        } >
        <
        Table components = {
            {
                body: {
                    cell: EditableCell,
                },
            }
        }
        bordered dataSource = {
            data
        }
        columns = {
            mergedColumns
        }
        rowClassName = "editable-row"
        pagination = {false}
        />
        </Form>
        
    );
};
export default EditableTable;