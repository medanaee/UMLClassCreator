import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'


import { cloudflare } from "@cloudflare/vite-plugin";


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile(), cloudflare()],
  build: {
    // اسم پوشه جدیدی که می‌خواهی ساخته شود را اینجا بنویس
    outDir: 'build', 
    
    // (اختیاری) این گزینه باعث می‌شود قبل از هر بیلد جدید، محتویات پوشه قبلی پاک شود
    emptyOutDir: true 
  }
})