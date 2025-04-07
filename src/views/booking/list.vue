<template>
  <div class="app-container">
    <!-- filter container -->
    <div class="filter-container">
      <el-form :inline="true" ref="searchFormRef" :model="searchForm">
        <el-form-item>
          <el-button type="success" icon="refresh" circle @click="getVillaList"></el-button>
          <el-button type="primary" icon="plus" circle @click="showAddVillaDialog">
          </el-button>
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input v-model="searchForm.name" @keydown.enter="onSearch" />
        </el-form-item>
        <el-form-item label="Province Code" prop="provinceCode">
          <el-input v-model="searchForm.provinceCode" @keydown.enter="onSearch" />
        </el-form-item>
        <el-form-item label="Suggest Tags" prop="suggestTags">
          <el-input v-model="searchForm.suggestTags" @keydown.enter="onSearch" />
        </el-form-item>
        <el-form-item label="Amenities" prop="amenities">
          <el-input v-model="searchForm.amenities" @keydown.enter="onSearch" />
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
      <el-table-column label="Image" prop="imageIds" width="85">
        <template #default="scope">
          <el-image style="width: 100px; height: 100px" :src="getImage(scope.row.imageIds[0])" fit="contain" />
        </template>
      </el-table-column>
      <el-table-column label="Name" prop="name[0]" width="250" />
      <el-table-column label="Description" prop="description[0]" />
      <el-table-column label="Province code" prop="provinceCode" width="150">
      </el-table-column>
      <el-table-column label="Suggest Tags" width="350">
        <template #default="scope">
          <template v-for="(suggestTag, index) in scope.row.suggestTags" :key="index">
            <el-tag size="small" effect="plain" class="mr-1">
              {{ suggestTag }}
            </el-tag>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="Amenities" width="350">
        <template #default="scope">
          <template v-for="amenity in scope.row.amenities" :key="amenity">
            <el-tag size="small" effect="plain" class="mr-1">
              {{ amenity }}
            </el-tag>
          </template>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="Operations" width="150">
        <template #default="scope">
          <template v-if="true">
            <el-space wrap>
              <span>
                <el-button @click="showUpdateVillaDialog(scope.row.id)">Update Villa</el-button>
              </span>
            </el-space>
          </template>
        </template>
      </el-table-column>
    </el-table>
    <!-- Modal Add/Update villa -->
    <el-dialog v-model="dialogVillaVisible" :title="dialogVillaStatusMap[dialogVillaStatus].title" destroy-on-close>
      <el-form ref="villaFormRef" :model="villaForm" :rules="villaFormRules" status-icon label-position="left"
        label-width="100px">
        <el-form-item label="Name" prop="name">
          <el-input type="text" autocomplete="off" prefix-icon="Management" v-model="villaForm.name">
            <template #append>
              <el-button icon="refresh-right" @click="getFakeVillaName" :loading="getFakeVillaNameLoading"
                :disabled="getFakeVillaNameDisabled" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="Province Code" prop="provinceCode">
          <el-input type="text" autocomplete="off" prefix-icon="Management" v-model="villaForm.provinceCode">
          </el-input>
        </el-form-item>
        <el-form-item label="Address" prop="address">
          <el-input type="text" autocomplete="off" prefix-icon="address" v-model="villaForm.address">
          </el-input>
        </el-form-item>
        <el-form-item label="Suggest Tags" prop="suggestTags">
          <el-input type="text" autocomplete="off" prefix-icon="address" v-model="villaForm.suggestTags">
          </el-input>
        </el-form-item>
        <el-form-item label="Amenities" prop="amenities">
          <el-input type="text" autocomplete="off" prefix-icon="address" v-model="villaForm.amenities">
          </el-input>
        </el-form-item>
        <el-form-item label="Geo" prop="geo">
          <el-input type="text" autocomplete="off" prefix-icon="address" v-model="villaForm.geo">
          </el-input>
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input type="textarea" autocomplete="off" prefix-icon="maxRoom" :rows="2"
            v-model="villaForm.description" />
        </el-form-item>
        <el-form-item label="Upload Image" prop="imageIds">
          <el-upload class="avatar-uploader" action="http://localhost:8080/uploadImage" :show-file-list="false"
            :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
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
import { getListVilla, updateDetail as updateMemberDetail, add as addMember, remove as removeMember, } from 'api/villa'
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

onMounted(async () => {
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
  name: "",
  provinceCode: "",
  suggestTags: [],
  amenities: []
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
  totalData: 0,
})

const getIndex = (index) => {
  return index + 1
}

const getVillaList = () => {
  return new Promise((resolve, reject) => {
    villaListLoading.value = true
    onSearchLoading.value = true
    onSearchDisabled.value = true
    const Params = {};
    for (let el in searchForm) {
      if ((Array.isArray(searchForm[el]) && searchForm[el].length != 0) || (!Array.isArray(searchForm[el]) && searchForm[el])) {
        Params[el] = searchForm[el]
      }
    }
    getListVilla(Params)
      .then((response) => {
        villaList.value = response.data
        page.totalData = response.totalRow
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
const getImage = (imageId) => {
  return `${process.env.VITE_API_DOMAIN}/component/image/${imageId}`
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
    name: "",
    suggestTags: "",
    amenities: "",
    description: "",
    provinceCode: "",
  }
}
const villaForm = reactive(defaultVillaForm())

// ------- add villa -------
const getFakeVillaName = () => {
  getFakeVillaNameLoading.value = true
  getFakeVillaNameDisabled.value = true
  getFakeName()
    .then((response) => {
      villaForm.name = response.data
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

const showAddVillaDialog = async () => {
  Object.assign(villaForm, defaultVillaForm())
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
    username: [{ trigger: ['change', 'blur'], validator: validateUsername }],
    password: [{ trigger: ['change', 'blur'], validator: validatePassword }],
    description: [{ trigger: ['change', 'blur'], validator: validateNickname }],
})

const showUpdateVillaDialog = (_id) => {
  Object.assign(villaForm, defaultVillaForm())
  getVillaDetail({ id: _id })
    .then((response) => {
      Object.assign(villaForm, response.data)
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
