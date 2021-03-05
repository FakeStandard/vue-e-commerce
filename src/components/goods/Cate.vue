<template>
  <div>
    <!--麵包屑-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首頁</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分類</el-breadcrumb-item>
    </el-breadcrumb>
    <!--Card View-->
    <el-card>
        <!--Add button-->
        <el-row>
          <el-col>
            <el-button type="primary" @click="showAddCateDialog">新增分類</el-button>
          </el-col>
        </el-row>
        <!--Body table-->
        <tree-table class="treeTable" :data="catelist.slice((pagenum -1) * pagesize, pagenum * pagesize)" :columns="columns" :selection-type="false" :expand-type="false" :show-index="true" index-text="#" border :show-row-hover="false">
          <template slot="isok" slot-scope="scope">
              <i class="el-icon-success" style="color:lightgreen;" v-if="scope.row.catDeleted === false"></i>
              <i class="el-icon-error" style="color:red;" v-else></i>
          </template>
          <template slot="order" slot-scope="scope">
            <el-tag v-if="scope.row.catLevel === 0">一級</el-tag>
            <el-tag v-else-if="scope.row.catLevel === 1" type="success">二級</el-tag>
            <el-tag v-else type="warning">三級</el-tag>
          </template>
          <template slot="opt" slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.catID)">編輯</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeDialogById(scope.row.catID)">刪除</el-button>
          </template>
        </tree-table>
        <!--Page region-->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
    </el-card>

    <!--增加分類-->
    <el-dialog title="新增分類" :visible.sync="addCateDialogVisible" width="40%" @close="addCateDialogClosed">
      <!--Body-->
      <el-form :model="addCateForm" :rules="CateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分類名稱" prop="catName">
          <el-input v-model="addCateForm.catName"></el-input>
        </el-form-item>
        <el-form-item label="父級分類">
          <!--options 指定數據源-->
          <!--v-modle 選中項的值-->
          <el-cascader expand-trigger="hover" :options="parentCateList" :props="cascaderProps" v-model="selectedKeys" @change="parentCateChanged" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <!--Footer(button)-->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addCate">確 定</el-button>
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>

    <!--編輯分類-->
    <el-dialog title="編輯分類" :visible.sync="editCateDialogVisible" width="40%" @close="editCateDialogClosed">
      <!--Body-->
      <el-form :model="editCateForm" :rules="CateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分類名稱" prop="catName">
          <el-input v-model="editCateForm.catName"></el-input>
        </el-form-item>
      </el-form>
      <!--Footer(button)-->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editCate">確 定</el-button>
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 查詢條件
      queryInfo: {
        type: '3'
      },
      // 商品分類的數據列表，預設為空
      catelist: [],
      pagenum: 1,
      pagesize: 5,
      // 總筆數
      total: 0,
      // 為 Table 指定列的定義
      columns: [
        {
          label: '分類名稱',
          prop: 'catName'
        },
        {
          label: '是否有效',
          // 將當前列定義為模板
          type: 'template',
          // 當前列所使用的模板名稱
          template: 'isok'
        },
        {
          label: '排序',
          // 將當前列定義為模板
          type: 'template',
          // 當前列所使用的模板名稱
          template: 'order'
        },
        {
          label: '操作',
          // 將當前列定義為模板
          type: 'template',
          // 當前列所使用的模板名稱
          template: 'opt'
        }
      ],
      // 控制新增分類對話框的顯示
      addCateDialogVisible: false,
      // 增加分類的表單數據對象
      addCateForm: {
        catParentID: 0,
        catName: '',
        catLevel: 0
      },
      // 增加分類表單驗證的規則
      CateFormRules: {
        catName: [
          { required: true, message: '請輸入分類名稱', trigger: 'blur' }
        ]
      },
      // 父級分類列表
      parentCateList: [],
      // 指定級聯選擇器的配置對象
      cascaderProps: {
        value: 'catID',
        label: 'catName',
        checkStrictly: true,
        children: 'children'
      },
      // 選重的父級分類 ID 數組
      selectedKeys: [],
      // 編輯分類對話框顯示控制
      editCateDialogVisible: false,
      // 編輯分類的表單數據對象
      editCateForm: []
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 獲取商品分類數據
    async getCateList () {
      await this.$http.get('categories', {
        params: this.queryInfo
      }).then((res) => {
        // 把數據列表賦值給 catelist
        this.catelist = res.data
        // 為總筆數賦值
        this.total = res.data.length
      }).catch(() => {
        return this.$message.error('獲取商品分類失敗')
      })
    },
    // 監聽 pagesize 改變事件
    handleSizeChange (newSize) {
      this.pagesize = newSize
      this.getCateList()
    },
    // 監聽 pagenum 改變事件
    handleCurrentChange (newPage) {
      this.pagenum = newPage
      this.getCateList()
    },
    // 開啟新增分類對話框
    showAddCateDialog () {
      // 先取得父級分類數據列表
      this.getParentCateList()
      // 再展示出對話框
      this.addCateDialogVisible = true
    },
    // 取得父級分類數據列表
    async getParentCateList () {
      await this.$http.get('categories', {
        params: { type: 2 }
      }).then((res) => {
        this.parentCateList = res.data
      }).catch(() => {
        return this.$message.error('獲取父級分類數據失敗')
      })
    },
    // 選擇項發生變化觸發事件
    parentCateChanged () {
      // 若 selectedKeys 的 length 大於 0 則為選中父級分類，反之沒有選中任何父級分類
      if (this.selectedKeys.length > 0) {
        this.addCateForm.catParentID = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.catLevel = this.selectedKeys.length
      } else {
        this.addCateForm.catParentID = 0
        this.addCateForm.catLevel = 0
      }
    },
    // 點擊新增分類按鈕事件
    addCate () {
      console.log(this.$refs)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        await this.$http.post('categories', this.addCateForm).then(() => {
          this.$message.success('新增分類成功')
          this.addCateDialogVisible = false
          this.getCateList()
        }).catch(() => {
          return this.$message.error('新增分類失敗')
        })
      })
    },
    // 監聽新增分類對話框的關閉事件，以重製表單數據
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.catLevel = 0
      this.addCateForm.catParentID = 0
    },
    // 監聽編輯分類對話框開啟按鈕事件
    async showEditDialog (id) {
      await this.$http.get(`categories/${id}`).then((res) => {
        this.editCateForm = res.data
        this.editCateDialogVisible = true
      }).catch(() => {
        this.$message.error('取得分類數據失敗')
      })
    },
    // 監聽刪除分類按鈕事件
    async removeDialogById (id) {
      const confirmResult = await this.$confirm('確定永久刪除該分類？', '提示', {
        confirmButtonText: '忍心刪除',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      // this.$confirm() 確認會返回 confrim 字串, 取消則返回 cancel 字串
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消刪除')
      }

      // 刪除為假刪除
      await this.$http.delete(`categories/${id}`).then(() => {
        this.$message.success('刪除分類成功')
        this.getCateList()
      }).catch(() => {
        this.$message.error('刪除分類失敗')
      })
    },
    // 監聽編輯分類對話框關閉事件
    editCateDialogClosed () {
      this.$refs.editCateFormRef.resetFields()
    },
    // 監聽編輯分類對話框確定按鈕事件
    editCate (id) {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        await this.$http.patch(`categories/${this.editCateForm.catID}/catName/${this.editCateForm.catName}`).then(() => {
          this.editCateDialogVisible = false
          this.getCateList()
          this.$message.success('更新分類資料成功')
        }).catch(() => {
          return this.$message.error('更新分類資料失敗')
        })
      })
    }
  }
}
</script>

<style scoped>
.treeTable {
  margin-top: 15px;
}
</style>
