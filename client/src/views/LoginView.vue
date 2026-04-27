<template>
  <div id="login-body">
    <video :muted="true" autoplay loop>
      <source src="/background-login2.mp4" type="video/mp4">
    </video>

    <div id="login-container">
      <img src="/launchpad.png" alt="Launchpad">
      <form @submit.prevent="handleSubmit">
        <div v-if="isRegistering">
          <p style="color: #CBD5E1; font-size: 0.85rem; margin-bottom: 0.5rem;">What should we call you?</p>
          <div>
            <label><i class="fa fa-user"></i></label>
            <input type="text" required v-model="name" placeholder="Full Name" autocomplete="off">
          </div>
          <div>
            <label><i class="fa fa-at"></i></label>
            <input type="text" required v-model="username" placeholder="Username" autocomplete="off">
          </div>
          <hr style="border-color: rgba(255,255,255,0.1); margin: 1rem 0;">
        </div>
        <div>
          <label for="email"><i class="fa fa-user"></i></label>
          <input type="text" required id="email" v-model="email" placeholder="Email" autocomplete="off">
        </div>
        <div>
          <label for="pass"><i class="fa fa-lock"></i></label>
          <input type="password" required id="pass" v-model="password" placeholder="Password" autocomplete="off">
        </div>
        <p v-if="error" style="color: red; margin-top: 1rem;">{{ error }}</p>
        <button type="submit">{{ isRegistering ? 'Register' : 'Log In' }}</button>
        <p style="margin-top: 1rem; color: #CBD5E1; cursor: pointer;" @click="isRegistering = !isRegistering">
          {{ isRegistering ? 'Already have an account? Log In' : 'No account? Register' }}
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { auth } from '../firebase'
  import { signInWithEmailAndPassword } from 'firebase/auth'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const email = ref('')
  const username = ref('')
  const name = ref('')
  const password = ref('')
  const isRegistering = ref(false)
  const error = ref('')

  const handleSubmit = async () => {
    error.value = ''
    try {
      if (isRegistering.value) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.value,
            username: username.value,
            email: email.value,
            password: password.value
          })
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error)
        }
        await signInWithEmailAndPassword(auth, email.value, password.value)
        localStorage.setItem('username', username.value)
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
        const token = await userCredential.user.getIdToken()
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        localStorage.setItem('username', data.username)
      }
      await router.push('/discover')
    } catch (e) {
      error.value = e.message
    }
  }
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@200..900&family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Oswald:wght@200..700&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&family=Squada+One&display=swap');

  #login-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    overflow: hidden;
    background-image: linear-gradient(rgba(36, 125, 132, 0.05) 0%, rgba(5, 31, 56, 0.1) 100%);
  }

  #login-container {
    background-color: #051f38;
    border-radius: 15px;
    padding: 4rem;
  }

  #login-container img {
    max-width: 312px;
    max-height: 208px;
    padding-bottom: 1rem;
  }

  video {
    height: 100%;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    object-fit: cover;
    opacity: 0.2;
    z-index: -1;
  }

  i {
    color: #36e2f0;
  }

  input {
    padding: 8px 10px;
    width: 200px;
    border-radius: 5px;
    margin: 0.5rem;
    border: none;
    background-color: #CBD5E1;
    color: #000000;
  }

  input:focus {
    outline: none;
  }

  button {
    margin-top: 2rem;
    background-color: #1F2937;
    color: #ffffff;
    font-size: 1rem;
    text-transform: uppercase;
    font-family: 'Squada One', sans-serif;
    padding: 10px 20px;
    border: none;
  }

  button:hover {
    cursor: pointer;
    filter: brightness(70%);
    text-decoration: underline;
  }
</style>