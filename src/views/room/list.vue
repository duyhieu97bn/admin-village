<template>
  <div class="app-container">
    <!-- filter container -->
    <div class="filter-container">
      <el-form :inline="true" ref="searchFormRef" :model="searchForm">
        <el-form-item>
          <el-button type="success" icon="refresh" circle @click="getRoomList"></el-button>
          <el-button type="primary" icon="plus" circle @click="showAddRoomDialog">
          </el-button>
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input v-model="searchForm.name" @keydown.enter="onSearch" />
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
    <el-table v-loading="roomListLoading" :data="roomList" border highlight-current-row style="width: 100%">
      <el-table-column type="index" :index="getIndex" />
      <el-table-column label="Image" prop="imageIds" width="85">
        <template #default="scope">
          <el-image style="width: 100px; height: 100px" :src="getImage(scope.row.imageIds[0])" fit="contain" />
        </template>
      </el-table-column>
      <el-table-column label="Name" prop="name[0]" />
      <el-table-column label="Villa ID" prop="villaId" width="80">
      </el-table-column>
      <el-table-column label="Room Type" prop="roomType" width="150">
        <template #default="scope">
          {{ getRoomTypeName(scope.row.roomType) }}
        </template>
      </el-table-column>
      <el-table-column label="Max Persons" prop="maxPersons" width="150">
      </el-table-column>
      <el-table-column label="Amenities" width="130">
        <template #default="scope">
          <template v-for="amenity in scope.row.amenities" :key="amenity">
            <el-tag size="small" effect="plain" class="mr-1">
              {{ getAmenityName(amenity) }}
            </el-tag>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="Price Per Night" prop="pricePerNight" width="150" />
      <el-table-column label="Price Per Month" prop="pricePerMonth" width="150" />
      <el-table-column fixed="right" label="Operations" width="270">
        <template #default="scope">
          <template v-if="true">
            <el-space wrap>
              <span>
                <el-button @click="showUpdateRoomDialog(scope.row.id)">Update Room</el-button>
              </span>
              <span>
                <el-popconfirm confirm-button-text="Yes" cancel-button-text="No" icon-color="red"
                  :title="`Are you sure to remove this room: ${scope.row.nameShow}?`" @confirm="onRemove(scope.row.id)">
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
    <!-- Add/Update-->
    <el-pagination background layout="total, sizes, prev, pager, next, jumper" v-model:currentPage="page.currentPage"
      v-model:page-size="page.pageSize" :page-sizes="page.pageSizes" :total="page.totalData"
      @size-change="handleSizeChange" @current-change="handleCurrentChange">
    </el-pagination>
    <el-dialog v-model="dialogMemberVisible" :title="dialogMemberStatusMap[dialogMemberStatus].title" destroy-on-close>
      <el-form ref="roomFormRef" :model="roomForm" :rules="roomFormRules" status-icon label-position="left"
        label-width="100px">
        <el-form-item label="Villa" prop="villaId">
          <el-select v-model="roomForm.villaId">
            <el-option v-for="item in listVilla" :key="item.id" :label="item.name[0]" :value="item.id"
              :disabled="item.id === roomForm.villaId" />
          </el-select>
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input type="text" autocomplete="off" prefix-icon="Management" v-model="roomForm.nameShow">
          </el-input>
        </el-form-item>
        <el-form-item label="Room Type" prop="roomType">
          <el-select v-model="roomForm.roomType">
            <el-option v-for="item in dropdownRoomType" :key="item.value" :label="item.label" :value="item.value"
              :disabled="item.value === roomForm.roomType" />
          </el-select>
        </el-form-item>
        <el-form-item label="Area" prop="area">
          <el-input type="text" autocomplete="off" v-model="roomForm.area">
          </el-input>
        </el-form-item>
        <el-form-item label="Max Persons" prop="maxPersons">
          <el-input-number v-model="roomForm.maxPersons" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="Amenities" prop="amenities">
          <el-select-v2 v-model="roomForm.amenities" filterable :options="dropdownAmenities" placeholder="Please select"
            style="width: 240px" multiple />
        </el-form-item>
        <el-form-item label="Price Per Night" prop="pricePerNight">
          <el-input-number v-model="roomForm.pricePerNight" :min="0" :max="100000000" :step="10000">
            <template #prefix>
              <span>đ</span>
            </template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="Price Per Month" prop="pricePerMonth">
          <el-input-number v-model="roomForm.pricePerMonth" :min="0" :max="100000000" :step="10000">
            <template #prefix>
              <span>đ</span>
            </template>
          </el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogMemberVisible = false">Cancel</el-button>
          <el-button type="danger" @click="resetForm(roomFormRef)">Reset</el-button>
          <el-button type="primary" :loading="submitRoomLoading" :disabled="submitRoomDisabled"
            @click="dialogMemberStatusMap[dialogMemberStatus].submitAction(roomFormRef)">Confirm
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { resetForm, allEmpty } from 'utils/form'
import { listRoom, updateDetail as updateRoomDetail, add as addRoom, remove as removeMember, } from 'api/room'
import { getListAmenity, getListRoomType } from 'api/component'
import { getListVilla } from 'api/villa'

