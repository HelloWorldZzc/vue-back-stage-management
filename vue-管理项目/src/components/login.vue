<template>
  <div class="login_container">
    <!-- 登录盒子 -->
    <div class="login_box">
      <!-- 登录的logo -->
      <div class="avatar_box">
        <img src="../assets/logo.jpg" width="200" height="200">
      </div>
      <!-- 登录的表单-->
      <el-form ref="login_form" label-width="80px" class="login_form" :model="loginForm" :rules="loginFormRules">
        <!-- 用户名 prop表示相关的规则验证-->
        <el-form-item label="用户名" prop="username">
          <el-input prefix-icon="el-icon-user" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input prefix-icon="el-icon-lock" type="password" v-model="loginForm.password"></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btn">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "login",
  data(){
    return{
      // v-model 从表单中读取输入
      loginForm:{
        username:"",
        password:""
      },
      // props 相关的验证规则
      loginFormRules:{
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 4, max: 10, message: '长度在 4 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods:{
    resetForm(){
      //表单属性自带的方法 resetFields，重置表单的内容
      this.$refs.login_form.resetFields()
    },
    login(){
      //记住要使用箭头函数，不然this是undefined，不是使用vm上面挂载的内容
      //validate也是表单的一个属性，要是prop的规则都满足了的话，能返回true，否则的话返回false
      this.$refs.login_form.validate(async v=>{
       if (!v){
         this.$message({
           message:"请按照要求填充相关信息",
           type:"warning"
         });
         return
       }
       //也可以直接使用 this.loginForm，这样更直观的看出用了哪些参数
       const {data}=await this.$http.post("/login",
           {
             'username':this.loginForm.username,
             'password':this.loginForm.password
              }
       );
      if(data.meta.status!==200){
        return this.$message.error('登录失败');
      }
        this.$message({
          type:"success",
          message:"登录成功"
        })
        //保存token在本地服务器中，并且跳转到home目录
        window.sessionStorage.setItem("token",data.data.token)
        await setTimeout(()=>{
          this.$router.push("/home")
        },1000)
      })
    }
  }
}
</script>

<style lang="less">
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  position: absolute;
  left: 50%;
  top: 50%;
  //transform 属性向元素应用 2D 或 3D 转换。该属性允许我们对元素进行旋转、缩放、移动或倾斜
  //translate是其中的一个属性，作用是	定义 2D 转换。
  transform: translate(-50%, -50%);

  //css设置图形的边框样式及logo
  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eeeeee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;

    img {
      width: 100%;
      height: 100%;
      // 图片的圆角
      border-radius: 50%;
      background-color: #eee;
    }
  }
  .login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    // box-sizing 属性定义如何计算一个元素的总宽度和总高度，主要设置是否需要加上内边距(padding)和边框等
    //content-box 默认值 border-box 告诉浏览器：你想要设置的边框和内边距的值是包含在 width 内的
    // 这样的话就不用去计算长度了，更加方便操作
    box-sizing: border-box;
  }
  .btn{
    display: flex;
    //justify-content 用于设置或检索弹性盒子元素在主轴（横轴）方向上的对齐方式。
    // flex-start 默认 flex-end:队尾开始排序 center居中排序....
    justify-content: flex-end;
  }
}

</style>
