<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" :placeholder="$t('table.title')" v-model="listQuery.title">
      </el-input>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">{{$t('table.search')}}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="danger" icon="el-icon-edit">{{$t('table.add')}}</el-button>
    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">
      <el-table-column align="center" type="index" width="65">
      </el-table-column>
      <el-table-column width="160px" align="center" :label="$t('table.gmtCreate')">
        <template slot-scope="scope">
          <span>{{scope.row.gmtCreate}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150px" :label="'标题'" >
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{scope.row.title}}</span>
        </template>
      </el-table-column>
       <el-table-column width="110px" align="center" :label="'新闻详情'">
        <template slot-scope="scope">
          <span class="link-type" @click="handleDetail(scope.row)">查看</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" :label="'类型名称'" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.type | typeFilter">{{scope.row.type | typeValueFilter}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('table.actions')" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" top="5vh" width="80%" >
      <el-form class="form-container" :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="90px"  style='width: 80%; margin-left:50px;'>
         <el-form-item :label="'图片'" prop="logo">
            <el-upload
              class="avatar-uploader"
              :action="uploadUrl"
              :show-file-list="false"
              :on-success="handleUploadSuccess">
              <img :width=300  v-if="temp.logo" :src="temp.logo" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
        </el-form-item>
         <el-form-item :label="'新闻类型'" prop="type">
          <el-select class="filter-item"  ref="typeSelect" v-model="temp.type" placeholder="请选择">
           <el-option v-for="item in  typeOptions" :key="item.key" :label="item.value" :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="'标题'" prop="title" >
          <el-input v-model="temp.title" ></el-input>
        </el-form-item>
        <el-form-item :label="'详情'" prop="detail" >
             <div class="editor-container">
               <tinymce :height=260 ref="editorTiny"  v-model="temp.detail"></tinymce>
            </div>
        </el-form-item>
        </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createDataCancel">{{$t('table.cancel')}}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{$t('table.confirm')}}</el-button>
        <el-button v-else type="primary" @click="updateData">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogDetailVisible" >
      <el-form class="form-container" ref="detailForm" :model="editTemp" label-position="left" label-width="90px"  style='width: 80%; margin-left:50px;'>
            <span v-html="editTemp.detail"></span>
        </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogDetailVisible=false">关闭</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import { fetchList, createNews, updateNews, removeNews } from '@/api/news'
import waves from '@/directive/waves' // 水波纹指令
import { parseTime } from '@/utils'

let updateFlag=0

export default {
  name: 'newsTable',
  directives: {
    waves
  },
  components: { Tinymce },
  data() {
    return {
      uploadUrl:process.env.BASE_API+"/rest/upload",
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        title: undefined,
        showIndex:undefined
        //sort: '+id'
      },
      temp: {
        id: undefined,
        gmtCreate:'',
        title: '',
        detail:'',
        type:'',
        logo:null
      },
      editTemp: {
       id: undefined,
        gmtCreate:'',
        title: '',
        detail:'',
        type:'',
        logo:null
      },
      dialogFormVisible: false,
      dialogDetailVisible:false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '添加',
        detail: '查看'
      },
      typeOptions: [{'key':'COMPANY','value':'公司新闻'}, {'key':'INDUSTRY','value':'行业动态'}, {'key':'TECH','value':'技术百科'}],
      rules: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '类型不能为空', trigger: 'blur' }],
        detail: [{ required: true, message: '详情不能为空', trigger: 'change' }],
        logo: [{ required: true, message: '图片不能为空', trigger: 'change' }]
      }
    }
  },
  filters: {
    typeFilter(type) {
      const typeMap = {
        COMPANY: 'success',
        INDUSTRY: 'danger',
        TECH: 'info'
      }
      return typeMap[type]
    }
    ,typeValueFilter(type) {
      const typeMap = {
        COMPANY: '公司新闻',
        INDUSTRY: '行业动态',
        TECH:'技术百科'
      }
      return typeMap[type]
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
        gmtCreate:'',
        title: '',
        detail:'',
        type:'',
        logo:null
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        if(updateFlag>0)
          this.$refs['editorTiny'].setContent(this.temp.detail)
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
          createNews(this.temp).then((result) => {
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
      this.editTemp = Object.assign({}, row) 
      this.dialogStatus = 'detail'
      this.dialogDetailVisible = true
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      if(this.temp.logo=="")
        this.temp.logo=null
      else
        this.temp.logo=process.env.BASE_API+"/"+this.temp.logo
        
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        if(updateFlag>0)
          this.$refs['editorTiny'].setContent(row.detail)
        this.$refs['dataForm'].clearValidate()
        updateFlag++
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          // if(tempData.logo.startsWith("http"))
          //   tempData.logo=this.temp.logo.substring(this.temp.logo.lastIndexOf("/")+1,this.temp.logo.length)
          //tempData.gmtModified = parseTime(new Date().getTime,'{y}-{m}-{d} {h}:{i}')
          updateNews(tempData).then(() => {
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
    handleDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          removeNews(row.id).then(() => {
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
<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>