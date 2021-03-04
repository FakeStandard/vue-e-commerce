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
          <!--展開列-->
          <el-table-column type="expand">
            <template v-slot="scope">
              <el-row :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, index1) in scope.row.children" :key="item1.id">
                <el-col :span="5">
                  <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="19">
                  <el-row :class="[index2 === 0 ? '' : 'bdtop', 'vcenter']"  v-for="(item2, index2) in item1.children" :key="item2.id">
                    <el-col :span="6">
                      <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <!--索引列-->
          <el-table-column type="index"></el-table-column>
          <el-table-column label="角色名稱" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作">
            <template v-slot="scope">
              <el-button type="primary" icon="el-icon-edit" size="medium" @click="showEditDialog(scope.row.id)">編輯</el-button>
              <el-button type="danger" icon="el-icon-delete" size="medium" @click="removeRoleById(scope.row.id)">刪除</el-button>
              <el-button type="warning" icon="el-icon-setting" size="medium" @click="showSetRightDialog(scope.row)">分配權限</el-button>
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

      <!--分配權限-->
      <el-dialog title="分配權限" :visible.sync="setRightDialogVisible" width="40%" @close="setRightDialogClosed">
        <!--tree-->
        <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
        <!--Fotter(Button)-->
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="allotRights">確定</el-button>
          <el-button @click="setRightDialogVisible = false">取消</el-button>
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
      addForm: {},
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
      editForm: {},
      // 控制權限分配對話框的顯示
      setRightDialogVisible: false,
      // 所有權限項目
      rightslist: [],
      // 樹形控制項的屬性綁定對象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默認勾選節點 ID
      defKeys: [],
      // 當前開啟分配權限對話框的 ID
      roleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 取得角色所有資料
    async getRolesList () {
      // 取得 API 資料
      const { data: roles } = await this.$http.get('role').catch(() => {
        return this.$message.error('獲取角色列表失敗')
      })
      this.rolelist = roles
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

      // 請求刪除 API
      await this.$http.delete(`role/${id}`).then(() => {
        this.getRolesList()
        this.$message.success('刪除成功')
      }).catch(() => {
        return this.$message.error('刪除用戶失敗')
      })
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
        await this.$http.post('role', this.addForm).then(() => {
          this.$message.success('新增角色成功')
          this.addDialogVisible = false
          this.getRolesList()
        }).catch(() => {
          return this.$message.error('新增角色失敗')
        })
      })
    },
    // 顯示修改角色對話框
    async showEditDialog (id) {
      // 取得角色資料
      await this.$http.get(`role/${id}`).then((res) => {
        this.editDialogVisible = true
        this.editForm = res.data
      }).catch(() => {
        return this.$message.error('請求用戶資料失敗')
      })
    },
    // 關閉編輯角色對話框
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 點擊按鈕修改角色事件
    editRole () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return

        await this.$http.put('role', this.editForm).then(() => {
          this.editDialogVisible = false
          this.getRolesList()
          this.$message.success('更新角色資料成功')
        }).catch(() => {
          return this.$message.error('修改用戶失敗')
        })
      })
    },
    // 根據 ID 刪除對應的權限
    async removeRightById (role, rightId) {
      const confrimResult = await this.$confirm('是否刪除該權限？', '提示', {
        confirmButtonText: '確定刪除',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confrimResult !== 'confirm') {
        return this.$message.info('已取消刪除')
      }

      await this.$http.delete(`role/${role.id}/${rightId}`).then((res) => {
        role.children = res.data
        this.$message.success('刪除成功')
      }).catch(() => {
        this.$message.error('刪除失敗')
      })
    },
    // 開啟分配權限的對話框
    async showSetRightDialog (role) {
      this.roleId = role.id
      this.setRightDialogVisible = true
      // 取得所有權限項目
      await this.$http.get('right/tree').then((res) => {
        this.rightslist = res.data
        // 遞迴取得三級節點 ID
        this.getLeafKeys(role, this.defKeys)
        this.setRightDialogVisible = true
      }).catch(() => {
        this.$message.error('取得角色權限列表失敗')
      })
    },
    // 通過遞迴取得所有三級權限的 ID，並保存到 defKeys[]
    getLeafKeys (node, arr) {
      // 若當前 node 節點不包含 children 屬性，則為三級節點
      if (!node.children) {
        return arr.push(node.id)
      }

      // 若當前 node 節點非三級節點，則使用遞迴找出三級節點
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 監聽分配權限對話框的關閉事件
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 分配權限確定事件
    async allotRights () {
      // 取得所有的 Key
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]

      if (keys !== null) {
        const idStr = keys.join(',')
        await this.$http.post(`role/${this.roleId}/${idStr}`).then(() => {
          this.getRolesList()
          this.setRightDialogVisible = false
          this.$message.success('分配權限成功')
        }).catch((err) => {
          console.log(err)
          this.$message.error('分配權限失敗')
        })
      } else {
        await this.$http.post(`role/${this.roleId}`).then(() => {
          this.$message.success('分配權限成功')
        }).catch(() => {
          this.$message.error('分配權限失敗')
        })
      }
    }
  }
}
</script>

<style scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display:flex;
  align-items: center;
}
</style>
