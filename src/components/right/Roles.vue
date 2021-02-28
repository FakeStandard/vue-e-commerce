<template>
  <div>
      <!--麵包屑-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/home' }">首頁</el-breadcrumb-item>
          <el-breadcrumb-item>權限管理</el-breadcrumb-item>
          <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!--Card view-->
      <el-card>
        <el-row>
          <el-col>
            <el-button type="primary" @click="addDialogVisible = true">新增角色</el-button>
          </el-col>
        </el-row>
        <el-table :data="rolelist" border stripe>
          <el-table-column type="expand"></el-table-column>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="角色名稱" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作">
            <template v-slot="scope">
              <el-button type="primary" icon="el-icon-edit" size="medium" @click="showEditDialog(scope.row.id)">編輯</el-button>
              <el-button type="danger" icon="el-icon-delete" size="medium" @click="removeRoleById(scope.row.id)">刪除</el-button>
              <el-button type="warning" icon="el-icon-setting" size="medium">分配權限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!--Add role dialog-->
      <el-dialog title="新增角色" :visible.sync="addDialogVisible" width="40%" @close="addDialogClosed">
        <!--Body-->
        <el-form :model="addForm" :rules="FormRules" ref="addFormRef" label-width="80px">
          <el-form-item label="角色名稱" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!--Footer(Button)-->
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="addRole">確定</el-button>
          <el-button @click="addDialogVisible = false">取消</el-button>
        </span>
      </el-dialog>

      <!--Edit role dialog-->
      <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="40%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="FormRules" ref="editFormRef" label-width="80px">
          <el-form-item label="角色名稱" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form >
        <!--Fotter(Button)-->
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="editRole">確定</el-button>
          <el-button @click="editDialogVisible = false">取消</el-button>
        </span>
      </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色資料列表
      rolelist: [],
      // 控制新增角色對話框顯示狀況
      addDialogVisible: false,
      // 新增角色表單資料
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 角色表單的驗證規則
      FormRules: {
        roleName: [
          { required: true, message: '請輸入角色名稱', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '請輸入角色描述', trigger: 'blur' }
        ]
      },
      // 控制編輯角色對話框顯示狀況
      editDialogVisible: false,
      // 修改角色表單資料
      editForm: {
        roleName: '',
        roleDesc: ''
      }
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 取得角色所有資料
    async getRolesList () {
      // 驗證 API 資料已取得連線(Fake)
      const { data: meta } = await this.$http.get('meta', {
        headers: {
          'Content-Type': 'application/json, text/plain'
        }
      })
      if (meta.status !== 200) return this.$message.error('獲取角色列表失敗！')
      // 取得 API 資料
      const { data: role } = await this.$http.get('roles')
      this.rolelist = role
    },
    // 根據 ID 刪除對應的角色資料
    async removeRoleById (id) {
      const confirmResult = await this.$confirm('確定永久刪除該角色？', '提示', {
        confirmButtonText: '忍心刪除',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      // this.$confirm() 確認會返回 confrim 字串，取消則返回 cancel 字串
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消刪除')
      }

      // 確認按鈕請求刪除 API
      await this.$http.delete(`roles/${id}`)
      // 取得 API 更新狀態(Fake)
      const { data: meta } = await this.$http.get('meta', {
        headers: {
          'Content-Type': 'application/json, text/plain'
        }
      })
      if (meta.status !== 200) {
        return this.$message.error('刪除用戶失敗！')
      }

      this.getRolesList()
      this.$message.success('刪除成功！')
    },
    // 關閉新增角色對話框
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 點擊按鈕添加角色事件
    addRole () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return

        // 發起新增角色 API 請求
        await this.$http.post('roles', this.addForm)
        // 取得 API 更新狀態(Fake)
        const { data: meta } = await this.$http.get('meta', {
          headers: {
            'Content-Type': 'application/json, text/plain'
          }
        })
        if (meta.status !== 200) {
          return this.$message.error('新增角色失敗！')
        }

        this.$message.success('新增角色成功')
        this.addDialogVisible = false
        this.getRolesList()
      })
    },
    // 顯示修改角色對話框
    async showEditDialog (id) {
      // 取得角色資料
      const { data: role } = await this.$http.get('roles', {
        params: { id: id }
      })
      // 取得 API 更新狀態(Fake)
      const { data: meta } = await this.$http.get('meta', {
        headers: {
          'Content-Type': 'application/json, text/plain'
        }
      })
      if (meta.status !== 200) {
        return this.$message.error('請求用戶資料失敗！')
      }
      this.editForm = {
        id: role[0].id,
        roleName: role[0].roleName,
        roleDesc: role[0].roleDesc
      }
      this.editDialogVisible = true
    },
    // 關閉編輯角色對話框
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 點擊按鈕修改角色事件
    editRole () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return

        await this.$http.patch(`roles/${this.editForm.id}`, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        })

        // 取得 API 更新狀態(Fake)
        const { data: meta } = await this.$http.get('meta', {
          headers: {
            'Content-Type': 'application/json, text/plain'
          }
        })
        if (meta.status !== 200) {
          return this.$message.error('修改用戶失敗！')
        }

        this.editDialogVisible = false
        this.getRolesList()
        this.$message.success('更新角色資料成功！')
      })
    }
  }
}
</script>

<style scoped>
</style>
