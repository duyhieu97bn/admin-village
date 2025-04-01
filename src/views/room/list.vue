<template>
  <div class="app-container">
    <!-- filter container -->
    <!-- <div class="filter-container" v-permission="'room:list'">
      <el-form :inline="true" ref="searchFormRef" :model="searchForm">
        <el-form-item>
          <el-button type="success" icon="refresh" circle @click="getRoomList"></el-button>
          <el-button type="primary" icon="plus" circle v-permission="'room:add'" @click="showAddMemberDialog">
          </el-button>
        </el-form-item>
        <el-form-item label="Username" prop="room.title">
          <el-input v-model="searchForm.room.title" />
        </el-form-item>
        <el-form-item label="Status" prop="room.status">
          <el-select v-model="searchForm.room.status" clearable>
            <el-option v-for="item in roomStatusMap" :key="item.value" :label="item.label" :value="item.value"
              :disabled="item.value === searchForm.room.status" />
          </el-select>
        </el-form-item>
        <el-form-item label="Nickname" prop="roomData.description">
          <el-input v-model="searchForm.roomData.description" />
        </el-form-item>
        <el-form-item label="Gender" prop="roomData.villaId">
          <el-select v-model="searchForm.roomData.villaId" clearable>
            <el-option v-for="item in roomGenderMap" :key="item.value" :label="item.label" :value="item.value"
              :disabled="item.value === searchForm.roomData.villaId" />
          </el-select>
        </el-form-item>
        <el-form-item label="RoleName" prop="role.name">
          <el-input v-model="searchForm.role.name" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" circle :loading="onSearchLoading" :disabled="onSearchDisabled"
            @click="onSearch"></el-button>
          <el-button type="danger" icon="refresh-left" circle :loading="restSearchLoading" :disabled="
            restSearchDisabled ||
            !searched ||
            allEmpty(searchForm, ['currentPage', 'pageSize'])
          " @click="restSearch(searchFormRef)"></el-button>
        </el-form-item>
      </el-form>
    </div> -->
    <!-- Header table -->
    <el-table v-loading="roomListLoading" :data="roomList" border highlight-current-row style="width: 100%">
      <el-table-column type="index" :index="getIndex" />
      <el-table-column label="Image" prop="roomData.images" width="85">
        <template #default="scope">
          <el-avatar :size="50" :src="scope.row.roomData.images[0]"></el-avatar>
        </template>
      </el-table-column>
      <el-table-column label="Title" prop="room.title" width="150" />
      <el-table-column label="Description" prop="roomData.description" width="150" />
      <el-table-column label="Villa ID" prop="roomData.villaId" width="100">
        <!-- <template #default="scope">
          <el-tag size="small" v-if="roomGenderMap.length > 0"
            :type="roomGenderMap[scope.row.roomData.villaId].color">
            {{ roomGenderMap[scope.row.roomData.villaId].label }}
          </el-tag>
        </template> -->
      </el-table-column>
      <el-table-column label="Status" prop="room.status" width="100">
        <!-- <template #default="scope">
          <el-tag size="small" v-if="roomStatusMap.length > 0" :type="roomStatusMap[scope.row.room.status].color">
            {{ roomStatusMap[scope.row.room.status].label }}
          </el-tag>
        </template> -->
      </el-table-column>
      <el-table-column label="Max Persons" prop="room.maxPersons" width="100">
        <!-- <template #default="scope">
          <el-tag size="small" v-if="roomLockMap.length > 0" :type="roomLockMap[scope.row.room.maxPersons].color">
            {{ roomLockMap[scope.row.room.maxPersons].label }}
          </el-tag>
        </template> -->
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
      <el-table-column label="Price Per Night" prop="roomData.pricePerNight" width="150" />
      <el-table-column label="Price Per Month" prop="roomData.pricePerMonth" width="150" />
      <el-table-column label="LoginAt / RegisterAt" width="180">
        <template #default="scope">
          <div>{{ scope.row.room.logined_at || 'None' }}</div>
          <div>{{ scope.row.room.created_at }}</div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="Operations" v-permission:or="['room:update', 'room:remove']">
        <template #default="scope">
          <template v-if="scope.row.room.room_id !== room.id">
            <el-space wrap>
              <span v-permission="'room:update'">
                <el-button @click="
                  showUpdateMemberRoleDialog(scope.row.room.room_id)
                ">Update Role</el-button>
                <el-button @click="showUpdateMemberDialog(scope.row.room.room_id)">Update Member</el-button>
              </span>
              <span v-permission="'room:remove'" v-if="scope.row.room.maxPersons === 0">
                <el-popconfirm confirm-button-text="Yes" cancel-button-text="No" icon-color="red"
                  :title="`Are you sure to remove this room: ${scope.row.room.title}?`"
                  @confirm="onRemove(scope.row.room.room_id)">
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
    <!--  -->
    <el-pagination background layout="total, sizes, prev, pager, next, jumper" v-model:currentPage="page.currentPage"
      v-model:page-size="page.pageSize" :page-sizes="page.pageSizes" :total="page.totalData"
      @size-change="handleSizeChange" @current-change="handleCurrentChange">
    </el-pagination>
    <el-dialog v-model="dialogMemberVisible" :title="dialogMemberStatusMap[dialogMemberStatus].title" destroy-on-close>
      <el-form ref="roomFormRef" :model="roomForm" :rules="roomFormRules" status-icon label-position="left"
        label-width="100px">
        <el-form-item label="Username" prop="room.title">
          <el-input type="text" autocomplete="off" prefix-icon="user" v-model="roomForm.room.title" />
        </el-form-item>
        <el-form-item label="Password" prop="room.password">
          <el-input type="text" autocomplete="off" prefix-icon="maxPersons" v-model="roomForm.room.password" />
        </el-form-item>
        <el-form-item label="Status" prop="room.status">
          <el-select v-model="roomForm.room.status">
            <el-option v-for="item in roomStatusMap" :key="item.value" :label="item.label" :value="item.value"
              :disabled="item.value === roomForm.room.status" />
          </el-select>
        </el-form-item>
        <el-form-item label="Lock" prop="room.maxPersons">
          <el-select v-model="roomForm.room.maxPersons">
            <el-option v-for="item in roomLockMap" :key="item.value" :label="item.label" :value="item.value"
              :disabled="item.value === roomForm.room.maxPersons" />
          </el-select>
        </el-form-item>
        <el-form-item label="Nickname" prop="roomData.description">
          <el-input type="text" autocomplete="off" prefix-icon="user" v-model="roomForm.roomData.description">
            <template #append>
              <el-button icon="refresh-right" @click="getFakeNickname" :loading="getFakeNicknameLoading"
                :disabled="getFakeNicknameDisabled" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="Gender" prop="roomData.villaId">
          <el-select v-model="roomForm.roomData.villaId">
            <el-option v-for="item in roomGenderMap" :key="item.value" :label="item.label" :value="item.value"
              :disabled="item.value === roomForm.roomData.villaId" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogMemberVisible = false">Cancel</el-button>
          <el-button type="danger" @click="resetForm(roomFormRef)">Reset</el-button>
          <el-button type="primary" :loading="submitMemberLoading" :disabled="submitMemberDisabled"
            @click="dialogMemberStatusMap[dialogMemberStatus].submitAction(roomFormRef)">Confirm
          </el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogUpdateMemberRoleVisible" title="Update Member Role" destroy-on-close>
      <el-form ref="roomRoleFormRef" :model="roomRoleForm" label-position="left" label-width="110px">
        <el-form-item label="Current Role">
          <template v-for="(role, index) in roomRoleForm.amenities" :key="role.id">
            <el-tag size="small" effect="plain" class="mr-1" closable @close="onRemoveMemberRole(index)">{{ role.name }}
            </el-tag>
          </template>
        </el-form-item>
        <el-form-item label="New Role">
          <el-cascader v-model="roleSelectIdList" :options="roleTree" :props="roleProps" @change="handleRoleChange"
            filterable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitMemberRoleLoading" :disabled="submitMemberRoleDisabled"
            @click="onAddMemberRole">Add</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="onCloseDialogUpdateMemberRole">Close</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { resetForm, allEmpty } from 'utils/form'
