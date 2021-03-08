<template>
  <div>
    <!--麵包屑-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首頁</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>參數列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--Card View-->
    <el-card>
        <!--Alert area-->
        <el-alert title="注意：只允許為第三級分類設置相關參數" type="warning" show-icon :closable="false"></el-alert>
        <!--選擇商品分類區域-->
        <el-row class="cat_opt">
          <el-col>
              <span>選擇商品分類</span>
              <!--選擇商品分類的級聯選單-->
              <el-cascader expand-trigger="hover" :options="catelist" :props="cateProps" v-model="selectedCateKeys" @change="handleChange" clearable></el-cascader>
          </el-col>
        </el-row>
        <!--Tabs area-->
        <el-tabs v-model="activeName" @tab-click="handleTabClick">
          <!--動態參數面板-->
          <el-tab-pane label="動態參數" name="many">
            <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">新增參數</el-button>
            <!--動態參數表格-->
            <el-table :data="manyTableData" border stripe>
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!--循環渲染 Tag 標籤-->
                  <el-tag v-for="(item, index) in scope.row.attrVals" :key="item.id" closable @close="handleClose(index, item.id, scope.row)">{{item.name}}</el-tag>
                  <!--輸入 Tag 文本框-->
                  <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)" size="small"></el-input>
                  <!--新增 Tag 按鈕-->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column label="參數名稱" prop="attrName"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">編輯</el-button>
                  <el-button type="danger" icon="el-icon-delete" @click="removeParams(scope.row.id)">刪除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <!--靜態屬性面板-->
          <el-tab-pane label="靜態屬性" name="only">
            <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">新增屬性</el-button>
            <!--靜態屬性表格-->
            <el-table :data="onlyTableData" border stripe>
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!--循環渲染 Tag 標籤-->
                  <el-tag v-for="(item, index) in scope.row.attrVals" :key="item.id" closable @close="handleClose(index, item.id, scope.row)">{{item.name}}</el-tag>
                  <!--輸入 Tag 文本框-->
                  <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)" size="small"></el-input>
                  <!--新增 Tag 按鈕-->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column label="屬性名稱" prop="attrName"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">編輯</el-button>
                  <el-button type="danger" icon="el-icon-delete" @click="removeParams(scope.row.id)">刪除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
    </el-card>
    <!--新增動態參數與靜態屬性對話框-->
    <el-dialog :title="'新增' + titleText" :visible.sync="addDialogVisible" width="40%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="FormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attrName">
          <el-input v-model="addForm.attrName"></el-input>
        </el-form-item>
      </el-form>
      <!--Fotter(Button)-->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addParams">確定</el-button>
        <el-button @click="addDialogVisible = false">取消</el-button>
      </span>
    </el-dialog>
    <!--修改動態參數與靜態屬性的對話框-->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="40%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="FormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attrName">
          <el-input v-model="editForm.attrName"></el-input>
        </el-form-item>
      </el-form>
      <!--Fotter(Button)-->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editParams">確定</el-button>
        <el-button @click="editDialogVisible = false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分類列表
      catelist: [],
      // 級聯選擇框的配置對象
      cateProps: {
        value: 'catID',
        label: 'catName',
        children: 'children'
      },
      // 級聯選擇框雙向綁定的數組
      selectedCateKeys: [],
      // 被選擇的頁簽名稱
      activeName: 'many',
      // 動態參數數據
      manyTableData: [],
      // 靜態屬性數據
      onlyTableData: [],
      // 控制新增對話框顯示與隱藏
      addDialogVisible: false,
      // 新增參數表單數據對象
      addForm: {
        attrName: ''
      },
      // 添加表單驗證規則對象
      FormRules: {
        attrName: [
          { required: true, message: '請輸入參數名稱', trigger: 'blur' }
        ]
      },
      // 控制修改對話框顯示與隱藏
      editDialogVisible: false,
      // 修改參數表單的數據對象
      editForm: {}
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 獲取所有商品分類列表
    async getCateList () {
      await this.$http.get('categories').then((res) => {
        this.catelist = res.data
      }).catch(() => {
        this.$message.error('獲取商品分類失敗')
      })
    },
    // 級聯選擇框選中項變化觸發的事件
    handleChange () {
      this.getParamsData()
    },
    // Tab 點擊事件處理函數
    handleTabClick () {
      this.getParamsData()
    },
    // 獲取參數的列表數據
    async getParamsData () {
      if (this.selectedCateKeys.length !== 0) {
        // 根據所選分類 ID 和當前所處面板，獲取對應的參數
        await this.$http.get(`params/${this.cateId}/${this.activeName}`).then((res) => {
          res.data.forEach(item => {
            // 控制 Tag 文本框顯示與隱藏
            item.inputVisible = false
            item.inputValue = ''
          })
          if (this.activeName === 'many') {
            this.manyTableData = res.data
          } else {
            this.onlyTableData = res.data
          }
        }).catch(() => {
          this.$message.error('獲取參數列表失敗')
        })
      } else {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
      }
    },
    // 監聽新增對話框關閉事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 點擊新增參數按鈕事件
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        await this.$http.post('params', {
          CategoriesID: this.cateId,
          attrName: this.addForm.attrName,
          attrType: this.activeName
        }).then(() => {
          this.$message.success('新增分類參數成功')
          this.addDialogVisible = false
          this.getParamsData()
        }).catch(() => {
          this.$message.error('新增分類參數失敗')
        })
      })
    },
    // 點擊按鈕顯示修改的對話框
    async showEditDialog (id) {
      await this.$http.get(`params/${id}`).then((res) => {
        this.editForm = res.data
        this.editDialogVisible = true
      }).catch(() => {
        this.$message.error('獲取分類參數失敗')
      })
    },
    // 重製修改參數表單
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 點擊修改參數按鈕事件
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        await this.$http.patch(`params/${this.editForm.id}/${this.editForm.attrName}`).then(() => {
          this.$message.success('修改分類參數成功')
          this.getParamsData()
          this.editDialogVisible = false
        }).catch(() => {
          this.$message.error('修改分類參數失敗')
        })
      })
    },
    // 點擊刪除參數按鈕事件
    async removeParams (id) {
      const confirmResult = await this.$confirm('確定永久刪除該分類參數？', '提示', {
        confirmButtonText: '忍心刪除',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      // this.$confirm() 確認會返回 confrim 字串, 取消則返回 cancel 字串
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消刪除')
      }

      // 請求刪除 API
      await this.$http.delete(`params/${id}`).then(() => {
        this.$message.success('刪除分類參數成功')
        this.getParamsData()
      }).catch(() => {
        this.$message.error('刪除分類參數失敗')
      })
    },
    // 文本框輸入焦點或和按下 Enter 觸發事件
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false
        row.inputValue = ''
      } else {
        // 發起 API 請求
        await this.$http.post('params/tag', { Name: row.inputValue.trim(), ParamsID: row.id }).then((res) => {
          row.attrVals.push({ id: res.data, name: row.inputValue.trim(), paramsId: row.id })
          row.inputValue = ''
          row.inputVisible = false
        }).catch(() => {
          this.$message.error('建立參數標籤失敗')
        })
      }
    },
    // 點籍按鈕展示文本輸入框
    showInput (row) {
      row.inputVisible = true
      // 讓文本框自動獲得焦點
      // $nextTick 方法的作用為當頁面上元素被重新渲染之後，才指定回傳函數中的代碼
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 刪除對應的參數標籤
    async handleClose (index, id, row) {
      await this.$http.delete(`params/tag/${id}`).then(() => {
        row.attrVals.splice(index, 1)
        row.inputValue = ''
        row.inputVisible = false
      }).catch(() => {
        this.$.message.error('刪除參數標籤成功')
      })
    }
  },
  // 計算屬性
  computed: {
    // 如果按鈕須被禁用，則返回 true，反之返回 false
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    // 當前選中的三級分類 ID
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      } else {
        return null
      }
    },
    // 動態計算標題文字
    titleText () {
      if (this.activeName === 'many') {
        return '動態參數'
      } else {
        return '靜態屬性'
      }
    }
  }
}
</script>

<style scoped>
.cat_opt {
  margin: 15px 0;
}
.el-cascader {
  margin-left: 15px;
  width: 40%;
}
.el-tag {
  margin-right: 10px;
  margin-top: 10px;
}
.input-new-tag {
  width: 120px;
}
.button-new-tag {
  margin-top: 10px;
  margin-right: 10px;
}
.input-new-tag {
  margin-top: 10px;
  margin-right: 10px;
}
</style>
