<template>
  <el-container class="home-container">
    <!--header-->
    <el-header>
      <div>
        <img class="imgbox" src="../assets/logo.png" alt="" />
        <span>電商後台管理系統</span>
      </div>
      <el-button type="info" @click="logout" style="float: right"
        >Logout</el-button
      >
    </el-header>
    <!--body-->
    <el-container>
      <!--sidebar-->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#3469b3" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="$route.path">
            <!--第一層選單-->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <!--第一層選單模板區-->
            <template slot="title">
              <!--icon-->
              <i :class="iconsObj[item.id]"></i>
              <!--text-->
              <span>{{item.authName}}</span>
            </template>

            <!--第二層選單-->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.childern" :key="subItem.id">
              <!--第二層選單模板區-->
              <template slot="title">
              <!--icon-->
              <i class="el-icon-menu"></i>
              <!--text-->
              <span>{{subItem.authName}}</span>
            </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--Main-->
      <el-main>
        <!--路由佔位符-->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 左側選單
      menulist: [],
      // 圖標
      iconsObj: {
        150: 'el-icon-user-solid',
        130: 'el-icon-s-tools',
        110: 'el-icon-s-goods',
        120: 'el-icon-s-order',
        140: 'el-icon-s-data'
      },
      // 選單是否摺疊
      isCollapse: false
    }
  },
  created () {
    this.getMenuList()
  },
  methods: {
    logout () {
      const tokenStr = window.sessionStorage.getItem('token')
      if (tokenStr) {
        // 清空 token
        window.sessionStorage.clear()
        // 跳轉到登入頁
        this.$router.push('./login')
      }
    },
    // 取得所有選單
    async getMenuList () {
      // 驗證API資料已取得連線(Fake)
      const { data: meta } = await this.$http.get('meta', {
        headers: {
          'Content-Type': 'application/json, text/plain'
        }
      })
      if (meta.status !== 200) return this.$message.error(meta.msg)
      // 取得 API 資料
      const { data: menu } = await this.$http.get('menu', {
        headers: {
          'Content-Type': 'application/json, text/plain'
        }
      })
      // console.log(res)
      this.menulist = menu
    },
    // 點擊按鈕，切換選單折疊
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style scoped>
.el-header {
  background-color: cadetblue;
  display: flex;
  justify-content: space-between;
  padding-left: 10;
  align-items: center;
  color: #fff;
  font-size: 20px;
}

.el-header div {
  display: flex;
  align-items: center;
}

.el-header span {
  margin-left: 15px;
}

.el-aside {
  background-color: #333744;
}

.el-aside .el-menu {
  border-right: none;
}

.el-main {
  background-color: rgb(220, 224, 218);
}

.home-container {
  height: 100%;
}

.imgbox {
  height: 40px;
  width: 40px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 1px;
  box-shadow: 0 0px 20px rgb(121, 170, 143);
}

.toggle-button {
  background-color: grey;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
