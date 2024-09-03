<template>
  <div>
    <nav class="flex-center-center gap-main">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/components">Components</RouterLink>
      <RouterLink to="/library">Library</RouterLink>
      <RouterLink to="/canvas">Canvas</RouterLink>
      <RouterLink to="/overscroll">Overscroll</RouterLink>
    </nav>
    <RouterView></RouterView>
  </div>
</template>

<style lang="scss">
html, body {
  overscroll-behavior: contain;
}
</style>