import { list2Tree } from 'utils/tree'
import Pair from 'utils/Pair'
import { listRoom, listAmenity, detail as getMemberDetail, updateDetail as updateMemberDetail, add as addMember, remove as removeMember, } from 'api/component'
import { addMemberRole, removeMemberRole } from 'api/role'
import { getName as getFakeName } from 'api/fake'

const store = useStore()
const room = computed(() => store.getters.room.room)

const roomStatusMap = ref([])
const roomLockMap = ref([])
const roomGenderMap = ref([])

onMounted(async () => {
  const dataList = await Pair.getValueByKey(['roomStatusMap', 'roomLockMap', 'roomGenderMap'])
  roomStatusMap.value = dataList[0].value
  roomLockMap.value = dataList[1].value
  roomGenderMap.value = dataList[2].value
  await getRoomList()
})

const roomListLoading = ref(false)
const roomList = ref([])
const amenities = ref([])
const roleSelectIdList = ref([])
const roleTree = ref([])
const roleProps = {
  value: 'id',
  label: 'name',
  checkStrictly: true,
}

const searched = ref(false)
const onSearchLoading = ref(false)
const onSearchDisabled = ref(false)
const searchFormRef = ref(null)
const searchForm = reactive({
  room: {
    username: null,
    status: null,
  },
  roomData: {
    description: null,
    villaId: null,
  },
  role: {
    name: null,
  },
  currentPage: null,
  pageSize: null,
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

const getRoleList = () => {
  return new Promise((resolve, reject) => {
    listAmenity()
      .then((response) => {
        amenities.value = response.data.list
        // roleTree.value = list2Tree(response.data.list)
        resolve(response)
      })
      .catch((error) => {
        ElMessage.error('Get role list error')
        console.error('Get role list error', error)
        reject(error)
      })
  })
}

const getRoomList = () => {
  return new Promise((resolve, reject) => {
    roomListLoading.value = true
    onSearchLoading.value = true
    onSearchDisabled.value = true
    searchForm.currentPage = page.currentPage
    searchForm.pageSize = page.pageSize
    listRoom(searchForm)
      .then((response) => {
        roomList.value = response.data.list
        page.totalData = response.data.total
        page.currentPage = response.data.currentPage
        page.pageSize = response.data.pageSize
        page.totalPage = response.data.totalPage
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
    title: 'Add Member',
    submitAction: (formEl) => onAddMember(formEl),
  },
  update: {
    title: 'Update Member',
    submitAction: (formEl) => onUpdateMember(formEl),
  },
}
const dialogMemberStatus = ref('add')
const dialogMemberVisible = ref(false)
const submitMemberLoading = ref(false)
const submitMemberDisabled = ref(false)
const getFakeNicknameLoading = ref(false)
const getFakeNicknameDisabled = ref(false)
const roomFormRef = ref(null)
const defaultRoomForm = () => {
  return {
    room: {
      id: null,
      username: null,
      password: null,
      status: null,
      maxPersons: null,
    },
    roomData: {
      images: null,
      description: null,
      villaId: null,
    },
  }
}
const roomForm = reactive(defaultRoomForm())

// ------- add room -------
const getFakeNickname = () => {
  getFakeNicknameLoading.value = true
  getFakeNicknameDisabled.value = true
  getFakeName()
    .then((response) => {
      roomForm.roomData.description = response.data
    })
    .catch((error) => {
      ElMessage.error('Get fake description error')
      console.error('Get fake description error', error)
    })
    .finally(() => {
      getFakeNicknameLoading.value = false
      getFakeNicknameDisabled.value = false
    })
}

const showAddMemberDialog = async () => {
  Object.assign(roomForm, defaultRoomForm())
  await getRoleList()
  dialogMemberStatus.value = 'add'
  dialogMemberVisible.value = true
}

const onAddMember = () => {
  submitMemberLoading.value = true
  submitMemberDisabled.value = true
  addMember(roomForm)
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
      submitMemberLoading.value = false
      submitMemberDisabled.value = false
    })
}

// ------- update room -------
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

const roomFormRules = reactive({
  room: {
    username: [{ trigger: ['change', 'blur'], validator: validateUsername }],
    password: [{ trigger: ['change', 'blur'], validator: validatePassword }],
  },
  roomData: {
    description: [{ trigger: ['change', 'blur'], validator: validateNickname }],
  },
})

const showUpdateMemberDialog = (roomId) => {
  Object.assign(roomForm, defaultRoomForm())
  getMemberDetail({ id: roomId })
    .then((response) => {
      roomForm.room = response.data.room
      roomForm.roomData = response.data.roomData
      dialogMemberStatus.value = 'update'
      dialogMemberVisible.value = true
    })
    .catch((error) => {
      ElMessage.error('Get room detail error')
      console.error('Get room detail error', error)
    })
}

const onUpdateMember = () => {
  submitMemberLoading.value = true
  submitMemberDisabled.value = true
  updateMemberDetail(roomForm)
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
      submitMemberLoading.value = false
      submitMemberDisabled.value = false
    })
}

// ------- update room role -------
const submitMemberRoleLoading = ref(false)
const submitMemberRoleDisabled = ref(false)
const dialogUpdateMemberRoleVisible = ref(false)

const defaultMemberRoleForm = () => {
  return {
    roomId: null,
    roleId: null,
    amenities: [],
  }
}
const roomRoleFormRef = ref(null)
const roomRoleForm = reactive(defaultMemberRoleForm())

const showUpdateMemberRoleDialog = (roomId) => {
  Object.assign(roomRoleForm, defaultMemberRoleForm())
  getMemberDetail({ id: roomId })
    .then(async (response) => {
      roomRoleForm.roomId = response.data.room.id
      roomRoleForm.amenities = response.data.amenities
      await getRoleList()
      dialogUpdateMemberRoleVisible.value = true
    })
    .catch((error) => {
      ElMessage.error('Get room detail error')
      console.error('Get room detail error', error)
    })
}

const handleRoleChange = (value) => {
  if (!value) {
    return
  }
  const roleId = Object.values(value).pop()
  for (let i = 0; i < roomRoleForm.amenities.length; i++) {
    if (roomRoleForm.amenities[i].id === roleId) {
      roleSelectIdList.value = []
      return ElMessage.error('Member already assumed this role')
    }
  }
  roomRoleForm.roleId = roleId
}

let isMemberRoleUpdate = false

const onRemoveMemberRole = (index) => {
  submitMemberRoleLoading.value = true
  submitMemberRoleDisabled.value = true
  const roleId = roomRoleForm.amenities[index].id
  removeMemberRole({ roleId: roleId, roomId: roomRoleForm.roomId })
    .then(() => {
      isMemberRoleUpdate = true
      roomRoleForm.amenities.splice(index, 1)
      ElMessage.success('Remove room role success')
    })
    .catch((error) => {
      ElMessage.error('Remove room role error')
      console.error('Remove room role error', error)
    })
    .finally(() => {
      submitMemberRoleLoading.value = false
      submitMemberRoleDisabled.value = false
    })
}

const onAddMemberRole = () => {
  submitMemberRoleLoading.value = true
  submitMemberRoleDisabled.value = true
  addMemberRole({
    roleId: roomRoleForm.roleId,
    roomId: roomRoleForm.roomId,
  })
    .then((response) => {
      isMemberRoleUpdate = true
      roleSelectIdList.value = []
      roomRoleForm.amenities.push(response.data)
      ElMessage.success('Add room role success')
    })
    .catch((error) => {
      ElMessage.error('Add room role error')
      console.error('Add room role error', error)
    })
    .finally(() => {
      submitMemberRoleLoading.value = false
      submitMemberRoleDisabled.value = false
    })
}

const onCloseDialogUpdateMemberRole = async () => {
  if (isMemberRoleUpdate) {
    isMemberRoleUpdate = false
    await getRoomList()
    dialogUpdateMemberRoleVisible.value = false
  } else {
    dialogUpdateMemberRoleVisible.value = false
  }
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
</style>