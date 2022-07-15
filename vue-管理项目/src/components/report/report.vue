<template>
<div>
  <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>数据统计</el-breadcrumb-item>
    <el-breadcrumb-item>数据报表</el-breadcrumb-item>
  </el-breadcrumb>


  <!-- 卡片视图区域 -->
  <el-card>
    <!-- 2. 为ECharts准备一个具备大小（宽高）的Dom -->
    <div id="main" style="width: 1050px;height:400px;"></div>
  </el-card>
</div>
</template>

<script>
import *as echarts from "echarts"
import _ from 'lodash'
export default {
  name: "report",
  data(){
    return{
      // 需要合并的数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
   mounted() {
   this.getDate()

  },
  methods:{
   async getDate(){
      let myChart = echarts.init(document.getElementById('main'))
      const { data} = await this.$http.get('reports/type/1')
      if (data.meta.status !== 200) {
        console.log(data)
        return this.$message.error('获取折线图数据失败！')
      }
      // 4. 准备数据和配置项(把服务端返回的数据和data中的数据进行合并)
      const result = _.merge(data.data, this.options)
      // 5. 展示数据
      myChart.setOption(result)
    }
  }
}
</script>

<style scoped>
#main{
 margin: auto;
}
</style>
