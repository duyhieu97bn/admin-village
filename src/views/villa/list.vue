<template>
  <div class="app-container">
    <!-- filter container -->
    <div class="filter-container">
      <el-form :inline="true" ref="searchFormRef" :model="searchForm">
        <el-form-item>
          <el-button type="success" icon="refresh" circle @click="getVillaList"></el-button>
          <el-button type="primary" icon="plus" circle @click="showAddMemberDialog">
          </el-button>
        </el-form-item>
        <el-form-item label="Name" prop="villa.name">
          <el-input v-model="searchForm.villa.name" />
        </el-form-item>
        <el-form-item label="Status" prop="villa.status">
          <el-select v-model="searchForm.villa.status" clearable>
            <el-option v-for="item in villaStatusMap" :key="item.value" :label="item.label" :value="item.value"
              :disabled="item.value === searchForm.villa.status" />
          </el-select>
        </el-form-item>
        <el-form-item label="Description" prop="villaData.description">
          <el-input v-model="searchForm.villaData.description" />
        </el-form-item>
        <el-form-item label="Province Code" prop="villaData.provinceCode">
          <el-select v-model="searchForm.villaData.provinceCode" clearable>
            <el-option v-for="item in villaGenderMap" :key="item.value" :label="item.label" :value="item.value"
              :disabled="item.value === searchForm.villaData.provinceCode" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" circle :loading="onSearchLoading" :disabled="onSearchDisabled"
            @click="onSearch"></el-button>
          <el-button type="danger" icon="refresh-left" circle :loading="restSearchLoading" :disabled="restSearchDisabled ||
            !searched ||
            allEmpty(searchForm, ['currentPage', 'pageSize'])
            " @click="restSearch(searchFormRef)"></el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- Header table -->
    <el-table v-loading="villaListLoading" :data="villaList" border highlight-current-row style="width: 100%">
      <el-table-column type="index" :index="getIndex" />
      <el-table-column label="Image" prop="villaData.images" width="85">
        <template #default="scope">
          <el-avatar :size="50" :src="scope.row.villaData.images[0]"></el-avatar>
        </template>
      </el-table-column>
      <el-table-column label="Name" prop="villa.name" width="150" />
      <el-table-column label="Description" prop="villaData.description" width="150" />
      <el-table-column label="Province code" prop="villaData.provinceCode" width="100">
      </el-table-column>
      <el-table-column label="Status" prop="villa.status" width="100">
      </el-table-column>
      <el-table-column label="Max Room" prop="villa.maxRoom" width="100">
      </el-table-column>
      <el-table-column label="Amenities" width="130">
        <template #default="scope">
          <template v-for="amenity in scope.row.amenities" :key="amenity.id">
            <el-tag size="small" effect="plain" class="mr-1">
              {{ amenity.name }}
            </el-tag>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="Price Per Night" prop="villaData.pricePerNight" width="150" />
      <el-table-column label="Price Per Month" prop="villaData.pricePerMonth" width="150" />
      <el-table-column label="Update / Create" width="180">
        <template #default="scope">
          <div>{{ scope.row.villa.logined_at || 'None' }}</div>
          <div>{{ scope.row.villa.created_at }}</div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="Operations">
        <template #default="scope">
          <template v-if="true">
            <el-space wrap>
              <span>
                <el-button @click="showUpdateVillaDialog(scope.row.villaData.id)">Update Villa</el-button>
              </span>
              <span v-if="scope.row.villa.maxRoom === 0">
                <el-popconfirm confirm-button-text="Yes" cancel-button-text="No" icon-color="red"
                  :title="`Are you sure to remove this villa: ${scope.row.villa.name}?`"
                  @confirm="onRemove(scope.row.villaData.id)">
                  <template #reference>
                    <el-button>Remove</el-button>
                  </template>
                </el-popconfirm>
              </span>
            </el-space>
          </template>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background layout="total, sizes, prev, pager, next, jumper" v-model:currentPage="page.currentPage"
      v-model:page-size="page.pageSize" :page-sizes="page.pageSizes" :total="page.totalData"
      @size-change="handleSizeChange" @current-change="handleCurrentChange">
    </el-pagination>
    <!-- Modal Add/Update villa -->
    <el-dialog v-model="dialogVillaVisible" :title="dialogVillaStatusMap[dialogVillaStatus].title" destroy-on-close>
      <el-form ref="villaFormRef" :model="villaForm" :rules="villaFormRules" status-icon label-position="left"
        label-width="100px">
        <el-form-item label="Name" prop="villa.name">
          <el-input type="text" autocomplete="off" prefix-icon="user" v-model="villaForm.villa.name">
            <template #append>
              <el-button icon="refresh-right" @click="getFakeVillaName" :loading="getFakeVillaNameLoading"
                :disabled="getFakeVillaNameDisabled" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="Description" prop="villaData.description">
          <el-input type="textarea" autocomplete="off" prefix-icon="maxRoom" :rows="2"
            v-model="villaForm.villaData.description" />
        </el-form-item>
        <el-form-item label="Status" prop="villa.status">
          <el-select v-model="villaForm.villa.status">
            <el-option v-for="item in villaStatusMap" :key="item.value" :label="item.label" :value="item.value"
              :disabled="item.value === villaForm.villa.status" />
          </el-select>
        </el-form-item>
        <el-form-item label="Max Room" prop="villa.maxRoom">
          <el-input-number v-model="villaForm.villa.maxRoom" :min="1" :max="10" @change="() => { }" />
        </el-form-item>
        <el-form-item label="Province Code" prop="villaData.provinceCode">
          <el-select v-model="villaForm.villaData.provinceCode">
            <el-option v-for="item in villaGenderMap" :key="item.value" :label="item.label" :value="item.value"
              :disabled="item.value === villaForm.villaData.provinceCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="Upload Image" prop="villaData.images">
          <el-upload class="avatar-uploader" action="http://localhost:8080/uploadImage"
              :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
              <img v-if="imageUrl" :src="imageUrl" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon">
                <Plus />
              </el-icon>
            </el-upload>
          <!-- <uploadImage /> -->
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVillaVisible = false">Cancel</el-button>
          <el-button type="danger" @click="resetForm(villaFormRef)">Reset</el-button>
          <el-button type="primary" :loading="submitMemberLoading" :disabled="submitMemberDisabled"
            @click="dialogVillaStatusMap[dialogVillaStatus].submitAction(villaFormRef)">Confirm
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import uploadImage from '../imageUpload/add.vue'
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { resetForm, allEmpty } from 'utils/form'
import Pair from 'utils/Pair'
import { listVilla, listAmenity, detail as getVillaDetail, updateDetail as updateMemberDetail, add as addMember, remove as removeMember, } from 'api/villa'
import { getName as getFakeName } from 'api/fake'

