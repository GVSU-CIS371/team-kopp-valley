<template>
  <div class="page-wrapper">
    <div class="container">
      <nav>
        <div class="nav-links">
          <img src="/launchpad.png" alt="Launchpad">
          <ul class="nav-links">
            <li><a href="#" @click="router.push('/discover')"><i class="fa fa-home"></i> Home</a></li>
            <li><button type="button" @click="showForm = true"><i class="fa fa-book"></i> New Project</button></li>
            <li><a @click="router.push('/profile')"><i class="fa fa-address-book-o"></i> Profile</a></li>
          </ul>
        </div>
        <div class="bottom-nav">
          <p>@{{ username }}</p>
          <button type="button" @click="handleLogout"><span class="logout">Log Out</span></button>
        </div>
      </nav>

      <div v-if="showForm" class="popup" @click.self="showForm = false">
        <div id="popup-content">
          <label for="project"><b>Project Name<span class="star">*</span></b></label>
          <input type="text" v-model="newProject.title" placeholder="Launchpad" required>

          <label for="description"><b>Project Description<span class="star">*</span></b></label>
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
            <button type="button" class="submit-button" @click="submitProject">Add Project</button>
            <button type="button" class="cancel-button" @click="showForm = false">Cancel</button>
          </div>
        </div>
      </div>

      <main>
        <div id="sticky-header">
          <h1>Discover</h1>
          <div class="search-filter-bar">
            <input type="text" v-model="search" placeholder="Search projects...">
            <select v-model="tagFilter">
              <option value="all">All Tags</option>
              <option v-for="tag in TAGS" :key="tag" :value="tag">{{ tag }}</option>
            </select>
          </div>
        </div>

        <div class="feed" v-for="project in filteredProjects" :key="project.id">
          <h3>{{ project.title }}</h3>
          <p class="project-author">{{ project.name }} <span class="separator">·</span> <span class="project-username">@{{ project.username }}</span></p>
          <p class="project-content">{{ project.content }}</p>

          <div class="proj-tags">
            <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>

          <a v-if="project.githubUrl" :href="project.githubUrl" target="_blank"><i class="fa fa-github"></i> GitHub</a>
          <a v-if="project.demoUrl" :href="project.demoUrl" target="_blank"><i class="fa fa-external-link"></i> Demo</a>
          <br><br>
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
  const search = ref('')
  const tagFilter = ref('all')
  const showForm = ref(false)
  const username = ref('')
  const newProject = ref({
    title: '',
    content: '',
    tags: [],
    githubUrl: '',
    demoUrl: ''
  })

  const TAGS = ['Web', 'Game', 'Educational', 'Mobile', 'CLI', 'API', 'AI/ML', 'Security', 'DevOps', 'Open Source']

  const filteredProjects = computed(() => {
    return projects.value.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(search.value.toLowerCase()) ||
          p.content.toLowerCase().includes(search.value.toLowerCase())
      const matchesTag = tagFilter.value === 'all' || p.tags?.includes(tagFilter.value)
      return matchesSearch && matchesTag
    })
  })

  const fetchProjects = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/projects`)
    projects.value = await res.json()
  }

  const handleLogout = async () => {
    await signOut(auth)
    await router.push('/')
  }

  const submitProject = async () => {
    const user = auth.currentUser
    if (!user) return
    const token = await user.getIdToken()

    await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...newProject.value,
      })
    })

    showForm.value = false
    newProject.value = { title: '', content: '', tags: [], githubUrl: '', demoUrl: '' }
    await fetchProjects()
  }

  onMounted(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        username.value = localStorage.getItem('username') || ''
      } else {
        router.push('/')
      }
    })
    fetchProjects()
  })
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@200..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap');

  * { margin: 0; padding: 0; border: 0; }

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

  nav {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-family: "Inconsolata", sans-serif;
    text-align: center;
    gap: 1rem;
    height: 100vh;
    position: sticky;
    top: 0;
    border-top-left-radius: 15px;
    border-bottom-left-radius: 15px;
    background-image: linear-gradient(#247d84 0%, #051f38 100%);
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

  main {
    margin: 0 5% 3% 0;
    display: flex;
    flex-direction: column;
    text-align: center;
    background-color: #FCFAF2;
    border-radius: 15px;
    padding: 1rem;
  }

  main h1 { padding-bottom: 2rem; }

  #sticky-header {
    position: sticky;
    top: 0;
    z-index: 998;
    background-color: #FCFAF2;
  }

  .search-filter-bar { display: flex; gap: 1rem; justify-content: center; margin-bottom: 1.5rem; }
  .search-filter-bar input,
  .search-filter-bar select { padding: 0.5rem; border-radius: 8px; border: 1px solid #ccc; width: 200px; }

  .feed {
    font-family: "Montserrat", sans-serif;
    border-bottom: 1px solid #ccc;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
  }

  .feed h3 { text-align: left; font-size: 1.2em; padding: 0.5rem 0 0.5rem 1.2rem; }
  .feed a { display: block; text-align: left; padding-left: 1rem; color: #247d84; }

  .project-author { text-align: left; padding-left: 1rem; color: #555; margin-bottom: 0.5rem; }
  .project-username { color: #247d84; font-weight: bold; }
  .project-content { text-align: left; margin-left: 1rem; margin-bottom: 0.5rem; }
  .separator { color: #aaa; padding: 0 0.2rem; }

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

  :deep(.multiselect__tags) { border: solid #000000 2px; border-radius: 5px; background-color: #ffffff; }
  :deep(.multiselect__tag) { background-color: #247d84; border-radius: 15px; }
  :deep(.multiselect__tag-icon:after) { color: #ffffff; }
  :deep(.multiselect__placeholder) { color: #757575; }
  :deep(.multiselect__input),
  :deep(.multiselect__placeholder) { background-color: transparent; padding: 0; margin: 0; }
</style>