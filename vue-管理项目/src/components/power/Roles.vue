<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 下面的表格区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 展开列所需要展示的内容... 首先进行load展示-->
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children"
                    :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children"
                        :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable
                            @close="removeRightById(scope.row, item3.id)">{{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <!-- 索引列  -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeUserById(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的dialog -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的dialog -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <!-- 树形控件 -->
      <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色dialog-->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="角色">
          <el-input v-model="editForm.roleName" ></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.roleDesc" ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: "Roles",
  data() {
    return {
      //规则列表
      rolelist: [],
      //添加角色的对话框
      addDialogVisible: false,
      // 赋值权限的对话框
      setRightDialogVisible:false,
      //修改角色信息
      editDialogVisible:false,
      // 添加角色的表单
      addForm: {
        roleName: "",
        roleDesc: ""
      },
      // 添加表单的验证规则对象
      addFormRules: {
        roleName: [
          {required: true, message: '请输入角色名称', trigger: 'blur'},
        ]
      },
      // 角色数据
      editForm:{},
      // 所有权限的数据
      rightslist:[],
      //树形结构的控件
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点Id值数组(选中的值都赋值给此defKey)
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: '',

    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList() {
      const {data} = await this.$http.get('roles')
      if (data.meta.status !== 200) {
        console.log(data)
        return this.$message.error('获取角色列表失败！')
      }
      this.rolelist = data.data
    },
    //关闭添加角色对话框的操作
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 根据Id删除对应的权限，三种权限中都有的方法
    async removeRightById(role, rightId) {
      //role 这一行的数据，rightID 权限的id值
      const confirmResult = await this.$confirm(
          '此操作将永久删除该文件, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除！')
      }
      const {data} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (data.meta.status !== 200) {
        console.log(data)
        return this.$message.error('删除权限失败！')
      }
      //data.data返回的是删除之后的所有权限信息
      //如果删除权限之后使用create中的函数刷新，那么会导致页面直接闪退到没有伸缩的时候，对用户不友好
      role.children = data.data

    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data} = await this.$http.get('rights/tree')
      if (data.meta.status !== 200) {
        console.log(data)
        return this.$message.error('获取权限数据失败！')
      }
      // 把获取到的权限数据保存到 data 中
      this.rightslist = data.data
      console.log(this.rightslist)
      // 递归获取三级节点的Id
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
    getLeafKeys(node, arr) {
      // 如果当前 node 节点不包含 children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed(){
      this.defKeys = []
    },
    // 确定给角色分配权限了
    async allotRights(){
      //获得所有点击的id值
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      //服务端接口要求，需要使用,进行分割
      const idStr = keys.join(',')
      const { data } = await this.$http.post(
          `roles/${this.roleId}/rights`,
          { rids: idStr }
      )
      if (data.meta.status !== 200) {
        console.log(data)
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      await this.getRolesList()
      this.setRightDialogVisible = false
    },
    // 添加新角色按钮点击
     addUser(){
      this.$refs.addFormRef.validate(async v=>{
       if (!v){
         return this.$message.error("请根据要求输入相关信息")
       }
       const {data}=await this.$http.post("roles",this.addForm)
        if (data.meta.status !==201){
          console.log(data)
          return this.$message.error("添加角色失败")
        }
       this.$message.success("添加角色成功")
        this.addDialogVisible=false
        await this.getRolesList()
      })
    },
    //根据id删除角色
    async removeUserById(id){
      const confirmResult = await this.$confirm(
          '此操作将永久删除该角色, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data } = await this.$http.delete('roles/' + id)
      if (data.meta.status !== 200) {
        return this.$message.error('删除角色失败！')
      }
      this.$message.success('删除角色成功！')
      await this.getRolesList()
    },
    //修改角色信息窗口关闭后
    editDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },
    //提交修改角色信息
     editUserInfo(){
      this.$refs.editFormRef.validate(async valid => {
        if (!valid){
          return this.$message.error("请检查数据后再修改")
        }
        const {data} = await this.$http.put(
              `roles/${this.editForm.roleId}`,
            {
              roleName: this.editForm.roleName,
              roleDesc: this.editForm.roleDesc
            }
        )
        if (data.meta.status !== 200) {
          console.log(data)
          return this.$message.error('更新用户信息失败！')
        }
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        await this.getRolesList()
        // 提示修改成功
        this.$message.success('更新用户信息成功！')
      })
    },
    //点击修改角色的按钮
    async showEditDialog(id){
      const { data } = await this.$http.get('roles/' + id)
      if (data.meta.status !== 200) {
        console.log(data)
        return this.$message.error('查询用户信息失败！')
      }
      this.editForm = data.data
      this.editDialogVisible = true
    }
  }
}
</script>

<style scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
