import 'antd/dist/antd.css'
import EditableTable from './component/EditableTable'
import CollectionsPage from './component/CollectionsPage'
// import { div } from 'prelude-ls';
function App() {
  return (
      <div style={{textAlign:'center',width:"70%",margin:"0 auto"}} >
        {/* 数据展示、修改按钮、删除按钮 */}
        <EditableTable ></EditableTable>
        {/* 添加按钮 */}
        <CollectionsPage />
      </div>
  );
}
export default App;