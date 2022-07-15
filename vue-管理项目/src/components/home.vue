<template>
  <el-container class="home-container">
    <!--头部地区-->
    <el-header>
      <div>
        <img src="../assets/logo.jpg" width="61px" height="56px">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">登出</el-button>
    </el-header>
    <!--页面主体区域-->
    <el-container>
      <!--侧边栏-->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 控制展开和缩小的按钮div -->
        <div class="toggle-button"  @click="toggleCollapse">|||</div>
      <!-- 侧边栏（可伸缩）菜单 -->
      <!-- unique-opened表示只能开启一个 collapse表示伸缩 :collapse-transition表示省略动画 router是点击路由-->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF"
                 :unique-opened="true" :collapse="isCollapse"  :collapse-transition="false" :router="true">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 index是点击的路由菜单-->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id">
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 页面主体区 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "home",
  data() {
    return {
      //左侧菜单栏中的数据
      menuList:[],
      //不同的一级菜单需要展示不同的图标，根据id进行匹配展示
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      //侧边栏时候被折叠
      isCollapse: false,
    }
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$message("成功登出....")
      setTimeout(() => {
        this.$router.push("/login")
      }, 500)

    },
    //不同的用户会展现出不同的菜单，菜单选项从服务器中获得
    async getMenuList(){
      const {data}=await this.$http.get("menus")
      // console.log(data)
      if (data.meta.status !==200){
        return this.$message.error(data.meta.msg)
      }
      //存储相关的变量
      this.menuList=data.data

    },
    toggleCollapse(){
      this.isCollapse = !this.isCollapse
    }
  },
  created() {
    this.getMenuList()
  }
}
</script>

<style lang="less" scoped>
.home-container{
  height: 100%;
}
.el-header{
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  //align-items 属性定义flex子项在flex容器的当前行的侧轴（纵轴）方向上的对齐方式。
  align-items: center;
  color: #eeeeee;
  font-size: 20px;
  >div{
    display: flex;
    align-items: center;
    span{
      margin-left: 15px;
    }
  }

}
.el-button{
  background-color: #373d41;
}
.el-aside{
  background-color: #333744;
  .el-menu{
    //有时候会看到若隐若现的小边框，需要进行去除
    border-right: none;
  }
}
.el-main{
  background-color: #eaedf1;
}
.el-button{
  background-color: #4a5064;
}
.iconfont{
  margin-left: 10px;
}
.toggle-button{
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
