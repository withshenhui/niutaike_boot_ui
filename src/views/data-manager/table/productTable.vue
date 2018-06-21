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
      <el-table-column width="160px" align="center" :label="'一级分类'">
        <template slot-scope="scope">
          <span>{{scope.row.productTypeParentName}}</span>
        </template>
      </el-table-column>
      <el-table-column width="160px" align="center" :label="'二级分类'">
        <template slot-scope="scope">
          <span >{{scope.row.productTypeName}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" :label="'商品介绍'">
        <template slot-scope="scope">
          <span class="link-type" @click="handleIntro(scope.row)">查看介绍</span>
        </template>
      </el-table-column>
       <el-table-column width="110px" align="center" :label="'商品详情'">
        <template slot-scope="scope">
          <span class="link-type" @click="handleDetail(scope.row)">查看详情</span>
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :fullscreen="fullScreen" top="5vh"  width="80%">
      <el-form class="form-container" :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="90px"  style='width: 80%; margin-left:50px;'>
         <el-form-item :label="'图片'" prop="logo">
           <!--
            <el-upload
              class="avatar-uploader" multiple
              :action="uploadUrl" 
              :show-file-list="true"
              :on-success="handleUploadSuccess">
              <img :width=300  v-if="temp.logo" :src="temp.logo" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
            -->
            <el-upload :action="uploadUrl" :on-success="handleUploadSuccess"  :file-list="imageList" multiple list-type="picture-card" :on-preview="handlePictureCardPreview" :on-remove="handleImageRemove">
              <i class="el-icon-plus"></i>
            </el-upload>
            <el-dialog :visible.sync="imagePreviewVisible" append-to-body>
              <img width="100%" :src="dialogImageUrl" alt>
            </el-dialog>


        </el-form-item>
        <el-form-item :label="'商品标题'" prop="title" >
          <el-input v-model="temp.title" ></el-input>
        </el-form-item>
        <el-form-item :label="'商品分类'" prop="detailTypeList" >
          <el-cascader :options="typeList" v-model="detailTypeList"></el-cascader>
        </el-form-item>
        <el-form-item :label="'商品介绍'" prop="title" >
          <div class="editor-container">
               <tinymce :height=260 ref="editorIntro"  v-model="temp.intro"></tinymce>
            </div>
        </el-form-item>
        <el-form-item :label="'商品详情'" prop="detail" >
             <div class="editor-container">
               <tinymce :height=260 ref="editorTiny"  v-model="temp.detail"></tinymce>
            </div>
        </el-form-item>
         <el-form-item :label="'SEO标题'" prop="seoTitle" >
          <el-input v-model="temp.seoTitle" ></el-input>
        </el-form-item>
         <el-form-item :label="'SEO描述'" prop="seoDescription" >
          <el-input v-model="temp.seoDescription" ></el-input>
        </el-form-item>
         <el-form-item :label="'SEO关键词'" prop="seoKeyword" >
          <el-input v-model="temp.seoKeyword" ></el-input>
        </el-form-item>
        </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createDataCancel">{{$t('table.cancel')}}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{$t('table.confirm')}}</el-button>
        <el-button v-else type="primary" @click="updateData">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogDetailVisible" width="80%" top="5vh">
      <el-form class="form-container" ref="detailForm"  label-position="left" label-width="90px"  style='width: 80%; margin-left:50px;'>
            <span v-html="detailValue"></span>
        </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogDetailVisible=false">关闭</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import { fetchList, createProduct, updateProduct, removeProduct } from '@/api/product'
import { fetchResult } from '@/api/productType'
import waves from '@/directive/waves' // 水波纹指令
import { parseTime } from '@/utils'

let updateFlag=0

export default {
  name: 'productTable',
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
      typeList:null,
      detailTypeList:[],
      listLoading: true,
      imageList:[],
      imageListArr:[],
      dialogImageUrl:'',
      listQuery: {
        page: 1,
        limit: 20,
        title: undefined,
        showIndex:undefined
        //sort: '+id'
      },
      detailValue:'',
      temp: {
        id: undefined,
        gmtCreate:'',
        title: '',
        detail:'',
        intro:'',
        seoTitle:'',
        seoDescription:'',
        seoKeyword:'',
        productTypeId:'',
        productTypeParentId:'',
        productTypeName:'',
        productTypeParentName:'',
        logo:null
      },
      editTemp: {
        id: undefined,
        gmtCreate:'',
        title: '',
        detail:'',
        intro:'',
        productTypeId:'',
        productTypeParentId:'',
        productTypeName:'',
        productTypeParentName:'',
        seoTitle:'',
        seoDescription:'',
        seoKeyword:'',
        logo:null
      },
      fullScreen: false,
      imagePreviewVisible:false,
      dialogFormVisible: false,
      dialogDetailVisible:false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '添加',
        detail: '查看'
      },
      rules: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        intro: [{ required: true, message: '介绍不能为空', trigger: 'blur' }],
        typeList: [{ required: true, message: '分类不能为空', trigger: 'change' }],
        detail: [{ required: true, message: '详情不能为空', trigger: 'change' }],
        logo: [{ required: true, message: '图片不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList(),
    this.getTypeList()
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
    getTypeList() {
      fetchResult().then(response => {
        this.typeList = response.data
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
        //this.temp.logo =process.env.BASE_API+"/"+res.result
        // if(this.temp.logo!=null)
        //   this.temp.logo=this.temp.logo+","+res.result
        // else
        //   this.temp.logo=res.result
        this.imageListArr.push(res.result)
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        gmtCreate:'',
        title: '',
        detail:'',
        intro:'',
        logo:null
      }
    },
     handleImageRemove(file, fileList) {
        if(file.response!=undefined)
          this.imageListArr.remove(file.response.result)
        this.imageListArr.remove(file.url.substring(file.url.lastIndexOf("/")+1,file.url.length))
        console.log(this.imageListArr)
    },
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url;
        this.imagePreviewVisible = true;
      },
    handleCreate() {
      this.resetTemp()
      this.detailTypeList=[]
      this.imageList=[]
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        if(updateFlag>0){
          this.$refs['editorTiny'].setContent(this.temp.detail)
          this.$refs['editorIntro'].setContent(this.temp.intro)
        }
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
      this.temp.logo=this.imageListArr.join(',')
      console.log(this.detailTypeList[1])
      this.$refs['dataForm'].validate((valid) => {
        // if(this.temp.logo.startsWith("http"))
        //     this.temp.logo=this.temp.logo.substring(this.temp.logo.lastIndexOf("/")+1,this.temp.logo.length)
        if (valid) {
          this.temp.productTypeId=this.detailTypeList[1]
          createProduct(this.temp).then((result) => {
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
    handleIntro(row) {
      this.editTemp = Object.assign({}, row) 
      this.detailValue=this.editTemp.intro
      this.dialogStatus = 'detail'
      this.dialogDetailVisible = true
    },
    handleDetail(row) {
      this.editTemp = Object.assign({}, row) 
      this.detailValue=this.editTemp.detail
      this.dialogStatus = 'detail'
      this.dialogDetailVisible = true
    },
    handleUpdate(row) {
      this.detailTypeList=[]
      this.temp = Object.assign({}, row) // copy obj
      this.detailTypeList.push(this.temp.productTypeParentId)
      this.detailTypeList.push(this.temp.productTypeId)
      console.log(this.detailTypeList)
      // if(this.temp.logo=="")
      //   this.temp.logo=null
      // else
      //   this.temp.logo=process.env.BASE_API+"/"+this.temp.logo
      this.imageList=[]
      this.imageListArr=[]
      let imgArr=this.temp.logo.split(",")
      for (var i = 0; i < imgArr.length; i++) {
        //imageListJson["url"+i] = imgArr[i];
        this.imageList.push({"url":process.env.BASE_API+"/"+imgArr[i]});
        this.imageListArr.push(imgArr[i]);
      }
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        if(updateFlag>0){
          this.$refs['editorTiny'].setContent(row.detail)
          this.$refs['editorIntro'].setContent(row.intro)
        }
          
        this.$refs['dataForm'].clearValidate()
        updateFlag++
      })
    },
    updateData() {
      this.temp.logo=this.imageListArr.join(',')
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          // if(tempData.logo.startsWith("http"))
          //   tempData.logo=this.temp.logo.substring(this.temp.logo.lastIndexOf("/")+1,this.temp.logo.length)
          //tempData.gmtModified = parseTime(new Date().getTime,'{y}-{m}-{d} {h}:{i}')
          updateProduct(tempData).then(() => {
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
          removeProduct(row.id).then(() => {
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