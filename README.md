# TrainerX Backend

TrainerX 健身小程序后端服务 - NestJS + TypeScript + Prisma

## 🚀 快速开始

### 1. 环境准备

确保已安装：
- Node.js 18+
- Docker & Docker Compose
- Git

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的配置
```

### 4. 启动数据库

```bash
docker-compose up -d
```

### 5. 数据库迁移

```bash
npx prisma generate
npx prisma migrate dev
```

### 6. 启动服务

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

## 📚 API 文档

启动服务后访问：http://localhost:3000/api/docs

## 🛠️ 常用命令

```bash
# 开发
npm run start:dev          # 开发模式（热重载）
npm run start:debug        # 调试模式

# 数据库
npx prisma studio          # 可视化数据库
npx prisma migrate dev     # 开发环境迁移
npx prisma migrate deploy  # 生产环境迁移
npx prisma db seed         # 插入种子数据

# 代码质量
npm run lint               # ESLint
npm run format             # Prettier
npm run test               # 测试
npm run test:cov           # 测试覆盖率

# 构建
npm run build              # 生产构建
npm run start:prod         # 生产启动
```

## 📁 项目结构

```
src/
├── main.ts                    # 入口文件
├── app.module.ts              # 根模块
├── common/                    # 公共模块
│   ├── decorators/            # 自定义装饰器
│   ├── filters/               # 异常过滤器
│   ├── guards/                # 守卫
│   ├── interceptors/          # 拦截器
│   └── pipes/                 # 管道
├── config/                    # 配置文件
├── modules/                   # 业务模块
│   ├── auth/                  # 认证
│   ├── user/                  # 用户
│   ├── coach/                 # 教练
│   ├── booking/               # 预约
│   ├── course/                # 课程
│   ├── checkin/               # 打卡
│   └── notification/          # 通知
└── database/                  # 数据库相关
    ├── migrations/            # 迁移文件
    └── seeds/                 # 种子数据
```

## 🔧 技术栈

- **框架**: NestJS v10
- **语言**: TypeScript v5
- **数据库**: MySQL 8.0
- **ORM**: Prisma v5
- **缓存**: Redis 7
- **认证**: JWT
- **文档**: Swagger
- **监控**: Sentry

## 📝 开发规范

- 使用 TypeScript 严格模式
- 遵循 NestJS 最佳实践
- 所有 API 需要编写 Swagger 文档
- 核心业务逻辑需要单元测试

## 🐳 Docker 部署

```bash
# 构建镜像
docker build -t trainerx-backend .

# 运行容器
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  trainerx-backend
```

## 📞 支持

有问题？联系项目负责人 Sheen
