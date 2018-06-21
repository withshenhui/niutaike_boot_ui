<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" :placeholder="$t('table.title')" v-model="listQuery.label">
      </el-input>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">{{$t('table.search')}}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="danger" icon="el-icon-edit">{{$t('table.add')}}</el-button>
    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">
      <el-table-column align="center" type="index" width="65">
      </el-table-column>
      <el-table-column min-width="150px" :label="'名称'" >
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{scope.row.label}}</span>
        </template>
      </el-table-column>
       <el-table-column width="110px" align="center" :label="'二级分类'">
        <template slot-scope="scope">
          <span class="link-type" @click="handleDetail(scope.row)">查看</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('table.actions')" width="380" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <!--<el-button type="success" size="mini" @click="handleAddSon(scope.row)">新增</el-button>-->
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{$t('table.edit')}}</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">{{$t('table.delete')}}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.page" :page-sizes="[5,10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" >
      <el-form class="form-container" :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="90px"  style='width:80%;margin-left:50px;'>
        <el-form-item :label="'名称'" prop="label" >
          <el-input v-model="temp.label" ></el-input>
        </el-form-item>
        </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createDataCancel">{{$t('table.cancel')}}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{$t('table.confirm')}}</el-button>
        <el-button v-else type="primary" @click="updateData">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>

     <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormSonVisible" :append-to-body="appendTo">
      <el-form class="form-container" :rules="rules" ref="dataSonForm" :model="temp" label-position="left" label-width="90px"  style='width:80%;margin-left:50px;'>
        <el-form-item :label="'一级分类'" prop="parent">
          <el-input v-model="temp.label" readonly="readonly"></el-input>
        </el-form-item>
        <el-form-item :label="'分类名称'" prop="labelSon" >
          <el-input  v-model="temp.labelSon"></el-input>
        </el-form-item>
        </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormSonVisible=false">{{$t('table.cancel')}}</el-button>
        <el-button  type="primary" @click="createSonData">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogDetailVisible">
        <el-tree :data="treeTemp" show-checkbox="" node-key="id" default-expand-all :expand-on-click-node="false">
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span>{{ node.label }}</span>
            <span>
              <el-button v-if="data.parent!=0" type="text" size="mini" @click="() => removeSon(node, data)">
                删除
              </el-button>
            </span>
          </span>
        </el-tree>
      <div slot="footer" class="dialog-footer">
         <el-button type="primary" @click="handleAddSon">新增二级分类</el-button>
        <el-button @click="dialogDetailVisible=false">关闭</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchList, createProductType, updateProductType, removeProductType } from '@/api/productType'
import waves from '@/directive/waves' // 水波纹指令
import { parseTime } from '@/utils'

export default {
  name: 'productTypeTable',
  directives: {
    waves
  },
  data() {
    return {
      tableKey: 0,
      appendTo:true,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        label: undefined
        //sort: '+id'
      },
      temp: {
        id: undefined,
        label: '',
        parent:''
      },
      editTemp: {
        id: undefined,
        label: '',
        parent:''
      },
      treeTemp: {
        id: undefined,
        label: '',
        parent:''
      },
      dialogFormVisible: false,
      dialogDetailVisible:false,
      dialogFormSonVisible:false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '添加',
        detail: '查看'
      },
      rules: {
        label: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        labelSon: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.data
        this.total = response.data.count
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    handleUploadSuccess(res, file) {
        // console.log(res.result)
        // this.editTemp.logo = URL.createObjectURL(file.raw);
        this.temp.logo =process.env.BASE_API+"/"+res.result
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        parent:''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createDataCancel() {
      this.dialogFormVisible = false
    },
    editDataCancel() {
      this.dialogFormVisible = false
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        // if(this.temp.logo.startsWith("http"))
        //     this.temp.logo=this.temp.logo.substring(this.temp.logo.lastIndexOf("/")+1,this.temp.logo.length)
        if (valid) {
          createProductType(this.temp).then((result) => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }

      })
    },
    handleDetail(row) {
      const tempData = Object.assign({}, row)
      this.treeTemp=new Array()
      this.treeTemp.push(tempData)
      this.temp=tempData
      console.log(this.treeTemp)
      this.dialogStatus = 'detail'
      this.dialogDetailVisible = true
    },
    handleAddSon(row) {
      this.dialogStatus = 'create'
      this.dialogFormSonVisible = true
      this.$nextTick(() => {
        this.$refs['dataSonForm'].clearValidate()
      })
    },
    createSonData() {
      this.$refs['dataSonForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.parent=this.temp.id
          tempData.id=undefined
          tempData.label=this.temp.labelSon
          createProductType(tempData).then((result) => {
            this.dialogFormSonVisible = false
            this.dialogDetailVisible = false
            this.getList()
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }

      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          // if(tempData.logo.startsWith("http"))
          //   tempData.logo=this.temp.logo.substring(this.temp.logo.lastIndexOf("/")+1,this.temp.logo.length)
          //tempData.gmtModified = parseTime(new Date().getTime,'{y}-{m}-{d} {h}:{i}')
          updateProductType(tempData).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    removeSon(node, data) {
        this.$confirm(`确认删除${node.label}分类以及该分类下的产品吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          removeProductType(data.id).then(() => {
            const parent = node.parent;
            const children = parent.data.children || parent.data;
            const index = children.findIndex(d => d.id === data.id);
            children.splice(index, 1);
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
    },
    handleDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          removeProductType(row.id).then(() => {
            const index = this.list.indexOf(row)
            this.list.splice(index, 1)
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
    }
  }
}
</script>
