<template>
  <div class="page-wrapper">
    <div class="container">
      <nav>
        <div class="nav-links">
          <img src="/launchpad.png" alt="Launchpad">
          <ul class="nav-links">
            <li><a href="#" @click="router.push('/discover')"><i class="fa fa-home"></i> Home</a></li>
            <li><button type="button" @click="showForm = true"><i class="fa fa-book"></i> New Project</button></li>
            <li><a href="#" @click="router.push('/profile')"><i class="fa fa-address-book-o"></i> Profile</a></li>
          </ul>
        </div>
        <div class="bottom-nav">
          <p>@{{ username }}</p>
          <button type="button" @click="handleLogout"><span class="logout">Log Out</span></button>
        </div>
      </nav>

      <div v-if="showForm" class="popup" @click.self="showForm = false; editingProject = null">
        <div id="popup-content">
          <label><b>Project Name<span class="star">*</span></b></label>
          <input type="text" v-model="newProject.title" placeholder="Launchpad" required>

          <label><b>Project Description<span class="star">*</span></b></label>
          <textarea id="proj-desc" v-model="newProject.content" placeholder="Describe your project here..." required></textarea>

          <label><b>Tags</b></label>
          <Multiselect
              v-model="newProject.tags"
              :options="TAGS"
              :multiple="true"
              :close-on-select="false"
              placeholder="Select tags"
          />

          <label><b>GitHub Link</b></label>
          <input type="text" v-model="newProject.githubUrl" placeholder="https://github.com/...">

          <label><b>Demo Link</b></label>
          <input type="text" v-model="newProject.demoUrl" placeholder="https://demo.com/...">

          <div id="form-buttons">
            <button type="button" class="submit-button" @click="submitProject">
              {{ editingProject ? 'Save Changes' : 'Add Project' }}
            </button>
            <button type="button" class="cancel-button" @click="showForm = false">Cancel</button>
          </div>
        </div>
      </div>

      <main>
        <h1>My Profile</h1>

        <div id="profile">
          <div id="namebubble">{{ initials }}</div>
          <h2>{{ fullName }}</h2>
          <h2 class="profile-username">@{{ username }}</h2>
          <hr>

          <div class="user-proj" v-for="project in projects" :key="project.id">
            <div class="proj-header">
              <h3>{{ project.title }}</h3>
              <div class="proj-actions-right">
                <button class="edit-btn" @click="editProject(project)"><i class="fa fa-pencil"></i></button>
                <select v-model="project.status" @change="updateStatus(project)">
                  <option value="draft">Private</option>
                  <option value="published">Public</option>
                </select>
              </div>
            </div>
            <p class="project-content">{{ project.content }}</p>
            <div class="proj-tags">
              <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
            <a v-if="project.githubUrl" :href="project.githubUrl" target="_blank"><i class="fa fa-github"></i> GitHub</a>
            <a v-if="project.demoUrl" :href="project.demoUrl" target="_blank"><i class="fa fa-external-link"></i> Demo</a>
            <div class="proj-actions">
              <button class="delete-btn" @click="deleteProject(project.id)">Delete</button>
            </div>
            <hr>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { auth } from '../firebase'
  import { signOut, onAuthStateChanged } from 'firebase/auth'
  import { useRouter } from 'vue-router'
  import Multiselect from 'vue-multiselect'

  const router = useRouter()
  const projects = ref([])
  const username = ref('')
  const fullName = ref('')
  const showForm = ref(false)
  const newProject = ref({
    title: '',
    content: '',
    tags: [],
    githubUrl: '',
    demoUrl: ''
  })
  const editingProject = ref(null)

  const TAGS = ['Web', 'Game', 'Educational', 'Mobile', 'CLI', 'API', 'AI/ML', 'Security', 'DevOps', 'Open Source']

  const initials = computed(() => {
    if (!fullName.value) return '?'
    return fullName.value.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  })

  const fetchProjects = async () => {
    const user = auth.currentUser
    if (!user) return
    const token = await user.getIdToken()
    const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    projects.value = await res.json()
  }

  const submitProject = async () => {
    const user = auth.currentUser
    if (!user) return
    const token = await user.getIdToken()

    if (editingProject.value) {
      await fetch(`${import.meta.env.VITE_API_URL}/projects/${editingProject.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProject.value,
          status: editingProject.value.status
        })
      })
      editingProject.value = null
    } else {
      await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newProject.value })
      })
    }

    showForm.value = false
    newProject.value = { title: '', content: '', tags: [], githubUrl: '', demoUrl: '' }
    await fetchProjects()
  }

  const updateStatus = async (project) => {
    const user = auth.currentUser
    if (!user) return
    const token = await user.getIdToken()
    await fetch(`${import.meta.env.VITE_API_URL}/projects/${project.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: project.title,
        content: project.content,
        tags: project.tags,
        githubUrl: project.githubUrl,
        demoUrl: project.demoUrl,
        status: project.status
      })
    })
  }

  const deleteProject = async (id) => {
    const user = auth.currentUser
    if (!user) return
    const token = await user.getIdToken()
    await fetch(`${import.meta.env.VITE_API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    await fetchProjects()
  }

  const editProject = (project) => {
    editingProject.value = project
    newProject.value = {
      title: project.title,
      content: project.content,
      tags: project.tags,
      githubUrl: project.githubUrl || '',
      demoUrl: project.demoUrl || ''
    }
    showForm.value = true
  }

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/')
  }

  onMounted(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken()
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        fullName.value = data.name
        username.value = data.username
        await fetchProjects()
      } else {
        router.push('/')
      }
    })
  })
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@200..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap');

  * { margin: 0; padding: 0; border: 0; }

  /* Layout */
  .page-wrapper {
    background-color: #f7f0d9;
    min-height: 100vh;
    display: flex;
    justify-content: center;
  }

  .container {
    width: 100%;
    max-width: 1400px;
    background-color: #f7f0d9;
    display: grid;
    grid-template-columns: 250px 1fr;
  }

  /* Nav */
  nav {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-family: "Inconsolata", sans-serif;
    text-align: center;
    background-image: linear-gradient(#247d84 0%, #051f38 100%);
    gap: 1rem;
    height: 100vh;
    position: sticky;
    top: 0;
    border-top-left-radius: 15px;
    border-bottom-left-radius: 15px;
  }

  nav img { max-width: 50%; margin: 1rem auto 0 auto; }
  nav a { color: #ffffff; text-decoration: none; padding: 1.15rem; }
  nav a:hover { background-color: #1a5a5f; border-radius: 10px; }
  nav .fa { color: #ffffff; padding-right: 2%; font-size: 0.8em; }

  nav li {
    display: flex;
    flex-direction: column;
    font-size: 1.75em;
    margin: 1rem 0;
    padding-bottom: 0.75rem;
  }

  nav button {
    padding: 1.15rem;
    background-color: transparent;
    color: #ffffff;
    font-size: 1em;
    font-family: "Inconsolata", sans-serif;
  }

  nav button:hover { background-color: #1a5a5f; border-radius: 10px; cursor: pointer; }

  .bottom-nav { margin: 2rem; color: #ffffff; }
  .bottom-nav p { font-size: 1.25em; margin-bottom: 0.5rem; }
  .logout { font-weight: normal; font-size: 1.5em; }
  .logout:hover { cursor: pointer; text-decoration: underline; }

  /* Main */
  main {
    margin: 0 5% 0 0;
    min-height: calc(100vh - 2rem);
    display: flex;
    flex-direction: column;
    text-align: center;
    background-color: #FCFAF2;
    border-radius: 15px;
    padding: 1rem;
  }

  main h1 { padding-bottom: 1rem; }

  /* Profile */
  #profile {
    font-family: "Montserrat", sans-serif;
    margin: 2% 5%;
  }

  #namebubble {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    background-color: #247d84;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.25rem;
    margin: 1rem;
  }

  #profile h2 { text-align: left; padding-left: 1rem; font-size: 1.5em; margin: 0.5rem 0; }
  .profile-username { color: #247d84; }
  hr { border: none; height: 1px; background-color: #cccccc; margin: 1rem 0; }

  /* Projects */
  .user-proj { margin-bottom: 1rem; }

  .proj-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
  }

  .proj-header h3 { font-size: 1.2em; }

  .proj-actions-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .edit-btn {
    padding: 0.4rem;
    background-color: #dbdbdb;
    border: none;
    border-radius: 15px;
    cursor: pointer;
    transition: 0.15s ease-in;
  }

  .edit-btn i { font-size: 1.5em; }
  .edit-btn:hover { transform: scale(1.1); }

  .proj-header select {
    background-color: #247d84;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 0.4rem 0.75rem;
    font-family: "Montserrat", sans-serif;
    font-size: 1em;
    cursor: pointer;
    transition: 0.15s ease-in;
  }

  .proj-header select:hover { transform: scale(1.1); }

  .project-content { text-align: left; margin-left: 1rem; margin-bottom: 0.5rem; }

  .proj-tags { text-align: left; margin: 0.5rem 0 0.5rem 1rem; }
  .tag {
    display: inline-block;
    padding: 0.3rem 0.6rem;
    background-color: #247d84;
    color: #ffffff;
    border-radius: 15px;
    margin-right: 0.4rem;
    font-size: 0.85rem;
  }

  #profile a { display: block; text-align: left; padding-left: 1rem; color: #247d84; }

  .proj-actions { text-align: left; margin: 0.5rem 1rem; }
  .delete-btn {
    background-color: #c0392b;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 0.4rem 0.75rem;
    cursor: pointer;
    font-size: 0.85rem;
  }
  .delete-btn:hover { opacity: 0.8; }

  /* Popup */
  .popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #00000099;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
  }

  #popup-content {
    display: flex;
    flex-direction: column;
    padding: 2rem;
    width: 22%;
    height: 70%;
    border-radius: 10px;
    background-color: #f7f0d9;
    border: solid #000000;
  }

  .star { color: red; }
  #popup-content label { font-size: 1.25em; padding: 0.5rem 0; }
  #popup-content input { border: solid #000000 2px; border-radius: 5px; padding: 0.5rem; margin-bottom: 0.5rem; }

  #proj-desc {
    min-height: 100px;
    resize: vertical;
    border: solid #000000 2px;
    border-radius: 5px;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    font-family: inherit;
  }

  #form-buttons { margin-top: auto; display: flex; flex-direction: column; }
  #form-buttons button {
    background-color: #247d84;
    border-radius: 10px;
    color: #ffffff;
    padding: 0.75rem;
    margin: 0.5rem auto;
    width: 70%;
    cursor: pointer;
  }
  #form-buttons button:hover { opacity: 80%; }
  .cancel-button { background-color: #888 !important; }

  /* Multiselect */
  :deep(.multiselect__tags) { border: solid #000000 2px; border-radius: 5px; background-color: #ffffff; }
  :deep(.multiselect__tag) { background-color: #247d84; border-radius: 15px; }
  :deep(.multiselect__tag-icon:after) { color: #ffffff; }
  :deep(.multiselect__placeholder) { color: #757575; }
  :deep(.multiselect__input),
  :deep(.multiselect__placeholder) { background-color: transparent; padding: 0; margin: 0; }
</style>