import Vue from "vue";
import Router from "vue-router"
import login from "@/components/login";
import home from "@/components/home";
import welcome from "@/components/welcome";
import user from "@/components/user/user";
import Roles from "@/components/power/Roles";
import Rights from "@/components/power/Rights";
import cate from "@/components/goods/cate";
import params from "@/components/goods/params";
import list from "@/components/goods/list";
import add from "@/components/goods/add";
import Order from "@/components/order/Order";
import report from "@/components/report/report";
Vue.use(Router)

//创建路由对象
const router =new Router({
routes:[
    {path:"/",redirect:"/login"},
    {path:"/login",component:login},
    {
        path:"/home",
        component:home,
        redirect:"/welcome",
        children:[
            {
                path:"/welcome",
                component:welcome
            },
            {
                path:"/users",
                component:user
            },
            {
                path:"/roles",
                component:Roles
            },
            {
            path:"/rights",
            component:Rights
            },
            {
                path:"/categories",
                component:cate
            },
            {
            path:"/params",
            component:params
            },
            {
            path:"/goods",
                component:list
            },
            {
                path:"/goods/add",
                component:add
            },
            {
                path:"/orders",
                component:Order
            },{
            path:"/reports",
                component:report
            }
        ]

    }
]
})

//路由导航守卫，确保每个登录了的用户才能够访问
router.beforeEach((to,from,next)=>{
    //访问登录页面直接放行
    if(to.path==='/login'){
        return next()
    }
    //访问其他的页面没有token直接return login
    const tokenStr=window.sessionStorage.getItem("token")
    if (!tokenStr){
        return next("/login")
    }
    next()

})

export default router


