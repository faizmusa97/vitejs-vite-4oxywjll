<template>
  <div>
    <h2>User List</h2>
    <button class="btn btn-primary my-2" @click="fetchUsers">Load Users</button>
    <ul class="list-group mt-3" v-if="users.length">
      <li v-for="user in users" :key="user.id" class="list-group-item">
        {{ user.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const users = ref([]);

const fetchUsers = async () => {
  try {
    const response = await axios.get(
      'https://jsonplaceholder.typicode.com/users'
    );
    users.value = response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }
};
</script>
