<template>
  <div>
    <!--麵包屑-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首頁</el-breadcrumb-item>
      <el-breadcrumb-item>用戶管理</el-breadcrumb-item>
      <el-breadcrumb-item>用戶列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--Card View-->
    <el-card>
      <!--Search region-->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input v-model="query" placeholder="請輸入搜尋內容" clearable @click="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="textclick"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary">添加用戶</el-button>
        </el-col>
      </el-row>
      <!--User list region-->
      <!--.slice(開始的索引值, 結束的索引值)-->
      <el-table :data="userlist.slice((pagenum -1) * pagesize, pagenum * pagesize)" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="電子郵件" prop="email"></el-table-column>
        <el-table-column label="電話" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="狀態" prop="mg_state">
          <!-- <template slot-scope="scope"> -->
          <!--v2.6 語法-->
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
            <!-- {{scope.row}} -->
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" icon="el-icon-edit" size="medium"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="medium"></el-button>
            <!--分配角色按鈕-->
            <el-tooltip effect="dark" content="分配角色" placement="right" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="medium"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--Page region-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 用戶列表數據
      userlist: [],
      // 搜尋框文字
      query: '',
      // 當前頁數
      pagenum: 1,
      // 每頁顯示多少筆資料
      pagesize: 2,
      // 總筆數
      total: 0
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 取得所有用戶列表
    async getUserList () {
      // 驗證 API 資料已取得連線(Fake)
      const { data: meta } = await this.$http.get('meta', {
        headers: {
          'Content-Type': 'application/json, text/plain'
        }
      })
      if (meta.status !== 200) return this.$message.error(meta.msg)
      // 取得 API 資料
      const { data: users } = await this.$http.get('users', {
        params: {
          username: this.query.length === 0 ? null : this.query
        },
        headers: {
          'Content-Type': 'application/json, text/plain'
        }
      })
      this.userlist = users
      this.total = users.length
    },
    // 監聽 pagesize 改變事件
    handleSizeChange (newSize) {
      this.pagesize = newSize
      this.getUserList()
    },
    // 監聽 current page 改變事件
    handleCurrentChange (newPage) {
      this.pagenum = newPage
      this.getUserList()
    },
    // 監聽 switch 開關狀態改變事件
    async userStateChanged (userinfo) {
      await this.$http.patch(`users/${userinfo.id}`, {
        mg_state: userinfo.mg_state
      })
      // 取得 API 更新狀態(Fake)
      const { data: meta } = await this.$http.get('meta', {
        headers: {
          'Content-Type': 'application/json, text/plain'
        }
      })
      if (meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用戶狀態失敗！')
      }
      this.$message.success('更新用戶狀態成功！')
    },
    textclick () {
      // 尚未實現模糊查詢
      if (this.query.length === 0) return this.$message.warning('請輸入要搜尋的內容！')
      this.getUserList()
    }
  }
}
</script>

<style scoped>

</style>
