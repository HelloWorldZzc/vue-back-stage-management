<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 使用到了layout布局-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 table -->
      <el-table :data="userlist" border stripe>
        <!-- 索引列的添加  -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!-- 使用插槽 {{scope.row}}表示的是当前行的信息-->
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)" :disabled="scope.row.id===500"></el-switch>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <!-- 分配角色按钮 el-tooltip是鼠标靠近button 自动展示辅助文字-->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 下面的页码栏 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum" :page-sizes="[1, 3, 5, 10]" :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>

      <!-- 添加用户的对话框 visible.sync表示是否显示对话框-->
      <el-dialog
          title="添加用户"
          :visible.sync="addDialogVisible"
          width="50%" @close="addDialogClosed">
        <!-- 内容主体区域  使用了form表单:model 表单数据 rules 表单规则 prop:验证规则中的子对象 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
      </el-dialog>

      <!-- 修改用户的对话框 -->
      <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
      </el-dialog>
      <!-- 分配角色的对话框-->
      <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
        <div>
          <p>当前的用户：{{userInfo.username}}</p>
          <p>当前的角色：{{userInfo.role_name}}</p>
          <p>分配新角色：
            <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
              </el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "user",
  data() {
    // 验证邮箱的规则
    let checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号的规则
    let checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      //获取用户列表所需要的参数对象
      queryInfo: {
        query: "",
        pagenum:1,
        pagesize:3
      },
      userlist: [],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      //显示修改用户信息的添加与隐藏
      editDialogVisible:false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      //用户表单的验证规则需要满足
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '密码的长度在6~15个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户的表单 数据从showEditDialog中通过获取网络请求读取而得
      editForm: {},
      editFormRules:{
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      //分配角色的相关按钮
      setRoleDialogVisible:false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      rolesList: [],
      // 已选中的角色Id值
      selectedRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    //获取用户列表的方法
    async getUserList() {
      const {data} = await this.$http.get("users", {
        params: this.queryInfo
      })
      if (data.meta.status !== 200) {
        console.log(data)
        return this.$message.error("获取用户列表失败")
      }
      this.total = data.data.total
      this.userlist = data.data.users

    },
    // 监听 pageSize 改变的事件 (一页显示多少数据)
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听 页码值 改变的事件 （当前是第几页）
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 修改用户的状态
    async userStateChanged(userinfo) {
      //修改数据之后会传入一个值
      console.log(userinfo)
      //发送http请求 在服务器端修改数据
      const {data} = await this.$http.put(
          `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (data.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
    },
    // 在dialog标签关闭的时候 重置表单
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    },
    //添加用户的操作
     addUser(){
      this.$refs.addFormRef.validate(async v=>{
        if (!v){
          this.$message.error("请核对信息后再添加")
          return
        }
        //可以发起网络请求添加用户操作了
        const {data}=await this.$http.post("users",this.addForm)
        if (data.meta.status !==201){
          this.$message.error("添加用户失败")
          console.log(data)
          return
        }
        this.$message.success("添加用户成功")
        this.addDialogVisible = false
        await this.getUserList()
      })
    },
    //关闭修改页面的操作
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //提交修改用户操作
    editUserInfo(){
      this.$refs.editFormRef.validate(async valid => {
        if (!valid){
          this.$message.error("请检查信息后再进行提交")
          return
        }
        // 发起修改用户信息的数据请求
        const { data } = await this.$http.put(
            'users/' + this.editForm.id,
            {
              email: this.editForm.email,
              mobile: this.editForm.mobile
            }
        )

        if (data.meta.status !== 200) {
          console.log(data)
          return this.$message.error('更新用户信息失败！')
        }
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        await this.getUserList()
        // 提示修改成功
        this.$message.success('更新用户信息成功！')
      })
    },
    // 点击修改按钮之后 需要进行的一些操作
    async showEditDialog(id) {
      // console.log(id)
      const { data} = await this.$http.get('users/' + id)
      if (data.meta.status !== 200) {
        console.log(data)
        return this.$message.error('查询用户信息失败！')
      }
      this.editForm = data.data
      this.editDialogVisible = true
    },
    // 删除用户操作
    async removeUserById(id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm(
          '此操作将永久删除该用户, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).catch(err => err)
      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data } = await this.$http.delete('users/' + id)
      if (data.meta.status !== 200) {
        console.log(data)
        return this.$message.error('删除用户失败！')
      }
      this.$message.success('删除用户成功！')
      await this.getUserList()
    },
    // 关闭授予用户角色的对话框触发条件
    setRoleDialogClosed(){
      this.selectedRoleId = ''
      this.userInfo = {}
    },
    //点击了分配角色的按钮了，需要触发的相关函数
    async setRole(userInfo){
      //把这一列用户信息放在data中存储
      this.userInfo=userInfo
      //在展示对话框之前，获取所有的角色列表
      const {data}=await this.$http.get("roles")
      if (data.meta.status!==200){
        console.log(data)
        return this.$message.error("获取角色列表失败")
      }
      this.rolesList=data.data
      this.setRoleDialogVisible=true

    },
    //点击提交，修改权限用户
    async saveRoleInfo(){
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色！')
      }
      const { data } = await this.$http.put(
          `users/${this.userInfo.id}/role`,
          {
            rid: this.selectedRoleId
          }
      )
      if (data.meta.status !== 200) {
        console.log(data)
        return this.$message.error('更新角色失败！')
      }
      this.$message.success('更新角色成功！')
      await this.getUserList()
      this.setRoleDialogVisible = false
    }
    },

}
</script>

<style scoped>

</style>
