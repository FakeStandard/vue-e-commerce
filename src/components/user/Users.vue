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
          <el-button type="primary" @click="addDialogVisible = true">添加用戶</el-button>
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
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="medium"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="medium" @click="removeUserById(scope.row.id)"></el-button>
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

    <!--Add user dialog-->
    <el-dialog title="新增用戶" :visible.sync="addDialogVisible" width="40%" @close="addDialogClosed">
      <!--Body-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="用戶名稱" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密碼" prop="password">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="電子郵件" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手機號碼" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--Footer(button)-->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addUser">確 定</el-button>
        <el-button @click="addDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 驗證電子郵件規則
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) return cb()
      cb(new Error('請輸入合法的電子郵件'))
    }
    // 驗證手機號碼規則
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^[09]{2}[0-9]{8}$/
      if (regMobile.test(value)) return cb()
      cb(new Error('請輸入合法的手機號碼'))
    }
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
      total: 0,
      // 控制添加用戶對話框的顯示與隱藏
      addDialogVisible: false,
      // 添加用戶表單的資料
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用戶表單的驗證規則
      addFormRules: {
        username: [
          { required: true, message: '請輸入用戶名稱', trigger: 'blur' },
          { min: 3, max: 10, message: '用戶名稱請輸入 3-10 個字', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '請輸入用戶密碼', trigger: 'blur' },
          { min: 6, max: 18, message: '密碼請輸入 6-18 個字之間', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '請輸入電子郵件', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '請輸入手機號碼', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
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
    },
    // 根據 ID 刪除對應的用戶資料
    async removeUserById (id) {
      const confirmResult = await this.$confirm('確定永久刪除該用戶？', '提示', {
        confirmButtonText: '忍心刪除',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      this.getUserList()

      // this.$confirm() 確認會返回 confrim 字串, 取消則返回 cancel 字串
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消刪除')
      }

      // 確認按鈕請求刪除 API
      await this.$http.delete(`users/${id}`)
      // 取得 API 更新狀態(Fake)
      const { data: meta } = await this.$http.get('meta', {
        headers: {
          'Content-Type': 'application/json, text/plain'
        }
      })
      if (meta.status !== 200) {
        return this.$message.error('刪除用戶失敗！')
      }
      this.$message.success('刪除成功！')
    },
    // 監聽添加用戶對話框的關閉事件
    addDialogClosed () {
      // clear
      this.$refs.addFormRef.resetFields()
    },
    // 確定添加新用戶事件
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return

        // 發起添加用戶的 API 請求
        await this.$http.post('users', this.addForm)
        // 取得 API 更新狀態(Fake)
        const { data: meta } = await this.$http.get('meta', {
          headers: {
            'Content-Type': 'application/json, text/plain'
          }
        })
        if (meta.status !== 200) {
          return this.$message.error('添加用戶失敗！')
        }

        this.$message.success('添加用戶成功')
        this.addDialogVisible = false
        this.getUserList()
      })
    }
  }
}
</script>

<style scoped>

</style>