// upload image
import { Plus } from '@element-plus/icons-vue'

const imageUrl = ref('')

const handleAvatarSuccess = (
  response,
  uploadFile
) => {
  console.log(111, uploadFile);

  imageUrl.value = URL.createObjectURL(uploadFile.raw)
}

const beforeAvatarUpload = (rawFile) => {
  if (rawFile.type !== 'image/jpeg') {
    ElMessage.error('Avatar picture must be JPG format!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error('Avatar picture size can not exceed 2MB!')
    return false
  }
  return true
}
// 

const store = useStore()

const villaStatusMap = ref([])
const villaLockMap = ref([])
const villaGenderMap = ref([])

onMounted(async () => {
  const dataList = await Pair.getValueByKey(['villaStatusMap', 'villaLockMap', 'villaGenderMap'])
  villaStatusMap.value = dataList[0].value
  villaLockMap.value = dataList[1].value
  villaGenderMap.value = dataList[2].value
  await getVillaList()
})

const villaListLoading = ref(false)
const villaList = ref([])
const amenities = ref([])

const searched = ref(false)
const onSearchLoading = ref(false)
const onSearchDisabled = ref(false)
const searchFormRef = ref(null)
const searchForm = reactive({
  villa: {
    username: null,
    status: null,
  },
  villaData: {
    description: null,
    provinceCode: null,
  },
  role: {
    name: null,
  },
  currentPage: null,
  pageSize: null,
})

const onSearch = () => {
  searched.value = true
  getVillaList()
}

const restSearchLoading = ref(false)
const restSearchDisabled = ref(false)

const restSearch = async (formEl) => {
  searched.value = false
  restSearchLoading.value = true
  restSearchDisabled.value = true
  resetForm(formEl)
  try {
    await getVillaList()
  } finally {
    restSearchLoading.value = false
    restSearchDisabled.value = false
  }
}

const page = reactive({
  currentPage: 1,
  pageSize: 10,
  pageSizes: [10, 20, 50, 100, 200],
  totalPage: 1,
  prePage: 1,
  nextPage: 1,
  totalData: 0,
})

const handleSizeChange = (pageSize) => {
  page.pageSize = pageSize
  page.currentPage = 1
  getVillaList()
}

const handleCurrentChange = (currentPage) => {
  page.currentPage = currentPage
  getVillaList()
}

const getIndex = (index) => {
  return (page.currentPage - 1) * page.pageSize + index + 1
}

const getRoleList = () => {
  return new Promise((resolve, reject) => {
    listAmenity()
      .then((response) => {
        amenities.value = response.data.list
        resolve(response)
      })
      .catch((error) => {
        ElMessage.error('Get amenities list error')
        console.error('Get amenities list error', error)
        reject(error)
      })
  })
}

const getVillaList = () => {
  return new Promise((resolve, reject) => {
    villaListLoading.value = true
    onSearchLoading.value = true
    onSearchDisabled.value = true
    searchForm.currentPage = page.currentPage
    searchForm.pageSize = page.pageSize
    listVilla(searchForm)
      .then((response) => {
        villaList.value = response.data.list
        page.totalData = response.data.total
        page.currentPage = response.data.currentPage
        page.pageSize = response.data.pageSize
        page.totalPage = response.data.totalPage
        resolve(response)
      })
      .catch((error) => {
        ElMessage.error('Get villa list error')
        console.error('Get villa list error', error)
        reject(error)
      })
      .finally(() => {
        villaListLoading.value = false
        onSearchLoading.value = false
        onSearchDisabled.value = false
      })
  })
}

const dialogVillaStatusMap = {
  add: {
    title: 'Add Villa',
    submitAction: (formEl) => onAddVilla(formEl),
  },
  update: {
    title: 'Update Villa',
    submitAction: (formEl) => onUpdateVilla(formEl),
  },
}
const dialogVillaStatus = ref('add')
const dialogVillaVisible = ref(false)
const submitMemberLoading = ref(false)
const submitMemberDisabled = ref(false)
const getFakeVillaNameLoading = ref(false)
const getFakeVillaNameDisabled = ref(false)
const villaFormRef = ref(null)
const defaultVillaForm = () => {
  return {
    villa: {
      id: null,
      username: null,
      password: null,
      status: null,
      maxRoom: null,
    },
    villaData: {
      images: null,
      description: null,
      provinceCode: null,
    },
  }
}
const villaForm = reactive(defaultVillaForm())

// ------- add villa -------
const getFakeVillaName = () => {
  getFakeVillaNameLoading.value = true
  getFakeVillaNameDisabled.value = true
  getFakeName()
    .then((response) => {
      villaForm.villa.name = response.data
    })
    .catch((error) => {
      ElMessage.error('Get fake name error')
      console.error('Get fake name error', error)
    })
    .finally(() => {
      getFakeVillaNameLoading.value = false
      getFakeVillaNameDisabled.value = false
    })
}

const showAddMemberDialog = async () => {
  Object.assign(villaForm, defaultVillaForm())
  await getRoleList()
  dialogVillaStatus.value = 'add'
  dialogVillaVisible.value = true
}

const onAddVilla = () => {
  submitMemberLoading.value = true
  submitMemberDisabled.value = true
  addMember(villaForm)
    .then(async () => {
      await getVillaList()
      ElMessage.success('Add villa success')
      dialogVillaVisible.value = false
    })
    .catch((error) => {
      ElMessage.error('Add villa error')
      console.error('Add villa error', error)
    })
    .finally(() => {
      submitMemberLoading.value = false
      submitMemberDisabled.value = false
    })
}

// ------- update villa -------
const validateUsername = (rule, value, callback) => {
  if (!value) {
    submitMemberDisabled.value = true
    callback(new Error('Please input username'))
  } else {
    if (value.length < 3) {
      submitMemberDisabled.value = true
      callback(new Error('Username length must be over 3'))
    } else {
      submitMemberDisabled.value = false
      callback()
    }
  }
}
const validatePassword = (rule, value, callback) => {
  if (value) {
    if (value.length < 3) {
      submitMemberDisabled.value = true
      callback(new Error('Password length must be over 3'))
    } else {
      submitMemberDisabled.value = false
      callback()
    }
  }
}
const validateNickname = (rule, value, callback) => {
  if (!value) {
    submitMemberDisabled.value = true
    callback(new Error('Please input description'))
  } else {
    if (value.length < 3) {
      submitMemberDisabled.value = true
      callback(new Error('Nickname length must be over 3'))
    } else {
      submitMemberDisabled.value = false
      callback()
    }
  }
}

const villaFormRules = reactive({
  villa: {
    username: [{ trigger: ['change', 'blur'], validator: validateUsername }],
    password: [{ trigger: ['change', 'blur'], validator: validatePassword }],
  },
  villaData: {
    description: [{ trigger: ['change', 'blur'], validator: validateNickname }],
  },
})

const showUpdateVillaDialog = (provinceCode) => {
  Object.assign(villaForm, defaultVillaForm())
  getVillaDetail({ id: provinceCode })
    .then((response) => {
      villaForm.villa = response.data.villa
      villaForm.villaData = response.data.villaData
      dialogVillaStatus.value = 'update'
      dialogVillaVisible.value = true
    })
    .catch((error) => {
      ElMessage.error('Get villa detail error')
      console.error('Get villa detail error', error)
    })
}

const onUpdateVilla = () => {
  submitMemberLoading.value = true
  submitMemberDisabled.value = true
  updateMemberDetail(villaForm)
    .then(async () => {
      await getVillaList()
      ElMessage.success('Update villa detail success')
      dialogVillaVisible.value = false
    })
    .catch((error) => {
      ElMessage.error('Update villa detail error')
      console.error('Update villa detail error', error)
    })
    .finally(() => {
      submitMemberLoading.value = false
      submitMemberDisabled.value = false
    })
}

const defaultMemberRoleForm = () => {
  return {
    provinceCode: null,
    amenities: [],
  }
}
const villaRoleForm = reactive(defaultMemberRoleForm())

const showUpdateMemberRoleDialog = (provinceCode) => {
  Object.assign(villaRoleForm, defaultMemberRoleForm())
  getVillaDetail({ id: provinceCode })
    .then(async (response) => {
      villaRoleForm.provinceCode = response.data.villa.id
      villaRoleForm.amenities = response.data.amenities
      await getRoleList()
    })
    .catch((error) => {
      ElMessage.error('Get villa detail error')
      console.error('Get villa detail error', error)
    })
}


// ------- remove villa -------
const onRemove = (provinceCode) => {
  removeMember({ id: provinceCode })
    .then(async () => {
      await getVillaList()
      ElMessage.success('Remove villa success')
    })
    .catch((error) => {
      ElMessage.error('Remove villa error')
      console.error('Remove villa error', error)
    })
}
</script>

<style lang="scss" scoped>
.filter-container {
  margin-bottom: 20px;
}

.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

<style lang="scss">
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