const store = useStore()
const room = computed(() => store.getters.room.room)

onMounted(async () => {
  getVillaList();
  getAmenities();
  getRoomType();
  await getRoomList();
})
const getRoomType = () => {
  return new Promise((resolve, reject) => {
    getListRoomType()
      .then((response) => {
        listRoomType.value = response.data
        dropdownRoomType.value = response.data.map((item) => {
          return {
            value: item.code,
            label: item.name[0],
          }
        })
        resolve(response)
      })
      .catch((error) => {
        ElMessage.error('Get room type list error')
        console.error('Get room type list error', error)
        reject(error)
      })
      .finally(() => {
      })
  })
}
const getRoomTypeName = (roomTypeCode) => {
  const roomType = listRoomType.value.find((item) => item.code === roomTypeCode)
  return roomType ? roomType.name[0] : ''
}
const dropdownRoomType = ref([])
const listVilla = ref([])
const roomListLoading = ref(false)
const roomList = ref([])
const listAmenities = ref([])
const listRoomType = ref([])
const getAmenities = () => {
  return new Promise((resolve, reject) => {
    getListAmenity()
      .then((response) => {
        listAmenities.value = response.data
        dropdownAmenities.value = response.data.map((item) => {
          return {
            value: item.code,
            label: item.name[0],
          }
        })
        resolve(response)
      })
      .catch((error) => {
        ElMessage.error('Get amenities list error')
        console.error('Get amenities list error', error)
        reject(error)
      })
      .finally(() => {
      })
  })
}
const getAmenityName = (amenityCode) => {
  const amenity = listAmenities.value.find((item) => item.code === amenityCode)
  return amenity ? amenity.name[0] : ''
}
const dropdownAmenities = ref([])

const searched = ref(false)
const onSearchLoading = ref(false)
const onSearchDisabled = ref(false)
const searchFormRef = ref(null)
const searchForm = reactive({
  name: "",
  amenities: []
})

const onSearch = () => {
  searched.value = true
  getRoomList()
}

const restSearchLoading = ref(false)
const restSearchDisabled = ref(false)

