const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

if (!code.includes('vite-plugin-pwa:register-sw')) {
  code = code.replace(
    '</head>',
    `  <script type="module">
    import { registerSW } from 'virtual:pwa-register'
    registerSW({ immediate: true })
  </script>
</head>`
  );
  fs.writeFileSync('index.html', code);
  console.log("Updated index.html");
} else {
  console.log("Already updated");
}
