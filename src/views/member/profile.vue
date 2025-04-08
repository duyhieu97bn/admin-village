<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <el-avatar :size="60" :src="member.avatar"></el-avatar>
      </div>
    </template>
    <el-descriptions :column="3" size="large" border>
      <template #extra>
        <el-button class="button" @click="dialogProfileVisible = true">Update Profile</el-button>
        <el-button class="button" @click="dialogPasswordVisible = true">Update Password</el-button>
      </template>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <avatar />
            </el-icon>Username
          </div>
        </template>
        {{ member.username }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <avatar />
            </el-icon>Phone Number
          </div>
        </template>
        {{ member.phoneNumber }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <avatar />
            </el-icon>Email Address
          </div>
        </template>
        {{ member.email }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <avatar />
            </el-icon>Address
          </div>
        </template>
        {{ member.address }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <user />
            </el-icon>Full Name
          </div>
        </template>
        {{ member.fullName }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <key />
            </el-icon>RoleName
          </div>
        </template>
        {{ member.role }}
      </el-descriptions-item>
    </el-descriptions>
  </el-card>

  <!-- Update Profile -->
  <el-dialog v-model="dialogProfileVisible" title="Update Profile" destroy-on-close>
    <el-form ref="profileFormRef" :model="profileForm" :rules="profileFormRules" status-icon label-position="left"
      label-width="100px">
      <el-form-item label="Full Name" prop="fullName" required>
        <el-input type="text" autocomplete="off" prefix-icon="user" v-model="profileForm.fullName"
          placeholder="Please input nickname">
        </el-input>
      </el-form-item>
      <el-form-item label="Phone Number" prop="phoneNumber" required>
        <el-input type="text" autocomplete="off" prefix-icon="user" v-model="profileForm.phoneNumber"
          placeholder="Please input phone number">
        </el-input>
      </el-form-item>
      <el-form-item label="Email" prop="email" required>
        <el-input type="text" autocomplete="off" prefix-icon="user" v-model="profileForm.email"
          placeholder="Please input phone number">
        </el-input>
      </el-form-item>
      <el-form-item label="Address" prop="address" required>
        <el-input type="text" autocomplete="off" prefix-icon="user" v-model="profileForm.address"
          placeholder="Please input phone number">
        </el-input>
      </el-form-item>
      <!-- <el-form-item label="Gender" prop="memberData.gender" required>
        <el-select v-model="profileForm.memberData.gender">
          <el-option v-for="item in memberGenderMap" :key="item.value" :label="item.label" :value="item.value"
            :disabled="item.value === profileForm.memberData.gender" />
        </el-select>
      </el-form-item> -->
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogProfileVisible = false">Cancel</el-button>
        <el-button type="danger" @click="resetForm(profileFormRef)">Reset</el-button>
        <el-button type="primary" :loading="submitProfileLoading" :disabled="submitProfileDisabled"
          @click="onUpdateProfile(profileFormRef)">Confirm</el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog v-model="dialogPasswordVisible" title="Update Password" destroy-on-close>
    <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordFormRules" status-icon label-position="left"
      label-width="130px">
      <el-form-item label="Old Password" prop="oldPassword" required>
        <el-input type="password" autocomplete="off" prefix-icon="lock" v-model="passwordForm.oldPassword"
          placeholder="Please input old password" show-password />
      </el-form-item>
      <el-form-item label="New Password" prop="newPassword" required>
        <el-input type="password" autocomplete="off" prefix-icon="lock" v-model="passwordForm.newPassword"
          placeholder="Please input new password" show-password />
      </el-form-item>
      <el-form-item label="New Password2" prop="checkPassword" required>
        <el-input type="password" autocomplete="off" prefix-icon="lock" v-model="passwordForm.checkPassword"
          placeholder="Please input new password again" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogPasswordVisible = false">Cancel</el-button>
        <el-button type="danger" @click="resetForm(passwordFormRef)">Reset</el-button>
        <el-button type="primary" :loading="submitPasswordLoading" :disabled="submitPasswordDisabled"
          @click="onUpdatePassword(passwordFormRef)">Confirm</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { resetForm } from 'utils/form'
import Pair from 'utils/Pair'
import { updateProfile, validateOldPassword as validateMemberOldPassword, updatePassword, } from 'api/auth'


onMounted(async () => {
})

const store = useStore()

const member = computed(() => store.getters.member)

// ------- profile -------
const submitProfileLoading = ref(false)
const submitProfileDisabled = ref(false)
const dialogProfileVisible = ref(false)
const profileFormRef = ref(null)
const profileForm = reactive({
  fullName: member.value.fullName,
  phoneNumber: member.value.phoneNumber,
  email: member.value.email,
  address: member.value.address,
})

const validateNickname = (rule, value, callback) => {
  if (!value) {
    submitProfileDisabled.value = true
    return callback(new Error('Please input nickname'))
  } else {
    if (value.length < 3) {
      submitProfileDisabled.value = true
      callback(new Error('Nickname length must be over 3'))
    } else {
      submitProfileDisabled.value = false
      callback()
    }
  }
}

const profileFormRules = reactive({
  memberData: {
    nickname: [{ trigger: ['change', 'blur'], validator: validateNickname }],
  }
})

// const onUpdateProfile = (formEl) => {
//   if (!formEl) return
//   formEl.validate((valid) => {
//     if (!valid) {
//       ElMessage.error('Profile form error')
//     }
//     submitProfileLoading.value = true
//     updateProfile(profileForm)
//       .then(async () => {
//         // get member profile
//         await store.dispatch('memberProfile')
//         ElMessage.success('Update profile success')
//         dialogProfileVisible.value = false
//       })
//       .catch((error) => {
//         ElMessage.error('Update profile error')
//         console.error('Update profile error', error)
//       })
//       .finally(() => {
//         submitProfileLoading.value = false
//       })
//   })
// }

// ------- password -------
const submitPasswordLoading = ref(false)
const submitPasswordDisabled = ref(false)
const dialogPasswordVisible = ref(false)

const passwordFormRef = ref(null)

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  checkPassword: '',
})

const validateOldPassword = (rule, value, callback) => {
  if (!value) {
    submitPasswordDisabled.value = true
    callback(new Error('Please input old password'))
  } else {
    validateMemberOldPassword({ oldPassword: value })
      .then(() => {
        submitPasswordDisabled.value = false
        callback()
      })
      .catch((error) => {
        callback(new Error(error.msg))
      })
  }
}
const validateNewPassword = (rule, value, callback) => {
  if (!value) {
    submitPasswordDisabled.value = true
    callback(new Error('Please input new password'))
  } else {
    if (value.length < 3) {
      submitPasswordDisabled.value = true
      callback(new Error('New password length must be over 3'))
    } else {
      if (passwordForm.checkPassword !== '') {
        if (!passwordFormRef.value) return
        passwordFormRef.value.validateField('checkPassword')
      }
      submitPasswordDisabled.value = false
      callback()
    }
  }
}
const validateCheckPassword = (rule, value, callback) => {
  if (!value) {
    submitPasswordDisabled.value = true
    callback(new Error('Please input password again'))
  } else {
    if (value !== passwordForm.newPassword) {
      submitPasswordDisabled.value = true
      callback(new Error('Two password inputed are not same'))
    } else {
      submitPasswordDisabled.value = false
      callback()
    }
  }
}

const passwordFormRules = reactive({
  oldPassword: [
    { trigger: ['change', 'blur'], validator: validateOldPassword },
  ],
  newPassword: [
    { trigger: ['change', 'blur'], validator: validateNewPassword },
  ],
  checkPassword: [
    { trigger: ['change', 'blur'], validator: validateCheckPassword },
  ],
})

const onUpdatePassword = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (!valid) {
      return ElMessage.error('Password form error')
    }
    submitPasswordLoading.value = true
    updatePassword(passwordForm)
      .then(() => {
        ElMessage.success('Update password success')
      })
      .catch((error) => {
        ElMessage.error('Update password error')
        console.error('Update password error', error)
      })
      .finally(() => {
        submitPasswordLoading.value = false
      })
  })
}
</script>

<style lang="scss" scoped>
.card-header {
  text-align: center;
}
</style>