const restSearch = async (formEl) => {
  searched.value = false
  restSearchLoading.value = true
  restSearchDisabled.value = true
  resetForm(formEl)
  try {
    await getRoomList()
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
  getRoomList()
}

const handleCurrentChange = (currentPage) => {
  page.currentPage = currentPage
  getRoomList()
}

const getIndex = (index) => {
  return (page.currentPage - 1) * page.pageSize + index + 1
}

const getRoomList = () => {
  return new Promise((resolve, reject) => {
    roomListLoading.value = true
    onSearchLoading.value = true
    onSearchDisabled.value = true
    const Params = {};
    for (let el in searchForm) {
      if ((Array.isArray(searchForm[el]) && searchForm[el].length != 0) || (!Array.isArray(searchForm[el]) && searchForm[el])) {
        Params[el] = searchForm[el]
      }
    }
    listRoom(Params)
      .then((response) => {
        roomList.value = response.data
        page.totalData = response.totalRow
        resolve(response)
      })
      .catch((error) => {
        ElMessage.error('Get room list error')
        console.error('Get room list error', error)
        reject(error)
      })
      .finally(() => {
        roomListLoading.value = false
        onSearchLoading.value = false
        onSearchDisabled.value = false
      })
  })
}

const dialogMemberStatusMap = {
  add: {
    title: 'Add Room',
    submitAction: (formEl) => onAddRoom(formEl),
  },
  update: {
    title: 'Update Room',
    submitAction: (formEl) => onUpdateRoom(formEl),
  },
}
const dialogMemberStatus = ref('add')
const dialogMemberVisible = ref(false)
const submitRoomLoading = ref(false)
const submitRoomDisabled = ref(false)
const roomFormRef = ref(null)
const defaultRoomForm = () => {
  return {
    id: null,
    villaId: null,
    name: null,
    nameShow: null,
    roomType: null,
    area: null,
    maxPersons: null,
    amenities: [],
    pricePerNight: null,
    pricePerMonth: null,
  }
}
const roomForm = reactive(defaultRoomForm())

// ------- add room -------
const getVillaList = () => {
  return new Promise((resolve, reject) => {
    getListVilla()
      .then((response) => {
        listVilla.value = response.data;

        resolve(response)
      })
      .catch((error) => {
        ElMessage.error('Get villa list error')
        console.error('Get villa list error', error)
        reject(error)
      })
      .finally(() => {
      })
  })
}
const showAddRoomDialog = async () => {
  Object.assign(roomForm, defaultRoomForm())
  dialogMemberStatus.value = 'add'
  dialogMemberVisible.value = true
  submitRoomDisabled.value = true
}

const showUpdateRoomDialog = async (roomId) => {
  listRoom({ ids: [roomId] })
    .then((response) => {
      let data = response.data[0] || {};
      roomForm.id = null;
      for (let key in roomForm) {
        if (data[key]) {
          roomForm[key] = data[key]
        }
        if (roomForm.name) {
          roomForm.nameShow = roomForm.name[0]
        }
      }
      dialogMemberStatus.value = 'update'
      dialogMemberVisible.value = true
    })
    .catch((error) => {
      ElMessage.error('Get room detail error')
      console.error('Get room detail error', error)
    })
}

const onAddRoom = () => {
  submitRoomLoading.value = true
  submitRoomDisabled.value = true
  roomForm.name = [roomForm.nameShow, roomForm.nameShow]
  delete roomForm.id
  addRoom(roomForm)
    .then(async () => {
      await getRoomList()
      ElMessage.success('Add room success')
      dialogMemberVisible.value = false
    })
    .catch((error) => {
      ElMessage.error('Add room error')
      console.error('Add room error', error)
    })
    .finally(() => {
      submitRoomLoading.value = false
      submitRoomDisabled.value = false
    })
}

const getImage = (imageId) => {
  return imageId ? `${process.env.VITE_API_DOMAIN}/component/image/${imageId}` : "https://picsum.photos/200"
}
// ------- update room -------
const validateVillaId = (rule, value, callback) => {
  if (!value) {
    submitRoomDisabled.value = true
    callback(new Error('Please select Villa'))
  } else {
    submitRoomDisabled.value = false
    callback()
  }
}
const validateName = (rule, value, callback) => {
  if (!value) {
    submitRoomDisabled.value = true
    callback(new Error('Please input room name'))
  } else {
    if (value.length < 3) {
      submitRoomDisabled.value = true
      callback(new Error('Room name length must be over 3'))
    } else {
      submitRoomDisabled.value = false
      callback()
    }
  }
}
const validatePricePerNight = (rule, value, callback) => {
  if (!value) {
    submitRoomDisabled.value = true
    callback(new Error('Please set Price Per Night'))
  } else {
    submitRoomDisabled.value = false
    callback()
  }
}
const validatePricePerMonth = (rule, value, callback) => {
  if (!value) {
    submitRoomDisabled.value = true
    callback(new Error('Please set Price Per Month'))
  } else {
    submitRoomDisabled.value = false
    callback()
  }
}

const roomFormRules = reactive({
  villaId: [{ trigger: ['change', 'blur'], validator: validateVillaId }],
  nameShow: [{ trigger: ['change', 'blur'], validator: validateName }],
  pricePerNight: [{ trigger: ['change', 'blur'], validator: validatePricePerNight }],
  pricePerMonth: [{ trigger: ['change', 'blur'], validator: validatePricePerMonth }],
})


const onUpdateRoom = () => {
  submitRoomLoading.value = true
  submitRoomDisabled.value = true
  roomForm.name[0] = roomForm.nameShow
  console.log('roomForm', roomForm);
  
  updateRoomDetail(roomForm)
    .then(async () => {
      await getRoomList()
      ElMessage.success('Update room detail success')
      dialogMemberVisible.value = false
    })
    .catch((error) => {
      ElMessage.error('Update room detail error')
      console.error('Update room detail error', error)
    })
    .finally(() => {
      submitRoomLoading.value = false
      submitRoomDisabled.value = false
    })
  
  submitRoomLoading.value = false
  submitRoomDisabled.value = false
}

// ------- remove room -------
const onRemove = (roomId) => {
  removeMember({ id: roomId })
    .then(async () => {
      await getRoomList()
      ElMessage.success('Remove room success')
    })
    .catch((error) => {
      ElMessage.error('Remove room error')
      console.error('Remove room error', error)
    })
}
</script>

<style lang="scss" scoped>
.filter-container {
  margin-bottom: 20px;
}

::v-deep {
  .el-input-number {
    width: 200px;
  }
}
</style>