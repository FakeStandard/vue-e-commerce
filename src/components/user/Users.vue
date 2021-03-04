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
            <el-button slot="append" icon="el-icon-search" @click="queryClick"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">新增用戶</el-button>
        </el-col>
      </el-row>
      <!--User list region-->
      <!--.slice(開始的索引值, 結束的索引值)-->
      <el-table :data="userlist.slice((pagenum -1) * pagesize, pagenum * pagesize)" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="name"></el-table-column>
        <el-table-column label="帳號" prop="account"></el-table-column>
        <el-table-column label="電子郵件" prop="email"></el-table-column>
        <el-table-column label="電話" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="roleName"></el-table-column>
        <el-table-column label="狀態" prop="state">
          <!-- <template slot-scope="scope"> -->
          <!--v2.6 語法-->
          <template v-slot="scope">
            <el-switch v-model="scope.row.state" @change="userStateChanged(scope.row)"></el-switch>
            <!-- {{scope.row}} -->
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <!--modify button-->
            <el-button type="primary" icon="el-icon-edit" size="medium" @click="showEditDialog(scope.row.id)"></el-button>
            <!--delete button-->
            <el-button type="danger" icon="el-icon-delete" size="medium" @click="removeUserById(scope.row.id)"></el-button>
            <!--分配角色按鈕-->
            <el-tooltip effect="dark" content="分配角色" placement="right" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="medium" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--Page region-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!--Add user dialog-->
    <el-dialog title="新增用戶資料" :visible.sync="addDialogVisible" width="40%" @close="addDialogClosed">
      <!--Body-->
      <el-form :model="addForm" :rules="FormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="用戶名稱" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="帳號" prop="account">
          <el-input v-model="addForm.account"></el-input>
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

    <!--Modify user dialog-->
    <el-dialog title="修改用戶資料" :visible.sync="editDialogVisible" width="40%" @close="editDialogClosed">
      <!--Body-->
      <el-form :model="editForm" :rules="FormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="用戶名稱">
          <el-input v-model="editForm.name" disabled></el-input>
        </el-form-item>
        <el-form-item label="電子郵件" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手機號碼" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--Footer(button)-->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editUser">確 定</el-button>
        <el-button @click="editDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>

    <!--分配角色權限-->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="40%" @close="setRoleDialogClosed">
      <div>
        <p>當前的用戶：{{userInfo.name}}</p>
        <p>當前的角色：{{userInfo.roleName}}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="請選擇">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </p>
      </div>
      <!--Footer(button)-->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveRoleInfo">確 定</el-button>
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
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
    // 驗證帳號和密碼規則
    var checkAccPass = (rule, value, cb) => {
      const regAccount = /^.[A-Za-z0-9]+$/
      if (regAccount.test(value)) return cb()
      cb(new Error('請輸入數字或英文'))
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
      addForm: {},
      // 用戶表單的驗證規則
      FormRules: {
        name: [
          { required: true, message: '請輸入用戶名稱', trigger: 'blur' },
          { min: 3, max: 10, message: '用戶名稱請輸入 3-10 個字', trigger: 'blur' }
        ],
        account: [
          { required: true, message: '請輸入用戶帳號', trigger: 'blur' },
          { min: 4, maxi: 16, message: '帳號請輸入 4-16 個字之間', trigger: 'blur' },
          { validator: checkAccPass, trigger: 'blur' }
        ],
        password: [
          { required: true, message: '請輸入用戶密碼', trigger: 'blur' },
          { min: 6, max: 18, message: '密碼請輸入 6-18 個字之間', trigger: 'blur' },
          { validator: checkAccPass, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '請輸入電子郵件', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '請輸入手機號碼', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制修改用戶對話框的顯示與隱藏
      editDialogVisible: false,
      // 修改用戶表單的資料
      editForm: {},
      // 分配權限對話框的顯示與隱藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用戶資訊
      userInfo: {},
      // 所有角色數據列表
      rolesList: [],
      // 已選中角色 ID 值
      selectedRoleId: ''
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 取得所有用戶列表
    async getUserList () {
      const { data: users } = await this.$http.get('user', {
        params: {
          query: this.query.length === 0 ? null : this.query
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
      await this.$http.patch(`user/${userinfo.id}/${userinfo.state}`).then(() => {
        this.$message.success('更新用戶狀態成功')
        this.getUserList()
      }).catch(() => {
        return this.$message.error('更新用戶狀態失敗')
      })
    },
    // 監聽查詢按鈕事件
    queryClick () {
      this.getUserList()
    },
    // 根據 ID 刪除對應的用戶資料
    async removeUserById (id) {
      const confirmResult = await this.$confirm('確定永久刪除該用戶？', '提示', {
        confirmButtonText: '忍心刪除',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      // this.$confirm() 確認會返回 confrim 字串, 取消則返回 cancel 字串
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消刪除')
      }

      // 確認按鈕請求刪除 API
      await this.$http.delete(`user/${id}`).then(() => {
        this.$message.success('刪除用戶成功')
        this.getUserList()
      }).catch(() => {
        this.$message.error('刪除用戶失敗')
      })
    },
    // 監聽添加用戶對話框的關閉事件
    addDialogClosed () {
      // clear
      this.$refs.addFormRef.resetFields()
    },
    // 點擊按鈕添加用戶事件
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return

        // 發起新增用戶的 API 請求
        await this.$http.post('user', this.addForm).then(() => {
          this.$message.success('添加用戶成功')
          this.addDialogVisible = false
          this.getUserList()
        }).catch(() => {
          return this.$message.error('添加用戶失敗')
        })
      })
    },
    // 開啟編輯用戶資料對話框
    async showEditDialog (id) {
      // 請求用戶資料
      const { data: user } = await this.$http.get(`user/${id}`).catch(() => {
        return this.$message.error('請求用戶資料失敗')
      })

      this.editForm = user
      this.editDialogVisible = true
    },
    // 監聽修改用戶對話框的關閉事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 點擊按鈕修改用戶事件
    editUser () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        await this.$http.put('user', this.editForm).then(() => {
          this.editDialogVisible = false
          this.getUserList()
          this.$message.success('更新用戶資料成功')
        }).catch(() => {
          return this.$message.error('修改用戶失敗')
        })
      })
    },
    // 展示分配角色對話框
    async setRole (userInfo) {
      this.userInfo = userInfo
      // 取得所有角色列表
      await this.$http.get('role').then((res) => {
        this.rolesList = res.data
        this.setRoleDialogVisible = true
      }).catch(() => {
        return this.$message.error('取得角色列表失敗')
      })
    },
    // 點擊按鈕分配角色
    async saveRoleInfo () {
      if (!this.selectedRoleId) {
        return this.$message.error('請選擇要分配的角色')
      }

      await this.$http.patch(`user/${this.userInfo.id}/role/${this.selectedRoleId}`).then(() => {
        this.$message.success('成功')
        this.getUserList()
        this.setRoleDialogVisible = false
      }).catch(() => {
        this.$message.error('失敗')
      })
    },
    // 監聽分配角色對話框關閉事件
    setRoleDialogClosed () {
      this.selectedRoleId = ''
      this.userInfo = []
    }
  }
}
</script>

<style scoped>

</style>
