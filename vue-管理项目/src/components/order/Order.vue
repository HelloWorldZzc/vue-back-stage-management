<template>
<div>
  <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>订单管理</el-breadcrumb-item>
    <el-breadcrumb-item>订单列表</el-breadcrumb-item>
  </el-breadcrumb>

  <!-- 卡片视图区域 -->
  <el-card>
  <!--使用load，展示搜索框和搜索按钮-->
    <el-row>
      <el-col :span="8">
        <el-input placeholder="请输入内容" v-model="queryInfo.query" >
          <el-button slot="append" icon="el-icon-search" @click="searchBtn"></el-button>
        </el-input>
      </el-col>
    </el-row>
    <!-- 订单列表数据 -->
    <el-table :data="orderlist" border stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="订单编号" prop="order_number"></el-table-column>
      <el-table-column label="订单价格" prop="order_price"></el-table-column>
      <el-table-column label="是否付款" prop="pay_status">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
          <el-tag type="danger" v-else>未付款</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否发货" prop="is_send">
        <template slot-scope="scope">
          <template>
            {{scope.row.is_send}}
          </template>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" prop="create_time">
        <template slot-scope="scope">
          {{scope.row.create_time | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template>
          <el-tooltip class="item" effect="dark" content="修改地址" placement="top-start">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="showBox"></el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="物流追踪" placement="top-start">
            <el-button size="mini" type="success" icon="el-icon-location" @click="showProgressBox"></el-button>
          </el-tooltip>
         </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </el-card>
  <!-- 修改地址的对话框 -->
  <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressDialogClosed">
    <el-alert title="此操作目前并不会同步于服务器中哦" type="info" center show-icon :closable="false"></el-alert>
    <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
      <el-form-item label="省市区/县" prop="address1">
        <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
      </el-form-item>
      <el-form-item label="详细地址" prop="address2">
        <el-input v-model="addressForm.address2"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
  </el-dialog>
</div>
</template>

<script>
import cityData from "@/components/order/citydata";
export default {
  name: "Order",
  data(){
    return{
      //查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      orderlist: [],
      //添加地址的选择框
      addressVisible: false,
      //添加的规则
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      //选择的表单
      addressForm: {
        address1: [],
        address2: ''
      },
      //展示流程的数据
      progressVisible: false,
      progressInfo: [],
      cityData:cityData
    }
  },
  created() {
    this.getOrderList()
  },
  methods:{
    //获取订单的数据
    async getOrderList() {
      const { data } = await this.$http.get('orders', {params: this.queryInfo})
      if (data.meta.status !== 200) {
        console.log(data)
        return this.$message.error('获取订单列表失败！')
      }
      this.total = data.data.total
      this.orderlist = data.data.goods
    },
    //页脚发生变化时候触发的函数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 展示修改地址的对话框
    showBox() {

      this.addressVisible = true
    },
    //关闭对话框清除表单数据
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    searchBtn(){
      this.getOrderList()
    },
    showProgressBox(){
      this.$message.info("该功能正在研发中，敬请期待")
    }
  }

}
</script>

<style>
.el-alert{
  margin-bottom: 20px;
}
</style>
