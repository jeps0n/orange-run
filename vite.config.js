import { defineConfig } from "vite";

export default defineConfig({
    base: "/orange-run/",
    server: {
        host: "0.0.0.0",
        allowedHosts: true
    }
});