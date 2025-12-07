import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Cho phép dùng describe, it, expect mà không cần import
    environment: "jsdom", // Giả lập trình duyệt
    setupFiles: "./src/test/setup.ts", // File setup vừa tạo ở Bước 2
    css: true, // Nếu muốn parse cả CSS (optional)
  },
});
