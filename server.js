const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

// 设置静态文件目录
app.use(
  express.static("./", {
    setHeaders: (res, path, stat) => {
      if (path.endsWith(".js")) {
        res.set("Content-Type", "application/javascript");
      }
    },
  })
);

// 添加 MIME 类型
app.use((req, res, next) => {
  if (req.url.endsWith(".js")) {
    res.type("application/javascript");
  }
  next();
});

// 路由处理
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/progress", (req, res) => {
  res.sendFile(path.join(__dirname, "progress.html"));
});

app.get("/monologue", (req, res) => {
  res.sendFile(path.join(__dirname, "monologue.html"));
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
